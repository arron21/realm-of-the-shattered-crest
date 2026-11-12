// ============================================================================
// REALM OF THE SHATTERED CREST — HUD, MINIMAP, ELDER LORE, VAULT & FORGE UI
// ============================================================================

import { CLASSES, STAT_NAMES, STAT_LABELS, getStarRankColor, CREST_SHARDS, ELDER_LORE_CHAPTERS } from '../data/classes.js';
import { ITEMS, BAG_TYPES, canClassEquip } from '../data/items.js';
import { TILES, TILE_SIZE } from '../data/worldgen.js';
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
    this.selectedSlot = null;

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
        this.game.useRelicAbility();
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        if (!this.game.interactWithNearest()) {
          this.game.useRelicAbility();
        }
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        this.game.liftOrThrowPot();
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        this.openModal('elder');
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        // RotMG Instant Sanctuary Escape Hotkey!
        sound.playSfx('beam');
        this.game.warpToMap('nexus');
        this.game.addChatMessage('SANCTUARY', 'Warped safely to the Radiant Sanctuary Hub! [R]', '#38bdf8');
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyC') {
        e.preventDefault();
        this.game.triggerDash();
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
      this.game.mouse.hasMoved = true;
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
        this.game.useRelicAbility();
      }
    });

    canvas.addEventListener('mouseup', (e) => {
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

    const takeAllBtn = document.getElementById('world-loot-take-all');
    if (takeAllBtn) {
      takeAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const bag = this.game.getNearestBag();
        if (bag) {
          this.game.lootAllFromBag(bag);
          this.lastBagSignature = '';
          this.updateGroundBagPanel();
        }
      });
    }

    this.bindTouchControls();
  }

  bindTouchControls() {
    // 1. Left Thumb Virtual Analog Movement Joystick
    const moveZone = document.getElementById('touch-joystick-zone');
    const joyBase = document.getElementById('joystick-base');
    const joyKnob = document.getElementById('joystick-knob');

    if (moveZone && joyBase && joyKnob) {
      let moveTouchId = null;
      let moveMouseDown = false;
      const maxRadius = 36;

      const updateMoveStick = (clientX, clientY) => {
        const rect = joyBase.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;
        const dist = Math.hypot(dx, dy);
        const clamped = Math.min(maxRadius, dist);
        const angle = Math.atan2(dy, dx);
        const kx = dist > 3 ? Math.cos(angle) * clamped : 0;
        const ky = dist > 3 ? Math.sin(angle) * clamped : 0;

        joyKnob.style.transform = `translate(${Math.round(kx)}px, ${Math.round(ky)}px)`;
        this.game.touch.active = true;
        this.game.touch.moveX = dist > 4 ? kx / maxRadius : 0;
        this.game.touch.moveY = dist > 4 ? ky / maxRadius : 0;
      };

      const resetMoveStick = () => {
        moveTouchId = null;
        moveMouseDown = false;
        joyKnob.style.transform = 'translate(0px, 0px)';
        this.game.touch.moveX = 0;
        this.game.touch.moveY = 0;
      };

      moveZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        sound.init();
        const t = e.changedTouches[0];
        if (t) {
          moveTouchId = t.identifier;
          updateMoveStick(t.clientX, t.clientY);
        }
      });

      moveZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === moveTouchId) {
            updateMoveStick(t.clientX, t.clientY);
            break;
          }
        }
      });

      moveZone.addEventListener('touchend', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === moveTouchId) {
            resetMoveStick();
            break;
          }
        }
      });

      moveZone.addEventListener('touchcancel', () => resetMoveStick());

      // Also support mouse drag on the virtual joystick for responsive testing
      moveZone.addEventListener('mousedown', (e) => {
        e.preventDefault();
        sound.init();
        moveMouseDown = true;
        updateMoveStick(e.clientX, e.clientY);
      });
      window.addEventListener('mousemove', (e) => {
        if (moveMouseDown) updateMoveStick(e.clientX, e.clientY);
      });
      window.addEventListener('mouseup', () => {
        if (moveMouseDown) resetMoveStick();
      });
    }

    // 2. Right Thumb Twin-Stick Attack & 360° Aim Pad
    const attackBtn = document.getElementById('btn-touch-attack');
    const attackKnob = document.getElementById('attack-stick-knob');
    if (attackBtn && attackKnob) {
      let aimTouchId = null;
      let aimMouseDown = false;
      const maxAimR = 20;

      const updateAimStick = (clientX, clientY) => {
        const rect = attackBtn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = clientX - cx;
        const dy = clientY - cy;
        const dist = Math.hypot(dx, dy);
        this.game.touch.active = true;
        this.game.touch.attacking = true;
        attackBtn.classList.add('active');

        if (dist > 10) {
          const angle = Math.atan2(dy, dx);
          const clamped = Math.min(maxAimR, dist);
          attackKnob.style.transform = `translate(${Math.round(Math.cos(angle) * clamped)}px, ${Math.round(Math.sin(angle) * clamped)}px)`;
          this.game.touch.aimActive = true;
          this.game.touch.aimAngle = angle;
        } else {
          attackKnob.style.transform = 'translate(0px, 0px)';
          this.game.touch.aimActive = false;
        }
      };

      const resetAimStick = () => {
        aimTouchId = null;
        aimMouseDown = false;
        attackBtn.classList.remove('active');
        attackKnob.style.transform = 'translate(0px, 0px)';
        this.game.touch.attacking = false;
        this.game.touch.aimActive = false;
      };

      attackBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        sound.init();
        const t = e.changedTouches[0];
        if (t) {
          aimTouchId = t.identifier;
          updateAimStick(t.clientX, t.clientY);
        }
      });

      attackBtn.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === aimTouchId) {
            updateAimStick(t.clientX, t.clientY);
            break;
          }
        }
      });

      attackBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === aimTouchId) {
            resetAimStick();
            break;
          }
        }
      });

      attackBtn.addEventListener('touchcancel', () => resetAimStick());

      attackBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        sound.init();
        aimMouseDown = true;
        updateAimStick(e.clientX, e.clientY);
      });
      window.addEventListener('mousemove', (e) => {
        if (aimMouseDown) updateAimStick(e.clientX, e.clientY);
      });
      window.addEventListener('mouseup', () => {
        if (aimMouseDown) resetAimStick();
      });
    }

    // 3. Radial Action Buttons (Relic [Q], Parry/Shield, Dash, Urn [F])
    const relicBtn = document.getElementById('btn-touch-relic');
    if (relicBtn) {
      const triggerRelic = (e) => {
        e.preventDefault();
        sound.init();
        this.game.touch.active = true;
        this.game.useRelicAbility();
      };
      relicBtn.addEventListener('touchstart', triggerRelic);
      relicBtn.addEventListener('click', triggerRelic);
    }

    const shieldBtn = document.getElementById('btn-touch-shield');
    if (shieldBtn) {
      const startShield = (e) => {
        e.preventDefault();
        sound.init();
        this.game.touch.active = true;
        shieldBtn.classList.add('active');
        if (this.game.player) {
          this.game.player.shielding = true;
          this.game.player.shieldRaiseTime = this.game.time;
        }
      };
      const endShield = (e) => {
        if (e) e.preventDefault();
        shieldBtn.classList.remove('active');
        if (this.game.player) {
          this.game.player.shielding = false;
        }
      };
      shieldBtn.addEventListener('touchstart', startShield);
      shieldBtn.addEventListener('touchend', endShield);
      shieldBtn.addEventListener('touchcancel', endShield);
      shieldBtn.addEventListener('mousedown', startShield);
      shieldBtn.addEventListener('mouseup', endShield);
    }

    const dashBtn = document.getElementById('btn-touch-dash');
    if (dashBtn) {
      const onDash = (e) => {
        e.preventDefault();
        sound.init();
        this.game.touch.active = true;
        this.game.triggerDash();
      };
      dashBtn.addEventListener('touchstart', onDash);
      dashBtn.addEventListener('click', onDash);
    }

    const potBtn = document.getElementById('btn-touch-pot');
    if (potBtn) {
      const onPot = (e) => {
        e.preventDefault();
        sound.init();
        this.game.touch.active = true;
        this.game.liftOrThrowPot();
      };
      potBtn.addEventListener('touchstart', onPot);
      potBtn.addEventListener('click', onPot);
    }
  }

  toggleMobileDrawer(forceOpen = null) {
    const sidebar = document.getElementById('rotmg-sidebar');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (!sidebar) return;
    const isOpen = forceOpen !== null ? forceOpen : !this.mobileDrawerOpen;
    this.mobileDrawerOpen = isOpen;
    sidebar.classList.toggle('drawer-open', isOpen);
    if (backdrop) backdrop.classList.toggle('open', isOpen);
  }

  bindTopBarButtons() {
    const drawerBtn = document.getElementById('btn-toggle-drawer');
    if (drawerBtn) {
      drawerBtn.addEventListener('click', () => {
        this.toggleMobileDrawer();
      });
    }
    const closeDrawerBtn = document.getElementById('btn-close-drawer');
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', () => {
        this.toggleMobileDrawer(false);
      });
    }
    const drawerBackdrop = document.getElementById('mobile-drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', () => {
        this.toggleMobileDrawer(false);
      });
    }
    const chatToggleBtn = document.getElementById('btn-toggle-chat');
    if (chatToggleBtn) {
      chatToggleBtn.addEventListener('click', () => {
        const chatBox = document.getElementById('bottom-left-chat');
        if (chatBox) chatBox.classList.toggle('chat-open');
      });
    }
    const elderBtn = document.getElementById('btn-open-elder');
    if (elderBtn) {
      elderBtn.addEventListener('click', () => {
        this.openModal('elder');
      });
    }
    const crestBadge = document.getElementById('hud-crest-badge');
    if (crestBadge) {
      crestBadge.addEventListener('click', () => {
        this.openModal('elder');
      });
    }
    const classesBtn = document.getElementById('btn-open-classes');
    if (classesBtn) {
      classesBtn.addEventListener('click', () => {
        this.openModal('classes');
      });
    }
    const vaultBtn = document.getElementById('btn-open-vault');
    if (vaultBtn) {
      vaultBtn.addEventListener('click', () => {
        this.openModal('vault');
      });
    }
    const forgeBtn = document.getElementById('btn-open-forge');
    if (forgeBtn) {
      forgeBtn.addEventListener('click', () => {
        this.openModal('forge');
      });
    }
    const audioBtn = document.getElementById('btn-toggle-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', (e) => {
        sound.muted = !sound.muted;
        e.currentTarget.textContent = sound.muted ? '🔇' : '🔊';
      });
    }
  }

  // ==========================================================================
  // DYNAMIC HUD REFRESH (60FPS & ON-EVENT)
  // ==========================================================================
  updateFrameHud() {
    const p = this.game.player;
    if (!p) return;

    // 1. Update Zone Banner, Sunshards, Account Fame & Holy Crest Shards Header
    const zoneEl = document.getElementById('hud-zone-title');
    if (zoneEl) zoneEl.textContent = this.game.currentMap.name;
    const sunshardEl = document.getElementById('hud-sunshards');
    if (sunshardEl) sunshardEl.textContent = this.game.account.sunshards;
    const accFameEl = document.getElementById('hud-account-fame');
    if (accFameEl) accFameEl.textContent = this.game.account.accountFame;
    const crestEl = document.getElementById('hud-crest-shards');
    if (crestEl) {
      const restored = this.game.getRestoredShardsCount();
      crestEl.textContent = `${restored}/5`;
    }

    const totalStars = this.game.getTotalStars();
    const starInfo = getStarRankColor(totalStars);
    const starEl = document.getElementById('hud-star-badge');
    if (starEl) {
      starEl.textContent = `★ ${totalStars}`;
      starEl.style.color = starInfo.color;
    }

    // 2. Update Life Heart Containers (1 Heart = 50 HP, up to 16 Hearts shown)
    this.renderLifeHearts(p.hp, p.stats.hp);

    // 3. Update RotMG Numerical Bars (Level/XP, Fame, HP, MP) + Mobile Compact Bars
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
    document.getElementById('bar-mp-label').innerHTML = `<span>MP (MANA)</span><span>${Math.floor(p.mp)} / ${p.stats.mp}</span>`;

    const mobHpFill = document.getElementById('mobile-hp-fill');
    const mobHpText = document.getElementById('mobile-hp-text');
    if (mobHpFill && mobHpText) {
      mobHpFill.style.width = `${hpPct}%`;
      mobHpText.textContent = `HP ${Math.ceil(p.hp)}/${p.stats.hp}`;
    }
    const mobMpFill = document.getElementById('mobile-mp-fill');
    const mobMpText = document.getElementById('mobile-mp-text');
    if (mobMpFill && mobMpText) {
      mobMpFill.style.width = `${mpPct}%`;
      mobMpText.textContent = `MP ${Math.floor(p.mp)}/${p.stats.mp}`;
    }

    // 4. Context Interaction Prompt Banner ([E] Speak with High Elder Vaelen / Enter Portal / Open Vault)
    const target = this.game.getNearestInteractiveTarget();
    const banner = document.getElementById('interact-banner');
    if (target) {
      banner.style.display = 'block';
      banner.textContent = `✋ ${target.label}`;
    } else {
      banner.style.display = 'none';
    }

    // 5. Ground Loot Bag Panel (Appears automatically when standing near any Loot Bag!)
    this.updateGroundBagPanel();

    // 6. Render Minimap
    this.renderMinimap();
  }

  renderLifeHearts(hp, maxHp) {
    const row = document.getElementById('life-hearts-row');
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
      html += `<svg class="life-heart" viewBox="0 0 24 24">
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
    const mobileBagBadge = document.getElementById('mobile-bag-badge');
    if (mobileBagBadge) {
      mobileBagBadge.textContent = `${p.maxedCount}/8`;
      mobileBagBadge.style.color = p.maxedCount === 8 ? '#facc15' : '#93c5fd';
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

    // 2. Update 4 Equipment Slots (Weapon, Sacred Relic, Armor, Ring)
    const eqContainer = document.getElementById('equipment-grid');
    if (eqContainer) {
      const slots = [
        { key: 'weapon', label: 'WEAPON' },
        { key: 'relic',  label: 'RELIC [Q]' },
        { key: 'armor',  label: 'ARMOR' },
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

    // 3b. Update Mobile 4-Slot Quick-Belt (First 4 backpack slots)
    const quickBelt = document.getElementById('mobile-quick-belt');
    if (quickBelt) {
      quickBelt.innerHTML = p.inventory.slice(0, 4).map((itemId, idx) => {
        return this.renderSlotHtml(itemId, `${idx + 1}`, 'quick_belt', idx);
      }).join('');
      this.bindSlotEvents(quickBelt, 'quick_belt');
    }

    // 3c. Refresh Selected Item Stats & Equip Inspector Panel
    this.renderItemInspectorPanels();

    // 4. Update Nearby Party Roster
    this.renderPartyList();
  }

  isSlotSelected(group, indexOrKey) {
    if (!this.selectedSlot) return false;
    const s = this.selectedSlot;
    if (s.group === group && String(s.index) === String(indexOrKey)) return true;
    if (
      (s.group === 'inventory' && group === 'quick_belt' && String(s.index) === String(indexOrKey)) ||
      (s.group === 'quick_belt' && group === 'inventory' && String(s.index) === String(indexOrKey))
    ) {
      return true;
    }
    if (
      (s.group === 'bag' && group === 'world_bag' && String(s.index) === String(indexOrKey)) ||
      (s.group === 'world_bag' && group === 'bag' && String(s.index) === String(indexOrKey))
    ) {
      return true;
    }
    return false;
  }

  renderSlotHtml(itemId, placeholder, group, indexOrKey) {
    const item = itemId ? ITEMS[itemId] : null;
    if (!item) {
      return `<div class="item-slot" data-group="${group}" data-index="${indexOrKey}">
        <span class="slot-placeholder">${placeholder}</span>
      </div>`;
    }
    const iconUrl = getItemIconDataUrl(itemId);
    const isUt = item.tier === 'UT' || item.tier === 'SHARD';
    const isSel = this.isSlotSelected(group, indexOrKey);
    return `<div class="item-slot ${isUt ? 'ut-slot' : ''} ${isSel ? 'selected-slot' : ''}" data-group="${group}" data-index="${indexOrKey}" data-item-id="${itemId}">
      <img src="${iconUrl}" alt="${item.name}" />
      <span class="slot-tier-badge ${isUt ? 'ut' : ''}">${item.tier}</span>
    </div>`;
  }

  bindSlotEvents(container, group, bagObj = null) {
    const slots = container.querySelectorAll('.item-slot');
    slots.forEach((el) => {
      const itemId = el.getAttribute('data-item-id');
      const rawIdx = el.getAttribute('data-index');
      const idxOrKey = group === 'equip' ? rawIdx : parseInt(rawIdx, 10);

      el.addEventListener('mouseenter', (e) => {
        if (itemId && !this.game.touch.active) this.showItemTooltip(itemId, e.clientX, e.clientY);
      });
      el.addEventListener('mousemove', (e) => {
        if (itemId && !this.game.touch.active) this.moveTooltip(e.clientX, e.clientY);
      });
      el.addEventListener('mouseleave', () => {
        this.hideTooltip();
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideTooltip();
        if (!itemId) {
          this.clearSelectedSlot();
          return;
        }
        this.selectItemSlot(group, idxOrKey, bagObj);
      });
    });
  }

  resolveSlotItemId(group, indexOrKey, bagObj = null) {
    const p = this.game.player;
    if (!p) return null;
    if (group === 'inventory' || group === 'quick_belt' || group === 'vault_inv') {
      return p.inventory[Number(indexOrKey)] || null;
    }
    if (group === 'equip') {
      return p.equipment[indexOrKey] || null;
    }
    if (group === 'bag' || group === 'world_bag') {
      const activeBag = bagObj || this.game.getNearestBag();
      return activeBag && activeBag.items ? activeBag.items[Number(indexOrKey)] || null : null;
    }
    if (group === 'vault_chest') {
      return this.game.account && this.game.account.vault
        ? this.game.account.vault[Number(indexOrKey)] || null
        : null;
    }
    return null;
  }

  selectItemSlot(group, indexOrKey, bagObj = null) {
    const itemId = this.resolveSlotItemId(group, indexOrKey, bagObj);
    if (!itemId) {
      this.clearSelectedSlot();
      return false;
    }
    this.selectedSlot = { group, index: indexOrKey, itemId };
    this.updateSlotSelectionHighlights();
    this.renderItemInspectorPanels(bagObj);

    if (group === 'inventory' || group === 'equip' || group === 'bag') {
      const sidebarInspector = document.getElementById('item-inspector-panel');
      if (sidebarInspector && typeof sidebarInspector.scrollIntoView === 'function') {
        sidebarInspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    return true;
  }

  clearSelectedSlot() {
    this.selectedSlot = null;
    this.updateSlotSelectionHighlights();
    const ids = ['item-inspector-panel', 'world-loot-inspector', 'quick-belt-inspector', 'vault-item-inspector'];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = 'none';
        el.innerHTML = '';
      }
    }
  }

  updateSlotSelectionHighlights() {
    document.querySelectorAll('.item-slot').forEach((el) => {
      const g = el.getAttribute('data-group');
      const idx = el.getAttribute('data-index');
      const itemId = el.getAttribute('data-item-id');
      el.classList.toggle('selected-slot', Boolean(itemId && this.isSlotSelected(g, idx)));
    });
  }

  buildInspectorCardHtml(group, indexOrKey, itemId) {
    const item = ITEMS[itemId];
    const p = this.game.player;
    if (!item || !p) return '';

    const iconUrl = getItemIconDataUrl(itemId);
    const bagMeta = BAG_TYPES[item.bagType] || BAG_TYPES[0];
    const isUt = item.tier === 'UT' || item.tier === 'SHARD';
    const canEquip = item.slot !== 'consumable' ? canClassEquip(p.classId, item) : true;

    const slotLabelMap = {
      weapon: 'Primary Weapon',
      relic: 'Sacred Relic [Q]',
      armor: 'Armor Vestment',
      ring: 'Sacred Signet Ring',
      consumable: item.subType === 'crest_shard' ? 'Holy Crest Shard' : 'Consumable Potion'
    };
    const compatibilityTag = item.slot === 'consumable'
      ? '<span style="color:#4ade80;">• Instant Use</span>'
      : canEquip
        ? `<span style="color:#4ade80;">• ✓ Usable by ${p.className}</span>`
        : `<span style="color:#f87171;">• ✕ Not Usable by ${p.className}</span>`;

    const statLines = [];
    if (item.minDmg) {
      statLines.push(
        `<div style="color:#fde047;font-weight:800;">⚔️ Damage: ${item.minDmg}–${item.maxDmg}${item.shots > 1 ? ` (x${item.shots} shots)` : ''}${item.range ? ` • Range: ${item.range}` : ''}${item.pierce ? ' • Piercing' : ''}${item.pierceArmor ? ' • Armor-Piercing' : ''}</div>`
      );
    }
    if (item.dmg) {
      statLines.push(
        `<div style="color:#38bdf8;font-weight:800;">✨ Relic Power: ${item.dmg} Dmg (${item.mpCost || 30} MP)${item.stunSec ? ` • ${item.stunSec}s Stun` : ''}${item.blastRadius ? ` • ${item.blastRadius}m Blast` : ''}</div>`
      );
    }
    if (item.heal) {
      statLines.push(
        `<div style="color:#4ade80;font-weight:800;">💚 Party Heal: +${item.heal} HP (${item.mpCost || 45} MP)${item.buffSec ? ` • ${item.buffSec}s Party Buff` : ''}</div>`
      );
    }
    if (item.subType === 'stat_pot' && item.stat) {
      const cls = CLASSES[p.classId];
      const curBase = p.baseStats[item.stat];
      const maxCap = cls.maxStats[item.stat];
      statLines.push(
        `<div style="color:#4ade80;font-weight:800;">🧪 Permanent Stat: +${item.amount} Base ${item.stat.toUpperCase()} (${curBase}/${maxCap})</div>`
      );
    }
    if (item.subType === 'stat_omni') {
      statLines.push(`<div style="color:#fde047;font-weight:800;">🌟 Ambrosia Blessing: +45 HP, +30 MP, +4 All Base Stats</div>`);
    }
    if (item.subType === 'heal') {
      statLines.push(`<div style="color:#f472b6;font-weight:800;">🧚 Restores +${item.healHp || 250} HP, +${item.healMp || 100} MP &amp; Auto-Revives on Fatal Hit</div>`);
    }
    if (item.stats) {
      const pairs = Object.entries(item.stats).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ');
      statLines.push(`<div style="color:#4ade80;font-weight:700;">🛡️ Equip Bonus: ${pairs}</div>`);
    }
    if (item.fameBonus) {
      statLines.push(`<div style="color:#facc15;font-size:10px;font-weight:700;">★ Legacy Fame Bonus: +${item.fameBonus * 5} Fame</div>`);
    }

    let compareHtml = '';
    if (group !== 'equip' && item.slot !== 'consumable') {
      const curEqId = p.equipment[item.slot];
      const curEq = curEqId ? ITEMS[curEqId] : null;
      if (curEq) {
        const curStatSummary = curEq.minDmg
          ? `${curEq.minDmg}–${curEq.maxDmg} Dmg`
          : curEq.stats
            ? Object.entries(curEq.stats).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ')
            : curEq.tier;
        compareHtml = `<div class="inspector-compare">Currently Equipped: <span style="color:#f8fafc;">${curEq.name} (${curEq.tier})</span> [${curStatSummary}]</div>`;
      }
    }

    let actionsHtml = '';
    if (group === 'inventory' || group === 'quick_belt') {
      if (item.slot === 'consumable') {
        const btnLabel = item.subType === 'crest_shard'
          ? '✨ Attune Crest Shard'
          : item.subType === 'heal'
            ? '🧚 Consume Wisp'
            : '🧪 Drink Potion';
        actionsHtml = `
          <button type="button" class="inspector-btn primary-drink" data-inspector-action="primary">${btnLabel}</button>
          <button type="button" class="inspector-btn danger-act" data-inspector-action="drop" title="Drop Item">🗑️ Drop</button>
        `;
      } else {
        const equipLabel = canEquip ? `⚔️ Equip ${item.slot.toUpperCase()}` : `✕ Cannot Equip (${p.className})`;
        actionsHtml = `
          <button type="button" class="inspector-btn primary-equip" data-inspector-action="primary" ${canEquip ? '' : 'disabled'}>${equipLabel}</button>
          <button type="button" class="inspector-btn danger-act" data-inspector-action="drop" title="Drop Item">🗑️ Drop</button>
        `;
      }
    } else if (group === 'equip') {
      if (indexOrKey === 'relic') {
        actionsHtml = `
          <button type="button" class="inspector-btn primary-equip" data-inspector-action="use-relic">✨ Use Relic (${item.mpCost || 30} MP)</button>
          <button type="button" class="inspector-btn secondary-act" data-inspector-action="unequip">📥 Unequip</button>
        `;
      } else {
        actionsHtml = `
          <button type="button" class="inspector-btn secondary-act" style="flex:1;" data-inspector-action="unequip">📥 Unequip to Backpack</button>
        `;
      }
    } else if (group === 'bag' || group === 'world_bag') {
      if (item.slot === 'consumable') {
        const btnLabel = item.subType === 'crest_shard' ? '✨ Attune Shard' : '🧪 Drink / Use';
        actionsHtml = `
          <button type="button" class="inspector-btn primary-drink" data-inspector-action="primary">${btnLabel}</button>
          <button type="button" class="inspector-btn secondary-act" data-inspector-action="take-bag">🎒 Backpack</button>
        `;
      } else if (canEquip) {
        actionsHtml = `
          <button type="button" class="inspector-btn primary-equip" data-inspector-action="primary">⚔️ Equip ${item.slot.toUpperCase()}</button>
          <button type="button" class="inspector-btn secondary-act" data-inspector-action="take-bag">🎒 Backpack</button>
        `;
      } else {
        actionsHtml = `
          <button type="button" class="inspector-btn primary-equip" data-inspector-action="take-bag">🎒 Take to Backpack</button>
        `;
      }
    } else if (group === 'vault_inv') {
      const secLabel = item.slot === 'consumable' ? '🧪 Drink' : '⚔️ Equip';
      actionsHtml = `
        <button type="button" class="inspector-btn primary-equip" data-inspector-action="vault-deposit">📥 Deposit to Vault</button>
        <button type="button" class="inspector-btn secondary-act" data-inspector-action="primary" ${item.slot !== 'consumable' && !canEquip ? 'disabled' : ''}>${secLabel}</button>
      `;
    } else if (group === 'vault_chest') {
      actionsHtml = `
        <button type="button" class="inspector-btn primary-equip" data-inspector-action="vault-withdraw">📤 Withdraw to Backpack</button>
      `;
    }

    return `
      <div class="inspector-top-row">
        <div class="inspector-item-identity">
          <img src="${iconUrl}" alt="${item.name}" />
          <div class="inspector-title-wrap">
            <div class="inspector-item-name" style="color:${isUt ? '#22d3ee' : '#fde047'};">
              ${item.name}
              <span style="font-size:10px;font-weight:900;padding:1px 5px;margin-left:4px;border-radius:3px;background:rgba(255,255,255,0.1);color:${bagMeta.color};">${item.tier}</span>
            </div>
            <div class="inspector-item-sub">${slotLabelMap[item.slot] || 'Sacred Item'} ${compatibilityTag}</div>
          </div>
        </div>
        <button type="button" class="inspector-close-x" data-inspector-action="close" aria-label="Close Item Details">✕</button>
      </div>
      ${statLines.length > 0 ? `<div class="inspector-stats-list">${statLines.join('')}</div>` : ''}
      <div class="inspector-desc">${item.desc}</div>
      ${compareHtml}
      <div class="inspector-actions">${actionsHtml}</div>
    `;
  }

  renderItemInspectorPanels(bagObj = null) {
    const sidebarInspector = document.getElementById('item-inspector-panel');
    const worldInspector = document.getElementById('world-loot-inspector');
    const beltInspector = document.getElementById('quick-belt-inspector');
    const vaultInspector = document.getElementById('vault-item-inspector');

    if (!this.selectedSlot) {
      if (sidebarInspector) sidebarInspector.style.display = 'none';
      if (worldInspector) worldInspector.style.display = 'none';
      if (beltInspector) beltInspector.style.display = 'none';
      if (vaultInspector) vaultInspector.style.display = 'none';
      return;
    }

    const { group, index } = this.selectedSlot;
    const currentItemId = this.resolveSlotItemId(group, index, bagObj);
    if (!currentItemId) {
      this.clearSelectedSlot();
      return;
    }
    this.selectedSlot.itemId = currentItemId;
    const item = ITEMS[currentItemId];
    const isUt = item && (item.tier === 'UT' || item.tier === 'SHARD');
    const html = this.buildInspectorCardHtml(group, index, currentItemId);

    // 1. Sidebar Inspector (shown for inventory, equip, bag, quick_belt)
    if (sidebarInspector) {
      if (group === 'inventory' || group === 'equip' || group === 'bag' || group === 'quick_belt') {
        sidebarInspector.innerHTML = html;
        sidebarInspector.style.display = 'block';
        sidebarInspector.classList.toggle('ut-inspector', Boolean(isUt));
        this.bindInspectorActions(sidebarInspector, group, index, bagObj);
      } else {
        sidebarInspector.style.display = 'none';
      }
    }

    // 2. Floating World Chest Inspector (shown when inspecting a chest/bag slot)
    if (worldInspector) {
      if (group === 'bag' || group === 'world_bag') {
        worldInspector.innerHTML = html;
        worldInspector.style.display = 'block';
        worldInspector.classList.toggle('ut-inspector', Boolean(isUt));
        this.bindInspectorActions(worldInspector, group, index, bagObj);
      } else {
        worldInspector.style.display = 'none';
      }
    }

    // 3. Mobile Quick-Belt Floating Inspector (shown when tapping quick-belt on combat screen)
    if (beltInspector) {
      if (group === 'quick_belt') {
        beltInspector.innerHTML = html;
        beltInspector.style.display = 'block';
        beltInspector.classList.toggle('ut-inspector', Boolean(isUt));
        this.bindInspectorActions(beltInspector, group, index, bagObj);
      } else {
        beltInspector.style.display = 'none';
      }
    }

    // 4. Vault Modal Inspector
    if (vaultInspector) {
      if (group === 'vault_inv' || group === 'vault_chest') {
        vaultInspector.innerHTML = html;
        vaultInspector.style.display = 'block';
        vaultInspector.classList.toggle('ut-inspector', Boolean(isUt));
        this.bindInspectorActions(vaultInspector, group, index, bagObj);
      } else {
        vaultInspector.style.display = 'none';
      }
    }
  }

  bindInspectorActions(container, group, indexOrKey, bagObj = null) {
    const buttons = container.querySelectorAll('[data-inspector-action]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const act = btn.getAttribute('data-inspector-action');
        if (act === 'close') {
          this.clearSelectedSlot();
          return;
        }
        this.executeInspectorAction(act, group, indexOrKey, bagObj);
      });
    });
  }

  executeInspectorAction(action, group, indexOrKey, bagObj = null) {
    const p = this.game.player;
    if (!p) return false;
    const activeBag = bagObj || this.game.getNearestBag();

    if (action === 'primary') {
      if (group === 'inventory' || group === 'quick_belt' || group === 'vault_inv') {
        const ok = this.game.useOrEquipItem('inventory', Number(indexOrKey));
        this.clearSelectedSlot();
        this.refreshAllStatsAndSlots();
        if (group === 'vault_inv') this.populateVaultModal();
        return ok;
      }
      if (group === 'bag' || group === 'world_bag') {
        const ok = this.game.useOrEquipItem('bag', Number(indexOrKey), activeBag);
        this.clearSelectedSlot();
        this.lastBagSignature = '';
        this.refreshAllStatsAndSlots();
        this.updateGroundBagPanel();
        return ok;
      }
    } else if (action === 'take-bag') {
      const ok = this.game.takeBagItemToInventory(Number(indexOrKey), activeBag);
      this.clearSelectedSlot();
      this.lastBagSignature = '';
      this.refreshAllStatsAndSlots();
      this.updateGroundBagPanel();
      return ok;
    } else if (action === 'drop') {
      const ok = this.game.dropInventoryItem(Number(indexOrKey));
      this.clearSelectedSlot();
      this.lastBagSignature = '';
      this.refreshAllStatsAndSlots();
      this.updateGroundBagPanel();
      return ok;
    } else if (action === 'unequip') {
      const ok = this.game.unequipItem(indexOrKey);
      this.clearSelectedSlot();
      this.refreshAllStatsAndSlots();
      return ok;
    } else if (action === 'use-relic') {
      this.game.useRelicAbility();
      this.clearSelectedSlot();
      this.refreshAllStatsAndSlots();
      return true;
    } else if (action === 'vault-deposit') {
      const idx = Number(indexOrKey);
      const itemId = p.inventory[idx];
      if (!itemId) return false;
      const emptyVaultIdx = this.game.account.vault.findIndex((x) => !x);
      if (emptyVaultIdx === -1) {
        this.game.spawnFloatingText(p.x, p.y - 0.7, 'VAULT FULL!', '#ef4444', 12);
        return false;
      }
      this.game.account.vault[emptyVaultIdx] = itemId;
      p.inventory[idx] = null;
      this.game.saveAccount();
      sound.playSfx('rupee');
      this.clearSelectedSlot();
      this.populateVaultModal();
      this.refreshAllStatsAndSlots();
      return true;
    } else if (action === 'vault-withdraw') {
      const idx = Number(indexOrKey);
      const itemId = this.game.account.vault[idx];
      if (!itemId) return false;
      const emptyInvIdx = p.inventory.findIndex((x) => !x);
      if (emptyInvIdx === -1) {
        this.game.spawnFloatingText(p.x, p.y - 0.7, 'BACKPACK FULL!', '#ef4444', 12);
        return false;
      }
      p.inventory[emptyInvIdx] = itemId;
      this.game.account.vault[idx] = null;
      this.game.saveAccount();
      sound.playSfx('rupee');
      this.clearSelectedSlot();
      this.populateVaultModal();
      this.refreshAllStatsAndSlots();
      return true;
    }
    return false;
  }

  updateGroundBagPanel() {
    const bagSection = document.getElementById('loot-bag-section');
    const bagGrid = document.getElementById('loot-bag-grid');
    const bagTitle = document.getElementById('loot-bag-title');
    const worldPopup = document.getElementById('world-loot-popup');
    const worldGrid = document.getElementById('world-loot-grid');
    const worldTitle = document.getElementById('world-loot-title');

    const bag = this.game.getNearestBag();
    if (!bag) {
      if (this.activeBagId !== null) {
        this.activeBagId = null;
        this.lastBagSignature = '';
        if (this.selectedSlot && (this.selectedSlot.group === 'bag' || this.selectedSlot.group === 'world_bag')) {
          this.clearSelectedSlot();
        }
        if (bagSection) bagSection.style.display = 'none';
        if (worldPopup) worldPopup.style.display = 'none';
      }
      return;
    }

    const meta = BAG_TYPES[bag.bagType] || BAG_TYPES[0];
    const chestLabel = bag.isChest ? `Treasure Chest (${meta.name})` : meta.name.replace('Bag', 'Chest');

    // Position the floating popup right next to the chest/bag in screen space every frame!
    if (worldPopup && this.game.player && this.game.canvas) {
      const p = this.game.player;
      const cw = this.game.canvas.width || 960;
      const ch = this.game.canvas.height || 640;
      const screenX = (bag.x - p.x) * TILE_SIZE + cw / 2;
      const screenY = (bag.y - p.y) * TILE_SIZE + ch / 2;

      const popupWidth = 240;
      const isInspectingBag = this.selectedSlot && (this.selectedSlot.group === 'bag' || this.selectedSlot.group === 'world_bag');
      const popupHeight = (bag.items.length > 4 ? 170 : 114) + (isInspectingBag ? 165 : 0);
      const flipLeft = screenX + 24 + popupWidth > cw - 12;
      const rawLeft = flipLeft ? screenX - popupWidth - 24 : screenX + 24;
      const rawTop = screenY - 48;

      // On mobile screens, keep the floating chest popup above the bottom virtual controls
      const bottomMargin = cw <= 960 ? 175 : 12;
      const clampedLeft = Math.max(12, Math.min(cw - popupWidth - 12, Math.round(rawLeft)));
      const clampedTop = Math.max(54, Math.min(ch - popupHeight - bottomMargin, Math.round(rawTop)));

      worldPopup.style.display = 'block';
      worldPopup.style.left = `${clampedLeft}px`;
      worldPopup.style.top = `${clampedTop}px`;
      worldPopup.style.borderColor = bag.bagType === 6 ? '#22d3ee' : meta.color;
      worldPopup.classList.toggle('flip-left', flipLeft);
      worldPopup.classList.toggle('white-bag-active', bag.bagType === 6);
    }

    const sig = `${bag.id}_${bag.items.join(',')}`;
    if (sig === this.lastBagSignature) return;
    this.lastBagSignature = sig;
    this.activeBagId = bag.id;

    const padded = [...bag.items];
    while (padded.length < 4) padded.push(null);

    if (worldTitle && worldGrid) {
      worldTitle.textContent = chestLabel;
      worldTitle.style.color = bag.bagType === 6 ? '#22d3ee' : meta.color;
      worldGrid.innerHTML = padded.slice(0, 8).map((itemId, idx) => {
        return this.renderSlotHtml(itemId, '', 'world_bag', idx);
      }).join('');
      this.bindSlotEvents(worldGrid, 'world_bag', bag);
    }

    if (bagSection && bagGrid && bagTitle) {
      bagSection.style.display = 'block';
      bagSection.classList.toggle('white-bag-active', bag.bagType === 6);
      bagTitle.textContent = `${chestLabel} (Tap to Inspect)`;
      bagTitle.style.color = bag.bagType === 6 ? '#22d3ee' : meta.color;
      bagGrid.innerHTML = padded.slice(0, 8).map((itemId, idx) => {
        return this.renderSlotHtml(itemId, '', 'bag', idx);
      }).join('');
      this.bindSlotEvents(bagGrid, 'bag', bag);
    }
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

    const actionText = item.subType === 'crest_shard'
      ? 'Attune to the Holy Crest'
      : item.slot === 'consumable'
        ? 'Drink / Consume'
        : 'Equip';

    this.tooltipEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-weight:800;font-size:12.5px;color:${item.tier === 'UT' || item.tier === 'SHARD' ? '#22d3ee' : '#f8fafc'};">${item.name}</span>
        <span style="font-size:10px;font-weight:800;padding:1px 5px;border-radius:3px;background:rgba(255,255,255,0.1);color:${bagMeta.color};">${item.tier}</span>
      </div>
      ${statsHtml}
      <div style="color:#94a3b8;font-size:11px;line-height:1.35;margin-top:5px;">${item.desc}</div>
      <div style="color:#eab308;font-size:10px;margin-top:6px;font-weight:700;">Click to ${actionText}</div>
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

    // Local Player (Bright White crosshair dot)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x * scaleX, p.y * scaleY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  renderPartyList() {
    const listEl = document.getElementById('party-list');
    if (!listEl) return;
    if (!this.game.aiPlayers || this.game.aiPlayers.length === 0) {
      listEl.innerHTML = `<div style="font-size:10.5px;color:#94a3b8;padding:4px 2px;line-height:1.35;">Sanctuary Safe Haven — Walk north past High Elder Vaelen to enter a Realm or Sanctum Portal [E].</div>`;
      return;
    }
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
  // MMO CHAT & SLASH COMMANDS (/nexus, /elder, /glands, /boss, /max88, /whitebag)
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
      if (cmd === '/nexus' || cmd === '/sanctuary') {
        this.game.warpToMap('nexus');
      } else if (cmd === '/elder' || cmd === '/lore' || cmd === '/crest') {
        this.openModal('elder');
      } else if (cmd === '/glands' || cmd === '/godlands') {
        this.game.warpToMap('realm', { zone: 'godlands' });
      } else if (cmd === '/boss' || cmd === '/citadel' || cmd === '/sanctum') {
        this.game.warpToMap('dungeon', { dungeonId: 'mad_sanctum' });
      } else if (cmd === '/max88') {
        const p = this.game.player;
        const cls = CLASSES[p.classId];
        for (const st of STAT_NAMES) p.baseStats[st] = cls.maxStats[st];
        p.level = 20;
        this.game.recalcPlayerStats(true);
        sound.playSfx('white_bag');
        this.game.addChatMessage('BLESSING', 'Hero promoted to Level 20 [8/8 MAXED]!', '#facc15');
      } else if (cmd === '/whitebag') {
        const p = this.game.player;
        this.game.spawnLootBag(p.x + 0.8, p.y, ['wep_sword_ut_master', 'rng_ut_crown', 'arm_ut_magic_armor', 'rel_boom_ut']);
      } else {
        this.game.addChatMessage('HELP', 'Commands: /nexus, /elder, /glands, /boss, /max88, /whitebag', '#38bdf8');
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
  // MODALS: HIGH ELDER VAELEN LORE & HOLY CREST, CLASSES, VAULT, FORGE & DEATH
  // ==========================================================================
  renderStaticModals() {
    document.querySelectorAll('.modal-close-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.closeAllModals());
    });
  }

  openModal(modalName) {
    this.closeAllModals();
    if (modalName === 'elder') {
      this.populateElderModal();
      const el = document.getElementById('modal-elder');
      if (el) el.style.display = 'flex';
    } else if (modalName === 'classes') {
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

  populateElderModal() {
    const shardsGrid = document.getElementById('elder-shards-grid');
    const loreContainer = document.getElementById('elder-lore-chapters');
    const progressBanner = document.getElementById('elder-crest-status');
    if (!shardsGrid || !loreContainer) return;

    const restoredCount = this.game.getRestoredShardsCount();
    if (progressBanner) {
      progressBanner.innerHTML = restoredCount === 5
        ? `<span style="color:#22d3ee;font-weight:900;">★ THE HOLY CREST IS REFORGED (5/5 SHARDS)! All 5 Sacred Blessings Active — Storm the Citadel of Evil Bane! ★</span>`
        : `<span style="color:#fde047;font-weight:800;">Holy Crest Reconstruction: ${restoredCount} / 5 Shards Restored</span> <span style="color:#94a3b8;font-size:11px;margin-left:8px;">(Walk north of High Elder Vaelen to enter each Sanctum Portal and reclaim its shard!)</span>`;
    }

    shardsGrid.innerHTML = CREST_SHARDS.map((shard) => {
      const isRestored = !!(this.game.account.crestShards && this.game.account.crestShards[shard.index]);
      const iconUrl = getItemIconDataUrl(shard.id);
      return `<div class="class-select-card ${isRestored ? 'active' : ''}" style="border-color:${isRestored ? shard.color : 'rgba(148,163,184,0.28)'};">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <img src="${iconUrl}" alt="${shard.name}" style="width:32px;height:32px;image-rendering:pixelated;" />
            <div>
              <div style="font-weight:800;font-size:12.5px;color:${shard.color};">${shard.name}</div>
              <div style="font-size:10px;color:#cbd5e1;">${shard.dungeonName}</div>
            </div>
          </div>
          <span style="font-size:10px;font-weight:900;padding:2px 6px;border-radius:4px;background:${isRestored ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.18)'};color:${isRestored ? '#4ade80' : '#fca5a5'};">
            ${isRestored ? '★ RESTORED' : 'SHATTERED'}
          </span>
        </div>
        <div style="font-size:10.5px;color:#94a3b8;line-height:1.35;margin:6px 0;">
          <strong>Guardian:</strong> ${shard.guardian}<br/>
          ${shard.lore}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;gap:6px;">
          <span style="font-size:10px;font-weight:800;color:#4ade80;">Blessing: ${shard.blessing}</span>
          <span style="font-size:10px;font-weight:700;color:#38bdf8;">📍 North Sanctuary Portal</span>
        </div>
      </div>`;
    }).join('');

    loreContainer.innerHTML = ELDER_LORE_CHAPTERS.map((ch) => `
      <div style="background:rgba(9,14,23,0.78);border-left:3px solid #facc15;border-radius:6px;padding:10px 14px;margin-bottom:8px;">
        <div style="font-weight:800;font-size:12.5px;color:#fde047;margin-bottom:4px;">${ch.title}</div>
        <div style="font-size:11.5px;color:#cbd5e1;line-height:1.45;font-style:italic;">${ch.body}</div>
      </div>
    `).join('');
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

    this.bindSlotEvents(invEl, 'vault_inv');
    this.bindSlotEvents(chestEl, 'vault_chest');
    this.renderItemInspectorPanels();
  }

  populateForgeModal() {
    const listEl = document.getElementById('forge-recipes-grid');
    const balEl = document.getElementById('forge-sunshard-balance');
    if (!listEl) return;
    if (balEl) balEl.textContent = `${this.game.account.sunshards} Sunshards | ${this.game.account.accountFame} Account Fame`;

    const recipes = [
      { itemId: 'con_fairy',           costSunshards: 20,  costFame: 0   },
      { itemId: 'pot_def',             costSunshards: 25,  costFame: 0   },
      { itemId: 'pot_atk',             costSunshards: 25,  costFame: 0   },
      { itemId: 'pot_spd',             costSunshards: 20,  costFame: 0   },
      { itemId: 'pot_dex',             costSunshards: 20,  costFame: 0   },
      { itemId: 'pot_life',            costSunshards: 45,  costFame: 0   },
      { itemId: 'wep_sword_ut_master', costSunshards: 80,  costFame: 50  },
      { itemId: 'wep_bow_ut_light',    costSunshards: 80,  costFame: 50  },
      { itemId: 'wep_rod_ut_seasons',  costSunshards: 80,  costFame: 50  },
      { itemId: 'rel_boom_ut',         costSunshards: 75,  costFame: 40  },
      { itemId: 'rel_hook_ut',         costSunshards: 75,  costFame: 40  },
      { itemId: 'rng_ut_crown',        costSunshards: 100, costFame: 75  }
    ];

    listEl.innerHTML = recipes.map((r) => {
      const it = ITEMS[r.itemId];
      const icon = getItemIconDataUrl(r.itemId);
      const costLabel = r.costFame > 0 ? `${r.costSunshards} Sunshards + ${r.costFame} Fame` : `${r.costSunshards} Sunshards`;
      return `<div class="class-select-card" data-craft-id="${r.itemId}" data-sunshards="${r.costSunshards}" data-fame="${r.costFame}">
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
        const costS = parseInt(card.getAttribute('data-sunshards'), 10);
        const costF = parseInt(card.getAttribute('data-fame'), 10);
        if (this.game.account.sunshards < costS || this.game.account.accountFame < costF) {
          this.game.spawnFloatingText(this.game.player.x, this.game.player.y - 0.8, 'NOT ENOUGH SUNSHARDS/FAME!', '#ef4444', 13);
          return;
        }
        const emptyIdx = this.game.player.inventory.findIndex((x) => !x);
        if (emptyIdx === -1) {
          this.game.spawnFloatingText(this.game.player.x, this.game.player.y - 0.8, 'INVENTORY FULL!', '#ef4444', 13);
          return;
        }
        this.game.account.sunshards -= costS;
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
