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
    }
  });

  hud = new HudController(game);

  // Flush initial welcome chat messages
  game.addChatMessage('NEXUS', 'Welcome to Realm of the Shattered Crest! An MMO Action RPG in the spirit of RotMG + Top-Down Zelda.', '#fde047');
  game.addChatMessage('CONTROLS', 'WASD: Move | Left-Click: Sword Slash & Beam (Hold 0.55s for 360° Spin!) | Right-Click: Shield Block & Perfect Parry | Q: Zelda Relic | F: Lift/Throw Pot | R: Instant Nexus!', '#38bdf8');
  game.addChatMessage('LinkOfHyrule', 'Medusa & Beholder train active in Dark World Godlands! Click TP next to my name to join!', '#4ade80', game.aiPlayers[0]);

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
