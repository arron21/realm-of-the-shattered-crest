// ============================================================================
// REALM OF THE SHATTERED CREST — SHARED MMO INSTANCE SERVER (AETHELGARD-PRIME)
// Works as a Vercel Serverless Function (/api/mmo) AND Local Node HTTP Handler
// Zero external dependencies — 100% native Node.js (crypto, fs)
// ============================================================================

const crypto = require('crypto');
const fs = require('fs');

const TMP_STATE_FILE = '/tmp/rotsc_mmo_instance_v1.json';
const PLAYER_TIMEOUT_MS = 15000;
const EVENT_TTL_MS = 16000;
const MAX_EVENTS = 160;
const MAX_CHAT = 60;

function hashPassword(password) {
  if (!password) return '';
  return crypto.createHash('sha256').update(String(password) + '_rotsc_salt_v1').digest('hex');
}

function createInitialInstanceState() {
  return {
    instanceId: 'aethelgard-prime',
    instanceName: 'Aethelgard-Prime (Shared MMO Instance)',
    worldSeed: 1337,
    seq: 1,
    chatSeq: 1,
    accounts: {},
    players: {},
    events: [],
    chat: [
      {
        seq: 1,
        sender: 'AETHELGARD-PRIME',
        text: 'Welcome to Aethelgard-Prime — the unified shared MMO instance! All logged-in heroes share this world, chat, party buffs, portals, and boss fights.',
        color: '#fde047',
        ts: Date.now()
      }
    ],
    worldState: {
      realmEventsRemaining: 3,
      sharedPortals: [],
      sharedBags: []
    },
    lastSavedAt: 0
  };
}

function getInstanceState() {
  if (!global.__ROTSC_MMO_INSTANCE__) {
    let loaded = null;
    try {
      if (fs.existsSync(TMP_STATE_FILE)) {
        const raw = fs.readFileSync(TMP_STATE_FILE, 'utf8');
        loaded = JSON.parse(raw);
      }
    } catch (e) {
      loaded = null;
    }
    if (loaded && loaded.instanceId === 'aethelgard-prime') {
      global.__ROTSC_MMO_INSTANCE__ = {
        ...createInitialInstanceState(),
        ...loaded,
        accounts: loaded.accounts || {},
        players: loaded.players || {},
        events: Array.isArray(loaded.events) ? loaded.events : [],
        chat: Array.isArray(loaded.chat) ? loaded.chat : [],
        worldState: {
          realmEventsRemaining: 3,
          sharedPortals: [],
          sharedBags: [],
          ...(loaded.worldState || {})
        }
      };
    } else {
      global.__ROTSC_MMO_INSTANCE__ = createInitialInstanceState();
    }
  }
  return global.__ROTSC_MMO_INSTANCE__;
}

function saveInstanceStateThrottled(state, force = false) {
  const now = Date.now();
  if (!force && now - (state.lastSavedAt || 0) < 1500) return;
  state.lastSavedAt = now;
  try {
    fs.writeFileSync(TMP_STATE_FILE, JSON.stringify(state), 'utf8');
  } catch (e) {
    // Ignore read-only or ephemeral filesystem errors gracefully
  }
}

function pruneStaleState(state, now) {
  for (const [pid, p] of Object.entries(state.players)) {
    if (!p || now - (p.lastSeen || 0) > PLAYER_TIMEOUT_MS) {
      delete state.players[pid];
    }
  }
  state.events = state.events.filter((ev) => now - (ev.ts || 0) <= EVENT_TTL_MS);
  if (state.events.length > MAX_EVENTS) {
    state.events = state.events.slice(state.events.length - MAX_EVENTS);
  }
  if (state.chat.length > MAX_CHAT) {
    state.chat = state.chat.slice(state.chat.length - MAX_CHAT);
  }
  if (Array.isArray(state.worldState.sharedPortals)) {
    state.worldState.sharedPortals = state.worldState.sharedPortals.filter(
      (pt) => !pt.expiresAt || pt.expiresAt > now
    );
  }
  if (Array.isArray(state.worldState.sharedBags)) {
    state.worldState.sharedBags = state.worldState.sharedBags.filter(
      (b) => b.items && b.items.length > 0 && (!b.expiresAt || b.expiresAt > now)
    );
  }
}

