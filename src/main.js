// ============================================================================
// REALM OF THE SHATTERED CREST — CLIENT BOOTSTRAP & MAIN LOOP
// ============================================================================

import { GameEngine } from './engine/game.js';
import { HudController } from './ui/hud.js';

export function bootGame() {
  const canvas = document.getElementById('game-canvas');
  let hud = null;

  const game = new GameEngine(canvas, {
    onStatsChanged: () => {
      if (hud) hud.refreshAllStatsAndSlots();
    },
    onMapChanged: () => {
      if (hud) hud.refreshAllStatsAndSlots();
    },
    onChatMessage: (msg) => {
      if (hud) hud.appendChatMessage(msg);
    },
    onOpenModal: (modalName) => {
      if (hud) hud.openModal(modalName);
    },
    onPermadeath: (summary) => {
      if (hud) hud.showPermadeathModal(summary);
    },
    onMmoStatusChanged: () => {
      if (hud) hud.renderPartyList();
    }
  });

  hud = new HudController(game);

  // Flush initial welcome chat messages & Elder Vaelen lore callout
  game.addChatMessage('AETHELGARD-PRIME', 'Connected to shared MMO instance [Aethelgard-Prime]! Click 🌐 Login in the top bar or type /login <Name> to set your Hero Name & play together.', '#4ade80');
  game.addChatMessage('HIGH ELDER VAELEN', '"Hero! Walk up to me in the Sanctuary Hub and press [E] (or click 📜 Lore) to learn how the Holy Crest that held back Malakor, the Evil Bane was shattered into 5 Shards!"', '#38bdf8');
  game.addChatMessage('SANCTUARY', 'Walk north past High Elder Vaelen and press [E] at any Portal, or click any online Hero in MMO Realm Party to Teleport (TP) to them!', '#fde047');

  // Prompt Hero Login on initial arrival if the player hasn't chosen a Hero Name yet
  if (!game.account.loggedInName) {
    hud.openModal('login');
  }

  window.__ROTSC_GAME__ = game;
  window.__ROTSC_HUD__ = hud;

  let lastTime = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    game.update(dt);
    game.render();
    hud.updateFrameHud();

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', bootGame);
}
