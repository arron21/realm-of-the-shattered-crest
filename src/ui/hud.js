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
      const activeId = document.activeElement ? document.activeElement.id : '';
      if (activeId === 'chat-input') {
        if (e.key === 'Enter') {
          this.submitChatInput();
          document.activeElement.blur();
        } else if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }
      if (activeId === 'login-username-input' || activeId === 'login-password-input') {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submitLoginForm();
        } else if (e.key === 'Escape') {
          this.closeAllModals();
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

    // Click on Minimap to Teleport to nearby MMO Player or Realm/Dungeon NPC Companion!
    this.minimapCanvas.addEventListener('click', (e) => {
      const rect = this.minimapCanvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const m = this.game.currentMap;
      const worldX = (mx / this.minimapCanvas.width) * m.width;
      const worldY = (my / this.minimapCanvas.height) * m.height;

      let closestPlayer = null;
      let bestD = 12;
      for (const rp of this.game.remotePlayers.values()) {
        if (rp.mapId !== m.id) continue;
        const d = Math.hypot(rp.x - worldX, rp.y - worldY);
        if (d < bestD) {
          bestD = d;
          closestPlayer = rp;
        }
      }
      if (this.game.aiPlayers) {
        for (const bot of this.game.aiPlayers) {
          const d = Math.hypot(bot.x - worldX, bot.y - worldY);
          if (d < bestD) {
            bestD = d;
            closestPlayer = bot;
          }
        }
      }
      if (closestPlayer) {
        this.game.teleportToPlayer(closestPlayer);
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
    const loginBtn = document.getElementById('btn-open-login');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        this.openModal('login');
      });
    }
    const submitLoginBtn = document.getElementById('btn-submit-login');
    if (submitLoginBtn) {
      submitLoginBtn.addEventListener('click', () => {
        this.submitLoginForm();
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

    // 6. Render Minimap & Refresh Live MMO Party Roster when player list changes
    this.renderMinimap();
    const partySig = `${p.name}_${this.game.currentMap.id}_${this.game.getOnlinePlayerCount()}_` +
      Array.from(this.game.remotePlayers.values()).map((r) => `${r.id}:${r.name}:${r.mapId}:${r.maxedCount || 0}`).join('|');
    if (this._partySig !== partySig) {
      this._partySig = partySig;
      this.renderPartyList();
    }
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

  scoreItemPower(item) {
    if (!item) return 0;
    const weights = { hp: 0.4, mp: 0.35, atk: 4.0, def: 4.5, spd: 3.5, dex: 3.8, vit: 3.2, wis: 3.2 };
    let score = 0;
    if (item.stats) {
      for (const [k, v] of Object.entries(item.stats)) {
        score += (weights[k] || 3.0) * v;
      }
    }
    if (item.minDmg) {
      const avgShot = ((item.minDmg || 0) + (item.maxDmg || 0)) / 2;
      const volleyDmg = avgShot * (item.shots || 1);
      const effectiveDps = volleyDmg * (item.rateMult || 1);
      score += effectiveDps * 1.15 + (item.range || 0) * 6 + (item.pierce ? 22 : 0) + (item.pierceArmor ? 45 : 0) + (item.alwaysBeam ? 25 : 0);
    }
    if (item.dmg) {
      score += item.dmg * 0.45;
    }
    if (item.heal) {
      score += item.heal * 0.9;
    }
    if (item.stunSec) {
      score += item.stunSec * 35;
    }
    if (item.blastRadius) {
      score += item.blastRadius * 18;
    }
    if (item.buffSec) {
      score += item.buffSec * 14;
    }
    return score;
  }

  compareItemWithEquipped(itemId, group = 'inventory') {
    const item = itemId ? ITEMS[itemId] : null;
    const p = this.game.player;
    if (!item || !p) return null;

    if (group === 'equip') {
      return {
        item,
        equippedItem: item,
        canEquip: true,
        verdict: 'same',
        verdictLabel: `✓ CURRENTLY EQUIPPED (${item.slot.toUpperCase()})`,
        metricDeltas: [],
        statChips: []
      };
    }

    // 1. Consumable Evaluation (Is this potion / shard / wisp worth picking up right now?)
    if (item.slot === 'consumable') {
      if (item.subType === 'stat_pot' && item.stat) {
        const cls = CLASSES[p.classId];
        const curBase = p.baseStats[item.stat];
        const maxCap = cls.maxStats[item.stat];
        const needed = Math.max(0, maxCap - curBase);
        if (needed > 0) {
          return {
            item,
            equippedItem: null,
            canEquip: true,
            verdict: 'upgrade',
            verdictLabel: `▲ WORTH PICKING UP — +${item.amount} ${item.stat.toUpperCase()} (${curBase}/${maxCap}, Needs ${needed})`,
            metricDeltas: [],
            statChips: [`<span class="cmp-delta-chip up">▲ +${item.amount} ${item.stat.toUpperCase()} (${curBase} ➔ ${Math.min(maxCap, curBase + item.amount)}/${maxCap})</span>`]
          };
        }
        return {
          item,
          equippedItem: null,
          canEquip: true,
          verdict: 'same',
          verdictLabel: `= ${item.stat.toUpperCase()} ALREADY MAXED (${maxCap}/${maxCap}) — Store in Vault`,
          metricDeltas: [],
          statChips: [`<span class="cmp-delta-chip same">= ${item.stat.toUpperCase()} MAXED (${maxCap}/${maxCap})</span>`]
        };
      }
      if (item.subType === 'stat_omni') {
        const unmaxed = 8 - (p.maxedCount || 0);
        return {
          item,
          equippedItem: null,
          canEquip: true,
          verdict: unmaxed > 0 ? 'upgrade' : 'same',
          verdictLabel: unmaxed > 0
            ? `▲ WORTH PICKING UP — UPGRADES ${unmaxed} UNMAXED STATS`
            : '= ALL 8/8 STATS ALREADY MAXED — Store in Vault',
          metricDeltas: [],
          statChips: []
        };
      }
      if (item.subType === 'crest_shard') {
        const restored = Boolean(this.game.account && this.game.account.crestShards && this.game.account.crestShards[item.shardIndex]);
        return {
          item,
          equippedItem: null,
          canEquip: true,
          verdict: !restored ? 'upgrade' : 'same',
          verdictLabel: !restored
            ? '▲ WORTH PICKING UP — NEW HOLY CREST SHARD!'
            : '= SHARD ALREADY ATTUNED (+150 Sunshards / +40 Fame)',
          metricDeltas: [],
          statChips: []
        };
      }
      return {
        item,
        equippedItem: null,
        canEquip: true,
        verdict: 'upgrade',
        verdictLabel: `▲ WORTH PICKING UP — +${item.healHp || 250} HP & AUTO-REVIVE`,
        metricDeltas: [],
        statChips: []
      };
    }

    // 2. Equipable Gear Comparison against p.equipment[item.slot]
    const canEquip = canClassEquip(p.classId, item);
    const curEqId = p.equipment[item.slot];
    const curEq = curEqId ? ITEMS[curEqId] : null;
    const metricDeltas = [];
    const statChips = [];
    let hasPositiveGain = false;

    // Compare Weapon Damage, Volley Output, Fire Rate & Range
    if (item.slot === 'weapon' || item.minDmg || (curEq && curEq.minDmg)) {
      const avgA = (((item.minDmg || 0) + (item.maxDmg || 0)) / 2) * (item.shots || 1);
      const avgB = curEq ? (((curEq.minDmg || 0) + (curEq.maxDmg || 0)) / 2) * (curEq.shots || 1) : 0;
      const dmgDiff = Math.round(avgA - avgB);
      const pct = avgB > 0 ? Math.round(((avgA - avgB) / avgB) * 100) : 100;
      if (dmgDiff > 0) hasPositiveGain = true;
      const diffColor = dmgDiff > 0 ? '#4ade80' : dmgDiff < 0 ? '#f87171' : '#94a3b8';
      const arrow = dmgDiff > 0 ? '▲ +' : dmgDiff < 0 ? '▼ ' : '= ';
      metricDeltas.push(
        `<div>⚔️ Avg Volley Dmg: <strong style="color:#f8fafc;">${Math.round(avgA)}</strong> vs ${Math.round(avgB)} <span style="color:${diffColor};font-weight:800;">(${arrow}${dmgDiff} Dmg${avgB > 0 && dmgDiff !== 0 ? ` / ${pct > 0 ? '+' : ''}${pct}%` : ''})</span></div>`
      );

      const rateA = Math.round((item.rateMult || 1) * 100);
      const rateB = Math.round(((curEq && curEq.rateMult) || 1) * 100);
      if (rateA !== rateB) {
        const rDiff = rateA - rateB;
        if (rDiff > 0) hasPositiveGain = true;
        const rColor = rDiff > 0 ? '#4ade80' : '#f87171';
        metricDeltas.push(
          `<div>⚡ Fire Rate: <strong style="color:#f8fafc;">${rateA}%</strong> vs ${rateB}% <span style="color:${rColor};font-weight:800;">(${rDiff > 0 ? '▲ +' : '▼ '}${rDiff}%)</span></div>`
        );
      }

      if (item.range || (curEq && curEq.range)) {
        const rngA = item.range || 0;
        const rngB = (curEq && curEq.range) || 0;
        const rngDiff = Number((rngA - rngB).toFixed(1));
        if (rngDiff !== 0) {
          if (rngDiff > 0) hasPositiveGain = true;
          const rngColor = rngDiff > 0 ? '#4ade80' : '#f87171';
          metricDeltas.push(
            `<div>🎯 Range: <strong style="color:#f8fafc;">${rngA}</strong> vs ${rngB} <span style="color:${rngColor};font-weight:800;">(${rngDiff > 0 ? '▲ +' : '▼ '}${rngDiff})</span></div>`
          );
        }
      }

      if (item.pierceArmor && !(curEq && curEq.pierceArmor)) {
        hasPositiveGain = true;
        metricDeltas.push(`<div style="color:#4ade80;">✨ Gains: <strong>Ignores Enemy DEF (Armor-Piercing)</strong></div>`);
      } else if (!item.pierceArmor && curEq && curEq.pierceArmor) {
        metricDeltas.push(`<div style="color:#f87171;">✕ Loses: Armor-Piercing</div>`);
      }
      if (item.pierce && !(curEq && curEq.pierce)) {
        hasPositiveGain = true;
        metricDeltas.push(`<div style="color:#4ade80;">✨ Gains: <strong>Pierces Multiple Enemies</strong></div>`);
      } else if (!item.pierce && curEq && curEq.pierce) {
        metricDeltas.push(`<div style="color:#f87171;">✕ Loses: Multi-Target Pierce</div>`);
      }
    }

    // Compare Sacred Relic Power, Heal, Stun & MP Cost
    if (item.slot === 'relic') {
      if (item.dmg || (curEq && curEq.dmg)) {
        const dA = item.dmg || 0;
        const dB = (curEq && curEq.dmg) || 0;
        const dDiff = dA - dB;
        if (dDiff > 0) hasPositiveGain = true;
        const dColor = dDiff > 0 ? '#4ade80' : dDiff < 0 ? '#f87171' : '#94a3b8';
        metricDeltas.push(
          `<div>✨ Relic Dmg: <strong style="color:#f8fafc;">${dA}</strong> vs ${dB} <span style="color:${dColor};font-weight:800;">(${dDiff > 0 ? '▲ +' : dDiff < 0 ? '▼ ' : '= '}${dDiff})</span></div>`
        );
      }
      if (item.heal || (curEq && curEq.heal)) {
        const hA = item.heal || 0;
        const hB = (curEq && curEq.heal) || 0;
        const hDiff = hA - hB;
        if (hDiff > 0) hasPositiveGain = true;
        const hColor = hDiff > 0 ? '#4ade80' : hDiff < 0 ? '#f87171' : '#94a3b8';
        metricDeltas.push(
          `<div>💚 Party Heal: <strong style="color:#f8fafc;">+${hA}</strong> vs +${hB} HP <span style="color:${hColor};font-weight:800;">(${hDiff > 0 ? '▲ +' : hDiff < 0 ? '▼ ' : '= '}${hDiff} HP)</span></div>`
        );
      }
      if (item.stunSec || (curEq && curEq.stunSec)) {
        const sA = item.stunSec || 0;
        const sB = (curEq && curEq.stunSec) || 0;
        const sDiff = Number((sA - sB).toFixed(1));
        if (sDiff !== 0) {
          if (sDiff > 0) hasPositiveGain = true;
          const sColor = sDiff > 0 ? '#4ade80' : '#f87171';
          metricDeltas.push(
            `<div>⚡ Stun Duration: <strong style="color:#f8fafc;">${sA}s</strong> vs ${sB}s <span style="color:${sColor};font-weight:800;">(${sDiff > 0 ? '▲ +' : '▼ '}${sDiff}s)</span></div>`
          );
        }
      }
      if (item.mpCost || (curEq && curEq.mpCost)) {
        const mA = item.mpCost || 0;
        const mB = (curEq && curEq.mpCost) || 0;
        const mDiff = mA - mB;
        if (mDiff !== 0) {
          const mColor = mDiff < 0 ? '#4ade80' : '#fbbf24';
          metricDeltas.push(
            `<div>💧 Mana Cost: <strong style="color:#f8fafc;">${mA} MP</strong> vs ${mB} MP <span style="color:${mColor};font-weight:800;">(${mDiff > 0 ? '+' : ''}${mDiff} MP)</span></div>`
          );
        }
      }
    }

    // Compare Passive Stat Bonuses (HP, MP, ATK, DEF, SPD, DEX, VIT, WIS)
    for (const st of STAT_NAMES) {
      const vA = (item.stats && item.stats[st]) || 0;
      const vB = (curEq && curEq.stats && curEq.stats[st]) || 0;
      if (vA === 0 && vB === 0) continue;
      const diff = vA - vB;
      if (diff > 0) {
        hasPositiveGain = true;
        statChips.push(`<span class="cmp-delta-chip up">▲ +${diff} ${st.toUpperCase()} (${vA} vs ${vB})</span>`);
      } else if (diff < 0) {
        statChips.push(`<span class="cmp-delta-chip down">▼ ${diff} ${st.toUpperCase()} (${vA} vs ${vB})</span>`);
      } else {
        statChips.push(`<span class="cmp-delta-chip same">= +${vA} ${st.toUpperCase()}</span>`);
      }
    }

    // Compute Overall Verdict
    if (!canEquip) {
      return {
        item,
        equippedItem: curEq,
        canEquip: false,
        verdict: 'unusable',
        verdictLabel: `✕ CANNOT EQUIP (${p.className}) — Vault for Another Class`,
        metricDeltas,
        statChips
      };
    }

    if (!curEq) {
      return {
        item,
        equippedItem: null,
        canEquip: true,
        verdict: 'upgrade',
        verdictLabel: '▲ WORTH PICKING UP — EMPTY SLOT UPGRADE',
        metricDeltas,
        statChips
      };
    }

    if (curEq.id === item.id) {
      return {
        item,
        equippedItem: curEq,
        canEquip: true,
        verdict: 'same',
        verdictLabel: '= IDENTICAL TO CURRENTLY EQUIPPED',
        metricDeltas,
        statChips
      };
    }

    const scoreA = this.scoreItemPower(item);
    const scoreB = this.scoreItemPower(curEq);
    const netDiff = scoreA - scoreB;

    let verdict = 'sidegrade';
    let verdictLabel = '◆ SIDEGRADE — SIMILAR POWER TO EQUIPPED';
    if (netDiff > 1.5) {
      verdict = 'upgrade';
      verdictLabel = '▲ WORTH PICKING UP — UPGRADE OVER EQUIPPED';
    } else if (netDiff < -1.5) {
      if (hasPositiveGain && (item.tier === 'UT' || curEq.tier === 'UT' || item.subType !== curEq.subType)) {
        verdict = 'sidegrade';
        verdictLabel = '◆ SITUATIONAL SIDEGRADE (Has Trade-Offs)';
      } else {
        verdict = 'downgrade';
        verdictLabel = '▼ NOT AN UPGRADE — WEAKER THAN EQUIPPED';
      }
    }

    return {
      item,
      equippedItem: curEq,
      canEquip: true,
      verdict,
      verdictLabel,
      metricDeltas,
      statChips
    };
  }

  buildComparisonHtml(itemId, group = 'inventory') {
    const cmp = this.compareItemWithEquipped(itemId, group);
    if (!cmp) return '';

    let equippedRowHtml = '';
    if (group !== 'equip' && cmp.item.slot !== 'consumable') {
      if (cmp.equippedItem) {
        const eqIcon = getItemIconDataUrl(cmp.equippedItem.id);
        const eqSummary = cmp.equippedItem.minDmg
          ? `${cmp.equippedItem.minDmg}–${cmp.equippedItem.maxDmg} Dmg`
          : cmp.equippedItem.stats
            ? Object.entries(cmp.equippedItem.stats).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ')
            : cmp.equippedItem.tier;
        equippedRowHtml = `
          <div class="cmp-equipped-row">
            <img src="${eqIcon}" alt="${cmp.equippedItem.name}" />
            <span>vs Equipped: <strong style="color:#f8fafc;">${cmp.equippedItem.name} (${cmp.equippedItem.tier})</strong> [${eqSummary}]</span>
          </div>
        `;
      } else {
        equippedRowHtml = `
          <div class="cmp-equipped-row">
            <span>vs Equipped: <strong style="color:#fde047;">Empty ${cmp.item.slot.toUpperCase()} Slot</strong></span>
          </div>
        `;
      }
    }

    return `
      <div class="inspector-compare-box">
        <div class="cmp-verdict-banner ${cmp.verdict}">${cmp.verdictLabel}</div>
        ${equippedRowHtml}
        ${cmp.metricDeltas.length > 0 ? `<div class="cmp-deltas-list">${cmp.metricDeltas.join('')}</div>` : ''}
        ${cmp.statChips.length > 0 ? `<div class="cmp-stat-chips">${cmp.statChips.join('')}</div>` : ''}
      </div>
    `;
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
    const cmp = group !== 'equip' ? this.compareItemWithEquipped(itemId, group) : null;
    const isUpgrade = cmp && cmp.verdict === 'upgrade';
    return `<div class="item-slot ${isUt ? 'ut-slot' : ''} ${isSel ? 'selected-slot' : ''}" data-group="${group}" data-index="${indexOrKey}" data-item-id="${itemId}">
      ${isUpgrade ? '<span class="slot-upgrade-badge" title="Worth Picking Up — Upgrade!">▲</span>' : ''}
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
        if (itemId && !this.game.touch.active) this.showItemTooltip(itemId, e.clientX, e.clientY, group);
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

    const compareHtml = this.buildComparisonHtml(itemId, group);

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
  showItemTooltip(itemId, cx, cy, group = 'inventory') {
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

    const compareHtml = this.buildComparisonHtml(itemId, group);

    const actionText = item.subType === 'crest_shard'
      ? 'Attune to the Holy Crest'
      : item.slot === 'consumable'
        ? 'Drink / Consume'
        : 'Inspect & Equip';

    this.tooltipEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-weight:800;font-size:12.5px;color:${item.tier === 'UT' || item.tier === 'SHARD' ? '#22d3ee' : '#f8fafc'};">${item.name}</span>
        <span style="font-size:10px;font-weight:800;padding:1px 5px;border-radius:3px;background:rgba(255,255,255,0.1);color:${bagMeta.color};">${item.tier}</span>
      </div>
      ${statsHtml}
      <div style="color:#94a3b8;font-size:11px;line-height:1.35;margin-top:5px;margin-bottom:6px;">${item.desc}</div>
      ${compareHtml}
      <div style="color:#eab308;font-size:10px;margin-top:4px;font-weight:700;">Tap / Click to ${actionText}</div>
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

    // Real Online MMO Players on Same Map (Green dots — Clickable to Teleport!)
    for (const rp of this.game.remotePlayers.values()) {
      if (rp.mapId !== m.id) continue;
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(rp.x * scaleX - 2.5, rp.y * scaleY - 2.5, 5, 5);
    }

    // Active NPC Companions on Map (0 in Nexus, 3 in Realm/Dungeons — Cyan dots)
    if (this.game.aiPlayers) {
      for (const bot of this.game.aiPlayers) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(bot.x * scaleX - 2, bot.y * scaleY - 2, 4, 4);
      }
    }

    // Local Player (Bright White crosshair dot)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(p.x * scaleX, p.y * scaleY, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  renderPartyList() {
    const p = this.game.player;
    const onlineCount = this.game.getOnlinePlayerCount ? this.game.getOnlinePlayerCount() : (1 + this.game.remotePlayers.size);

    const topOnlineBadge = document.getElementById('online-count-badge');
    if (topOnlineBadge) {
      topOnlineBadge.textContent = `● ${onlineCount}`;
    }
    const topLoginLabel = document.getElementById('top-login-label');
    if (topLoginLabel && p) {
      topLoginLabel.textContent = this.game.account.loggedInName ? p.name : 'Login';
    }
    const partyOnlineBadge = document.getElementById('party-online-badge');
    if (partyOnlineBadge) {
      partyOnlineBadge.textContent = `● ${onlineCount} Online`;
    }

    const listEl = document.getElementById('party-list');
    if (!listEl || !p) return;

    const remoteList = Array.from(this.game.remotePlayers.values());
    const npcList = Array.isArray(this.game.aiPlayers) ? this.game.aiPlayers.slice(0, 3) : [];
    const mapLabel = (mapId) => {
      if (!mapId || mapId === 'nexus') return 'Sanctuary';
      if (mapId === 'realm') return 'Realm';
      return mapId.replace('dungeon_', '').replace(/_/g, ' ');
    };

    const selfRow = `<div class="party-row" data-self-login="1" style="border-color:rgba(74,222,128,0.4);background:rgba(22,163,74,0.12);" title="Click to change your Hero Name or switch account in Aethelgard-Prime">
      <span><strong style="color:#4ade80;">● You:</strong> <strong style="color:#f8fafc;">${p.name}</strong> <span style="color:#94a3b8;font-size:10px;">(${p.maxedCount}/8 ${mapLabel(this.game.currentMap.id)})</span></span>
      <span style="color:#fde047;font-weight:800;font-size:9.5px;">✎ ID</span>
    </div>`;

    const remoteRows = remoteList.slice(0, 6).map((rp) => {
      const sameMap = rp.mapId === this.game.currentMap.id;
      const zoneTag = sameMap ? 'Here' : mapLabel(rp.mapId);
      return `<div class="party-row" data-player-id="${rp.id}" title="Click to Teleport (TP) to ${rp.name} (${zoneTag})!">
        <span><strong style="color:#4ade80;">★${rp.stars || 1}</strong> ${rp.name} <span style="color:#94a3b8;font-size:9.5px;">(${rp.maxedCount || 0}/8 • ${zoneTag})</span></span>
        <span style="color:#38bdf8;font-weight:800;font-size:10px;">TP ➔</span>
      </div>`;
    }).join('');

    const npcRows = npcList.map((bot) => {
      return `<div class="party-row" data-npc-id="${bot.id}" title="Click to Teleport (TP) to ${bot.name} (NPC Scout)!">
        <span><strong style="color:#38bdf8;">★${bot.stars || 12}</strong> ${bot.name} <span style="color:#94a3b8;font-size:9.5px;">(NPC • ${bot.className})</span></span>
        <span style="color:#38bdf8;font-weight:800;font-size:10px;">TP ➔</span>
      </div>`;
    }).join('');

    if (remoteList.length === 0 && npcList.length === 0) {
      listEl.innerHTML = selfRow + `<div style="font-size:10px;color:#94a3b8;padding:4px 2px 2px;line-height:1.35;">
        Shared Instance <strong style="color:#38bdf8;">Aethelgard-Prime</strong> active. Other players who log in appear here for instant co-op &amp; TP!
      </div>`;
    } else {
      listEl.innerHTML = selfRow + remoteRows + npcRows;
    }

    listEl.querySelectorAll('[data-self-login]').forEach((selfLoginRow) => {
      selfLoginRow.addEventListener('click', () => this.openModal('login'));
    });

    listEl.querySelectorAll('.party-row[data-player-id]').forEach((row) => {
      row.addEventListener('click', () => {
        const pid = row.getAttribute('data-player-id');
        const target = this.game.remotePlayers.get(pid);
        if (target) this.game.teleportToPlayer(target);
      });
    });

    listEl.querySelectorAll('.party-row[data-npc-id]').forEach((row) => {
      row.addEventListener('click', () => {
        const nid = row.getAttribute('data-npc-id');
        const target = (this.game.aiPlayers || []).find((b) => b.id === nid);
        if (target) this.game.teleportToPlayer(target);
      });
    });
  }

  // ==========================================================================
  // MMO CHAT & SLASH COMMANDS (/who, /login, /nexus, /elder, /glands, /boss, /max88, /whitebag)
  // ==========================================================================
  appendChatMessage({ sender, text, color, botTarget }) {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    const line = document.createElement('div');
    line.className = 'chat-line';
    line.innerHTML = `<strong style="color:${color || '#fde047'};">[${sender}]:</strong> <span>${text}</span>`;

    if (botTarget && botTarget.id !== (this.game.player && this.game.player.id)) {
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
      const parts = val.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      if (cmd === '/nexus' || cmd === '/sanctuary') {
        this.game.warpToMap('nexus');
      } else if (cmd === '/login' || cmd === '/name') {
        if (parts[1]) {
          this.game.loginToMmo(parts.slice(1).join(' '), '', this.game.player.classId);
        } else {
          this.openModal('login');
        }
      } else if (cmd === '/who' || cmd === '/online' || cmd === '/players') {
        const names = [this.game.player.name, ...Array.from(this.game.remotePlayers.values()).map((r) => `${r.name} (${r.mapId})`)];
        this.game.addChatMessage('AETHELGARD-PRIME', `Online Heroes (${names.length}): ${names.join(', ')}`, '#4ade80');
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
      } else if (cmd === '/dps') {
        this.openModal('dps');
      } else if (cmd === '/deaths' || cmd === '/graveyard' || cmd === '/died') {
        this.openModal('graveyard');
      } else {
        this.game.addChatMessage('HELP', 'Commands: /who, /login <Name>, /nexus, /elder, /dps, /deaths, /glands, /boss, /max88, /whitebag', '#38bdf8');
      }
      return;
    }

    this.game.sendGlobalChat(val);
  }

  // ==========================================================================
  // MODALS: LOGIN, HIGH ELDER VAELEN LORE & HOLY CREST, CLASSES, VAULT, FORGE, DPS & DEATH
  // ==========================================================================
  renderStaticModals() {
    document.querySelectorAll('.modal-close-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.closeAllModals());
    });
    const resetDpsBtn = document.getElementById('btn-reset-top-dps');
    if (resetDpsBtn) {
      resetDpsBtn.addEventListener('click', () => {
        this.game.resetTopDps();
        sound.playSfx('secret');
        this.populateDpsModal();
      });
    }
  }

  openModal(modalName) {
    this.closeAllModals();
    if (modalName === 'login') {
      this.populateLoginModal();
      const el = document.getElementById('modal-login');
      if (el) el.style.display = 'flex';
    } else if (modalName === 'elder') {
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
    } else if (modalName === 'dps') {
      this.populateDpsModal();
      const el = document.getElementById('modal-dps');
      if (el) el.style.display = 'flex';
    } else if (modalName === 'graveyard') {
      this.populateGraveyardModal();
      const el = document.getElementById('modal-graveyard');
      if (el) el.style.display = 'flex';
    }
  }

  populateLoginModal() {
    const p = this.game.player;
    const nameInput = document.getElementById('login-username-input');
    const passInput = document.getElementById('login-password-input');
    const pillsEl = document.getElementById('login-class-pills');
    const countEl = document.getElementById('login-online-count');
    const rosterEl = document.getElementById('login-online-roster');
    const statusEl = document.getElementById('login-status-msg');

    if (nameInput && p) {
      nameInput.value = this.game.account.loggedInName || p.name || '';
    }
    if (passInput) {
      passInput.value = '';
    }
    if (statusEl) {
      statusEl.textContent = this.game.account.loggedInName
        ? `✓ Logged in as ${this.game.account.loggedInName} on Aethelgard-Prime`
        : 'Enter your Hero Name to join all players in the Aethelgard-Prime MMO instance.';
      statusEl.style.color = '#4ade80';
    }

    this._selectedLoginClassId = p ? p.classId : 'knight';
    if (pillsEl) {
      pillsEl.innerHTML = Object.values(CLASSES).map((cls) => {
        const isSel = cls.id === this._selectedLoginClassId;
        return `<button type="button" class="hud-btn login-class-pill ${isSel ? 'primary-gold' : ''}" data-login-class="${cls.id}" style="justify-content:space-between;padding:6px 9px;">
          <span>${cls.name}</span>
          <span style="font-size:9.5px;opacity:0.85;">${cls.maxStats.hp}HP</span>
        </button>`;
      }).join('');

      pillsEl.querySelectorAll('[data-login-class]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this._selectedLoginClassId = btn.getAttribute('data-login-class');
          pillsEl.querySelectorAll('[data-login-class]').forEach((b) => {
            b.classList.toggle('primary-gold', b.getAttribute('data-login-class') === this._selectedLoginClassId);
          });
        });
      });
    }

    const onlineCount = this.game.getOnlinePlayerCount ? this.game.getOnlinePlayerCount() : (1 + this.game.remotePlayers.size);
    if (countEl) {
      countEl.textContent = `${onlineCount} ${onlineCount === 1 ? 'Hero' : 'Heroes'} Online`;
    }

    if (rosterEl && p) {
      const allPlayers = [
        { name: `${p.name} (You)`, className: p.className, maxedCount: p.maxedCount, mapId: this.game.currentMap.id, isSelf: true },
        ...Array.from(this.game.remotePlayers.values())
      ];
      rosterEl.innerHTML = allPlayers.map((pl) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:rgba(15,23,42,0.75);border:1px solid #1e293b;border-radius:4px;font-size:11px;">
          <span><strong style="color:${pl.isSelf ? '#fde047' : '#4ade80'};">● ${pl.name}</strong> <span style="color:#94a3b8;">— ${pl.className || 'Champion'} (${pl.maxedCount || 0}/8)</span></span>
          <span style="color:#38bdf8;font-size:10px;font-weight:700;">${pl.mapId || 'nexus'}</span>
        </div>
      `).join('');
    }
  }

  async submitLoginForm() {
    const nameInput = document.getElementById('login-username-input');
    const passInput = document.getElementById('login-password-input');
    const statusEl = document.getElementById('login-status-msg');
    const rawName = nameInput ? nameInput.value.trim() : '';
    const rawPass = passInput ? passInput.value : '';
    const classId = this._selectedLoginClassId || (this.game.player ? this.game.player.classId : 'knight');

    if (!rawName || rawName.length < 2) {
      if (statusEl) {
        statusEl.textContent = 'Please enter a Hero Name (at least 2 characters).';
        statusEl.style.color = '#f87171';
      }
      return false;
    }

    if (statusEl) {
      statusEl.textContent = 'Connecting to Aethelgard-Prime MMO Instance...';
      statusEl.style.color = '#38bdf8';
    }

    const res = await this.game.loginToMmo(rawName, rawPass, classId);
    if (!res || !res.ok) {
      if (statusEl) {
        statusEl.textContent = (res && res.error) || 'Could not log in with that Hero Name.';
        statusEl.style.color = '#f87171';
      }
      return false;
    }

    sound.playSfx('secret');
    this.refreshAllStatsAndSlots();
    this.renderPartyList();
    this.closeAllModals();
    return true;
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
      const compareHtml = this.buildComparisonHtml(r.itemId, 'forge');
      return `<div class="class-select-card" data-craft-id="${r.itemId}" data-sunshards="${r.costSunshards}" data-fame="${r.costFame}">
        <div style="display:flex;align-items:center;gap:10px;">
          <img src="${icon}" style="width:36px;height:36px;image-rendering:pixelated;" />
          <div>
            <div style="font-weight:800;font-size:12px;color:${it.tier === 'UT' ? '#22d3ee' : '#fde047'};">${it.name}</div>
            <div style="font-size:10.5px;color:#4ade80;font-weight:700;">Cost: ${costLabel}</div>
          </div>
        </div>
        <div style="font-size:10.5px;color:#94a3b8;margin-top:6px;margin-bottom:6px;">${it.desc}</div>
        ${compareHtml}
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

  populateDpsModal() {
    const body = document.getElementById('dps-modal-body');
    if (!body) return;

    const topDps = this.game.getTopDps ? this.game.getTopDps() : 0;
    const liveDps = this.game.getLiveDps ? this.game.getLiveDps() : 0;
    const topClass = (this.game.account && this.game.account.topDpsClass) || (this.game.player ? this.game.player.className : 'Champion');
    const bestHit = (this.game.account && this.game.account.topSingleHit) || 0;
    const totalDmg = (this.game.dpsTracker && this.game.dpsTracker.totalDamage) || 0;

    body.innerHTML = `
      <div style="background:rgba(9,14,23,0.82);border:1px solid rgba(251,146,60,0.45);border-radius:8px;padding:14px 16px;">
        <div style="text-align:center;margin-bottom:12px;">
          <div style="font-size:11px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;">All-Time Top DPS Record</div>
          <div style="font-size:28px;font-weight:900;color:#fde047;margin-top:2px;">⚔️ ${topDps} DPS</div>
          <div style="font-size:11.5px;color:#fb923c;font-weight:700;">Recorded as ${topClass}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;font-size:12px;border-top:1px solid rgba(148,163,184,0.18);padding-top:10px;">
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#cbd5e1;">Current Live DPS (3s Rolling Window)</span>
            <strong style="color:#4ade80;">${liveDps} DMG / sec</strong>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#cbd5e1;">Highest Single Hit Recorded</span>
            <strong style="color:#38bdf8;">${bestHit} DMG</strong>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#cbd5e1;">Total Session Damage Dealt</span>
            <strong style="color:#f8fafc;">${totalDmg} DMG</strong>
          </div>
        </div>
      </div>
      <div style="font-size:11.5px;color:#94a3b8;margin-top:10px;line-height:1.45;font-style:italic;">
        "Strike the Vanguard Combat Dummy or Armored Parry Dummy right beside me to benchmark your weapon, 8/8 stats, and Sacred Relic burst!" — Master Tactician Kael
      </div>
    `;
  }

  populateGraveyardModal() {
    const body = document.getElementById('graveyard-modal-body');
    if (!body) return;

    const totalDeaths = this.game.getDeathCount ? this.game.getDeathCount() : 0;
    const luminaSaves = (this.game.account && this.game.account.luminaRevives) || 0;
    const graves = (this.game.account && Array.isArray(this.game.account.graveyard)) ? this.game.account.graveyard : [];

    const graveRows = graves.length === 0
      ? `<div style="padding:12px;text-align:center;color:#94a3b8;font-size:12px;background:rgba(15,23,42,0.65);border-radius:6px;border:1px solid #1e293b;">
          No heroes have fallen yet! Your Soul Ledger remains unblemished (0 Deaths).
        </div>`
      : graves.map((g, i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:rgba(15,23,42,0.78);border:1px solid rgba(192,132,252,0.28);border-radius:6px;font-size:11.5px;">
            <div>
              <strong style="color:#f8fafc;">#${i + 1} ${g.name || 'Hero'}</strong>
              <span style="color:#c084fc;font-weight:700;">— Lvl ${g.level || 1} ${g.className || 'Champion'} (${g.maxedCount || 0}/8)</span>
              <div style="font-size:10.5px;color:#94a3b8;margin-top:2px;">Slain by <strong style="color:#f87171;">${g.killerName || 'Realm Monster'}</strong> ${g.date ? `at ${g.date}` : ''}</div>
            </div>
            <span style="color:#fde047;font-weight:800;font-size:11.5px;">★ +${g.totalFame || 0} Fame</span>
          </div>
        `).join('');

    body.innerHTML = `
      <div style="background:rgba(59,7,100,0.28);border:1px solid rgba(192,132,252,0.45);border-radius:8px;padding:12px 16px;margin-bottom:12px;text-align:center;">
        <div style="font-size:11px;font-weight:800;color:#d8b4fe;text-transform:uppercase;letter-spacing:0.06em;">Soul Warden's Tally</div>
        <div style="font-size:26px;font-weight:900;color:#f8fafc;margin-top:2px;">
          💀 You Have Died <span style="color:#f43f5e;">${totalDeaths}</span> ${totalDeaths === 1 ? 'Time' : 'Times'}
        </div>
        <div style="font-size:11.5px;color:#cbd5e1;margin-top:4px;">
          🧚 Saved from Death by Bottled Lumina Wisps: <strong style="color:#f472b6;">${luminaSaves} ${luminaSaves === 1 ? 'Time' : 'Times'}</strong>
        </div>
      </div>
      <div style="font-size:11px;font-weight:800;color:#c084fc;text-transform:uppercase;margin-bottom:6px;">
        Recent Fallen Heroes (${graves.length})
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto;">
        ${graveRows}
      </div>
    `;
  }
}
