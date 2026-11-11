// ============================================================================
// REALM OF THE SHATTERED CREST — PLAYABLE CLASSES & PROGRESSION DATA
// Combines Top-Down Zelda Archetypes with Realm of the Mad God 8/8 Stat Caps
// ============================================================================

export const STAT_NAMES = ['hp', 'mp', 'atk', 'def', 'spd', 'dex', 'vit', 'wis'];

export const STAT_LABELS = {
  hp:  { short: 'LIFE', name: 'Maximum Hearts / HP', potId: 'pot_life', inc: 5 },
  mp:  { short: 'MANA', name: 'Maximum Magic / MP',  potId: 'pot_mana', inc: 5 },
  atk: { short: 'ATK',  name: 'Attack Power',        potId: 'pot_atk',  inc: 1 },
  def: { short: 'DEF',  name: 'Armor Defense',       potId: 'pot_def',  inc: 1 },
  spd: { short: 'SPD',  name: 'Movement Speed',      potId: 'pot_spd',  inc: 1 },
  dex: { short: 'DEX',  name: 'Attack Speed',        potId: 'pot_dex',  inc: 1 },
  vit: { short: 'VIT',  name: 'Heart Regeneration',  potId: 'pot_vit',  inc: 1 },
  wis: { short: 'WIS',  name: 'Magic Regeneration',  potId: 'pot_wis',  inc: 1 }
};

