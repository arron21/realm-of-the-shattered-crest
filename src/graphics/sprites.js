// ============================================================================
// REALM OF THE SHATTERED CREST — SPRITE, TILE, ITEM ICON & FX RENDERER
// ============================================================================

import { TILES } from '../data/worldgen.js';
import { BAG_TYPES, ITEMS } from '../data/items.js';

export const TILE_SIZE = 36; // World tile size in pixels

const tileCache = new Map();
const itemIconCache = new Map();

export function getTileCanvas(tileType, animFrame = 0, switchState = 'red') {
  const key = `${tileType}_${animFrame}_${switchState}`;
  if (tileCache.has(key)) return tileCache.get(key);

  const c = document.createElement('canvas');
  c.width = TILE_SIZE;
  c.height = TILE_SIZE;
  const ctx = c.getContext('2d');
  const s = TILE_SIZE;

  switch (tileType) {
    case TILES.WATER: {
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(2, 4, s - 4, s - 8);
      ctx.fillStyle = '#38bdf8';
      const offset = (animFrame * 4) % 12;
      ctx.fillRect(4 + offset, 9, 10, 2);
      ctx.fillRect(14 - offset / 2, 24, 12, 2);
      break;
    }
    case TILES.SAND: {
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(6, 8, 3, 3);
      ctx.fillRect(24, 20, 3, 3);
      ctx.fillRect(14, 28, 2, 2);
      break;
    }
    case TILES.GRASS: {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(1, 1, s - 2, s - 2);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(6, 8, 2, 5);
      ctx.fillRect(9, 6, 2, 7);
      ctx.fillRect(24, 20, 2, 5);
      ctx.fillRect(27, 19, 2, 6);
      break;
    }
    case TILES.FOREST_FLOOR: {
      ctx.fillStyle = '#14532d';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#166534';
      ctx.fillRect(2, 2, s - 4, s - 4);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(10, 12, 3, 4);
      ctx.fillRect(22, 24, 4, 3);
      break;
    }
    case TILES.HIGHLAND_ROCK: {
      ctx.fillStyle = '#57534e';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#78716c';
      ctx.fillRect(2, 2, s - 4, s - 4);
      ctx.fillStyle = '#44403c';
      ctx.fillRect(7, 10, 6, 3);
      ctx.fillRect(21, 24, 7, 3);
      break;
    }
    case TILES.GODLANDS_ASH: {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2, 2, s - 4, s - 4);
      ctx.fillStyle = '#334155';
      ctx.fillRect(6, 6, 4, 4);
      ctx.fillRect(24, 22, 5, 3);
      break;
    }
    case TILES.LAVA: {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(3, 3, s - 6, s - 6);
      ctx.fillStyle = '#facc15';
      const off = (animFrame * 3) % 8;
      ctx.fillRect(7 + off, 10, 10, 5);
      ctx.fillRect(14 - off, 22, 8, 5);
      break;
    }
    case TILES.MARBLE: {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(1, 1, s - 2, s - 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(4, 4, s - 8, s - 8);
      break;
    }
    case TILES.MARBLE_GOLD: {
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#fef9c3';
      ctx.fillRect(2, 2, s - 4, s - 4);
      // Holy Crest diamond inlay in center
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(s / 2, 7);
      ctx.lineTo(s - 7, s / 2);
      ctx.lineTo(s / 2, s - 7);
      ctx.lineTo(7, s / 2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case TILES.WOOD_BRIDGE: {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#92400e';
      for (let y = 2; y < s; y += 9) {
        ctx.fillRect(2, y, s - 4, 7);
      }
      break;
    }
    case TILES.DUNGEON_FLOOR: {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#334155';
      ctx.fillRect(1, 1, s - 2, s - 2);
      ctx.fillStyle = '#475569';
      ctx.fillRect(4, 4, 12, 12);
      ctx.fillRect(20, 20, 12, 12);
      break;
    }
    case TILES.WALL_STONE: {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#475569';
      ctx.fillRect(2, 2, s - 4, s - 6);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(4, 4, s - 8, 12);
      ctx.fillStyle = '#334155';
      ctx.fillRect(4, 18, s - 8, 12);
      break;
    }
    case TILES.WALL_TREE: {
      ctx.fillStyle = '#052e16';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(s / 2 - 3, s / 2 - 3, s / 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case TILES.WALL_OBSIDIAN: {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(2, 2, s - 4, s - 4);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(5, 5, s - 10, s - 10);
      break;
    }
    case TILES.WALL_CRACKED: {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(2, 2, s - 4, s - 4);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.lineTo(18, 18);
      ctx.lineTo(12, 30);
      ctx.moveTo(18, 18);
      ctx.lineTo(29, 14);
      ctx.moveTo(18, 18);
      ctx.lineTo(27, 28);
      ctx.stroke();
      break;
    }
    case TILES.BARRIER_RED: {
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, s, s);
      const raised = switchState === 'red';
      ctx.fillStyle = raised ? '#ef4444' : 'rgba(239,68,68,0.28)';
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, raised ? 12 : 7, 0, Math.PI * 2);
      ctx.fill();
      if (raised) {
        ctx.strokeStyle = '#fca5a5';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }
    case TILES.BARRIER_BLUE: {
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, s, s);
      const raised = switchState === 'blue';
      ctx.fillStyle = raised ? '#3b82f6' : 'rgba(59,130,246,0.28)';
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, raised ? 12 : 7, 0, Math.PI * 2);
      ctx.fill();
      if (raised) {
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      break;
    }
    case TILES.HEAL_SPRING: {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(3, 3, s - 6, s - 6);
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, 6 + (animFrame % 2) * 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, s, s);
    }
  }

  tileCache.set(key, c);
  return c;
}

// ============================================================================
// RENDER INTERACTIVE PROPS & HIGH ELDER VAELEN IN THE SANCTUARY HUB
// ============================================================================
export function drawProp(ctx, prop, screenX, screenY, time) {
  ctx.save();
  ctx.translate(screenX, screenY);

  switch (prop.type) {
    case 'elder_npc': {
      // Radiant Pedestal Aura of the Holy Crest
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 34);
      grad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
      grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.fill();

      // Golden Crest Seal on the Sanctuary floor beneath Elder Vaelen
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 4, 20, 0, Math.PI * 2);
      ctx.stroke();

      // High Elder Vaelen's Robes (White & Gold Astral Vestments)
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-11, -7, 22, 20, 6);
      ctx.fill();
      ctx.stroke();

      // Elder Head & Flowing Silver Beard
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, -10, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Silver Beard
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(6, -6);
      ctx.lineTo(0, 7);
      ctx.closePath();
      ctx.fill();

      // Golden Elder Circlet Crown
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-7, -17, 14, 4);

      // Astral Crozier Staff in Right Hand with Floating Crest Gem
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(14, 12);
      ctx.lineTo(14, -16);
      ctx.stroke();

      const bob = Math.sin(time * 4) * 2.5;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(14, -20 + bob, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Overhead Nameplate & Lore Prompt
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📜 HIGH ELDER VAELEN [E]', 0, -30);
      ctx.fillStyle = '#93c5fd';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.fillText('Lore & Holy Crest Shards', 0, -19);
      break;
    }

    case 'bush': {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 13, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(-3, -3, 9, 0, Math.PI * 2);
      ctx.arc(4, -2, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#86efac';
      ctx.fillRect(-5, -7, 3, 3);
      ctx.fillRect(3, -5, 3, 3);
      break;
    }

    case 'pot': {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 11, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.arc(0, 1, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(-2, -1, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#431407';
      ctx.beginPath();
      ctx.ellipse(0, -6, 7, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;
    }

    case 'grapple_post': {
      ctx.fillStyle = '#334155';
      ctx.fillRect(-10, -12, 20, 24);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-8, -10, 16, 20);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, -2, 6, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'crystal_switch': {
      ctx.fillStyle = '#475569';
      ctx.fillRect(-11, 2, 22, 10);
      const isRed = prop.state === 'red';
      const orbColor = isRed ? '#ef4444' : '#3b82f6';
      const glowColor = isRed ? '#fca5a5' : '#93c5fd';
      ctx.fillStyle = orbColor;
      ctx.beginPath();
      ctx.arc(0, -3, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }

    case 'chest':
    case 'vault_chest': {
      const isVault = prop.type === 'vault_chest';
      if (!isVault && prop.opened) {
        // Open Treasure Chest (raised lid + glowing interior)
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-14, -14, 28, 8);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.strokeRect(-14, -14, 28, 8);

        ctx.fillStyle = '#78350f';
        ctx.fillRect(-14, -5, 28, 15);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
        ctx.fillRect(-11, -5, 22, 6);
        ctx.strokeRect(-14, -5, 28, 15);
      } else {
        ctx.fillStyle = isVault ? '#1e3a8a' : '#92400e';
        ctx.fillRect(-14, -10, 28, 20);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-14, -10, 28, 20);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(-3, -2, 6, 6);
      }
      if (isVault) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VAULT [E]', 0, -15);
      }
      break;
    }

    case 'forge_anvil': {
      ctx.fillStyle = '#334155';
      ctx.fillRect(-14, -8, 28, 16);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(0, -4, 6 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RELIC FORGE [E]', 0, -15);
      break;
    }
  }

  ctx.restore();
}

// ============================================================================
// RENDER LOOT CHESTS & BAGS (Auto-Opens When Player Moves Near!)
// ============================================================================
export function drawLootBag(ctx, bag, screenX, screenY, time, isOpen = false) {
  const meta = BAG_TYPES[bag.bagType] || BAG_TYPES[0];
  const bob = isOpen ? 0 : Math.sin(time * 5 + bag.x) * 2.2;

  ctx.save();
  ctx.translate(screenX, screenY + bob);

  if (isOpen) {
    // Pulsing proximity ring indicating auto-opened chest popup
    ctx.strokeStyle = bag.bagType === 6 ? '#22d3ee' : meta.ribbon;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 2, 18 + Math.sin(time * 8) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (bag.bagType >= 4 || isOpen) {
    const rad = bag.bagType === 6 ? 34 : 24;
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, rad);
    grad.addColorStop(0, meta.glow);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();

    if (bag.bagType === 6) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.fillRect(-10, -48, 20, 48);
    }
  }

  // Chest / Bag Base Body
  ctx.fillStyle = meta.color;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-12, -3, 24, 15, 4);
  ctx.fill();
  ctx.stroke();

  if (isOpen) {
    // Open Chest Lid (tilted up) + glowing loot interior
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-10, -3, 20, 5);
    ctx.fillStyle = bag.bagType === 6 ? '#22d3ee' : '#fde047';
    ctx.beginPath();
    ctx.arc(-4, -1, 3, 0, Math.PI * 2);
    ctx.arc(4, -1, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = meta.color;
    ctx.beginPath();
    ctx.roundRect(-12, -13, 24, 7, [4, 4, 1, 1]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = meta.ribbon;
    ctx.fillRect(-12, -9, 24, 2.5);
  } else {
    // Closed Chest Lid + Ribbon Band + Clasp
    ctx.fillStyle = meta.color;
    ctx.beginPath();
    ctx.roundRect(-12, -9, 24, 7, [4, 4, 1, 1]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = meta.ribbon;
    ctx.fillRect(-12, -3, 24, 3);
    ctx.fillRect(-3, -9, 6, 18);

    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.fillRect(-3, -4, 6, 6);
    ctx.strokeRect(-3, -4, 6, 6);
  }

  if (bag.bagType === 6) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ WHITE CHEST ★', 0, -18);
  } else if (bag.bagType === 4) {
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('POTION', 0, -16);
  }

  ctx.restore();
}

