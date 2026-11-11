// ============================================================================
// REALM OF THE SHATTERED CREST — HUD, MINIMAP, VAULT, FORGE & MODAL CONTROLLER
// ============================================================================

import { CLASSES, STAT_NAMES, STAT_LABELS, getStarRankColor } from '../data/classes.js';
import { ITEMS, BAG_TYPES } from '../data/items.js';
import { TILES } from '../data/worldgen.js';
import { getItemIconDataUrl } from '../graphics/sprites.js';
import { sound } from '../audio/sound.js';

export class HudController {
  constructor(game) {
    this.game = game;
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');
    this.tooltipEl = document.getElementById('item-tooltip');

    this.activeBagId = null;
    this.lastBagSignature = '';

    this.bindInputs();
    this.bindTopBarButtons();
    this.renderStaticModals();
    this.refreshAllStatsAndSlots();
  }

  bindInputs() {
    const canvas = this.game.canvas;

    const resizeCanvas = () => {
      const wrap = document.getElementById('viewport-wrap');
      canvas.width = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('keydown', (e) => {
      if (document.activeElement && document.activeElement.id === 'chat-input') {
        if (e.key === 'Enter') {
          this.submitChatInput();
          document.activeElement.blur();
        } else if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      this.game.keys[e.code] = true;
      const p = this.game.player;
      if (!p) return;

      if (e.code === 'KeyQ') {
        e.preventDefault();
        this.game.useZeldaRelic();
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        if (!this.game.interactWithNearest()) {
          this.game.useZeldaRelic();
        }
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        this.game.liftOrThrowPot();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        // RotMG Instant Nexus Escape Hotkey!
        sound.playSfx('beam');
        this.game.warpToMap('nexus');
        this.game.addChatMessage('NEXUS', 'Warped safely to the Nexus Sanctuary! [R]', '#38bdf8');
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyC') {
        e.preventDefault();
        if (p.dashCooldown <= 0 && p.stamina >= 22) {
          p.stamina -= 22;
          p.dashTimer = 0.24;
          p.dashCooldown = 0.55;
          p.invulnTimer = Math.max(p.invulnTimer, 0.26);
          sound.playSfx('dash');
          this.game.spawnBurstParticles(p.x, p.y, '#e2e8f0', 10);
        }
      } else if (e.code === 'KeyI') {
        this.game.autoFire = !this.game.autoFire;
        this.game.spawnFloatingText(p.x, p.y - 0.8, `AUTO-FIRE: ${this.game.autoFire ? 'ON' : 'OFF'}`, '#fde047', 12);
      } else if (e.code >= 'Digit1' && e.code <= 'Digit8') {
        const slotIdx = parseInt(e.code.replace('Digit', ''), 10) - 1;
        this.game.useOrEquipItem('inventory', slotIdx);
      } else if (e.code === 'Enter') {
        const chatIn = document.getElementById('chat-input');
        if (chatIn) chatIn.focus();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.game.keys[e.code] = false;
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.game.mouse.x = e.clientX - rect.left;
      this.game.mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mousedown', (e) => {
      sound.init();
      if (e.button === 0) {
        this.game.mouse.leftDown = true;
      } else if (e.button === 2) {
        this.game.mouse.rightDown = true;
        if (this.game.player) {
          this.game.player.shielding = true;
          this.game.player.shieldRaiseTime = this.game.time;
        }
      } else if (e.button === 1) {
        e.preventDefault();
        this.game.useZeldaRelic();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.game.mouse.leftDown = false;
      } else if (e.button === 2) {
        this.game.mouse.rightDown = false;
        if (this.game.player) {
          this.game.player.shielding = false;
        }
      }
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Click on Minimap to Teleport to nearby MMO Player!
    this.minimapCanvas.addEventListener('click', (e) => {
      const rect = this.minimapCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const m = this.game.currentMap;
      const worldX = (mx / this.minimapCanvas.width) * m.width;
      const worldY = (my / this.minimapCanvas.height) * m.height;

      let closestBot = null;
      let bestD = 12;
      for (const bot of this.game.aiPlayers) {
        const d = Math.hypot(bot.x - worldX, bot.y - worldY);
        if (d < bestD) {
          bestD = d;
          closestBot = bot;
        }
      }
      if (closestBot) {
        this.game.teleportToPlayer(closestBot);
      }
    });

    const interactBanner = document.getElementById('interact-banner');
    if (interactBanner) {
      interactBanner.addEventListener('click', () => {
        this.game.interactWithNearest();
      });
    }
  }

  bindTopBarButtons() {
    document.getElementById('btn-warp-nexus').addEventListener('click', () => {
      sound.playSfx('beam');
      this.game.warpToMap('nexus');
    });
    document.getElementById('btn-warp-realm').addEventListener('click', () => {
      sound.playSfx('beam');
      this.game.warpToMap('realm', { zone: 'beach' });
    });
    document.getElementById('btn-warp-godlands').addEventListener('click', () => {
      sound.playSfx('beam');
      this.game.warpToMap('realm', { zone: 'godlands' });
    });
    document.getElementById('btn-warp-sanctum').addEventListener('click', () => {
      sound.playSfx('secret');
      this.game.warpToMap('dungeon', { dungeonId: 'mad_sanctum' });
    });
    document.getElementById('btn-open-classes').addEventListener('click', () => {
      this.openModal('classes');
    });
    document.getElementById('btn-open-vault').addEventListener('click', () => {
      this.openModal('vault');
    });
    document.getElementById('btn-open-forge').addEventListener('click', () => {
      this.openModal('forge');
    });
    document.getElementById('btn-toggle-audio').addEventListener('click', (e) => {
      sound.muted = !sound.muted;
      e.currentTarget.textContent = sound.muted ? '🔇 Muted' : '🔊 Audio';
    });
  }

  // ==========================================================================
  // DYNAMIC HUD REFRESH (60FPS & ON-EVENT)
  // ==========================================================================
  updateFrameHud() {
    const p = this.game.player;
    if (!p) return;

    // 1. Update Zone Banner & Rupees / Account Fame Header
    const zoneEl = document.getElementById('hud-zone-title');
    if (zoneEl) zoneEl.textContent = this.game.currentMap.name;
    const rupeeEl = document.getElementById('hud-rupees');
    if (rupeeEl) rupeeEl.textContent = this.game.account.rupees;
    const accFameEl = document.getElementById('hud-account-fame');
    if (accFameEl) accFameEl.textContent = this.game.account.accountFame;

    const totalStars = this.game.getTotalStars();
    const starInfo = getStarRankColor(totalStars);
    const starEl = document.getElementById('hud-star-badge');
    if (starEl) {
      starEl.textContent = `★ ${totalStars}`;
      starEl.style.color = starInfo.color;
    }

    // 2. Update Zelda Heart Containers (1 Heart = 50 HP, up to 16 Hearts shown)
    this.renderZeldaHearts(p.hp, p.stats.hp);

    // 3. Update RotMG Numerical Bars (Level/XP, Fame, HP, MP, Stamina)
    const lvlFill = document.getElementById('bar-xp-fill');
    const lvlLabel = document.getElementById('bar-xp-label');
    if (p.level < 20) {
      const pct = Math.min(100, (p.xp / p.nextLevelXp) * 100);
      lvlFill.style.width = `${pct}%`;
      lvlFill.style.background = 'linear-gradient(90deg, #16a34a, #22c55e)';
      lvlLabel.innerHTML = `<span>LVL ${p.level} ${p.className}</span><span>${Math.floor(p.xp)}/${p.nextLevelXp} XP</span>`;
    } else {
      lvlFill.style.width = '100%';
      lvlFill.style.background = 'linear-gradient(90deg, #d97706, #eab308)';
      lvlLabel.innerHTML = `<span>LVL 20 ${p.className} [${p.maxedCount}/8]</span><span>★ ${Math.floor(p.fame)} FAME</span>`;
    }

    const hpPct = Math.max(0, Math.min(100, (p.hp / p.stats.hp) * 100));
    document.getElementById('bar-hp-fill').style.width = `${hpPct}%`;
    document.getElementById('bar-hp-label').innerHTML = `<span>HP (LIFE)</span><span>${Math.ceil(p.hp)} / ${p.stats.hp}</span>`;

    const mpPct = Math.max(0, Math.min(100, (p.mp / p.stats.mp) * 100));
    document.getElementById('bar-mp-fill').style.width = `${mpPct}%`;
    document.getElementById('bar-mp-label').innerHTML = `<span>MP (MAGIC)</span><span>${Math.floor(p.mp)} / ${p.stats.mp}</span>`;

    // 4. Context Interaction Prompt Banner ([E] Enter Portal / Open Vault / Open Chest)
    const target = this.game.getNearestInteractiveTarget();
    const banner = document.getElementById('interact-banner');
    if (target) {
      banner.style.display = 'block';
      banner.textContent = target.label;
    } else {
      banner.style.display = 'none';
    }

    // 5. Ground Loot Bag Panel (Appears automatically when standing near any Loot Bag!)
    this.updateGroundBagPanel();

    // 6. Render Minimap & Nearby Party List
    this.renderMinimap();
  }

  renderZeldaHearts(hp, maxHp) {
    const row = document.getElementById('zelda-hearts-row');
    if (!row) return;
    const totalHearts = Math.min(16, Math.max(4, Math.ceil(maxHp / 50)));
    const filledHearts = (hp / maxHp) * totalHearts;
    const sig = `${totalHearts}_${Math.round(filledHearts * 2)}`;
    if (this._heartSig === sig) return;
    this._heartSig = sig;

    let html = '';
    for (let i = 0; i < totalHearts; i++) {
      const rem = filledHearts - i;
      const color = rem >= 0.75 ? '#ef4444' : rem >= 0.25 ? '#fb7185' : 'rgba(148,163,184,0.22)';
      const stroke = rem > 0.1 ? '#fecdd3' : '#475569';
      html += `<svg class="zelda-heart" viewBox="0 0 24 24">
        <path fill="${color}" stroke="${stroke}" stroke-width="2"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>`;
    }
    row.innerHTML = html;
  }

  refreshAllStatsAndSlots() {
    const p = this.game.player;
    if (!p) return;
    const cls = CLASSES[p.classId];

    // 1. Update 8-Stat Grid with Gold 8/8 Maxing Highlights!
    const statsGrid = document.getElementById('stats-grid');
    const maxedBadge = document.getElementById('maxed-counter-badge');
    if (maxedBadge) {
      maxedBadge.textContent = `${p.maxedCount}/8 MAXED`;
      maxedBadge.style.color = p.maxedCount === 8 ? '#facc15' : '#93c5fd';
    }

    if (statsGrid) {
      statsGrid.innerHTML = STAT_NAMES.map((st) => {
        const baseVal = p.baseStats[st];
        const totalVal = p.stats[st];
        const bonus = totalVal - baseVal;
        const cap = cls.maxStats[st];
        const isMaxed = baseVal >= cap;
        const bonusStr = bonus > 0 ? ` <span style="color:#4ade80;font-size:9.5px;">(+${bonus})</span>` : '';
        return `<div class="stat-cell ${isMaxed ? 'maxed' : ''}" title="${STAT_LABELS[st].name}: Base ${baseVal}/${cap}">
          <span class="st-name">${STAT_LABELS[st].short}</span>
          <span class="st-val">${totalVal}${bonusStr}</span>
        </div>`;
      }).join('');
    }

    // 2. Update 4 Equipment Slots (Weapon, Zelda Relic, Armor, Ring)
    const eqContainer = document.getElementById('equipment-grid');
    if (eqContainer) {
      const slots = [
        { key: 'weapon', label: 'BLADE' },
        { key: 'relic',  label: 'RELIC [Q]' },
        { key: 'armor',  label: 'TUNIC' },
        { key: 'ring',   label: 'RING' }
      ];
      eqContainer.innerHTML = slots.map((s) => {
        const itemId = p.equipment[s.key];
        return this.renderSlotHtml(itemId, s.label, 'equip', s.key);
      }).join('');
      this.bindSlotEvents(eqContainer, 'equip');
    }

    // 3. Update 8 Inventory Slots
    const invContainer = document.getElementById('inventory-grid');
    if (invContainer) {
      invContainer.innerHTML = p.inventory.map((itemId, idx) => {
        return this.renderSlotHtml(itemId, `${idx + 1}`, 'inventory', idx);
      }).join('');
      this.bindSlotEvents(invContainer, 'inventory');
    }

    // 4. Update Nearby Party Roster
    this.renderPartyList();
  }

  renderSlotHtml(itemId, placeholder, group, indexOrKey) {
    const item = itemId ? ITEMS[itemId] : null;
    if (!item) {
      return `<div class="item-slot" data-group="${group}" data-index="${indexOrKey}">
        <span class="slot-placeholder">${placeholder}</span>
      </div>`;
    }
    const iconUrl = getItemIconDataUrl(itemId);
    const isUt = item.tier === 'UT';
    return `<div class="item-slot ${isUt ? 'ut-slot' : ''}" data-group="${group}" data-index="${indexOrKey}" data-item-id="${itemId}">
      <img src="${iconUrl}" alt="${item.name}" />
      <span class="slot-tier-badge ${isUt ? 'ut' : ''}">${item.tier}</span>
    </div>`;
  }

  bindSlotEvents(container, group, bagObj = null) {
    const slots = container.querySelectorAll('.item-slot');
    slots.forEach((el) => {
      const itemId = el.getAttribute('data-item-id');
      const idx = parseInt(el.getAttribute('data-index'), 10);

      el.addEventListener('mouseenter', (e) => {
        if (itemId) this.showItemTooltip(itemId, e.clientX, e.clientY);
      });
      el.addEventListener('mousemove', (e) => {
        if (itemId) this.moveTooltip(e.clientX, e.clientY);
      });
      el.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });

      el.addEventListener('click', () => {
        this.hideTooltip();
        if (group === 'inventory' && itemId) {
          this.game.useOrEquipItem('inventory', idx);
        } else if (group === 'bag' && itemId && bagObj) {
          this.game.useOrEquipItem('bag', idx, bagObj);
          this.lastBagSignature = ''; // Force bag UI redraw
          this.updateGroundBagPanel();
        }
      });
    });
  }

  updateGroundBagPanel() {
    const bagSection = document.getElementById('loot-bag-section');
    const bagGrid = document.getElementById('loot-bag-grid');
    const bagTitle = document.getElementById('loot-bag-title');
    if (!bagSection || !bagGrid) return;

    const bag = this.game.getNearestBag();
    if (!bag) {
      if (this.activeBagId !== null) {
        this.activeBagId = null;
        this.lastBagSignature = '';
        bagSection.style.display = 'none';
      }
      return;
    }

    const sig = `${bag.id}_${bag.items.join(',')}`;
    if (sig === this.lastBagSignature) return;
    this.lastBagSignature = sig;
    this.activeBagId = bag.id;

    const meta = BAG_TYPES[bag.bagType] || BAG_TYPES[0];
    bagSection.style.display = 'block';
    bagSection.classList.toggle('white-bag-active', bag.bagType === 6);
    bagTitle.textContent = `${meta.name} (Click to Loot/Drink)`;
    bagTitle.style.color = bag.bagType === 6 ? '#22d3ee' : meta.color;

    const padded = [...bag.items];
    while (padded.length < 4) padded.push(null);

    bagGrid.innerHTML = padded.slice(0, 8).map((itemId, idx) => {
      return this.renderSlotHtml(itemId, '', 'bag', idx);
    }).join('');

    this.bindSlotEvents(bagGrid, 'bag', bag);
  }

  // ==========================================================================
  // ITEM HOVER TOOLTIP
  // ==========================================================================
  showItemTooltip(itemId, cx, cy) {
    const item = ITEMS[itemId];
    if (!item || !this.tooltipEl) return;

    const bagMeta = BAG_TYPES[item.bagType] || BAG_TYPES[0];
    let statsHtml = '';
    if (item.minDmg) {
      statsHtml += `<div style="color:#fde047;font-weight:700;">Damage: ${item.minDmg}–${item.maxDmg}${item.shots > 1 ? ` (x${item.shots} shots)` : ''}</div>`;
    }
    if (item.dmg) {
      statsHtml += `<div style="color:#38bdf8;font-weight:700;">Relic Power: ${item.dmg} Dmg (${item.mpCost} MP)</div>`;
    }
    if (item.heal) {
      statsHtml += `<div style="color:#4ade80;font-weight:700;">Party Heal: +${item.heal} HP (${item.mpCost} MP)</div>`;
    }
    if (item.stats) {
      const pairs = Object.entries(item.stats).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ');
      statsHtml += `<div style="color:#4ade80;font-size:11px;margin-top:2px;">Equip Bonus: ${pairs}</div>`;
    }

    this.tooltipEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-weight:800;font-size:12.5px;color:${item.tier === 'UT' ? '#22d3ee' : '#f8fafc'};">${item.name}</span>
        <span style="font-size:10px;font-weight:800;padding:1px 5px;border-radius:3px;background:rgba(255,255,255,0.1);color:${bagMeta.color};">${item.tier}</span>
      </div>
      ${statsHtml}
      <div style="color:#94a3b8;font-size:11px;line-height:1.35;margin-top:5px;">${item.desc}</div>
      <div style="color:#eab308;font-size:10px;margin-top:6px;font-weight:700;">Click to ${item.slot === 'consumable' ? 'Drink / Consume' : 'Equip'}</div>
    `;
    this.tooltipEl.style.display = 'block';
    this.moveTooltip(cx, cy);
  }

  moveTooltip(cx, cy) {
    if (!this.tooltipEl) return;
    const x = Math.min(window.innerWidth - 260, Math.max(10, cx - 255));
    const y = Math.min(window.innerHeight - 160, Math.max(10, cy - 20));
    this.tooltipEl.style.left = `${x}px`;
    this.tooltipEl.style.top = `${y}px`;
  }

  hideTooltip() {
    if (this.tooltipEl) this.tooltipEl.style.display = 'none';
  }

  // ==========================================================================
  // MINIMAP & TELEPORT ROSTER
  // ==========================================================================
  renderMinimap() {
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;
    const m = this.game.currentMap;
    const p = this.game.player;
    if (!m || !p) return;

    ctx.fillStyle = '#05080f';
    ctx.fillRect(0, 0, w, h);

    const scaleX = w / m.width;
    const scaleY = h / m.height;

    // Sample map tiles cleanly
    const step = m.width > 80 ? 2 : 1;
    for (let y = 0; y < m.height; y += step) {
      for (let x = 0; x < m.width; x += step) {
        const t = m.tiles[y * m.width + x];
        if (t === TILES.WATER || t === TILES.VOID) continue;
        if (t === TILES.SAND) ctx.fillStyle = '#d97706';
        else if (t === TILES.GRASS || t === TILES.FOREST_FLOOR) ctx.fillStyle = '#15803d';
        else if (t === TILES.HIGHLAND_ROCK) ctx.fillStyle = '#57534e';
        else if (t === TILES.GODLANDS_ASH) ctx.fillStyle = '#334155';
        else if (t === TILES.LAVA) ctx.fillStyle = '#ef4444';
        else if (t === TILES.HEAL_SPRING) ctx.fillStyle = '#38bdf8';
        else ctx.fillStyle = '#64748b';
        ctx.fillRect(x * scaleX, y * scaleY, Math.ceil(scaleX * step), Math.ceil(scaleY * step));
      }
    }

    // Portals (Cyan / Gold diamonds)
    for (const pt of m.portals) {
      ctx.fillStyle = pt.color || '#38bdf8';
      ctx.fillRect(pt.x * scaleX - 2.5, pt.y * scaleY - 2.5, 5, 5);
    }

    // Enemies (Red dots, Bosses/Events as pulsing Gold squares)
    for (const e of this.game.enemies) {
      if (e.isBoss || e.isEvent) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(e.x * scaleX - 3.5, e.y * scaleY - 3.5, 7, 7);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(e.x * scaleX - 1.5, e.y * scaleY - 1.5, 3, 3);
      }
    }

    // AI MMO Party Players (Green dots — Clickable to Teleport!)
    for (const bot of this.game.aiPlayers) {
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(bot.x * scaleX - 2, bot.y * scaleY - 2, 4, 4);
    }

    // Local Player (Bright Cyan/White crosshair dot)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x * scaleX, p.y * scaleY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  renderPartyList() {
    const listEl = document.getElementById('party-list');
    if (!listEl) return;
    listEl.innerHTML = this.game.aiPlayers.slice(0, 6).map((bot) => {
      return `<div class="party-row" data-bot-id="${bot.id}" title="Click to Teleport (TP) to ${bot.name}!">
        <span><strong style="color:#4ade80;">★${bot.stars}</strong> ${bot.name} <span style="color:#94a3b8;font-size:10px;">(${bot.maxedCount}/8)</span></span>
        <span style="color:#38bdf8;font-weight:800;font-size:10px;">TP ➔</span>
      </div>`;
    }).join('');

    listEl.querySelectorAll('.party-row').forEach((row) => {
      row.addEventListener('click', () => {
        const botId = row.getAttribute('data-bot-id');
        const bot = this.game.aiPlayers.find((b) => b.id === botId);
        if (bot) this.game.teleportToPlayer(bot);
      });
    });
  }

  // ==========================================================================
  // MMO CHAT & SLASH COMMANDS (/nexus, /glands, /boss, /max88, /whitebag)
  // ==========================================================================
  appendChatMessage({ sender, text, color, botTarget }) {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    const line = document.createElement('div');
    line.className = 'chat-line';
    line.innerHTML = `<strong style="color:${color || '#fde047'};">[${sender}]:</strong> <span>${text}</span>`;

    if (botTarget) {
      const tpBtn = document.createElement('span');
      tpBtn.className = 'chat-tp-link';
      tpBtn.textContent = 'TP';
      tpBtn.addEventListener('click', () => this.game.teleportToPlayer(botTarget));
      line.appendChild(tpBtn);
    }

    box.appendChild(line);
    while (box.children.length > 40) {
      box.removeChild(box.firstChild);
    }
    box.scrollTop = box.scrollHeight;
  }

  submitChatInput() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const val = input.value.trim();
    input.value = '';
    if (!val) return;

    if (val.startsWith('/')) {
      const cmd = val.toLowerCase();
      if (cmd === '/nexus') {
        this.game.warpToMap('nexus');
      } else if (cmd === '/glands' || cmd === '/godlands') {
        this.game.warpToMap('realm', { zone: 'godlands' });
      } else if (cmd === '/boss' || cmd === '/sanctum') {
        this.game.warpToMap('dungeon', { dungeonId: 'mad_sanctum' });
      } else if (cmd === '/max88') {
        const p = this.game.player;
        const cls = CLASSES[p.classId];
        for (const st of STAT_NAMES) p.baseStats[st] = cls.maxStats[st];
        p.level = 20;
        this.game.recalcPlayerStats(true);
        sound.playSfx('white_bag');
        this.game.addChatMessage('CHEAT', 'Hero promoted to Level 20 [8/8 MAXED]!', '#facc15');
      } else if (cmd === '/whitebag') {
        const p = this.game.player;
        this.game.spawnLootBag(p.x + 0.8, p.y, ['wep_sword_ut_master', 'rng_ut_crown', 'arm_ut_magic_armor', 'rel_boom_ut']);
      } else {
        this.game.addChatMessage('HELP', 'Commands: /nexus, /glands, /boss, /max88, /whitebag', '#38bdf8');
      }
      return;
    }

    this.game.addChatMessage(this.game.player.name, val, '#4ade80');
    if (this.game.bc) {
      try {
        this.game.bc.postMessage({ type: 'chat', sender: this.game.player.name, text: val, color: '#4ade80' });
      } catch (e) {}
    }
  }

  // ==========================================================================
  // MODALS: CLASS SELECTOR, ACCOUNT VAULT, GORON RELIC FORGE & PERMADEATH FAME
  // ==========================================================================
  renderStaticModals() {
    document.querySelectorAll('.modal-close-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.closeAllModals());
    });
  }

  openModal(modalName) {
    this.closeAllModals();
    if (modalName === 'classes') {
      this.populateClassesModal();
      document.getElementById('modal-classes').style.display = 'flex';
    } else if (modalName === 'vault') {
      this.populateVaultModal();
      document.getElementById('modal-vault').style.display = 'flex';
    } else if (modalName === 'forge') {
      this.populateForgeModal();
      document.getElementById('modal-forge').style.display = 'flex';
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach((m) => {
      m.style.display = 'none';
    });
  }

  populateClassesModal() {
    const grid = document.getElementById('classes-modal-grid');
    if (!grid) return;

    grid.innerHTML = Object.values(CLASSES).map((cls) => {
      const bestFame = this.game.account.classBestFame[cls.id] || 0;
      const isCurrent = this.game.player && this.game.player.classId === cls.id;
      return `<div class="class-select-card ${isCurrent ? 'active' : ''}" data-class-id="${cls.id}">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong style="font-size:14px;color:${cls.palette.tunic};">${cls.name}</strong>
          <span style="font-size:11px;color:#facc15;font-weight:800;">★ Best: ${bestFame}</span>
        </div>
        <div style="font-size:11px;color:#cbd5e1;font-weight:700;margin:3px 0 6px;">${cls.subtitle}</div>
        <p style="font-size:11px;color:#94a3b8;line-height:1.35;margin:0 0 8px;">${cls.lore}</p>
        <div style="font-size:10px;color:#38bdf8;font-weight:700;">
          8/8 Caps: ${cls.maxStats.hp} HP | ${cls.maxStats.atk} ATK | ${cls.maxStats.def} DEF | ${cls.maxStats.spd} SPD
        </div>
      </div>`;
    }).join('');

    grid.querySelectorAll('.class-select-card').forEach((card) => {
      card.addEventListener('click', () => {
        const cid = card.getAttribute('data-class-id');
        this.game.spawnNewHero(cid);
        this.refreshAllStatsAndSlots();
        this.closeAllModals();
        sound.playSfx('secret');
      });
    });
  }

  populateVaultModal() {
    const invEl = document.getElementById('vault-player-inv');
    const chestEl = document.getElementById('vault-chest-grid');
    if (!invEl || !chestEl) return;

    const p = this.game.player;
    invEl.innerHTML = p.inventory.map((id, idx) => this.renderSlotHtml(id, `INV ${idx + 1}`, 'vault_inv', idx)).join('');
    chestEl.innerHTML = this.game.account.vault.map((id, idx) => this.renderSlotHtml(id, `V ${idx + 1}`, 'vault_chest', idx)).join('');

    // Click Player Inv -> Deposit to Vault
    invEl.querySelectorAll('.item-slot').forEach((slot) => {
      slot.addEventListener('click', () => {
        const idx = parseInt(slot.getAttribute('data-index'), 10);
        const itemId = p.inventory[idx];
        if (!itemId) return;
        const emptyVaultIdx = this.game.account.vault.findIndex((x) => !x);
        if (emptyVaultIdx === -1) return;
        this.game.account.vault[emptyVaultIdx] = itemId;
        p.inventory[idx] = null;
        this.game.saveAccount();
        sound.playSfx('rupee');
        this.populateVaultModal();
        this.refreshAllStatsAndSlots();
      });
    });

    // Click Vault Chest -> Withdraw to Player Inv
    chestEl.querySelectorAll('.item-slot').forEach((slot) => {
      slot.addEventListener('click', () => {
        const idx = parseInt(slot.getAttribute('data-index'), 10);
        const itemId = this.game.account.vault[idx];
        if (!itemId) return;
        const emptyInvIdx = p.inventory.findIndex((x) => !x);
        if (emptyInvIdx === -1) return;
        p.inventory[emptyInvIdx] = itemId;
        this.game.account.vault[idx] = null;
        this.game.saveAccount();
        sound.playSfx('rupee');
        this.populateVaultModal();
        this.refreshAllStatsAndSlots();
      });
    });
  }

  populateForgeModal() {
    const listEl = document.getElementById('forge-recipes-grid');
    const balEl = document.getElementById('forge-rupee-balance');
    if (!listEl) return;
    if (balEl) balEl.textContent = `${this.game.account.rupees} Rupees | ${this.game.account.accountFame} Account Fame`;

    const recipes = [
      { itemId: 'con_fairy',           costRupees: 20,  costFame: 0   },
      { itemId: 'pot_def',             costRupees: 25,  costFame: 0   },
      { itemId: 'pot_atk',             costRupees: 25,  costFame: 0   },
      { itemId: 'pot_spd',             costRupees: 20,  costFame: 0   },
      { itemId: 'pot_dex',             costRupees: 20,  costFame: 0   },
      { itemId: 'pot_life',            costRupees: 45,  costFame: 0   },
      { itemId: 'wep_sword_ut_master', costRupees: 80,  costFame: 50  },
      { itemId: 'wep_bow_ut_light',    costRupees: 80,  costFame: 50  },
      { itemId: 'wep_rod_ut_seasons',  costRupees: 80,  costFame: 50  },
      { itemId: 'rel_boom_ut',         costRupees: 75,  costFame: 40  },
      { itemId: 'rel_hook_ut',         costRupees: 75,  costFame: 40  },
      { itemId: 'rng_ut_crown',        costRupees: 100, costFame: 75  }
    ];

    listEl.innerHTML = recipes.map((r) => {
      const it = ITEMS[r.itemId];
      const icon = getItemIconDataUrl(r.itemId);
      const costLabel = r.costFame > 0 ? `${r.costRupees} Rupees + ${r.costFame} Fame` : `${r.costRupees} Rupees`;
      return `<div class="class-select-card" data-craft-id="${r.itemId}" data-rupees="${r.costRupees}" data-fame="${r.costFame}">
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${icon}" style="width:36px;height:36px;image-rendering:pixelated;" />
          <div>
            <div style="font-weight:800;font-size:12px;color:${it.tier === 'UT' ? '#22d3ee' : '#fde047'};">${it.name}</div>
            <div style="font-size:10.5px;color:#4ade80;font-weight:700;">Cost: ${costLabel}</div>
          </div>
        </div>
        <div style="font-size:10.5px;color:#94a3b8;margin-top:6px;">${it.desc}</div>
      </div>`;
    }).join('');

    listEl.querySelectorAll('.class-select-card').forEach((card) => {
      card.addEventListener('click', () => {
        const itemId = card.getAttribute('data-craft-id');
        const costR = parseInt(card.getAttribute('data-rupees'), 10);
        const costF = parseInt(card.getAttribute('data-fame'), 10);
        if (this.game.account.rupees < costR || this.game.account.accountFame < costF) {
          this.game.spawnFloatingText(this.game.player.x, this.game.player.y - 0.8, 'NOT ENOUGH RUPEES/FAME!', '#ef4444', 13);
          return;
        }
        const emptyIdx = this.game.player.inventory.findIndex((x) => !x);
        if (emptyIdx === -1) {
          this.game.spawnFloatingText(this.game.player.x, this.game.player.y - 0.8, 'INVENTORY FULL!', '#ef4444', 13);
          return;
        }
        this.game.account.rupees -= costR;
        this.game.account.accountFame -= costF;
        this.game.player.inventory[emptyIdx] = itemId;
        this.game.saveAccount();
        sound.playSfx('secret');
        this.populateForgeModal();
        this.refreshAllStatsAndSlots();
      });
    });
  }

  showPermadeathModal(summary) {
    const modal = document.getElementById('modal-death');
    const body = document.getElementById('death-summary-body');
    if (!modal || !body) return;

    const bonusRows = summary.bonuses.map((b) => `
      <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(148,163,184,0.15);">
        <span style="color:#cbd5e1;">${b.name}</span>
        <span style="color:#facc15;font-weight:800;">+${b.amount} Fame</span>
      </div>
    `).join('');

    body.innerHTML = `
      <div style="text-align:center;margin-bottom:14px;">
        <div style="font-size:22px;font-weight:900;color:#ef4444;letter-spacing:0.04em;">HERO FALLEN IN BATTLE</div>
        <div style="font-size:13px;color:#94a3b8;margin-top:4px;">
          Level ${summary.grave.level} ${summary.grave.className} (${summary.grave.maxedCount}/8 Maxed) — Slain by <strong style="color:#f87171;">${summary.killerName}</strong>
        </div>
      </div>
      <div style="background:rgba(9,14,23,0.75);border:1px solid rgba(234,179,8,0.35);border-radius:8px;padding:12px 16px;margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(148,163,184,0.15);">
          <span>Base Character Fame</span>
          <strong style="color:#fde047;">+${summary.baseFame} Fame</strong>
        </div>
        ${bonusRows}
        <div style="display:flex;justify-content:space-between;padding-top:8px;font-size:15px;font-weight:900;color:#4ade80;">
          <span>Total Legacy Fame Earned</span>
          <span>★ +${summary.totalFame} Account Fame</span>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('btn-respawn-hero').onclick = () => {
      modal.style.display = 'none';
      this.game.spawnNewHero(this.game.player.classId);
      this.refreshAllStatsAndSlots();
    };
  }
}
