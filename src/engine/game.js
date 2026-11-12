// ============================================================================
// REALM OF THE SHATTERED CREST — CORE 60FPS TOP-DOWN ACTION-ADVENTURE MMO ENGINE
// ============================================================================

import { CLASSES, STAT_NAMES, STAR_THRESHOLDS, getStarRankColor, CREST_SHARDS } from '../data/classes.js';
import { ITEMS, BAG_TYPES, canClassEquip } from '../data/items.js';
import { ENEMIES } from '../data/enemies.js';
import { TILES, DUNGEON_META, generateNexusMap, generateRealmMap, generateDungeonMap } from '../data/worldgen.js';
import { TILE_SIZE, getTileCanvas, drawProp, drawLootBag, drawHero, drawEnemy } from '../graphics/sprites.js';
import { sound } from '../audio/sound.js';

const STORAGE_KEY = 'rotsc_account_save_v2';

const BOT_NAMES = [
  { name: 'VaelenGuard',   classId: 'knight',     maxed: 8, stars: 25 },
  { name: 'SolarTemplar',  classId: 'paladin',    maxed: 8, stars: 22 },
  { name: 'WhiteBagPls',   classId: 'ranger',     maxed: 6, stars: 16 },
  { name: 'PPE_Vanguard',  classId: 'knight',     maxed: 4, stars: 12 },
  { name: 'CinderPyro',    classId: 'pyromancer', maxed: 7, stars: 19 },
  { name: 'NightStalker',  classId: 'assassin',   maxed: 8, stars: 24 },
  { name: 'SylvanArrow',   classId: 'ranger',     maxed: 3, stars: 8  },
  { name: 'BaneSlayer',    classId: 'paladin',    maxed: 6, stars: 15 },
  { name: 'CalderaHunter', classId: 'pyromancer', maxed: 5, stars: 11 },
  { name: 'BlueStarWiz',   classId: 'pyromancer', maxed: 1, stars: 3  },
  { name: 'BulwarkParry',  classId: 'knight',     maxed: 8, stars: 21 },
  { name: 'DuskShadow',    classId: 'assassin',   maxed: 6, stars: 17 }
];

export class GameEngine {
  constructor(canvas, uiCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = uiCallbacks;

    this.time = 0;
    this.animFrame = 0;
    this.running = false;

    // Persistent Account State (Saved in localStorage)
    this.account = this.loadAccount();

    // Maps cache
    this.nexusMap = generateNexusMap();
    this.realmMap = generateRealmMap(1337);
    this.currentMap = this.nexusMap;

    // Entities in active instance
    this.enemies = [];
    this.projectiles = [];
    this.boomerangs = [];
    this.bombs = [];
    this.lootBags = [];
    this.groundDrops = []; // Hearts, Mana Vials, Sunshards dropped from bushes/urns
    this.particles = [];
    this.floatingTexts = [];
    this.gravestones = [];
    this.aiPlayers = [];
    this.remotePlayers = new Map();

    // Realm Event Progress (Defeat 3 Blight Heralds to unseal the Citadel of Evil Bane!)
    this.realmEventsRemaining = 3;
    this.activeQuestEnemy = null;

    // Input State (Desktop Keyboard/Mouse + Mobile Twin-Stick Touch)
    this.keys = {};
    this.mouse = { x: 0, y: 0, worldX: 0, worldY: 0, leftDown: false, rightDown: false, hasMoved: false };
    this.touch = {
      active: false,
      moveX: 0,
      moveY: 0,
      aimActive: false,
      aimAngle: 0,
      attacking: false
    };
    this.autoFire = false;
    this.cameraShake = 0;

    // Initialize Player Hero
    this.player = null;
    this.spawnNewHero(this.account.lastClassId || 'knight');

    // Initialize AI MMO Bots & Realm Spawns
    this.initAiPlayers();
    this.populateMapEnemies();

    // Multi-Tab BroadcastChannel + Optional WebSocket MMO Sync
    this.setupMultiplayerSync();
  }