// ============================================================================
// RENDER WARDEN HERO / MMO PLAYER (Tunic + Hood + Bulwark Shield + Blade Arc)
// ============================================================================
export function drawHero(ctx, entity, screenX, screenY, time, isSelf = false) {
  ctx.save();
  ctx.translate(screenX, screenY);

  const pal = entity.palette || {
    tunic: '#22c55e',
    trim: '#eab308',
    cap: '#16a34a',
    skin: '#fed7aa',
    shield: '#3b82f6'
  };

  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  if (entity.chargeTime && entity.chargeTime > 0.15) {
    const ready = entity.chargeTime >= 0.55;
    ctx.strokeStyle = ready ? '#facc15' : '#38bdf8';
    ctx.lineWidth = ready ? 3 : 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 18 + Math.sin(time * 20) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (entity.invulnTimer > 0 || (entity.buffs && entity.buffs.armored > 0)) {
    ctx.strokeStyle = entity.invulnTimer > 0 ? '#38bdf8' : '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = pal.tunic;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-10, -6, 20, 18, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = pal.trim;
  ctx.fillRect(-10, 3, 20, 3);

  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.arc(0, -8, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  const angle = entity.aimAngle || 0;
  ctx.fillStyle = pal.cap;
  ctx.beginPath();
  ctx.arc(0, -10, 8.5, Math.PI, 0);
  ctx.lineTo(-Math.cos(angle) * 15, -12 - Math.sin(angle) * 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const ex = Math.cos(angle) * 3.5;
  const ey = Math.sin(angle) * 2.5 - 7.5;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(ex - 3, ey - 1, 2, 2.5);
  ctx.fillRect(ex + 1, ey - 1, 2, 2.5);

  // Runic Bulwark Shield
  const shieldDist = entity.shielding ? 13 : 9;
  const shieldAngle = entity.shielding ? angle : angle + 1.1;
  const sx = Math.cos(shieldAngle) * shieldDist;
  const sy = Math.sin(shieldAngle) * shieldDist;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.fillStyle = pal.shield;
  ctx.strokeStyle = entity.shielding ? '#fde047' : '#cbd5e1';
  ctx.lineWidth = entity.shielding ? 2.5 : 1.5;
  ctx.beginPath();
  ctx.roundRect(-6, -7, 12, 14, 3);
  ctx.fill();
  ctx.stroke();
  // Holy Crest diamond on shield
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(3.5, 0);
  ctx.lineTo(0, 4);
  ctx.lineTo(-3.5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  if (entity.slashTimer > 0) {
    const progress = 1 - entity.slashTimer / entity.slashDuration;
    const isSpin = entity.isSpinSlash;
    const arcSpan = isSpin ? Math.PI * 2 : (entity.slashArcRad || 2.1);
    const startA = isSpin ? 0 : angle - arcSpan / 2;
    const currentA = startA + arcSpan * progress;
    const radius = entity.slashRadiusPx || 44;

    ctx.strokeStyle = entity.bladeColor || '#67e8f9';
    ctx.lineWidth = isSpin ? 8 : 6;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.82, startA, currentA);
    ctx.stroke();

    ctx.save();
    ctx.rotate(currentA);
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = entity.bladeColor || '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(10, -3, radius - 10, 6);
    ctx.strokeRect(10, -3, radius - 10, 6);
    ctx.restore();
  }

  if (entity.carriedPot) {
    drawProp(ctx, { type: 'pot' }, 0, -24, time);
  }

  // Orbiting Lumina Wisp Companion
  if (entity.hasFairy !== false) {
    const fx = Math.cos(time * 3.5 + (entity.id ? entity.id.length : 0)) * 22;
    const fy = Math.sin(time * 5.0) * 10 - 14;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(fx - 4, fy - 2, 4, 2, -0.5, 0, Math.PI * 2);
    ctx.ellipse(fx + 4, fy - 2, 4, 2, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isSelf ? '#38bdf8' : '#a3e635';
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (entity.name) {
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isSelf ? '#fde047' : '#e2e8f0';
    const maxTag = entity.maxedCount > 0 ? ` [${entity.maxedCount}/8]` : '';
    ctx.fillText(`${entity.name}${maxTag}`, 0, -24);
  }

  ctx.restore();
}

// ============================================================================
// RENDER ENEMIES & BOSSES
// ============================================================================
export function drawEnemy(ctx, enemy, screenX, screenY, time) {
  ctx.save();
  ctx.translate(screenX, screenY);

  const r = enemy.size || 16;

  ctx.fillStyle = 'rgba(0,0,0,0.42)';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.75, r * 0.85, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  if (enemy.isBoss || enemy.isGod) {
    ctx.strokeStyle = enemy.isBoss ? 'rgba(250, 204, 21, 0.5)' : 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = enemy.isBoss ? 3 : 2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 5 + Math.sin(time * 6) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = enemy.hitFlash > 0 ? '#ffffff' : enemy.color;
  ctx.strokeStyle = '#090d16';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (enemy.id.includes('cube')) {
    ctx.roundRect(-r, -r, r * 2, r * 2, 5);
  } else {
    ctx.arc(0, 0, r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = enemy.accent || '#fde047';
  ctx.beginPath();
  ctx.arc(0, -2, r * 0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#090d16';
  if (enemy.id.includes('beholder') || enemy.id.includes('gohma')) {
    ctx.beginPath();
    ctx.arc(0, -2, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-r * 0.32, -4, 3.5, 4);
    ctx.fillRect(r * 0.15, -4, 3.5, 4);
  }

  if (enemy.frontShield) {
    const fa = enemy.facingAngle || 0;
    ctx.save();
    ctx.rotate(fa);
    ctx.fillStyle = '#eab308';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.fillRect(r - 3, -r * 0.7, 6, r * 1.4);
    ctx.strokeRect(r - 3, -r * 0.7, 6, r * 1.4);
    ctx.restore();
  }

  // Final Boss Crown (Malakor, the Evil Bane)
  if (enemy.isFinalBoss) {
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -r + 2);
    ctx.lineTo(-12, -r - 12);
    ctx.lineTo(-5, -r - 4);
    ctx.lineTo(0, -r - 15);
    ctx.lineTo(5, -r - 4);
    ctx.lineTo(12, -r - 12);
    ctx.lineTo(16, -r + 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  if (enemy.stunTimer > 0) {
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ STUNNED ★', 0, -r - 14);
  } else if (enemy.armorBreakTimer > 0) {
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ARMOR BROKEN', 0, -r - 14);
  }

  if (enemy.hp < enemy.maxHp || enemy.isBoss) {
    const bw = Math.max(32, r * 2);
    const bh = enemy.isBoss ? 6 : 4;
    const pct = Math.max(0, enemy.hp / enemy.maxHp);
    ctx.fillStyle = 'rgba(9, 13, 22, 0.85)';
    ctx.fillRect(-bw / 2, r + 6, bw, bh);
    ctx.fillStyle = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(-bw / 2 + 1, r + 7, (bw - 2) * pct, bh - 2);
  }

  ctx.restore();
}

// ============================================================================
// GENERATE CRISP 40x40 ITEM ICON DATA-URL FOR INVENTORY & LOOT BAGS
// ============================================================================
export function getItemIconDataUrl(itemId) {
  if (!itemId || !ITEMS[itemId]) return '';
  if (itemIconCache.has(itemId)) return itemIconCache.get(itemId);

  const item = ITEMS[itemId];
  const c = document.createElement('canvas');
  c.width = 40;
  c.height = 40;
  const ctx = c.getContext('2d');

  if (item.tier === 'UT') {
    const grad = ctx.createRadialGradient(20, 20, 2, 20, 20, 18);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 40, 40);
  }

  ctx.save();
  ctx.translate(20, 20);

  if (item.subType === 'crest_shard') {
    // Radiant 5-Pointed Holy Crest Fragment!
    ctx.fillStyle = item.color || '#facc15';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(10, -3);
    ctx.lineTo(6, 13);
    ctx.lineTo(-6, 13);
    ctx.lineTo(-10, -3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (item.subType === 'sword' || item.subType === 'dagger') {
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = item.bladeColor || item.color;
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2;
    const len = item.subType === 'sword' ? 22 : 16;
    ctx.beginPath();
    ctx.moveTo(-2, 6);
    ctx.lineTo(-3, -len + 6);
    ctx.lineTo(0, -len);
    ctx.lineTo(3, -len + 6);
    ctx.lineTo(2, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-7, 5, 14, 3);
    ctx.fillStyle = item.color;
    ctx.fillRect(-2, 8, 4, 6);
  } else if (item.subType === 'bow') {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-4, 0, 13, -1.1, 1.1);
    ctx.stroke();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4 + Math.cos(-1.1) * 13, Math.sin(-1.1) * 13);
    ctx.lineTo(-4 + Math.cos(1.1) * 13, Math.sin(1.1) * 13);
    ctx.stroke();
    ctx.strokeStyle = item.bladeColor || '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(12, 0);
    ctx.stroke();
  } else if (item.subType === 'rod' || item.subType === 'wand') {
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -12, 4, 24);
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(0, -12, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else if (item.subType === 'boomerang') {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-11, 8);
    ctx.lineTo(0, -9);
    ctx.lineTo(11, 8);
    ctx.stroke();
  } else if (item.subType === 'hookshot') {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, 10);
    ctx.lineTo(8, -8);
    ctx.stroke();
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(2, -11);
    ctx.lineTo(11, -11);
    ctx.lineTo(11, -2);
    ctx.stroke();
  } else if (item.subType === 'bomb') {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(0, 3, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(6, -13);
    ctx.stroke();
  } else if (item.subType === 'ocarina') {
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.ellipse(0, 2, 12, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.fillRect(-5, 0, 2, 2);
    ctx.fillRect(-1, 1, 2, 2);
    ctx.fillRect(3, 2, 2, 2);
  } else if (item.slot === 'armor') {
    ctx.fillStyle = item.color;
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-11, -9);
    ctx.lineTo(11, -9);
    ctx.lineTo(8, 11);
    ctx.lineTo(-8, 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (item.slot === 'ring') {
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 2, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(0, -7, 4.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.subType === 'stat_pot' || item.subType === 'stat_omni' || item.subType === 'heal') {
    ctx.fillStyle = item.color;
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 5, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-3, -10, 6, 7);
    ctx.fillStyle = '#a16207';
    ctx.fillRect(-4, -12, 8, 3);
  }

  ctx.restore();
  const url = c.toDataURL();
  itemIconCache.set(itemId, url);
  return url;
}