function pushEvent(state, ev) {
  state.seq += 1;
  const item = {
    ...ev,
    seq: state.seq,
    ts: Date.now()
  };
  state.events.push(item);
  return item;
}

function pushChat(state, msg) {
  state.chatSeq += 1;
  const item = {
    seq: state.chatSeq,
    chatId: state.chatSeq,
    sender: String(msg.sender || 'Hero').slice(0, 24),
    text: String(msg.text || '').slice(0, 220),
    color: msg.color || '#e2e8f0',
    playerId: msg.playerId || msg.id || null,
    senderId: msg.playerId || msg.id || null,
    mapId: msg.mapId || 'nexus',
    x: typeof msg.x === 'number' ? msg.x : null,
    y: typeof msg.y === 'number' ? msg.y : null,
    ts: Date.now()
  };
  state.chat.push(item);
  return item;
}

function mergeAccountData(existing, incoming) {
  if (!existing) return incoming || null;
  if (!incoming) return existing;
  const mergedShards = [0, 1, 2, 3, 4].map(
    (i) => Boolean((existing.crestShards && existing.crestShards[i]) || (incoming.crestShards && incoming.crestShards[i]))
  );
  const mergedBest = { ...(existing.classBestFame || {}) };
  if (incoming.classBestFame) {
    for (const [k, v] of Object.entries(incoming.classBestFame)) {
      mergedBest[k] = Math.max(mergedBest[k] || 0, Number(v) || 0);
    }
  }
  return {
    ...existing,
    ...incoming,
    accountFame: Math.max(Number(existing.accountFame) || 0, Number(incoming.accountFame) || 0),
    sunshards: Math.max(Number(existing.sunshards) || 0, Number(incoming.sunshards) || 0),
    crestShards: mergedShards,
    classBestFame: mergedBest,
    vault: Array.isArray(incoming.vault) ? incoming.vault : existing.vault
  };
}

function sanitizeUsername(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim().replace(/[^a-zA-Z0-9_\- ]/g, '').slice(0, 18).trim();
}