  // ==========================================================================
  // ACCOUNT PERSISTENCE (Vault, Sunshards, Holy Crest Shards, Fame, Graveyard)
  // ==========================================================================
  loadAccount() {
    const fallback = {
      accountFame: 250,
      sunshards: 150,
      lastClassId: 'knight',
      crestShards: [false, false, false, false, false],
      classBestFame: { knight: 25, ranger: 20, pyromancer: 0, paladin: 0, assassin: 0 },
      vault: [
        'wep_sword_ut_master',
        'rel_hook_t2',
        'pot_def',
        'pot_spd',
        'pot_atk',
        'con_fairy',
        null, null, null, null, null, null,
        null, null, null, null
      ],
      graveyard: []
    };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return {
        ...fallback,
        ...parsed,
        crestShards: Array.isArray(parsed.crestShards) && parsed.crestShards.length === 5
          ? parsed.crestShards
          : [...fallback.crestShards],
        classBestFame: { ...fallback.classBestFame, ...(parsed.classBestFame || {}) }
      };
    } catch (e) {
      return fallback;
    }
  }

  saveAccount() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.account));
    } catch (e) {}
  }

  getRestoredShardsCount() {
    if (!this.account || !Array.isArray(this.account.crestShards)) return 0;
    return this.account.crestShards.filter(Boolean).length;
  }

  attuneCrestShard(shardIndex) {
    if (shardIndex === undefined || shardIndex < 0 || shardIndex >= CREST_SHARDS.length) return false;
    const shardMeta = CREST_SHARDS[shardIndex];
    const wasAlreadyAttuned = !!this.account.crestShards[shardIndex];
    this.account.crestShards[shardIndex] = true;
    this.account.accountFame += wasAlreadyAttuned ? 25 : 100;
    this.saveAccount();
    this.recalcPlayerStats(false);

    const count = this.getRestoredShardsCount();
    sound.playSfx('white_bag');
    this.cameraShake = 0.45;
    if (this.player) {
      this.spawnBurstParticles(this.player.x, this.player.y, shardMeta.color, 34);
      this.spawnFloatingText(
        this.player.x,
        this.player.y - 1.1,
        `★ ${shardMeta.name.toUpperCase()} RESTORED! (${count}/5) ★`,
        shardMeta.color,
        15
      );
    }
    this.addChatMessage(
      'HIGH ELDER VAELEN',
      `"You have reclaimed the ${shardMeta.name} (${count}/5 Holy Crest Shards)! Permanent Blessing unlocked: ${shardMeta.blessing}!"`,
      '#fde047'
    );

    if (count === 5) {
      this.addChatMessage(
        'HOLY CREST REFORGED',
        '★ ALL 5 SHARDS OF THE HOLY CREST ARE REUNITED! The barrier of Aethelgard blazes with sovereign power — storm the Citadel of Evil Bane and vanquish Malakor! ★',
        '#22d3ee'
      );
    }
    if (this.ui && this.ui.onStatsChanged) this.ui.onStatsChanged();
    return true;
  }

  getTotalStars() {
    let stars = 0;
    for (const cid of Object.keys(CLASSES)) {
      const best = this.account.classBestFame[cid] || 0;
      for (const t of STAR_THRESHOLDS) {
        if (best >= t) stars++;
      }
    }
    return stars;
  }

  // ==========================================================================
  // HERO CREATION & STAT CALCULATION (0/8 to 8/8 Maxing + Crest Blessings!)
  // ==========================================================================
  spawnNewHero(classId = 'knight') {
    const cls = CLASSES[classId] || CLASSES.knight;
    this.account.lastClassId = cls.id;
    this.saveAccount();

    const baseStats = { ...cls.baseStats };
    const equipment = {
      weapon: cls.startingGear[0],
      relic:  cls.startingGear[1],
      armor:  cls.startingGear[2],
      ring:   cls.startingGear[3]
    };

    this.player = {
      id: 'hero_' + Math.random().toString(36).slice(2, 8),
      name: 'Crestbearer',
      classId: cls.id,
      className: cls.name,
      palette: { ...cls.palette },
      x: this.nexusMap.spawnX,
      y: this.nexusMap.spawnY,
      vx: 0,
      vy: 0,
      size: 13,
      level: 1,
      xp: 0,
      nextLevelXp: 100,
      fame: 0,
      kills: 0,
      godKills: 0,
      dungeonsCompleted: 0,
      parries: 0,
      secretsFound: 0,
      potsSmashed: 0,
      baseStats,
      stats: { ...baseStats },
      maxStats: { ...cls.maxStats },
      maxedCount: 0,
      hp: baseStats.hp,
      mp: baseStats.mp,
      stamina: 100,
      maxStamina: 100,
      equipment,
      inventory: ['con_fairy', 'pot_spd', null, null, null, null, null, null],
      aimAngle: 0,
      attackCooldown: 0,
      slashTimer: 0,
      slashDuration: 0.18,
      slashArcRad: 2.1,
      slashRadiusPx: 50,
      isSpinSlash: false,
      chargeTime: 0,
      shielding: false,
      shieldRaiseTime: 0,
      dashTimer: 0,
      dashCooldown: 0,
      invulnTimer: 0,
      hookTarget: null,
      carriedPot: false,
      buffs: { damaging: 0, armored: 0, speedy: 0, healing: 0 },
      debuffs: { slowed: 0, armorBroken: 0 },
      fairyTimer: 0,
      dead: false
    };

    this.recalcPlayerStats(true);
    this.warpToMap('nexus');
    this.addChatMessage('SYSTEM', `Welcome to Realm of the Shattered Crest! Playing as ${cls.name}.`, '#fde047');
    this.addChatMessage('HIGH ELDER VAELEN', 'Approach me in the center of the Sanctuary Hub and press [E] to learn how the Holy Crest was shattered across the realms!', '#38bdf8');
  }

  recalcPlayerStats(healToFull = false) {
    const p = this.player;
    if (!p) return;
    const cls = CLASSES[p.classId];

    const totals = { ...p.baseStats };
    for (const slot of ['weapon', 'relic', 'armor', 'ring']) {
      const itemId = p.equipment[slot];
      const item = itemId ? ITEMS[itemId] : null;
      if (item && item.stats) {
        for (const [st, val] of Object.entries(item.stats)) {
          totals[st] = (totals[st] || 0) + val;
        }
      }
    }

    // Apply permanent blessings from each restored Holy Crest Shard!
    const shardBonuses = [
      { hp: 25, spd: 2 }, // Shard 0: Tide-Crest Shard
      { hp: 25, dex: 2 }, // Shard 1: Wild-Crest Shard
      { mp: 20, wis: 2 }, // Shard 2: Astral-Crest Shard
      { atk: 2, vit: 2 }, // Shard 3: Ossuary-Crest Shard
      { hp: 25, def: 3 }  // Shard 4: Flame-Crest Shard
    ];
    if (this.account && Array.isArray(this.account.crestShards)) {
      this.account.crestShards.forEach((unlocked, idx) => {
        if (unlocked && shardBonuses[idx]) {
          for (const [st, val] of Object.entries(shardBonuses[idx])) {
            totals[st] = (totals[st] || 0) + val;
          }
        }
      });
    }

    p.stats = totals;

    // Count how many of the 8 stats have reached the RotMG 8/8 Class Cap
    let maxed = 0;
    for (const st of STAT_NAMES) {
      if (p.baseStats[st] >= cls.maxStats[st]) maxed++;
    }
    p.maxedCount = maxed;

    if (healToFull) {
      p.hp = p.stats.hp;
      p.mp = p.stats.mp;
    } else {
      p.hp = Math.min(p.hp, p.stats.hp);
      p.mp = Math.min(p.mp, p.stats.mp);
    }

    if (this.ui && this.ui.onStatsChanged) this.ui.onStatsChanged();
  }

  gainXp(amount) {
    const p = this.player;
    if (!p || p.dead) return;

    // Earn RotMG Character Fame continuously
    const fameGain = amount / 18;
    p.fame += fameGain;
    const wholeFame = Math.floor(p.fame);
    if (wholeFame > (this.account.classBestFame[p.classId] || 0)) {
      this.account.classBestFame[p.classId] = wholeFame;
      this.saveAccount();
    }

    if (p.level >= 20) return;

    p.xp += amount;
    while (p.level < 20 && p.xp >= p.nextLevelXp) {
      p.xp -= p.nextLevelXp;
      p.level++;
      p.nextLevelXp = Math.floor(100 * Math.pow(p.level, 1.35));

      const cls = CLASSES[p.classId];
      for (const st of STAT_NAMES) {
        p.baseStats[st] = Math.min(
          cls.maxStats[st],
          Math.round(p.baseStats[st] + (cls.growth[st] || 1))
        );
      }
      this.recalcPlayerStats(true);
      sound.playSfx('levelup');
      this.spawnFloatingText(p.x, p.y - 0.8, `LEVEL ${p.level}!`, '#fde047', 16);
      this.spawnBurstParticles(p.x, p.y, '#fde047', 22);
      if (p.level === 20) {
        this.addChatMessage('SYSTEM', '★ LEVEL 20 REACHED! Now hunt Blight Gods & Dungeon Guardians for Stat Potions (8/8) and the 5 Holy Crest Shards!', '#22c55e');
      }
    }
  }

  // ==========================================================================
  // MAP SWITCHING (Sanctuary Hub <-> Overworld Realm <-> 6 Shard Dungeons)
  // ==========================================================================
  warpToMap(targetType, options = {}) {
    const p = this.player;
    this.projectiles = [];
    this.boomerangs = [];
    this.bombs = [];
    this.lootBags = [];
    this.groundDrops = [];

    if (targetType === 'nexus') {
      this.currentMap = this.nexusMap;
      p.x = this.nexusMap.spawnX;
      p.y = this.nexusMap.spawnY;
      p.hp = p.stats.hp;
      p.mp = p.stats.mp;
    } else if (targetType === 'realm') {
      this.currentMap = this.realmMap;
      if (options.zone === 'godlands') {
        p.x = this.realmMap.godlandsSpawnX;
        p.y = this.realmMap.godlandsSpawnY;
        this.addChatMessage('REALM', 'Entered The Blighted Godlands (Level 20 Endgame Zone)! Defeat Blight Gods for Stat Potions and Dungeon Portals!', '#c084fc');
      } else {
        p.x = this.realmMap.spawnX;
        p.y = this.realmMap.spawnY;
        this.addChatMessage('REALM', 'Entered The Shattered Realm! Push inland toward the center for Highlands & The Blighted Godlands!', '#22c55e');
      }
    } else if (targetType === 'dungeon') {
      const dungeonId = options.dungeonId || 'deku_temple';
      this.currentMap = generateDungeonMap(dungeonId);
      p.x = this.currentMap.spawnX;
      p.y = this.currentMap.spawnY;
      const meta = DUNGEON_META[dungeonId] || DUNGEON_META.deku_temple;
      this.addChatMessage('DUNGEON', `Entered ${meta.name} (${'★'.repeat(meta.difficulty)})! ${meta.desc}`, meta.color);
    }

    p.invulnTimer = 2.0; // Spawn protection i-frames
    this.populateMapEnemies();
    this.repositionAiPlayersForMap();
    if (this.ui && this.ui.onMapChanged) this.ui.onMapChanged(this.currentMap);
  }

  populateMapEnemies() {
    this.enemies = [];
    this.activeQuestEnemy = null;

    if (this.currentMap.id === 'nexus') {
      // Spawn 2 friendly Training Target Dummies in the West Courtyard
      this.spawnEnemy('octorok', 12.5, 28.0, { isDummy: true, name: 'Vanguard Combat Dummy' });
      this.spawnEnemy('darknut_knight', 15.0, 28.0, { isDummy: true, name: 'Armored Parry Dummy' });
      return;
    }

    if (this.currentMap.id === 'realm') {
      const cx = this.currentMap.cx;
      const cy = this.currentMap.cy;

      // Spawn concentric rings of enemies across Beach, Lowlands, Highlands, and Godlands
      for (let i = 0; i < 85; i++) {
        const angle = (i / 85) * Math.PI * 2 + (i % 7) * 0.3;
        const ringRoll = i % 4;
        let dist, pool;
        if (ringRoll === 0) {
          dist = 54 + (i % 5);
          pool = ['octorok', 'chuchu_blue', 'pirate_moblin'];
        } else if (ringRoll === 1) {
          dist = 38 + (i % 10);
          pool = ['deku_scrub', 'stalfos_scout', 'lizalfos_spear'];
        } else if (ringRoll === 2) {
          dist = 24 + (i % 9);
          pool = ['darknut_knight', 'wizzrobe_fire'];
        } else {
          dist = 6 + (i % 13);
          pool = ['medusa_gorgon', 'beholder_eye', 'sprite_archmage', 'phantom_reaper', 'magma_titan'];
        }
        const ex = cx + Math.cos(angle) * dist;
        const ey = cy + Math.sin(angle) * dist;
        if (this.isWalkable(ex, ey)) {
          const eid = pool[i % pool.length];
          this.spawnEnemy(eid, ex, ey);
        }
      }

      // Spawn Active Realm Event Boss in the Godlands Perimeter!
      this.spawnRealmEventBoss();
      return;
    }

    if (this.currentMap.id.startsWith('dungeon_')) {
      const meta = DUNGEON_META[this.currentMap.dungeonId] || DUNGEON_META.deku_temple;
      // Minions in Room 1 & Room 2
      const coords = [
        [19, 50], [25, 50],
        [16, 39], [22, 39], [28, 39],
        [16, 30], [22, 30], [28, 30],
        [18, 18], [26, 18]
      ];
      coords.forEach(([x, y], idx) => {
        const mid = meta.minionIds[idx % meta.minionIds.length];
        this.spawnEnemy(mid, x + 0.5, y + 0.5);
      });

      // Spawn the Dungeon Boss in the North Sanctum!
      const boss = this.spawnEnemy(meta.bossId, this.currentMap.bossSpawnX, this.currentMap.bossSpawnY);
      this.activeQuestEnemy = boss;
    }
  }

  spawnRealmEventBoss() {
    if (this.currentMap.id !== 'realm') return;
    const events = ['event_skull_lord', 'event_cube_overseer', 'event_molten_colossus'];
    const pick = events[Math.max(0, 3 - this.realmEventsRemaining) % events.length];
    const cx = this.currentMap.cx;
    const cy = this.currentMap.cy;
    const ex = cx + (Math.random() > 0.5 ? 10 : -10);
    const ey = cy - 8;
    const boss = this.spawnEnemy(pick, ex, ey);
    this.activeQuestEnemy = boss;
    this.addChatMessage('MALAKOR THE EVIL BANE', `"My ${boss.name} shall grind the remnants of your Holy Crest to dust! (${this.realmEventsRemaining} Blight Events until the Citadel opens!)"`, '#ef4444');
  }

  spawnEnemy(enemyId, x, y, overrides = {}) {
    const tpl = ENEMIES[enemyId];
    if (!tpl) return null;
    const enemy = {
      uid: 'e_' + Math.random().toString(36).slice(2, 9),
      id: tpl.id,
      name: overrides.name || tpl.name,
      biome: tpl.biome,
      isGod: !!tpl.isGod,
      isBoss: !!tpl.isBoss,
      isEvent: !!tpl.isEvent,
      isFinalBoss: !!tpl.isFinalBoss,
      crestShardIndex: tpl.crestShardIndex,
      isDummy: !!overrides.isDummy,
      frontShield: !!tpl.frontShield,
      x,
      y,
      spawnX: x,
      spawnY: y,
      hp: tpl.hp,
      maxHp: tpl.hp,
      def: tpl.def,
      xp: tpl.xp,
      speed: tpl.speed,
      size: tpl.size,
      color: tpl.color,
      accent: tpl.accent,
      ai: tpl.ai,
      fireRate: tpl.fireRate,
      patterns: tpl.patterns || [],
      drops: tpl.drops || [],
      portalDrop: tpl.portalDrop || null,
      cooldown: Math.random() * 1.2,
      spiralAngle: 0,
      facingAngle: Math.PI / 2,
      stunTimer: 0,
      slowTimer: 0,
      armorBreakTimer: 0,
      hitFlash: 0,
      phase: 1
    };
    this.enemies.push(enemy);
    return enemy;
  }

  // ==========================================================================
  // AI MMO PLAYERS (Roam, Fight, Buff Party, Call Out Dungeons & White Bags!)
  // ==========================================================================
  initAiPlayers() {
    this.allAiPlayers = BOT_NAMES.map((b, idx) => {
      const cls = CLASSES[b.classId];
      return {
        id: `bot_${idx}`,
        name: b.name,
        classId: b.classId,
        className: cls.name,
        palette: { ...cls.palette },
        maxedCount: b.maxed,
        stars: b.stars,
        x: 0,
        y: 0,
        aimAngle: 0,
        slashTimer: 0,
        slashDuration: 0.18,
        slashRadiusPx: 42,
        bladeColor: '#38bdf8',
        fireCooldown: 0.5 + Math.random(),
        chatCooldown: 8 + idx * 4,
        zone: idx < 8 ? 'godlands' : 'lowlands'
      };
    });
    this.repositionAiPlayersForMap();
  }

  repositionAiPlayersForMap() {
    const m = this.currentMap;
    if (!m || m.id === 'nexus') {
      // No fake characters in the starting Sanctuary Hub!
      this.aiPlayers = [];
      return;
    }

    this.aiPlayers = [...(this.allAiPlayers || [])];
    this.aiPlayers.forEach((bot, idx) => {
      if (m.id === 'realm') {
        if (idx < 7) {
          // Godlands train party!
          bot.x = m.cx + Math.cos(idx) * 12;
          bot.y = m.cy + Math.sin(idx) * 12;
        } else {
          // Lowlands & Beach adventurers
          const a = idx * 0.9;
          bot.x = m.cx + Math.cos(a) * 34;
          bot.y = m.cy + Math.sin(a) * 34;
        }
      } else {
        // Co-op party inside Dungeon with Player!
        bot.x = m.spawnX + ((idx % 5) - 2) * 1.4;
        bot.y = m.spawnY - (idx % 3) * 1.2;
      }
    });
  }

  teleportToPlayer(botOrPlayer) {
    if (!botOrPlayer || !this.player || this.player.dead) return;
    this.player.x = botOrPlayer.x;
    this.player.y = botOrPlayer.y;
    this.player.invulnTimer = 1.5; // RotMG Teleport invulnerability!
    sound.playSfx('beam');
    this.spawnBurstParticles(this.player.x, this.player.y, '#38bdf8', 20);
    this.spawnFloatingText(this.player.x, this.player.y - 0.8, `TP -> ${botOrPlayer.name}`, '#38bdf8', 14);
  }

  // ==========================================================================
  // PRIMARY WEAPON ATTACK, SPIN ATTACK & SHIELD PARRY
  // ==========================================================================
  performPrimaryAttack(isSpin = false) {
    const p = this.player;
    if (!p || p.dead) return;

    const wep = ITEMS[p.equipment.weapon] || ITEMS.wep_sword_t1;
    const angle = p.aimAngle;

    // 1. Trigger Melee Arc Slash! (Every weapon has a close-range slash that cuts grass/urns/switches and cleaves adjacent foes!)
    p.slashDuration = isSpin ? 0.30 : 0.16;
    p.slashTimer = p.slashDuration;
    p.isSpinSlash = isSpin;
    p.slashArcRad = isSpin ? Math.PI * 2 : ((wep.arcDeg || 115) * Math.PI) / 180;
    const meleeTiles = isSpin ? 3.5 : (wep.subType === 'sword' ? 2.85 : 2.15);
    p.slashRadiusPx = meleeTiles * TILE_SIZE;
    p.bladeColor = isSpin ? '#facc15' : (wep.bladeColor || '#38bdf8');

    sound.playSfx(isSpin ? 'spin_attack' : 'slash');

    // Calculate base weapon damage scaled by RotMG ATK formula: (0.5 + ATK / 50)
    const atkMult = (0.5 + p.stats.atk / 50) * (p.buffs.damaging > 0 ? 1.35 : 1.0);
    const rawDmg = (wep.minDmg + Math.random() * (wep.maxDmg - wep.minDmg)) * atkMult;

    // Check Melee Arc Cleave against Enemies
    for (const e of this.enemies) {
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= meleeTiles + e.size / TILE_SIZE) {
        const angleToE = Math.atan2(dy, dx);
        const diff = Math.abs(this.normalizeAngle(angleToE - angle));
        if (isSpin || diff <= p.slashArcRad * 0.6) {
          const meleeMult = isSpin ? 2.2 : (wep.subType === 'sword' ? 1.35 : 0.95);
          this.damageEnemy(e, rawDmg * meleeMult, angleToE, false);
        }
      }
    }

    // Check Melee Arc against Interactive Props (Bushes, Urns, Crystal Switches!)
    this.hitPropsInRadius(p.x, p.y, meleeTiles, angle, isSpin ? Math.PI * 2 : p.slashArcRad);

    // If Hurricane Spin Attack: deflect nearby enemy projectiles!
    if (isSpin) {
      this.spawnBurstParticles(p.x, p.y, '#facc15', 26);
      for (const proj of this.projectiles) {
        if (proj.fromEnemy && Math.hypot(proj.x - p.x, proj.y - p.y) <= meleeTiles + 0.5) {
          proj.fromEnemy = false;
          proj.vx = -proj.vx * 1.3;
          proj.vy = -proj.vy * 1.3;
          proj.dmg *= 2.0;
          proj.color = '#facc15';
        }
      }
    }

    // 2. Spawn Ranged Projectiles (Sword Beams / Piercing Arrows / Twin Spellbolts / Daggers)
    const shouldFireBeam =
      wep.subType !== 'sword' ||
      wep.alwaysBeam ||
      isSpin ||
      p.hp >= p.stats.hp * 0.85;

    if (shouldFireBeam) {
      const shots = isSpin ? 8 : (wep.shots || 1);
      const spreadRad = ((wep.spreadDeg || 12) * Math.PI) / 180;
      const beamScale = wep.subType === 'sword' ? (wep.beamDmg || 0.75) : 1.0;

      if (wep.subType === 'sword') sound.playSfx('beam');

      for (let i = 0; i < shots; i++) {
        let shotAngle = angle;
        if (isSpin) {
          shotAngle = (i / shots) * Math.PI * 2;
        } else if (shots > 1) {
          shotAngle = angle + (i - (shots - 1) / 2) * spreadRad;
        }

        const speed = wep.subType === 'bow' ? 14.5 : wep.subType === 'dagger' ? 13.5 : 11.5;
        this.projectiles.push({
          x: p.x + Math.cos(shotAngle) * 0.55,
          y: p.y + Math.sin(shotAngle) * 0.55,
          vx: Math.cos(shotAngle) * speed,
          vy: Math.sin(shotAngle) * speed,
          baseAngle: shotAngle,
          age: 0,
          maxDist: wep.range || 7.0,
          traveled: 0,
          dmg: rawDmg * beamScale,
          pierce: !!wep.pierce || wep.subType === 'sword',
          pierceArmor: !!wep.pierceArmor,
          wave: !!wep.wave,
          waveSign: i % 2 === 0 ? 1 : -1,
          color: wep.bladeColor || wep.color || '#38bdf8',
          size: wep.subType === 'sword' ? 8 : 6,
          isCrescent: wep.subType === 'sword',
          fromEnemy: false,
          hitSet: new Set()
        });
      }
    }
  }

  // ==========================================================================
  // SACRED RELIC ABILITIES (Slot 2 — Q Key: Chakram, Grapple, Bomb, Warhorn, Scepter)
  // ==========================================================================
  useRelicAbility() {
    const p = this.player;
    if (!p || p.dead) return;
    const relic = ITEMS[p.equipment.relic];
    if (!relic) return;

    if (p.mp < (relic.mpCost || 30)) {
      this.spawnFloatingText(p.x, p.y - 0.7, 'LOW MAGIC!', '#60a5fa', 12);
      return;
    }
    p.mp -= relic.mpCost || 30;

    const wisBonus = 1 + p.stats.wis / 75;
    const angle = p.aimAngle;

    switch (relic.subType) {
      case 'boomerang': {
        sound.playSfx('boomerang');
        const count = relic.reflectNova ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const a = angle + (count > 1 ? (i === 0 ? -0.22 : 0.22) : 0);
          this.boomerangs.push({
            x: p.x,
            y: p.y,
            angle: a,
            speed: 13.0,
            maxDist: relic.range || 8.0,
            traveled: 0,
            returning: false,
            dmg: (relic.dmg || 160) * wisBonus,
            stunSec: relic.stunSec || 2.0,
            color: relic.color || '#facc15',
            hitSet: new Set()
          });
        }
        // UT Aegis Mirror & Cyclone Glaive reflects nearby bullets on cast!
        if (relic.reflectNova) {
          sound.playSfx('parry');
          this.spawnBurstParticles(p.x, p.y, '#facc15', 24);
          for (const proj of this.projectiles) {
            if (proj.fromEnemy && Math.hypot(proj.x - p.x, proj.y - p.y) <= 4.2) {
              proj.fromEnemy = false;
              proj.vx = -proj.vx * 1.4;
              proj.vy = -proj.vy * 1.4;
              proj.dmg *= 2.5;
              proj.color = '#facc15';
            }
          }
        }
        break;
      }

      case 'hookshot': {
        sound.playSfx('hookshot');
        const maxRange = relic.range || 9.0;
        let bestTarget = null;
        let bestDist = maxRange;

        // 1. Check for Grapple Anchor Pillars along aim ray!
        for (const prop of this.currentMap.props) {
          if (prop.type !== 'grapple_post') continue;
          const dx = prop.x - p.x;
          const dy = prop.y - p.y;
          const d = Math.hypot(dx, dy);
          const diff = Math.abs(this.normalizeAngle(Math.atan2(dy, dx) - angle));
          if (d <= maxRange && diff < 0.55 && d < bestDist) {
            bestDist = d;
            bestTarget = { type: 'pillar', x: prop.x, y: prop.y, prop };
          }
        }

        // 2. Or grapple/stun an Enemy along aim ray!
        if (!bestTarget) {
          for (const e of this.enemies) {
            const dx = e.x - p.x;
            const dy = e.y - p.y;
            const d = Math.hypot(dx, dy);
            const diff = Math.abs(this.normalizeAngle(Math.atan2(dy, dx) - angle));
            if (d <= maxRange && diff < 0.45 && d < bestDist) {
              bestDist = d;
              bestTarget = { type: 'enemy', x: e.x, y: e.y, enemy: e };
            }
          }
        }

        if (bestTarget) {
          if (bestTarget.type === 'pillar') {
            p.hookTarget = { x: bestTarget.x, y: bestTarget.y, shockwave: !!relic.shockwave, dmg: (relic.dmg || 200) * wisBonus };
            p.invulnTimer = Math.max(p.invulnTimer, 0.65);
            this.spawnFloatingText(p.x, p.y - 0.7, 'CHAIN-GRAPPLE!', '#facc15', 13);
          } else if (bestTarget.type === 'enemy') {
            const e = bestTarget.enemy;
            this.damageEnemy(e, (relic.dmg || 180) * wisBonus, angle, true);
            e.stunTimer = Math.max(e.stunTimer, relic.stunSec || 1.8);
            this.spawnBurstParticles(e.x, e.y, '#38bdf8', 16);
            if (relic.shockwave) {
              p.hookTarget = { x: e.x - Math.cos(angle) * 1.4, y: e.y - Math.sin(angle) * 1.4, shockwave: true, dmg: relic.dmg * wisBonus };
              p.invulnTimer = Math.max(p.invulnTimer, 0.65);
            }
          }
        } else {
          // Fire a piercing grapple-bolt even if no anchor was locked
          this.projectiles.push({
            x: p.x, y: p.y,
            vx: Math.cos(angle) * 15, vy: Math.sin(angle) * 15,
            baseAngle: angle, age: 0, maxDist: maxRange, traveled: 0,
            dmg: (relic.dmg || 160) * wisBonus, pierce: true, pierceArmor: true,
            color: relic.color || '#94a3b8', size: 7, fromEnemy: false, hitSet: new Set()
          });
        }
        break;
      }

      case 'bomb': {
        sound.playSfx('bomb_place');
        const cluster = relic.cluster || 1;
        for (let i = 0; i < cluster; i++) {
          const a = angle + (cluster > 1 ? (i - 1) * 0.35 : 0);
          const throwDist = 2.6;
          const tx = p.x + Math.cos(a) * throwDist;
          const ty = p.y + Math.sin(a) * throwDist;
          this.bombs.push({
            x: p.x,
            y: p.y,
            tx,
            ty,
            timer: 0.95,
            maxTimer: 0.95,
            radius: relic.blastRadius || 3.6,
            dmg: (relic.dmg || 280) * wisBonus,
            armorBreak: relic.tier !== 'T1',
            color: relic.color || '#3b82f6'
          });
        }
        break;
      }

      case 'ocarina': {
        sound.playSfx('ocarina');
        const healAmt = Math.round((relic.heal || 100) * wisBonus);
        const dur = (relic.buffSec || 4.5) * wisBonus;
        p.hp = Math.min(p.stats.hp, p.hp + healAmt);
        p.buffs.damaging = Math.max(p.buffs.damaging, dur);
        p.buffs.speedy = Math.max(p.buffs.speedy, dur);
        if (relic.tier !== 'T1') {
          p.buffs.armored = Math.max(p.buffs.armored, dur);
        }
        if (relic.purify) {
          p.debuffs.slowed = 0;
          p.debuffs.armorBroken = 0;
        }
        this.spawnBurstParticles(p.x, p.y, '#fde047', 28);
        this.spawnFloatingText(p.x, p.y - 0.9, `+${healAmt} HP [SOLAR ANTHEM!]`, '#4ade80', 14);
        break;
      }

      case 'wand': {
        sound.playSfx('beam');
        // Phase blink up to 3.2 tiles toward cursor if walkable
        const blinkDist = 3.2;
        const nx = p.x + Math.cos(angle) * blinkDist;
        const ny = p.y + Math.sin(angle) * blinkDist;
        if (this.isWalkable(nx, ny)) {
          this.spawnBurstParticles(p.x, p.y, '#38bdf8', 14);
          p.x = nx;
          p.y = ny;
        }
        if (relic.invulnSec) {
          p.invulnTimer = Math.max(p.invulnTimer, relic.invulnSec);
        }
        // Frost Nova around destination!
        this.spawnBurstParticles(p.x, p.y, relic.color || '#38bdf8', 26);
        for (const e of this.enemies) {
          if (Math.hypot(e.x - p.x, e.y - p.y) <= 4.2) {
            this.damageEnemy(e, (relic.dmg || 200) * wisBonus, angle, true);
            e.slowTimer = Math.max(e.slowTimer, relic.slowSec || 3.5);
            e.stunTimer = Math.max(e.stunTimer, 1.0);
          }
        }
        break;
      }
    }
  }

  // ==========================================================================
  // WORLD INTERACTIONS: BUSHES, URNS, CRACKED WALLS, CRYSTAL SWITCHES
  // ==========================================================================
  hitPropsInRadius(cx, cy, radius, aimAngle = 0, arcRad = Math.PI * 2) {
    const props = this.currentMap.props;
    for (let i = props.length - 1; i >= 0; i--) {
      const prop = props[i];
      const dx = prop.x - cx;
      const dy = prop.y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius + 0.5) continue;

      if (arcRad < Math.PI * 1.9) {
        const diff = Math.abs(this.normalizeAngle(Math.atan2(dy, dx) - aimAngle));
        if (diff > arcRad * 0.65) continue;
      }

      if (prop.type === 'bush') {
        sound.playSfx('bush');
        this.spawnBurstParticles(prop.x, prop.y, '#22c55e', 10);
        this.rollPropDrop(prop.x, prop.y);
        props.splice(i, 1);
      } else if (prop.type === 'pot') {
        sound.playSfx('pot');
        this.player.potsSmashed++;
        this.spawnBurstParticles(prop.x, prop.y, '#ea580c', 12);
        this.rollPropDrop(prop.x, prop.y, true);
        props.splice(i, 1);
      } else if (prop.type === 'crystal_switch') {
        prop.state = prop.state === 'red' ? 'blue' : 'red';
        this.currentMap.switchState = prop.state;
        sound.playSfx('secret');
        this.spawnBurstParticles(prop.x, prop.y, prop.state === 'red' ? '#ef4444' : '#3b82f6', 18);
        this.spawnFloatingText(prop.x, prop.y - 0.6, `SWITCH: ${prop.state.toUpperCase()}!`, '#fde047', 13);
      } else if (prop.type === 'chest' && !prop.opened) {
        this.openTreasureChest(prop);
      }
    }
  }

  liftOrThrowPot() {
    const p = this.player;
    if (!p || p.dead) return;

    if (p.carriedPot) {
      // Hurl carried urn toward cursor!
      p.carriedPot = false;
      sound.playSfx('slash');
      const angle = p.aimAngle;
      this.projectiles.push({
        x: p.x,
        y: p.y,
        vx: Math.cos(angle) * 11.5,
        vy: Math.sin(angle) * 11.5,
        baseAngle: angle,
        age: 0,
        maxDist: 5.5,
        traveled: 0,
        dmg: 190 + p.stats.atk * 4,
        pierce: false,
        pierceArmor: true,
        isThrownPot: true,
        stunOnHit: 1.6,
        color: '#ea580c',
        size: 10,
        fromEnemy: false,
        hitSet: new Set()
      });
      return;
    }

    // Find adjacent urn to lift
    const props = this.currentMap.props;
    for (let i = props.length - 1; i >= 0; i--) {
      const prop = props[i];
      if (prop.type === 'pot' && Math.hypot(prop.x - p.x, prop.y - p.y) <= 1.6) {
        props.splice(i, 1);
        p.carriedPot = true;
        sound.playSfx('dash');
        this.spawnFloatingText(p.x, p.y - 0.8, 'URN LIFTED! [F to Throw]', '#fdba74', 12);
        return;
      }
    }
  }

  rollPropDrop(x, y, isPot = false) {
    const r = Math.random();
    if (r < 0.38) {
      // Green / Blue / Red Sunshard Crystal!
      const val = isPot ? (Math.random() < 0.35 ? 20 : 5) : (Math.random() < 0.25 ? 5 : 1);
      const color = val >= 20 ? '#ef4444' : val >= 5 ? '#3b82f6' : '#22c55e';
      this.groundDrops.push({ type: 'sunshard', x, y, amount: val, color, timer: 18 });
    } else if (r < 0.65) {
      // Recovery Heart!
      this.groundDrops.push({ type: 'heart', x, y, amount: 45, color: '#f43f5e', timer: 18 });
    } else if (r < 0.82) {
      // Mana Vial!
      this.groundDrops.push({ type: 'magic', x, y, amount: 35, color: '#22c55e', timer: 18 });
    }
  }

  openTreasureChest(prop) {
    if (prop.opened) return;
    prop.opened = true;
    sound.playSfx('secret');
    this.player.secretsFound++;
    this.account.sunshards += 50;
    this.saveAccount();
    this.spawnLootBag(prop.x, prop.y, prop.loot || ['pot_def', 'pot_spd'], { isChest: true });
    this.spawnFloatingText(prop.x, prop.y - 0.8, 'TREASURE CHEST OPENED! (+50 Sunshards)', '#facc15', 14);
  }

  // ==========================================================================
  // DAMAGE, ROTMG DEFENSE FORMULA & LOOT BAG SPAWNING
  // ==========================================================================
  damageEnemy(enemy, rawDmg, hitAngle = 0, ignoreArmor = false) {
    if (!enemy || enemy.hp <= 0) return;

    let dmg = rawDmg;

    // Ironclad Dreadnought Directional Front Shield Check!
    if (enemy.frontShield && !ignoreArmor && enemy.stunTimer <= 0 && enemy.armorBreakTimer <= 0) {
      const incomingAngle = this.normalizeAngle(hitAngle + Math.PI);
      const diff = Math.abs(this.normalizeAngle(incomingAngle - (enemy.facingAngle || 0)));
      if (diff < 1.05) {
        dmg *= 0.30;
        sound.playSfx('block');
        this.spawnFloatingText(enemy.x, enemy.y - 0.5, 'SHIELDED! (Flank or Bomb!)', '#94a3b8', 11);
      }
    }

    // RotMG Defense Formula: DEF reduces flat damage up to 85% of raw hit
    const effectiveDef = ( ignoreArmor || enemy.armorBreakTimer > 0 ) ? 0 : enemy.def;
    const finalDmg = Math.max(Math.round(dmg * 0.15), Math.round(dmg - effectiveDef));

    enemy.hp -= finalDmg;
    enemy.hitFlash = 0.12;
    sound.playSfx('hit_enemy');
    this.spawnFloatingText(enemy.x + (Math.random() - 0.5) * 0.5, enemy.y - 0.6, `-${finalDmg}`, ignoreArmor ? '#c084fc' : '#fde047', 12);

    if (enemy.isDummy && enemy.hp <= 50) {
      enemy.hp = enemy.maxHp;
      this.spawnFloatingText(enemy.x, enemy.y - 0.9, 'DUMMY RESET!', '#38bdf8', 12);
      return;
    }

    if (enemy.hp <= 0) {
      this.onEnemyKilled(enemy);
    }
  }

  onEnemyKilled(enemy) {
    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) this.enemies.splice(idx, 1);

    const p = this.player;
    p.kills++;
    if (enemy.isGod || enemy.isBoss) p.godKills++;

    this.gainXp(enemy.xp || 30);
    this.spawnBurstParticles(enemy.x, enemy.y, enemy.color, enemy.isBoss ? 36 : 16);

    // Always drop Sunshards / Hearts around defeated enemy
    this.rollPropDrop(enemy.x + 0.3, enemy.y);
    if (enemy.isBoss || enemy.isGod) {
      this.groundDrops.push({ type: 'sunshard', x: enemy.x - 0.4, y: enemy.y, amount: 25, color: '#ef4444', timer: 25 });
    }

    // If this Boss guards one of the 5 Holy Crest Shards, attune it automatically!
    if (enemy.crestShardIndex !== undefined) {
      this.attuneCrestShard(enemy.crestShardIndex);
    }

    // Roll RotMG Loot Table -> Spawn Physical Colored Loot Bag!
    const droppedItems = [];
    for (const drop of enemy.drops) {
      if (Math.random() < drop.chance) {
        droppedItems.push(drop.id);
      }
    }
    // Guarantee at least 1 drop on Bosses
    if (enemy.isBoss && droppedItems.length === 0 && enemy.drops.length > 0) {
      droppedItems.push(enemy.drops[0].id);
    }

    if (droppedItems.length > 0) {
      this.spawnLootBag(enemy.x, enemy.y, droppedItems.slice(0, 8));
    }

    // Check Dungeon Portal Drop!
    if (enemy.portalDrop && Math.random() < enemy.portalDrop.chance) {
      const meta = DUNGEON_META[enemy.portalDrop.dungeonId];
      if (meta) {
        this.currentMap.portals.push({
          id: 'p_drop_' + Math.random().toString(36).slice(2, 7),
          name: `${meta.name} (${'★'.repeat(meta.difficulty)})`,
          targetMap: 'dungeon',
          dungeonId: meta.id,
          x: enemy.x + 0.8,
          y: enemy.y,
          color: meta.color,
          timer: 45
        });
        this.addChatMessage('PORTAL', `${enemy.name} opened a portal to ${meta.name}! Walk over it and press [E] to enter!`, meta.color);
      }
    }

    // If Realm Event Boss died -> Decrement Realm Events & check Realm Close!
    if (enemy.isEvent) {
      this.realmEventsRemaining = Math.max(0, this.realmEventsRemaining - 1);
      if (this.realmEventsRemaining === 0) {
        this.addChatMessage('MALAKOR THE EVIL BANE', '"IMPOSSIBLE! YOU HAVE SLAIN MY BLIGHT HERALDS! COME FACE ME IN THE CITADEL OF EVIL BANE!"', '#facc15');
        this.cameraShake = 0.8;
        this.currentMap.portals.push({
          id: 'portal_mad_sanctum_event',
          name: '★ CITADEL OF EVIL BANE ★',
          targetMap: 'dungeon',
          dungeonId: 'mad_sanctum',
          x: enemy.x,
          y: enemy.y - 1.2,
          color: '#facc15'
        });
      } else {
        setTimeout(() => this.spawnRealmEventBoss(), 3000);
      }
    }

    // If Dungeon Boss died -> Spawn Return to Sanctuary Portal!
    if (enemy.isBoss && this.currentMap.id.startsWith('dungeon_')) {
      p.dungeonsCompleted++;
      this.account.accountFame += 40;
      this.saveAccount();
      this.currentMap.portals.push({
        id: 'portal_boss_victory',
        name: 'Victory Return to Sanctuary Hub',
        targetMap: 'nexus',
        x: enemy.x,
        y: enemy.y - 1.5,
        color: '#22c55e'
      });
      if (enemy.isFinalBoss) {
        this.addChatMessage(
          'HIGH ELDER VAELEN',
          '"★ MALAKOR, THE EVIL BANE HAS FALLEN! With the Holy Crest reforged, the Blight recedes and Aethelgard is saved! ★"',
          '#22d3ee'
        );
      } else {
        this.addChatMessage('VICTORY', `★ ${enemy.name} DEFEATED! Collect your Blue & White Bag loot and return to High Elder Vaelen in the Sanctuary!`, '#fde047');
      }
    }
  }

  spawnLootBag(x, y, itemIds, options = {}) {
    if (!itemIds || itemIds.length === 0) return;
    let highestBagType = 0;
    for (const id of itemIds) {
      const it = ITEMS[id];
      if (it && it.bagType > highestBagType) {
        highestBagType = it.bagType;
      }
    }

    this.lootBags.push({
      id: 'bag_' + Math.random().toString(36).slice(2, 9),
      x,
      y,
      bagType: highestBagType,
      isChest: Boolean(options.isChest),
      items: [...itemIds],
      timer: 90
    });

    if (highestBagType === 6) {
      sound.playSfx('white_bag');
      this.cameraShake = 0.35;
      const whiteItemNames = itemIds.filter(id => ITEMS[id] && ITEMS[id].bagType === 6).map(id => ITEMS[id].name).join(', ');
      this.addChatMessage('LOOT', `★ LEGENDARY WHITE BAG DROPPED! (${whiteItemNames}) ★`, '#22d3ee');
      this.spawnFloatingText(x, y - 1.0, '★ WHITE BAG! ★', '#ffffff', 16);
    } else if (highestBagType === 4) {
      sound.playSfx('blue_bag');
      this.spawnFloatingText(x, y - 0.8, 'STAT POTION BAG!', '#60a5fa', 13);
    }
  }

  // ==========================================================================
  // INVENTORY, DRINKING STAT POTIONS, ATTUNING CREST SHARDS & EQUIPPING ITEMS
  // ==========================================================================
  useOrEquipItem(sourceType, slotIndex, bagObj = null) {
    const p = this.player;
    if (!p || p.dead) return false;

    const list = sourceType === 'bag' && bagObj ? bagObj.items : p.inventory;
    const itemId = list[slotIndex];
    if (!itemId) return false;
    const item = ITEMS[itemId];
    if (!item) return false;

    // 1. Consumable Stat Potion / Lumina Wisp / Holy Crest Shard
    if (item.slot === 'consumable') {
      if (item.subType === 'crest_shard') {
        this.attuneCrestShard(item.shardIndex);
      } else if (item.subType === 'stat_pot') {
        const cls = CLASSES[p.classId];
        const st = item.stat;
        if (p.baseStats[st] >= cls.maxStats[st]) {
          // If looting from a ground chest/bag and stat is already maxed, store in backpack if space permits!
          if (sourceType === 'bag' && bagObj) {
            const emptyIdx = p.inventory.findIndex(x => !x);
            if (emptyIdx !== -1) {
              p.inventory[emptyIdx] = itemId;
              bagObj.items.splice(slotIndex, 1);
              if (bagObj.items.length === 0) {
                const bIdx = this.lootBags.indexOf(bagObj);
                if (bIdx !== -1) this.lootBags.splice(bIdx, 1);
              }
              sound.playSfx('rupee');
              if (this.ui && this.ui.onStatsChanged) this.ui.onStatsChanged();
              return true;
            }
          }
          this.spawnFloatingText(p.x, p.y - 0.8, `${st.toUpperCase()} ALREADY MAXED!`, '#fde047', 13);
          this.addChatMessage('SYSTEM', `Your ${st.toUpperCase()} is already maxed! Store extra potions in your Sanctuary Vault.`, '#fde047');
          return false;
        }
        p.baseStats[st] = Math.min(cls.maxStats[st], p.baseStats[st] + item.amount);
        this.recalcPlayerStats(false);
        if (st === 'hp') p.hp += item.amount;
        if (st === 'mp') p.mp += item.amount;
        sound.playSfx('potion');
        this.spawnBurstParticles(p.x, p.y, item.color, 18);
        this.spawnFloatingText(p.x, p.y - 0.9, `+${item.amount} MAX ${st.toUpperCase()}! (${p.maxedCount}/8)`, item.color, 14);
      } else if (item.subType === 'stat_omni') {
        const cls = CLASSES[p.classId];
        for (const st of STAT_NAMES) {
          const boost = st === 'hp' ? 45 : st === 'mp' ? 30 : 4;
          p.baseStats[st] = Math.min(cls.maxStats[st], p.baseStats[st] + boost);
        }
        this.recalcPlayerStats(true);
        sound.playSfx('white_bag');
        this.spawnFloatingText(p.x, p.y - 1.0, `ALL STATS BOOSTED! (${p.maxedCount}/8)`, '#fde047', 15);
      } else if (item.subType === 'heal') {
        p.hp = Math.min(p.stats.hp, p.hp + (item.healHp || 250));
        p.mp = Math.min(p.stats.mp, p.mp + (item.healMp || 100));
        sound.playSfx('heart');
        this.spawnFloatingText(p.x, p.y - 0.8, 'LUMINA WISP HEAL!', '#f472b6', 14);
      }

      if (sourceType === 'bag' && bagObj) {
        bagObj.items.splice(slotIndex, 1);
        if (bagObj.items.length === 0) {
          const bIdx = this.lootBags.indexOf(bagObj);
          if (bIdx !== -1) this.lootBags.splice(bIdx, 1);
        }
      } else {
        p.inventory[slotIndex] = null;
      }
      if (this.ui && this.ui.onStatsChanged) this.ui.onStatsChanged();
      return true;
    }

    // 2. If clicking an item in a Ground Loot Bag: move to Inventory first, or equip directly if compatible!
    if (sourceType === 'bag' && bagObj) {
      if (canClassEquip(p.classId, item)) {
        const prevEquipped = p.equipment[item.slot];
        p.equipment[item.slot] = itemId;
        if (prevEquipped) {
          const emptyIdx = p.inventory.findIndex(x => !x);
          if (emptyIdx !== -1) {
            p.inventory[emptyIdx] = prevEquipped;
            bagObj.items.splice(slotIndex, 1);
          } else {
            bagObj.items[slotIndex] = prevEquipped;
          }
        } else {
          bagObj.items.splice(slotIndex, 1);
        }
        this.recalcPlayerStats(false);
        sound.playSfx('rupee');
      } else {
        const emptyIdx = p.inventory.findIndex(x => !x);
        if (emptyIdx === -1) {
          this.spawnFloatingText(p.x, p.y - 0.7, 'INVENTORY FULL!', '#ef4444', 12);
          return false;
        }
        p.inventory[emptyIdx] = itemId;
        bagObj.items.splice(slotIndex, 1);
        sound.playSfx('rupee');
      }
      if (bagObj.items.length === 0) {
        const bIdx = this.lootBags.indexOf(bagObj);
        if (bIdx !== -1) this.lootBags.splice(bIdx, 1);
      }
      if (this.ui && this.ui.onStatsChanged) this.ui.onStatsChanged();
      return true;
    }

    // 3. Equipping from Player Inventory
    if (!canClassEquip(p.classId, item)) {
      this.spawnFloatingText(p.x, p.y - 0.7, `Cannot equip on ${p.className}!`, '#f87171', 12);
      return false;
    }
    const prev = p.equipment[item.slot];
    p.equipment[item.slot] = itemId;
    p.inventory[slotIndex] = prev || null;
    this.recalcPlayerStats(false);
    sound.playSfx('rupee');
    return true;
  }

  lootAllFromBag(bagObj) {
    const p = this.player;
    if (!p || p.dead || !bagObj || !bagObj.items) return 0;
    let looted = 0;
    for (let i = bagObj.items.length - 1; i >= 0; i--) {
      const itemId = bagObj.items[i];
      const item = ITEMS[itemId];
      if (!item) continue;
      if (item.slot === 'consumable') {
        if (this.useOrEquipItem('bag', i, bagObj)) {
          looted++;
        }
      } else {
        // Put equipment into backpack first if space is available, otherwise equip if compatible
        const emptyIdx = p.inventory.findIndex(x => !x);
        if (emptyIdx !== -1) {
          p.inventory[emptyIdx] = itemId;
          bagObj.items.splice(i, 1);
          looted++;
        } else if (canClassEquip(p.classId, item) && !p.equipment[item.slot]) {
          p.equipment[item.slot] = itemId;
          bagObj.items.splice(i, 1);
          this.recalcPlayerStats(false);
          looted++;
        }
      }
    }
    if (bagObj.items.length === 0) {
      const bIdx = this.lootBags.indexOf(bagObj);
      if (bIdx !== -1) this.lootBags.splice(bIdx, 1);
    }
    if (looted > 0) {
      sound.playSfx('rupee');
      if (this.ui && this.ui.onStatsChanged) this.ui.onStatsChanged();
    } else if (bagObj.items.length > 0) {
      this.spawnFloatingText(p.x, p.y - 0.7, 'BACKPACK FULL!', '#ef4444', 12);
    }
    return looted;
  }

  // ==========================================================================
  // PLAYER HIT, PERFECT SHIELD PARRY & PERMADEATH / LUMINA WISP REVIVAL
  // ==========================================================================
  damagePlayer(rawDmg, proj = null, killerName = 'Realm Monster') {
    const p = this.player;
    if (!p || p.dead) return;

    // Check Bulwark Shield Block & Perfect Parry!
    if (p.shielding && proj) {
      const incomingAngle = Math.atan2(p.y - proj.y, p.x - proj.x);
      const shieldFacing = this.normalizeAngle(p.aimAngle + Math.PI);
      const diff = Math.abs(this.normalizeAngle(incomingAngle - shieldFacing));

      if (diff <= 1.2) {
        const timeSinceRaised = this.time - p.shieldRaiseTime;
        if (timeSinceRaised <= 0.25) {
          // ★ PERFECT BULWARK SHIELD PARRY! ★
          p.parries++;
          p.mp = Math.min(p.stats.mp, p.mp + 18);
          proj.fromEnemy = false;
          proj.vx = -proj.vx * 1.45;
          proj.vy = -proj.vy * 1.45;
          proj.dmg = rawDmg * 3.0;
          proj.color = '#facc15';
          proj.traveled = 0;
          sound.playSfx('parry');
          this.spawnBurstParticles(p.x, p.y, '#facc15', 22);
          this.spawnFloatingText(p.x, p.y - 0.9, '★ PERFECT PARRY! ★', '#facc15', 15);
          return;
        } else if (p.stamina >= 15) {
          // Standard Shield Block (80% damage reduction)
          p.stamina = Math.max(0, p.stamina - 18);
          rawDmg *= 0.20;
          sound.playSfx('block');
          this.spawnFloatingText(p.x, p.y - 0.7, 'BLOCKED', '#93c5fd', 11);
        }
      }
    }

    if (p.invulnTimer > 0 || p.dashTimer > 0) return;

    // Apply RotMG DEF calculation
    let def = p.debuffs.armorBroken > 0 ? 0 : p.stats.def;
    if (p.buffs.armored > 0) def = Math.round(def * 1.5);
    const ignoreDef = proj && proj.pierceArmor;
    const finalDmg = ignoreDef
      ? Math.round(rawDmg)
      : Math.max(Math.round(rawDmg * 0.15), Math.round(rawDmg - def));

    p.hp -= finalDmg;
    sound.playSfx('hit_player');
    this.cameraShake = Math.min(0.3, finalDmg / 250);
    this.spawnFloatingText(p.x, p.y - 0.6, `-${finalDmg}`, '#ef4444', 13);

    if (proj && proj.status === 'slowed') {
      p.debuffs.slowed = 2.5;
    }

    // Check Fatal Damage -> Bottled Lumina Wisp Auto-Revive OR RotMG Permadeath!
    if (p.hp <= 0) {
      const fairyIdx = p.inventory.indexOf('con_fairy');
      if (fairyIdx !== -1) {
        p.inventory[fairyIdx] = null;
        p.hp = Math.round(p.stats.hp * 0.65);
        p.mp = Math.round(p.stats.mp * 0.50);
        p.invulnTimer = 2.2;
        sound.playSfx('secret');
        this.spawnBurstParticles(p.x, p.y, '#f472b6', 32);
        this.spawnFloatingText(p.x, p.y - 1.1, '★ LUMINA WISP REVIVED YOU! ★', '#f472b6', 16);
        this.addChatMessage('SANCTUARY', 'Your Bottled Lumina Wisp burst free and saved you from Permadeath!', '#f472b6');
        if (this.ui && this.ui.onStatsChanged) this.ui.onStatsChanged();
        return;
      }

      // PERMADEATH!
      this.triggerPermadeath(killerName);
    }
  }

  triggerPermadeath(killerName) {
    const p = this.player;
    p.dead = true;
    p.hp = 0;
    sound.playSfx('death');

    // Calculate RotMG Fame Bonuses
    const baseFame = Math.max(5, Math.floor(p.fame));
    const bonuses = [];
    if (p.godKills > 0) bonuses.push({ name: 'Slayer of Blight Gods', amount: p.godKills * 15 });
    if (p.dungeonsCompleted > 0) bonuses.push({ name: 'Sanctum Conqueror', amount: p.dungeonsCompleted * 25 });
    if (p.parries > 0) bonuses.push({ name: 'Bulwark Parry Master', amount: p.parries * 12 });
    if (p.secretsFound > 0) bonuses.push({ name: 'Seeker of Secrets', amount: p.secretsFound * 20 });
    if (p.maxedCount > 0) bonuses.push({ name: `${p.maxedCount}/8 Maxed Hero`, amount: p.maxedCount * 30 });
    const shardsRestored = this.getRestoredShardsCount();
    if (shardsRestored > 0) bonuses.push({ name: `Rebuilder of the Holy Crest (${shardsRestored}/5)`, amount: shardsRestored * 35 });

    let gearFame = 0;
    for (const slot of ['weapon', 'relic', 'armor', 'ring']) {
      const it = ITEMS[p.equipment[slot]];
      if (it && it.fameBonus) gearFame += it.fameBonus * 5;
    }
    if (gearFame > 0) bonuses.push({ name: 'Sacred Equipment Bonus', amount: gearFame });

    const totalFame = baseFame + bonuses.reduce((acc, b) => acc + b.amount, 0);

    // Update Account Fame, Best Class Fame & Graveyard
    this.account.accountFame += totalFame;
    if (totalFame > (this.account.classBestFame[p.classId] || 0)) {
      this.account.classBestFame[p.classId] = totalFame;
    }
    const grave = {
      name: p.name,
      className: p.className,
      level: p.level,
      maxedCount: p.maxedCount,
      totalFame,
      killerName,
      x: p.x,
      y: p.y,
      mapId: this.currentMap.id,
      date: new Date().toLocaleTimeString()
    };
    this.gravestones.push(grave);
    this.account.graveyard.unshift(grave);
    this.account.graveyard = this.account.graveyard.slice(0, 12);
    this.saveAccount();

    if (this.ui && this.ui.onPermadeath) {
      this.ui.onPermadeath({ baseFame, bonuses, totalFame, killerName, grave });
    }
  }

  // ==========================================================================
  // MAIN 60FPS UPDATE LOOP
  // ==========================================================================
  update(dt) {
    this.time += dt;
    this.animFrame = Math.floor(this.time * 4);
    if (this.cameraShake > 0) this.cameraShake = Math.max(0, this.cameraShake - dt * 2.2);

    // Respawn Realm enemies periodically so the world stays lively
    if (this.currentMap.id === 'realm' && this.enemies.length < 55 && Math.random() < dt * 0.8) {
      const a = Math.random() * Math.PI * 2;
      const d = 8 + Math.random() * 14;
      const pool = ['medusa_gorgon', 'beholder_eye', 'sprite_archmage', 'phantom_reaper', 'magma_titan'];
      const ex = this.currentMap.cx + Math.cos(a) * d;
      const ey = this.currentMap.cy + Math.sin(a) * d;
      if (this.isWalkable(ex, ey)) {
        this.spawnEnemy(pool[Math.floor(Math.random() * pool.length)], ex, ey);
      }
    }

    this.updatePlayer(dt);
    this.updateAiPlayers(dt);
    this.updateEnemies(dt);
    this.updateProjectiles(dt);
    this.updateBoomerangs(dt);
    this.updateBombs(dt);
    this.updateDropsAndBags(dt);
    this.updateParticles(dt);
  }

  updatePlayer(dt) {
    const p = this.player;
    if (!p || p.dead) return;

    // Update Timers & Buffs
    if (p.attackCooldown > 0) p.attackCooldown -= dt;
    if (p.slashTimer > 0) p.slashTimer -= dt;
    if (p.dashTimer > 0) p.dashTimer -= dt;
    if (p.dashCooldown > 0) p.dashCooldown -= dt;
    if (p.invulnTimer > 0) p.invulnTimer -= dt;
    for (const k of Object.keys(p.buffs)) {
      if (p.buffs[k] > 0) p.buffs[k] = Math.max(0, p.buffs[k] - dt);
    }
    for (const k of Object.keys(p.debuffs)) {
      if (p.debuffs[k] > 0) p.debuffs[k] = Math.max(0, p.debuffs[k] - dt);
    }

    // VIT & WIS Regeneration + Stamina Regeneration
    p.hp = Math.min(p.stats.hp, p.hp + (1.5 + p.stats.vit * 0.24) * dt);
    p.mp = Math.min(p.stats.mp, p.mp + (1.2 + p.stats.wis * 0.22) * dt);
    if (!p.shielding) {
      p.stamina = Math.min(p.maxStamina, p.stamina + 28 * dt);
    }

    // Orbiting Lumina Wisp Companion Heal!
    p.fairyTimer += dt;
    if (p.fairyTimer >= 2.8) {
      p.fairyTimer = 0;
      if (p.hp < p.stats.hp || p.mp < p.stats.mp) {
        p.hp = Math.min(p.stats.hp, p.hp + 20);
        p.mp = Math.min(p.stats.mp, p.mp + 10);
      }
    }

    // Chain-Grapple Flight Override!
    if (p.hookTarget) {
      const dx = p.hookTarget.x - p.x;
      const dy = p.hookTarget.y - p.y;
      const dist = Math.hypot(dx, dy);
      const step = 22.0 * dt;
      if (dist <= step + 0.25) {
        p.x = p.hookTarget.x;
        p.y = p.hookTarget.y;
        if (p.hookTarget.shockwave) {
          this.spawnBurstParticles(p.x, p.y, '#facc15', 22);
          for (const e of this.enemies) {
            if (Math.hypot(e.x - p.x, e.y - p.y) <= 3.5) {
              this.damageEnemy(e, p.hookTarget.dmg || 250, 0, true);
              e.stunTimer = Math.max(e.stunTimer, 1.8);
            }
          }
        }
        p.hookTarget = null;
      } else {
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
      }
      return;
    }

    // Movement Vector (WASD / Arrow Keys OR Mobile Left Analog Joystick)
    let mx = 0;
    let my = 0;
    if (this.touch.moveX !== 0 || this.touch.moveY !== 0) {
      mx = this.touch.moveX;
      my = this.touch.moveY;
    } else {
      if (this.keys['KeyW'] || this.keys['ArrowUp']) my -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) my += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) mx -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) mx += 1;

      if (mx !== 0 || my !== 0) {
        const len = Math.hypot(mx, my);
        mx /= len;
        my /= len;
      }
    }

    // Aim Angle: Mobile Right Aim Stick / Auto-Aim OR Desktop Mouse World Position
    if (this.touch.aimActive) {
      p.aimAngle = this.touch.aimAngle;
    } else if (this.touch.active) {
      const autoAngle = this.findAutoAimAngle();
      if (autoAngle !== null) {
        p.aimAngle = autoAngle;
      } else if (mx !== 0 || my !== 0) {
        p.aimAngle = Math.atan2(my, mx);
      }
    } else if (this.mouse.hasMoved) {
      this.mouse.worldX = p.x + (this.mouse.x - this.canvas.width / 2) / TILE_SIZE;
      this.mouse.worldY = p.y + (this.mouse.y - this.canvas.height / 2) / TILE_SIZE;
      p.aimAngle = Math.atan2(this.mouse.worldY - p.y, this.mouse.worldX - p.x);
    } else if (mx !== 0 || my !== 0) {
      p.aimAngle = Math.atan2(my, mx);
    }

    // Speed calculation from RotMG SPD stat: (4.2 + 5.6 * (SPD / 75)) tiles/sec
    let moveSpeed = 4.5 + 5.5 * (p.stats.spd / 75);
    if (p.buffs.speedy > 0) moveSpeed *= 1.35;
    if (p.debuffs.slowed > 0) moveSpeed *= 0.55;
    if (p.shielding) moveSpeed *= 0.68;
    if (p.dashTimer > 0) moveSpeed *= 2.15;

    const nx = p.x + mx * moveSpeed * dt;
    const ny = p.y + my * moveSpeed * dt;
    if (this.isWalkable(nx, p.y)) p.x = nx;
    if (this.isWalkable(p.x, ny)) p.y = ny;

    // Tile Effects under Player (Sanctuary Healing Spring vs Magma Lava)
    const underTile = this.getTileAt(Math.floor(p.x), Math.floor(p.y));
    if (underTile === TILES.HEAL_SPRING) {
      p.hp = Math.min(p.stats.hp, p.hp + 95 * dt);
      p.mp = Math.min(p.stats.mp, p.mp + 65 * dt);
    } else if (underTile === TILES.LAVA && p.dashTimer <= 0 && p.invulnTimer <= 0) {
      p.hp = Math.max(1, p.hp - 35 * dt);
    }

    // Sword Attack & Spin Attack Charge Logic
    const wep = ITEMS[p.equipment.weapon] || ITEMS.wep_sword_t1;
    const rateMult = wep.rateMult || 1.0;
    const attacksPerSec = (1.6 + 4.8 * (p.stats.dex / 75)) * rateMult;
    const cooldownDur = 1 / attacksPerSec;

    const isAttackingInput = this.mouse.leftDown || this.touch.attacking || this.keys['Space'] || this.autoFire;
    const isHoldCharging = (this.mouse.leftDown || this.touch.attacking) && !this.autoFire;

    if (isAttackingInput) {
      if (isHoldCharging) {
        const prevCharge = p.chargeTime;
        p.chargeTime += dt;
        if (prevCharge < 0.55 && p.chargeTime >= 0.55) {
          sound.playSfx('spin_ready');
          this.spawnFloatingText(p.x, p.y - 0.8, 'SPIN READY! [Release]', '#facc15', 11);
        }
      }
      if (p.attackCooldown <= 0 && p.chargeTime < 0.35) {
        this.performPrimaryAttack(false);
        p.attackCooldown = cooldownDur;
      }
    } else if (p.chargeTime > 0) {
      if (p.chargeTime >= 0.55) {
        this.performPrimaryAttack(true); // 360° Hurricane Spin!
        p.attackCooldown = cooldownDur * 1.1;
      }
      p.chargeTime = 0;
    }
  }

  findAutoAimAngle() {
    const p = this.player;
    if (!p) return null;
    let bestE = null;
    let bestDist = 8.5;
    for (const e of this.enemies) {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < bestDist) {
        bestDist = d;
        bestE = e;
      }
    }
    if (bestE) {
      return Math.atan2(bestE.y - p.y, bestE.x - p.x);
    }
    return null;
  }

  triggerDash() {
    const p = this.player;
    if (!p || p.dead) return false;
    if (p.dashCooldown <= 0 && p.stamina >= 22) {
      p.stamina -= 22;
      p.dashTimer = 0.24;
      p.dashCooldown = 0.55;
      p.invulnTimer = Math.max(p.invulnTimer, 0.26);
      sound.playSfx('dash');
      this.spawnBurstParticles(p.x, p.y, '#e2e8f0', 10);
      return true;
    }
    return false;
  }

  // ==========================================================================
  // AI MMO PLAYERS UPDATE
  // ==========================================================================
  updateAiPlayers(dt) {
    for (const bot of this.aiPlayers) {
      bot.slashTimer = Math.max(0, bot.slashTimer - dt);
      bot.fireCooldown -= dt;
      bot.chatCooldown -= dt;

      if (this.currentMap.id === 'nexus') {
        bot.aimAngle += dt * 0.8;
        continue;
      }

      // Find nearest enemy to bot
      let nearest = null;
      let nearestDist = 11.0;
      for (const e of this.enemies) {
        const d = Math.hypot(e.x - bot.x, e.y - bot.y);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = e;
        }
      }

      if (nearest) {
        bot.aimAngle = Math.atan2(nearest.y - bot.y, nearest.x - bot.x);
        const idealDist = 4.2;
        const moveDir = nearestDist > idealDist ? 1 : nearestDist < 2.8 ? -1 : 0;
        const strafeAngle = bot.aimAngle + Math.PI / 2;
        const vx = Math.cos(bot.aimAngle) * moveDir * 3.5 + Math.cos(strafeAngle) * 2.0;
        const vy = Math.sin(bot.aimAngle) * moveDir * 3.5 + Math.sin(strafeAngle) * 2.0;
        if (this.isWalkable(bot.x + vx * dt, bot.y + vy * dt)) {
          bot.x += vx * dt;
          bot.y += vy * dt;
        }

        if (bot.fireCooldown <= 0) {
          bot.fireCooldown = 0.45 + Math.random() * 0.25;
          bot.slashTimer = 0.14;
          this.projectiles.push({
            x: bot.x,
            y: bot.y,
            vx: Math.cos(bot.aimAngle) * 11.5,
            vy: Math.sin(bot.aimAngle) * 11.5,
            baseAngle: bot.aimAngle,
            age: 0,
            maxDist: 6.5,
            traveled: 0,
            dmg: 45,
            pierce: false,
            color: '#67e8f9',
            size: 5,
            fromEnemy: false,
            fromBot: true,
            hitSet: new Set()
          });
        }

        // Occasional MMO Chat Callout!
        if (bot.chatCooldown <= 0 && (nearest.isGod || nearest.isBoss)) {
          bot.chatCooldown = 28 + Math.random() * 25;
          const phrases = [
            `Fighting ${nearest.name}! Click my name to TP!`,
            `Blighted Godlands train rolling! TP to ${bot.name}!`,
            `Watch the radial shotgun on ${nearest.name}!`,
            `Need Solar Templar Warhorn buff here!`
          ];
          this.addChatMessage(bot.name, phrases[Math.floor(Math.random() * phrases.length)], '#93c5fd', bot);
        }
      } else if (this.player && !this.player.dead) {
        // Follow player loosely in dungeons
        const dx = this.player.x - bot.x;
        const dy = this.player.y - bot.y;
        const d = Math.hypot(dx, dy);
        if (d > 4.5 && d < 18) {
          const nx = bot.x + (dx / d) * 4.2 * dt;
          const ny = bot.y + (dy / d) * 4.2 * dt;
          if (this.isWalkable(nx, ny)) {
            bot.x = nx;
            bot.y = ny;
          }
        }
      }
    }
  }

  // ==========================================================================
  // ENEMY & BOSS BULLET-HELL AI UPDATE
  // ==========================================================================
  updateEnemies(dt) {
    const p = this.player;
    if (!p) return;

    for (const e of this.enemies) {
      if (e.hitFlash > 0) e.hitFlash -= dt;
      if (e.stunTimer > 0) {
        e.stunTimer -= dt;
        continue;
      }
      if (e.slowTimer > 0) e.slowTimer -= dt;
      if (e.armorBreakTimer > 0) e.armorBreakTimer -= dt;

      if (e.isDummy) continue;

      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 18) continue;

      const targetAngle = Math.atan2(dy, dx);
      e.facingAngle = targetAngle;

      // Movement AI
      const spd = (e.speed || 2.5) * (e.slowTimer > 0 ? 0.5 : 1.0);
      let moveX = 0;
      let moveY = 0;

      if (e.ai === 'chase_shoot' || e.ai === 'boss_chase' || e.ai === 'lunge_shoot') {
        if (dist > 3.2) {
          moveX = Math.cos(targetAngle) * spd;
          moveY = Math.sin(targetAngle) * spd;
        }
      } else if (e.ai === 'strafe_shoot' || e.ai === 'boss_strafe') {
        const orbitDir = Math.sin(this.time * 1.4 + e.spawnX) > 0 ? 1 : -1;
        const approach = dist > 6.5 ? 0.6 : dist < 4.0 ? -0.5 : 0;
        moveX = (Math.cos(targetAngle) * approach + Math.cos(targetAngle + (Math.PI / 2) * orbitDir) * 0.8) * spd;
        moveY = (Math.sin(targetAngle) * approach + Math.sin(targetAngle + (Math.PI / 2) * orbitDir) * 0.8) * spd;
      } else if (e.ai === 'boss_orbit' || e.ai === 'mad_king_phases') {
        const a = this.time * 1.1;
        const ox = e.spawnX + Math.cos(a) * 3.5;
        const oy = e.spawnY + Math.sin(a) * 3.5;
        moveX = (ox - e.x) * 2.0;
        moveY = (oy - e.y) * 2.0;
      } else {
        moveX = Math.cos(this.time + e.spawnX) * spd * 0.6;
        moveY = Math.sin(this.time + e.spawnY) * spd * 0.6;
      }

      if (this.isWalkable(e.x + moveX * dt, e.y)) e.x += moveX * dt;
      if (this.isWalkable(e.x, e.y + moveY * dt)) e.y += moveY * dt;

      // Bullet-Hell Pattern Firing
      e.cooldown -= dt;
      if (e.cooldown <= 0 && dist <= 13.5 && !p.dead) {
        e.cooldown = e.fireRate || 1.2;
        this.fireEnemyPatterns(e, targetAngle);
      }
    }
  }

  fireEnemyPatterns(enemy, aimAngle) {
    for (const pat of enemy.patterns) {
      const count = pat.count || 1;
      const speed = pat.speed || 7.0;
      const range = pat.range || 8.5;

      if (pat.type === 'aimed' || pat.type === 'spread' || pat.type === 'grenade') {
        const spreadRad = ((pat.spreadDeg || 20) * Math.PI) / 180;
        for (let i = 0; i < count; i++) {
          const a = count === 1 ? aimAngle : aimAngle + (i - (count - 1) / 2) * (spreadRad / Math.max(1, count - 1));
          this.projectiles.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            baseAngle: a,
            age: 0,
            maxDist: range,
            traveled: 0,
            dmg: pat.dmg || 30,
            pierceArmor: !!pat.pierceArmor,
            boomerang: !!pat.boomerang,
            status: pat.status || null,
            color: pat.color || '#ef4444',
            size: pat.size || 6,
            fromEnemy: true,
            ownerName: enemy.name,
            hitSet: new Set()
          });
        }
      } else if (pat.type === 'radial' || pat.type === 'spiral') {
        if (pat.type === 'spiral') enemy.spiralAngle = (enemy.spiralAngle || 0) + 0.42;
        const baseA = pat.type === 'spiral' ? enemy.spiralAngle : aimAngle;
        for (let i = 0; i < count; i++) {
          const a = baseA + (i / count) * Math.PI * 2;
          this.projectiles.push({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            baseAngle: a,
            age: 0,
            maxDist: range,
            traveled: 0,
            dmg: pat.dmg || 35,
            pierceArmor: !!pat.pierceArmor,
            boomerang: !!pat.boomerang,
            status: pat.status || null,
            color: pat.color || '#f97316',
            size: pat.size || 6,
            fromEnemy: true,
            ownerName: enemy.name,
            hitSet: new Set()
          });
        }
      }
    }
  }

  // ==========================================================================
  // PROJECTILES, CHAKRAMS, BOMBS & DROPS UPDATE
  // ==========================================================================
  updateProjectiles(dt) {
    const p = this.player;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.age += dt;

      let vx = pr.vx;
      let vy = pr.vy;
      if (pr.wave) {
        const perp = pr.baseAngle + Math.PI / 2;
        const osc = Math.cos(pr.age * 16) * 4.0 * (pr.waveSign || 1);
        vx += Math.cos(perp) * osc;
        vy += Math.sin(perp) * osc;
      }
      if (pr.boomerang && pr.traveled > pr.maxDist * 0.5 && !pr.reversed) {
        pr.reversed = true;
        pr.vx = -pr.vx;
        pr.vy = -pr.vy;
      }

      const stepX = vx * dt;
      const stepY = vy * dt;
      pr.x += stepX;
      pr.y += stepY;
      pr.traveled += Math.hypot(stepX, stepY);

      if (pr.traveled >= pr.maxDist || this.isSolidWall(pr.x, pr.y)) {
        if (pr.isThrownPot) {
          sound.playSfx('pot');
          this.spawnBurstParticles(pr.x, pr.y, '#ea580c', 12);
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      if (pr.fromEnemy) {
        if (p && !p.dead && Math.hypot(pr.x - p.x, pr.y - p.y) <= 0.48) {
          this.damagePlayer(pr.dmg, pr, pr.ownerName);
          if (!pr.fromEnemy) continue;
          this.projectiles.splice(i, 1);
        }
      } else {
        if (!pr.fromBot) {
          this.hitPropsInRadius(pr.x, pr.y, 0.55);
        }
        let removeProj = false;
        for (const e of this.enemies) {
          if (pr.hitSet.has(e.uid)) continue;
          const hitRadius = (e.size / TILE_SIZE) + 0.35;
          if (Math.hypot(pr.x - e.x, pr.y - e.y) <= hitRadius) {
            pr.hitSet.add(e.uid);
            const dmg = pr.fromBot ? e.maxHp * 0.015 : pr.dmg;
            this.damageEnemy(e, dmg, pr.baseAngle, pr.pierceArmor);
            if (pr.stunOnHit) {
              e.stunTimer = Math.max(e.stunTimer, pr.stunOnHit);
              sound.playSfx('pot');
            }
            if (!pr.pierce) {
              removeProj = true;
              break;
            }
          }
        }
        if (removeProj) {
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  updateBoomerangs(dt) {
    const p = this.player;
    for (let i = this.boomerangs.length - 1; i >= 0; i--) {
      const b = this.boomerangs[i];
      if (!b.returning) {
        const step = b.speed * dt;
        b.x += Math.cos(b.angle) * step;
        b.y += Math.sin(b.angle) * step;
        b.traveled += step;
        if (b.traveled >= b.maxDist || this.isSolidWall(b.x, b.y)) {
          b.returning = true;
        }
      } else if (p) {
        const dx = p.x - b.x;
        const dy = p.y - b.y;
        const d = Math.hypot(dx, dy);
        const step = (b.speed + 2.5) * dt;
        if (d <= step + 0.4) {
          this.boomerangs.splice(i, 1);
          continue;
        }
        b.x += (dx / d) * step;
        b.y += (dy / d) * step;
      }

      // Chakram cuts bushes, flips switches, stuns enemies, AND pulls Loot Bags & Hearts!
      this.hitPropsInRadius(b.x, b.y, 0.85);

      for (const e of this.enemies) {
        if (!b.hitSet.has(e.uid) && Math.hypot(e.x - b.x, e.y - b.y) <= (e.size / TILE_SIZE) + 0.5) {
          b.hitSet.add(e.uid);
          this.damageEnemy(e, b.dmg, b.angle, false);
          e.stunTimer = Math.max(e.stunTimer, b.stunSec);
          this.spawnBurstParticles(e.x, e.y, '#facc15', 10);
        }
      }

      // Tempest Chakram Loot Magnet! Pull nearby Loot Bags & Drops to Player!
      if (p) {
        for (const bag of this.lootBags) {
          if (Math.hypot(bag.x - b.x, bag.y - b.y) <= 2.2) {
            bag.x += (p.x - bag.x) * 8 * dt;
            bag.y += (p.y - bag.y) * 8 * dt;
          }
        }
        for (const dr of this.groundDrops) {
          if (Math.hypot(dr.x - b.x, dr.y - b.y) <= 2.5) {
            dr.x = p.x;
            dr.y = p.y;
          }
        }
      }
    }
  }

  updateBombs(dt) {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bm = this.bombs[i];
      bm.timer -= dt;
      bm.x += (bm.tx - bm.x) * 8 * dt;
      bm.y += (bm.ty - bm.y) * 8 * dt;

      if (bm.timer <= 0) {
        this.detonateBomb(bm);
        this.bombs.splice(i, 1);
      }
    }
  }

  detonateBomb(bm) {
    sound.playSfx('bomb_explode');
    this.cameraShake = 0.35;
    this.spawnBurstParticles(bm.x, bm.y, '#f97316', 32);
    this.spawnBurstParticles(bm.x, bm.y, '#fde047', 20);

    // 1. Damage & Armor-Break Enemies in Blast Radius
    for (const e of this.enemies) {
      if (Math.hypot(e.x - bm.x, e.y - bm.y) <= bm.radius + e.size / TILE_SIZE) {
        this.damageEnemy(e, bm.dmg, 0, true);
        e.stunTimer = Math.max(e.stunTimer, 1.4);
        if (bm.armorBreak) {
          e.armorBreakTimer = Math.max(e.armorBreakTimer, 4.5);
        }
      }
    }

    // 2. Smash Props in Blast Radius
    this.hitPropsInRadius(bm.x, bm.y, bm.radius);

    // 3. SECRET MECHANIC: Blow open Cracked Dungeon/Sanctuary Walls (`TILES.WALL_CRACKED`)!
    const m = this.currentMap;
    const minX = Math.max(0, Math.floor(bm.x - bm.radius));
    const maxX = Math.min(m.width - 1, Math.ceil(bm.x + bm.radius));
    const minY = Math.max(0, Math.floor(bm.y - bm.radius));
    const maxY = Math.min(m.height - 1, Math.ceil(bm.y + bm.radius));

    let secretOpened = false;
    for (let ty = minY; ty <= maxY; ty++) {
      for (let tx = minX; tx <= maxX; tx++) {
        if (m.tiles[ty * m.width + tx] === TILES.WALL_CRACKED) {
          m.tiles[ty * m.width + tx] = TILES.MARBLE_GOLD;
          secretOpened = true;
          this.spawnBurstParticles(tx + 0.5, ty + 0.5, '#facc15', 24);
        }
      }
    }
    if (secretOpened) {
      sound.playSfx('secret');
      this.player.secretsFound++;
      this.spawnFloatingText(bm.x, bm.y - 1.0, '★ SECRET PASSAGE DISCOVERED! ★', '#facc15', 16);
      this.addChatMessage('SECRET', 'You blasted open a Cracked Wall and discovered a hidden treasure chamber!', '#facc15');
    }
  }

  updateDropsAndBags(dt) {
    const p = this.player;
    for (let i = this.groundDrops.length - 1; i >= 0; i--) {
      const dr = this.groundDrops[i];
      dr.timer -= dt;
      if (dr.timer <= 0) {
        this.groundDrops.splice(i, 1);
        continue;
      }
      if (p && !p.dead) {
        const d = Math.hypot(dr.x - p.x, dr.y - p.y);
        if (d < 2.2) {
          dr.x += (p.x - dr.x) * 9 * dt;
          dr.y += (p.y - dr.y) * 9 * dt;
        }
        if (d < 0.65) {
          if (dr.type === 'sunshard') {
            this.account.sunshards += dr.amount;
            this.saveAccount();
            sound.playSfx('rupee');
            this.spawnFloatingText(p.x, p.y - 0.6, `+${dr.amount} Sunshard`, dr.color, 11);
          } else if (dr.type === 'heart') {
            p.hp = Math.min(p.stats.hp, p.hp + dr.amount);
            sound.playSfx('heart');
            this.spawnFloatingText(p.x, p.y - 0.6, `+${dr.amount} HP`, '#f43f5e', 11);
          } else if (dr.type === 'magic') {
            p.mp = Math.min(p.stats.mp, p.mp + dr.amount);
            sound.playSfx('rupee');
            this.spawnFloatingText(p.x, p.y - 0.6, `+${dr.amount} MP`, '#22c55e', 11);
          }
          this.groundDrops.splice(i, 1);
        }
      }
    }

    // Auto-open nearby world Treasure Chests as the player moves near them!
    if (p && !p.dead && this.currentMap && this.currentMap.props) {
      for (const prop of this.currentMap.props) {
        if (prop.type === 'chest' && !prop.opened && Math.hypot(prop.x - p.x, prop.y - p.y) <= 2.15) {
          this.openTreasureChest(prop);
        }
      }
    }

    for (let i = this.lootBags.length - 1; i >= 0; i--) {
      const bag = this.lootBags[i];
      bag.timer -= dt;
      if (bag.timer <= 0 || bag.items.length === 0) {
        this.lootBags.splice(i, 1);
      }
    }
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.9 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  // ==========================================================================
  // COLLISION & MAP HELPERS
  // ==========================================================================
  getTileAt(tx, ty) {
    const m = this.currentMap;
    if (tx < 0 || tx >= m.width || ty < 0 || ty >= m.height) return TILES.WALL_STONE;
    return m.tiles[ty * m.width + tx];
  }

  isSolidWall(x, y) {
    const t = this.getTileAt(Math.floor(x), Math.floor(y));
    if (t === TILES.WALL_STONE || t === TILES.WALL_TREE || t === TILES.WALL_OBSIDIAN || t === TILES.WALL_CRACKED) {
      return true;
    }
    if (t === TILES.BARRIER_RED && this.currentMap.switchState === 'red') return true;
    if (t === TILES.BARRIER_BLUE && this.currentMap.switchState === 'blue') return true;
    return false;
  }

  isWalkable(x, y) {
    if (this.isSolidWall(x, y)) return false;
    const t = this.getTileAt(Math.floor(x), Math.floor(y));
    if (t === TILES.WATER || t === TILES.VOID) return false;
    return true;
  }

  normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  getNearestBag() {
    if (!this.player) return null;
    let best = null;
    let bestD = 2.25;
    for (const bag of this.lootBags) {
      const d = Math.hypot(bag.x - this.player.x, bag.y - this.player.y);
      if (d < bestD) {
        bestD = d;
        best = bag;
      }
    }
    return best;
  }

  getNearestInteractiveTarget() {
    const p = this.player;
    if (!p) return null;
    for (const portal of this.currentMap.portals) {
      if (Math.hypot(portal.x - p.x, portal.y - p.y) <= 1.8) {
        return { kind: 'portal', obj: portal, label: `Enter ${portal.name} [E]` };
      }
    }
    for (const prop of this.currentMap.props) {
      if (Math.hypot(prop.x - p.x, prop.y - p.y) <= 2.1) {
        if (prop.type === 'elder_npc') {
          return {
            kind: 'elder',
            obj: prop,
            label: `Speak with High Elder Vaelen — Lore & Holy Crest (${this.getRestoredShardsCount()}/5 Shards) [E]`
          };
        }
        if (prop.type === 'vault_chest') return { kind: 'vault', obj: prop, label: 'Open Account Vault [E]' };
        if (prop.type === 'forge_anvil') return { kind: 'forge', obj: prop, label: 'Open Relic Forge [E]' };
        if (prop.type === 'chest' && !prop.opened) return { kind: 'chest', obj: prop, label: 'Open Treasure Chest [E]' };
      }
    }
    return null;
  }

  interactWithNearest() {
    const target = this.getNearestInteractiveTarget();
    if (!target) return false;
    if (target.kind === 'portal') {
      const pt = target.obj;
      this.warpToMap(pt.targetMap, { zone: pt.targetZone, dungeonId: pt.dungeonId });
      return true;
    }
    if (target.kind === 'elder' && this.ui && this.ui.onOpenModal) {
      sound.playSfx('secret');
      this.ui.onOpenModal('elder');
      return true;
    }
    if (target.kind === 'vault' && this.ui && this.ui.onOpenModal) {
      this.ui.onOpenModal('vault');
      return true;
    }
    if (target.kind === 'forge' && this.ui && this.ui.onOpenModal) {
      this.ui.onOpenModal('forge');
      return true;
    }
    if (target.kind === 'chest') {
      this.openTreasureChest(target.obj);
      return true;
    }
    return false;
  }

  // ==========================================================================
  // RENDERING PIPELINE (60FPS CANVAS)
  // ==========================================================================
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const p = this.player;
    if (!p) return;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const shakeX = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake * 28 : 0;
    const shakeY = this.cameraShake > 0 ? (Math.random() - 0.5) * this.cameraShake * 28 : 0;

    const camX = p.x * TILE_SIZE - w / 2 + shakeX;
    const camY = p.y * TILE_SIZE - h / 2 + shakeY;

    // 1. Draw Visible Map Tiles
    const m = this.currentMap;
    const startCol = Math.max(0, Math.floor(camX / TILE_SIZE));
    const endCol = Math.min(m.width - 1, Math.ceil((camX + w) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camY / TILE_SIZE));
    const endRow = Math.min(m.height - 1, Math.ceil((camY + h) / TILE_SIZE));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const t = m.tiles[r * m.width + c];
        const tileImg = getTileCanvas(t, this.animFrame, m.switchState);
        ctx.drawImage(tileImg, Math.floor(c * TILE_SIZE - camX), Math.floor(r * TILE_SIZE - camY));
      }
    }

    // 2. Draw Portals
    for (const pt of m.portals) {
      const sx = pt.x * TILE_SIZE - camX;
      const sy = pt.y * TILE_SIZE - camY;
      if (sx < -60 || sx > w + 60 || sy < -60 || sy > h + 60) continue;

      ctx.save();
      ctx.translate(sx, sy);
      // Swirling portal rings
      ctx.strokeStyle = pt.color || '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 17 + Math.sin(this.time * 5) * 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = pt.color || '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 6 + Math.cos(this.time * 8) * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(pt.name, 0, -24);
      ctx.restore();
    }

    // 3. Draw Interactive Props (including High Elder Vaelen in the Sanctuary Hub!)
    for (const prop of m.props) {
      const sx = prop.x * TILE_SIZE - camX;
      const sy = prop.y * TILE_SIZE - camY;
      if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) continue;
      drawProp(ctx, prop, sx, sy, this.time);
    }

    // 4. Draw Ground Drops (Sunshards, Hearts, Mana Vials)
    for (const dr of this.groundDrops) {
      const sx = dr.x * TILE_SIZE - camX;
      const sy = dr.y * TILE_SIZE - camY + Math.sin(this.time * 6 + dr.x) * 2;
      ctx.save();
      ctx.translate(sx, sy);
      if (dr.type === 'sunshard') {
        // Hexagonal Sunshard Crystal!
        ctx.fillStyle = dr.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(5, -4);
        ctx.lineTo(5, 4);
        ctx.lineTo(0, 8);
        ctx.lineTo(-5, 4);
        ctx.lineTo(-5, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (dr.type === 'heart') {
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(-3.5, -2, 4, 0, Math.PI * 2);
        ctx.arc(3.5, -2, 4, 0, Math.PI * 2);
        ctx.lineTo(0, 7);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-4, -5, 8, 10);
      }
      ctx.restore();
    }

    // 5. Draw Gravestones
    for (const gr of this.gravestones) {
      if (gr.mapId !== m.id) continue;
      const sx = gr.x * TILE_SIZE - camX;
      const sy = gr.y * TILE_SIZE - camY;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.fillStyle = gr.maxedCount >= 8 ? '#eab308' : '#94a3b8';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-11, -14, 22, 24, [10, 10, 2, 2]);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${gr.maxedCount}/8`, 0, 2);
      ctx.restore();
    }

    // 6. Draw Loot Chests & Bags (Visually open when player is near!)
    const nearestBag = this.getNearestBag();
    for (const bag of this.lootBags) {
      const sx = bag.x * TILE_SIZE - camX;
      const sy = bag.y * TILE_SIZE - camY;
      drawLootBag(ctx, bag, sx, sy, this.time, bag === nearestBag);
    }

    // 7. Draw AI MMO Players & Remote WebSocket Players
    for (const bot of this.aiPlayers) {
      const sx = bot.x * TILE_SIZE - camX;
      const sy = bot.y * TILE_SIZE - camY;
      if (sx < -60 || sx > w + 60 || sy < -60 || sy > h + 60) continue;
      drawHero(ctx, bot, sx, sy, this.time, false);
    }
    for (const rp of this.remotePlayers.values()) {
      if (rp.mapId !== m.id) continue;
      const sx = rp.x * TILE_SIZE - camX;
      const sy = rp.y * TILE_SIZE - camY;
      drawHero(ctx, rp, sx, sy, this.time, false);
    }

    // 8. Draw Enemies & Bosses
    for (const e of this.enemies) {
      const sx = e.x * TILE_SIZE - camX;
      const sy = e.y * TILE_SIZE - camY;
      if (sx < -80 || sx > w + 80 || sy < -80 || sy > h + 80) continue;
      drawEnemy(ctx, e, sx, sy, this.time);
    }

    // 9. Draw Player Hero + Hookshot Chain
    if (!p.dead) {
      if (p.hookTarget) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(w / 2, h / 2);
        ctx.lineTo(p.hookTarget.x * TILE_SIZE - camX, p.hookTarget.y * TILE_SIZE - camY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      drawHero(ctx, p, w / 2, h / 2, this.time, true);
    }

    // 10. Draw Active Bombs & Boomerangs
    for (const bm of this.bombs) {
      const sx = bm.x * TILE_SIZE - camX;
      const sy = bm.y * TILE_SIZE - camY;
      ctx.save();
      ctx.translate(sx, sy);
      const pulse = Math.sin(this.time * 28) > 0;
      ctx.fillStyle = pulse ? '#ef4444' : bm.color;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    for (const b of this.boomerangs) {
      const sx = b.x * TILE_SIZE - camX;
      const sy = b.y * TILE_SIZE - camY;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(this.time * 18);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-11, 7);
      ctx.lineTo(0, -10);
      ctx.lineTo(11, 7);
      ctx.stroke();
      ctx.restore();
    }

    // 11. Draw Projectiles (Sword Beams, Arrows, Bullet-Hell Volleys)
    for (const pr of this.projectiles) {
      const sx = pr.x * TILE_SIZE - camX;
      const sy = pr.y * TILE_SIZE - camY;
      if (sx < -30 || sx > w + 30 || sy < -30 || sy > h + 30) continue;

      ctx.save();
      ctx.translate(sx, sy);
      if (pr.isCrescent) {
        ctx.rotate(Math.atan2(pr.vy, pr.vx));
        ctx.strokeStyle = pr.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 11, -0.9, 0.9);
        ctx.stroke();
      } else {
        ctx.fillStyle = pr.color;
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, pr.size || 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 12. Draw Particles & Floating Damage Numbers
    for (const pt of this.particles) {
      const sx = pt.x * TILE_SIZE - camX;
      const sy = pt.y * TILE_SIZE - camY;
      ctx.fillStyle = pt.color;
      ctx.fillRect(sx - 2.5, sy - 2.5, 5, 5);
    }

    for (const ft of this.floatingTexts) {
      const sx = ft.x * TILE_SIZE - camX;
      const sy = ft.y * TILE_SIZE - camY;
      ctx.font = `bold ${ft.size || 12}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#090d16';
      ctx.fillText(ft.text, sx + 1, sy + 1);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, sx, sy);
    }

    // 13. Draw RotMG Quest / Boss Compass Arrow at Edge of Screen!
    if (this.activeQuestEnemy && this.enemies.includes(this.activeQuestEnemy)) {
      const qe = this.activeQuestEnemy;
      const dx = qe.x - p.x;
      const dy = qe.y - p.y;
      const dist = Math.round(Math.hypot(dx, dy));
      if (dist > 9) {
        const angle = Math.atan2(dy, dx);
        const ax = w / 2 + Math.cos(angle) * (Math.min(w, h) * 0.38);
        const ay = h / 2 + Math.sin(angle) * (Math.min(w, h) * 0.38);
        ctx.save();
        ctx.translate(ax, ay);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-75, -18, 150, 34, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`QUEST: ${qe.name}`, 0, -3);
        ctx.fillStyle = '#93c5fd';
        ctx.fillText(`${dist}m away`, 0, 10);
        ctx.restore();
      }
    }
  }

  // ==========================================================================
  // PARTICLES, FLOATING TEXT & MULTIPLAYER SYNC
  // ==========================================================================
  spawnBurstParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        color,
        life: 0.25 + Math.random() * 0.25
      });
    }
  }

  spawnFloatingText(x, y, text, color = '#ffffff', size = 12) {
    this.floatingTexts.push({ x, y, text, color, size, life: 0.85 });
  }

  addChatMessage(sender, text, color = '#e2e8f0', botTarget = null) {
    if (this.ui && this.ui.onChatMessage) {
      this.ui.onChatMessage({ sender, text, color, botTarget });
    }
  }

  setupMultiplayerSync() {
    // 1. BroadcastChannel for zero-latency Multi-Tab Co-Op!
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.bc = new BroadcastChannel('rotsc_mmo_channel');
        this.bc.onmessage = (ev) => {
          this.handleNetworkPacket(ev.data);
        };
      }
    } catch (e) {}

    // 2. WebSocket connection to Node.js MMO Server when running locally on port 4000
    try {
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = `${location.hostname}:${location.port || 4000}`;
        const ws = new WebSocket(`${proto}//${host}/ws`);
        ws.onmessage = (ev) => {
          try {
            this.handleNetworkPacket(JSON.parse(ev.data));
          } catch (err) {}
        };
        this.ws = ws;
      }
    } catch (e) {}

    // Broadcast local player position & state every 120ms
    setInterval(() => {
      if (!this.player || this.player.dead) return;
      const pkt = {
        type: 'player_sync',
        id: this.player.id,
        name: this.player.name,
        x: this.player.x,
        y: this.player.y,
        aimAngle: this.player.aimAngle,
        palette: this.player.palette,
        maxedCount: this.player.maxedCount,
        mapId: this.currentMap.id,
        ts: Date.now()
      };
      if (this.bc) {
        try { this.bc.postMessage(pkt); } catch (e) {}
      }
      if (this.ws && this.ws.readyState === 1) {
        try { this.ws.send(JSON.stringify(pkt)); } catch (e) {}
      }
    }, 120);
  }

  handleNetworkPacket(pkt) {
    if (!pkt || pkt.id === (this.player && this.player.id)) return;
    if (pkt.type === 'player_sync') {
      this.remotePlayers.set(pkt.id, pkt);
    } else if (pkt.type === 'chat') {
      this.addChatMessage(pkt.sender, pkt.text, pkt.color || '#38bdf8');
    }
  }
}