export const CLASSES = {
  knight: {
    id: 'knight',
    name: 'Hylian Knight',
    subtitle: 'Sword & Shield Vanguard',
    lore: 'Trained in the Royal Citadel. Cleaves enemies with wide 180° sword arcs, deflects bullets with Perfect Parries, and hurls a Gale Boomerang to stun foes and pull loot bags from afar.',
    weaponType: 'sword',
    relicType: 'boomerang',
    armorType: 'heavy',
    palette: {
      tunic: '#22c55e',      // Classic Hero Green
      trim: '#eab308',       // Triforce Gold
      cap: '#16a34a',
      skin: '#fed7aa',
      shield: '#3b82f6'
    },
    baseStats: { hp: 200, mp: 100, atk: 14, def: 4, spd: 12, dex: 14, vit: 12, wis: 10 },
    growth:    { hp: 24,  mp: 5,   atk: 1.5, def: 0, spd: 1.2, dex: 1.3, vit: 1.2, wis: 1.0 },
    maxStats:  { hp: 780, mp: 255, atk: 55, def: 40, spd: 50, dex: 50, vit: 75, wis: 50 },
    startingGear: ['wep_sword_t1', 'rel_boom_t1', 'arm_heavy_t1', 'rng_hp_t1'],
    perks: ['Full-HP Sword Beams', 'Heavy Shield Poise (+35%)', 'Gale Loot Magnet']
  },

  ranger: {
    id: 'ranger',
    name: 'Kokiri Ranger',
    subtitle: 'Bow & Clawshot Pathfinder',
    lore: 'Swift guardian of the Lost Woods. Combines quick close-quarters dagger slashes with long-range piercing arrows and a Hookshot that grapples across chasms or stuns bosses.',
    weaponType: 'bow',
    relicType: 'hookshot',
    armorType: 'leather',
    palette: {
      tunic: '#10b981',
      trim: '#a3e635',
      cap: '#047857',
      skin: '#fed7aa',
      shield: '#92400e'
    },
    baseStats: { hp: 165, mp: 110, atk: 13, def: 2, spd: 16, dex: 16, vit: 10, wis: 12 },
    growth:    { hp: 21,  mp: 6,   atk: 1.6, def: 0, spd: 1.5, dex: 1.5, vit: 1.0, wis: 1.2 },
    maxStats:  { hp: 700, mp: 260, atk: 75, def: 25, spd: 55, dex: 55, vit: 40, wis: 50 },
    startingGear: ['wep_bow_t1', 'rel_hook_t1', 'arm_leather_t1', 'rng_dex_t1'],
    perks: ['Piercing Arrow Volleys', 'Chasm Grapple Hookshot', 'Close-Range Dagger Riposte']
  },

  pyromancer: {
    id: 'pyromancer',
    name: 'Goron Pyromancer',
    subtitle: 'Fire Rod & Powder Demolitionist',
    lore: 'Channeler of Death Mountain magma. Swings a blazing Magic Rod that emits arcane shockwaves AND twin firebolts, while lobbing heavy Bombs that shatter cracked dungeon walls and armor.',
    weaponType: 'rod',
    relicType: 'bomb',
    armorType: 'robe',
    palette: {
      tunic: '#ef4444',      // Goron Red Tunic
      trim: '#fbbf24',
      cap: '#b91c1c',
      skin: '#fdba74',
      shield: '#f97316'
    },
    baseStats: { hp: 150, mp: 145, atk: 16, def: 1, spd: 12, dex: 15, vit: 9, wis: 16 },
    growth:    { hp: 19,  mp: 9,   atk: 1.9, def: 0, spd: 1.2, dex: 1.6, vit: 0.9, wis: 1.6 },
    maxStats:  { hp: 670, mp: 385, atk: 75, def: 25, spd: 50, dex: 75, vit: 40, wis: 60 },
    startingGear: ['wep_rod_t1', 'rel_bomb_t1', 'arm_robe_t1', 'rng_atk_t1'],
    perks: ['Dual Spellblade Bolts', 'Wall-Breaching Bombs', 'Armor-Piercing Blast']
  },

  paladin: {
    id: 'paladin',
    name: 'Royal Paladin',
    subtitle: 'Sacred Blade & Ocarina Sage',
    lore: 'Champion of the Sacred Realm. Wields blessed broadswords and plays sacred Ocarina hymns that grant Healing, Damaging (+40% ATK), and Armored buffs to all nearby MMO allies.',
    weaponType: 'sword',
    relicType: 'ocarina',
    armorType: 'heavy',
    palette: {
      tunic: '#3b82f6',      // Zora / Royal Blue Tunic
      trim: '#fde047',
      cap: '#1d4ed8',
      skin: '#fed7aa',
      shield: '#fbbf24'
    },
    baseStats: { hp: 190, mp: 125, atk: 14, def: 3, spd: 13, dex: 13, vit: 11, wis: 15 },
    growth:    { hp: 23,  mp: 7,   atk: 1.4, def: 0, spd: 1.3, dex: 1.2, vit: 1.1, wis: 1.5 },
    maxStats:  { hp: 750, mp: 320, atk: 55, def: 30, spd: 55, dex: 50, vit: 60, wis: 75 },
    startingGear: ['wep_sword_t1', 'rel_ocarina_t1', 'arm_heavy_t1', 'rng_wis_t1'],
    perks: ['Party-Wide Ocarina Buffs', 'Sacred Heal Aura', 'Blessed Spin Attack']
  },

  assassin: {
    id: 'assassin',
    name: 'Sheikah Shadow',
    subtitle: 'Twin Blades & Frost Wand Trickster',
    lore: 'Phantom operative of Kakariko. Unleashes ultra-fast twin katana slashes and wields the Wand of Frost to freeze bullet-hell bosses in their tracks while dashing unseen.',
    weaponType: 'dagger',
    relicType: 'wand',
    armorType: 'leather',
    palette: {
      tunic: '#38bdf8',
      trim: '#f43f5e',
      cap: '#0284c7',
      skin: '#fed7aa',
      shield: '#e2e8f0'
    },
    baseStats: { hp: 160, mp: 120, atk: 14, def: 2, spd: 18, dex: 18, vit: 10, wis: 13 },
    growth:    { hp: 20,  mp: 6.5, atk: 1.5, def: 0, spd: 1.8, dex: 1.8, vit: 1.0, wis: 1.3 },
    maxStats:  { hp: 680, mp: 285, atk: 65, def: 25, spd: 75, dex: 75, vit: 45, wis: 60 },
    startingGear: ['wep_dagger_t1', 'rel_wand_t1', 'arm_leather_t1', 'rng_spd_t1'],
    perks: ['Twin-Strike Crit Arcs', 'Cryo-Freeze Relic Wave', 'Extended Dash i-Frames']
  }
};

// RotMG Star Rank System (Total Class Fame Milestones per Class)
// 5 Stars per Class (20, 150, 400, 800, 2000 Fame) x 5 Classes = 25 Max Stars
export const STAR_THRESHOLDS = [20, 150, 400, 800, 2000];

export function getStarRankColor(totalStars) {
  if (totalStars >= 25) return { name: 'White Star',      color: '#ffffff', glow: '#38bdf8' };
  if (totalStars >= 20) return { name: 'Yellow Star',     color: '#facc15', glow: '#eab308' };
  if (totalStars >= 15) return { name: 'Orange Star',     color: '#fb923c', glow: '#ea580c' };
  if (totalStars >= 10) return { name: 'Red Star',        color: '#f87171', glow: '#dc2626' };
  if (totalStars >= 5)  return { name: 'Dark Blue Star',  color: '#60a5fa', glow: '#2563eb' };
  return                       { name: 'Light Blue Star', color: '#93c5fd', glow: '#60a5fa' };
}