function processMmoRequest(arg1 = {}, arg2 = null) {
  const body = (typeof arg1 === 'string' && arg2 && typeof arg2 === 'object') ? arg2 : (arg1 || {});
  const state = getInstanceState();
  const now = Date.now();
  pruneStaleState(state, now);

  const action = body.action || 'status';

  // 1. LOGIN / REGISTER ACCOUNT IN SHARED MMO INSTANCE
  if (action === 'login') {
    const cleanName = sanitizeUsername(body.username);
    if (!cleanName || cleanName.length < 2) {
      return { ok: false, error: 'Hero Name must be between 2 and 18 characters.' };
    }
    const key = cleanName.toLowerCase();
    const passHash = hashPassword(body.password || '');
    let acct = state.accounts[key];
    let isNewAccount = false;

    if (!acct) {
      isNewAccount = true;
      acct = {
        username: key,
        displayName: cleanName,
        playerId: body.playerId || ('hero_' + key),
        passHash,
        sessionToken: 'tok_' + crypto.randomBytes(12).toString('hex'),
        createdAt: now,
        lastLoginAt: now,
        accountData: {
          playerId: body.playerId || ('hero_' + key),
          ...(body.accountData || {})
        }
      };
      state.accounts[key] = acct;
    } else {
      if (acct.passHash && acct.passHash !== passHash && body.sessionToken !== acct.sessionToken) {
        return { ok: false, error: 'Incorrect passcode for this Hero Name. Try another name or enter your passcode.' };
      }
      if (!acct.passHash && passHash) {
        acct.passHash = passHash;
      }
      acct.lastLoginAt = now;
      acct.displayName = cleanName;
      acct.accountData = mergeAccountData(acct.accountData, body.accountData);
      if (acct.accountData && !acct.accountData.playerId) {
        acct.accountData.playerId = acct.playerId || body.playerId || ('hero_' + key);
      }
    }

    const p = body.player || {};
    const playerId = (acct.accountData && acct.accountData.playerId) || body.playerId || p.id || ('hero_' + key);
    state.players[playerId] = {
      id: playerId,
      name: acct.displayName,
      username: key,
      classId: body.classId || p.classId || 'knight',
      className: p.className || 'Vanguard',
      palette: p.palette || null,
      level: p.level || 20,
      maxedCount: p.maxedCount || 0,
      stars: p.stars || 1,
      mapId: p.mapId || 'nexus',
      x: typeof p.x === 'number' ? p.x : 22,
      y: typeof p.y === 'number' ? p.y : 25,
      vx: 0,
      vy: 0,
      aimAngle: p.aimAngle || 0,
      hp: p.hp || 200,
      maxHp: p.maxHp || 200,
      mp: p.mp || 100,
      maxMp: p.maxMp || 100,
      shielding: false,
      slashTimer: 0,
      isSpinSlash: false,
      equipment: p.equipment || {},
      lastSeen: now
    };

    pushChat(state, {
      sender: 'AETHELGARD-PRIME',
      text: `★ ${acct.displayName} joined the shared MMO instance! (${Object.keys(state.players).length} heroes online)`,
      color: '#4ade80',
      playerId,
      mapId: p.mapId || 'nexus',
      x: state.players[playerId].x,
      y: state.players[playerId].y
    });

    saveInstanceStateThrottled(state, true);

    return {
      ok: true,
      isNewAccount,
      instanceId: state.instanceId,
      instanceName: state.instanceName,
      worldSeed: state.worldSeed,
      username: acct.displayName,
      sessionToken: acct.sessionToken,
      account: acct.accountData,
      accountData: acct.accountData,
      onlineCount: Object.keys(state.players).length,
      players: Object.values(state.players),
      chat: state.chat.slice(-25),
      events: state.events.slice(-30),
      worldState: state.worldState,
      lastSeq: state.seq,
      seq: state.seq,
      chatSeq: state.chatSeq
    };
  }

  // 2. REAL-TIME HEARTBEAT & WORLD/COMBAT SYNC
  if (action === 'sync') {
    const p = body.player;
    if (p && p.id) {
      const existing = state.players[p.id] || {};
      state.players[p.id] = {
        ...existing,
        id: p.id,
        name: sanitizeUsername(p.name || existing.name || 'Hero') || 'Hero',
        classId: p.classId || existing.classId || 'knight',
        className: p.className || existing.className || 'Vanguard',
        palette: p.palette || existing.palette || null,
        level: p.level || 20,
        maxedCount: p.maxedCount || 0,
        stars: p.stars || 1,
        mapId: p.mapId || 'nexus',
        zoneName: p.zoneName || existing.zoneName || 'Sovereign Sanctuary',
        x: typeof p.x === 'number' ? p.x : 22,
        y: typeof p.y === 'number' ? p.y : 25,
        vx: typeof p.vx === 'number' ? p.vx : 0,
        vy: typeof p.vy === 'number' ? p.vy : 0,
        aimAngle: typeof p.aimAngle === 'number' ? p.aimAngle : 0,
        hp: typeof p.hp === 'number' ? p.hp : 200,
        maxHp: typeof p.maxHp === 'number' ? p.maxHp : 200,
        mp: typeof p.mp === 'number' ? p.mp : 100,
        maxMp: typeof p.maxMp === 'number' ? p.maxMp : 100,
        shielding: Boolean(p.shielding),
        slashTimer: typeof p.slashTimer === 'number' ? p.slashTimer : 0,
        spinAttack: Boolean(p.spinAttack || p.isSpinSlash),
        isSpinSlash: Boolean(p.spinAttack || p.isSpinSlash),
        equipment: p.equipment || existing.equipment || {},
        lastSeen: now
      };

      if (body.accountData && p.name) {
        const key = p.name.toLowerCase();
        if (state.accounts[key]) {
          state.accounts[key].accountData = mergeAccountData(state.accounts[key].accountData, body.accountData);
        }
      }
    }

    // Process outgoing client events (attacks, relic casts, boss damage, portals, bags, chat)
    const incomingEvents = Array.isArray(body.events)
      ? body.events
      : Array.isArray(body.clientEvents)
        ? body.clientEvents
        : [];
    for (const cev of incomingEvents) {
      if (!cev || !cev.type) continue;
      if (cev.type === 'chat') {
        pushChat(state, {
          sender: cev.sender || (p && p.name) || 'Hero',
          text: cev.text,
          color: cev.color || '#38bdf8',
          playerId: (p && p.id) || cev.id || cev.playerId,
          mapId: cev.mapId || (p && p.mapId) || 'nexus',
          x: cev.x !== undefined ? cev.x : (p && p.x),
          y: cev.y !== undefined ? cev.y : (p && p.y)
        });
      } else if (cev.type === 'portal_open' && cev.portal) {
        const exists = state.worldState.sharedPortals.some((pt) => pt.id === cev.portal.id);
        if (!exists) {
          state.worldState.sharedPortals.push({
            ...cev.portal,
            id: cev.portal.id,
            portal: cev.portal,
            mapId: cev.mapId || 'realm',
            expiresAt: now + 60000
          });
        }
        pushEvent(state, cev);
      } else if (cev.type === 'public_bag' && cev.bag) {
        state.worldState.sharedBags.push({
          ...cev.bag,
          id: cev.bag.id,
          bag: cev.bag,
          mapId: cev.mapId || 'nexus',
          expiresAt: now + 90000
        });
        pushEvent(state, cev);
      } else {
        pushEvent(state, cev);
      }
    }

    saveInstanceStateThrottled(state, false);

    const sinceSeq = Number(body.sinceSeq) || 0;
    const sinceChatSeq = Number(body.sinceChatId !== undefined ? body.sinceChatId : body.sinceChatSeq) || 0;

    return {
      ok: true,
      instanceId: state.instanceId,
      instanceName: state.instanceName,
      onlineCount: Object.keys(state.players).length,
      players: Object.values(state.players),
      events: state.events.filter((e) => e.seq > sinceSeq),
      chat: state.chat.filter((c) => c.seq > sinceChatSeq),
      worldState: state.worldState,
      lastSeq: state.seq,
      seq: state.seq,
      chatSeq: state.chatSeq
    };
  }

  // 3. LOGOUT
  if (action === 'logout' && body.playerId) {
    const leaving = state.players[body.playerId];
    if (leaving) {
      delete state.players[body.playerId];
      pushChat(state, {
        sender: 'AETHELGARD-PRIME',
        text: `${leaving.name} departed the realm.`,
        color: '#94a3b8'
      });
      saveInstanceStateThrottled(state, true);
    }
    return { ok: true, onlineCount: Object.keys(state.players).length };
  }

  // 4. DEFAULT STATUS SNAPSHOT
  return {
    ok: true,
    instanceId: state.instanceId,
    instanceName: state.instanceName,
    worldSeed: state.worldSeed,
    onlineCount: Object.keys(state.players).length,
    players: Object.values(state.players),
    chat: state.chat.slice(-25),
    worldState: state.worldState,
    seq: state.seq,
    chatSeq: state.chatSeq
  };
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    if (typeof req.body === 'string' && req.body.length > 0) {
      try {
        resolve(JSON.parse(req.body));
      } catch (e) {
        resolve({});
      }
      return;
    }
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 256 * 1024) req.destroy();
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  try {
    const body = req.method === 'POST' ? await readJsonBody(req) : {};
    const result = processMmoRequest(body);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(result));
  } catch (err) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: false, error: err ? err.message : 'Server error' }));
  }
}

handler.processMmoRequest = processMmoRequest;
handler.getInstanceState = getInstanceState;

module.exports = handler;
