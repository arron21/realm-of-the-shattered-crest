// ============================================================================
// REALM OF THE SHATTERED CREST — PLAYABLE CLASSES, LORE & PROGRESSION DATA
// ============================================================================

export const STAT_NAMES = ['hp', 'mp', 'atk', 'def', 'spd', 'dex', 'vit', 'wis'];

export const STAT_LABELS = {
  hp:  { short: 'LIFE', name: 'Maximum Life (HP)',   potId: 'pot_life', inc: 5 },
  mp:  { short: 'MANA', name: 'Maximum Mana (MP)',   potId: 'pot_mana', inc: 5 },
  atk: { short: 'ATK',  name: 'Attack Power',        potId: 'pot_atk',  inc: 1 },
  def: { short: 'DEF',  name: 'Armor Defense',       potId: 'pot_def',  inc: 1 },
  spd: { short: 'SPD',  name: 'Movement Speed',      potId: 'pot_spd',  inc: 1 },
  dex: { short: 'DEX',  name: 'Attack Speed',        potId: 'pot_dex',  inc: 1 },
  vit: { short: 'VIT',  name: 'Life Regeneration',   potId: 'pot_vit',  inc: 1 },
  wis: { short: 'WIS',  name: 'Mana Regeneration',   potId: 'pot_wis',  inc: 1 }
};

// The 5 Sacred Shards of the Holy Crest scattered across the Realms
export const CREST_SHARDS = [
  {
    id: 'shard_tide',
    index: 0,
    name: 'I. Shard of the Silver Tide',
    dungeonId: 'pirate_cove',
    dungeonName: 'Sunken Corsair Grotto',
    guardian: 'Dread Captain Vorath',
    color: '#38bdf8',
    blessing: '+25 Max Life & +2 SPD across all heroes',
    lore: 'When the Holy Crest fractured upon the High Altar, the western fragment plunged into the Tempest Sea, where Vorath bound its tidal light inside his sunken flagship.'
  },
  {
    id: 'shard_wilds',
    index: 1,
    name: 'II. Shard of the Sylvan Root',
    dungeonId: 'deku_temple',
    dungeonName: 'Blighted Sylvan Temple',
    guardian: 'Arachne the Blightweaver',
    color: '#4ade80',
    blessing: '+25 Max Life & +2 DEX across all heroes',
    lore: 'The emerald fragment fell into the ancient canopy of the Whispering Wilds. Evil Bane’s venom twisted the temple roots, birthing Arachne to guard the shard.'
  },
  {
    id: 'shard_astral',
    index: 2,
    name: 'III. Shard of the Astral Wind',
    dungeonId: 'sprite_world',
    dungeonName: 'The Astral Conduit',
    guardian: 'Aetherion the Astral Archon',
    color: '#c084fc',
    blessing: '+20 Max Mana & +2 WIS across all heroes',
    lore: 'Hurled beyond the mortal sky, the third fragment lodged within the floating spires of the Astral Conduit, warping the star-spirits into ruthless sentinels.'
  },
  {
    id: 'shard_ossuary',
    index: 3,
    name: 'IV. Shard of the Dawn Vigil',
    dungeonId: 'undead_lair',
    dungeonName: 'Sunken Catacombs',
    guardian: 'Mordecai the Undying Lich',
    color: '#facc15',
    blessing: '+2 ATK & +2 VIT across all heroes',
    lore: 'Buried beneath the crypts of the First Wardens, this shard’s radiant energy was inverted by Mordecai to raise legions of tireless bone-knights.'
  },
  {
    id: 'shard_flame',
    index: 4,
    name: 'V. Shard of the Primordial Flame',
    dungeonId: 'abyss_mountain',
    dungeonName: 'Caldera of the Abyss',
    guardian: 'Ignis the Magma Overlord',
    color: '#f97316',
    blessing: '+3 DEF & +25 Max Life across all heroes',
    lore: 'Cast into the molten heart of the world, the final outer fragment burns within the Caldera of the Abyss. Unite all five shards to restore the Holy Crest and vanquish Malakor, the Evil Bane!'
  }
];

export const ELDER_LORE_CHAPTERS = [
  {
    title: 'I. The Age of the Holy Crest',
    body: 'Greetings, Warden. Before the sky turned to ash, the realm of Aethelgard knew peace under the radiance of the Holy Crest—a five-pointed celestial seal forged by the First Elders. Set upon the High Altar of this very Sanctuary, its golden barrier held back Malakor, the Evil Bane, imprisoning his legions within the outer void.'
  },
  {
    title: 'II. The Night the Crest Shattered',
    body: 'On the night of the Blood Eclipse, Malakor channeled all his malice into a single cataclysmic lance that struck the High Altar. Rather than bend to his corruption, the Holy Crest shattered into Five Sacred Shards, scattering across the mortal realms and deep into the perilous dungeons of Aethelgard.'
  },
  {
    title: 'III. Corruption of the Blightlands',
    body: 'With the Holy Crest broken, the center of our world collapsed into the Blightlands—a scorched crater where Malakor’s lieutenant Gods now roam freely. Every fallen Warden leaves behind a monument of stone, yet their legacy fame endures within the Sanctuary.'
  },
  {
    title: 'IV. Rebuilding the Crest Piece by Piece',
    body: 'Your destiny is clear, hero: venture from the Sunlit Shoals into the five corrupted Dungeons, slay the Guardians who hoard the Crest Shards, and return each fragment to this Sanctuary. Each recovered shard permanently empowers all your future heroes—and when all five are united, the seal to the Sanctum of the Evil Bane will be reforged!'
  }
];

export const CLASSES = {
  knight: {
    id: 'knight',
    name: 'Aethelgard Vanguard',
    subtitle: 'Broadblade & Bulwark Sentinel',
    lore: 'Sworn defender of the High Altar. Cleaves foes with wide 180° broadsword arcs, reflects projectiles with timed Bulwark Parries, and hurls a Gale Chakram to stun enemies and draw loot bags close.',
    weaponType: 'sword',
    relicType: 'boomerang',
    armorType: 'heavy',
    palette: {
      tunic: '#22c55e',
      trim: '#eab308',
      cap: '#16a34a',
      skin: '#fed7aa',
      shield: '#3b82f6'
    },
    baseStats: { hp: 200, mp: 100, atk: 14, def: 4, spd: 12, dex: 14, vit: 12, wis: 10 },
    growth:    { hp: 24,  mp: 5,   atk: 1.5, def: 0, spd: 1.2, dex: 1.3, vit: 1.2, wis: 1.0 },
    maxStats:  { hp: 780, mp: 255, atk: 55, def: 40, spd: 50, dex: 50, vit: 75, wis: 50 },
    startingGear: ['wep_sword_t1', 'rel_boom_t1', 'arm_heavy_t1', 'rng_hp_t1'],
    perks: ['Full-HP Blade Waves', 'Bulwark Perfect Parry', 'Gale Chakram Loot Magnet']
  },

  ranger: {
    id: 'ranger',
    name: 'Sylvan Warden',
    subtitle: 'Longbow & Grapple Pathfinder',
    lore: 'Swift sentinel of the Whispering Wilds. Combines close-range blade slashes with piercing arrow volleys and a Chain Grapple that vaults across chasms or stuns bosses.',
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
    perks: ['Piercing Arrow Volleys', 'Chasm Chain Grapple', 'Close-Range Riposte']
  },

  pyromancer: {
    id: 'pyromancer',
    name: 'Cinder Pyromancer',
    subtitle: 'Spellrod & Brimstone Sapper',
    lore: 'Channeler of Caldera fire. Swings a blazing Spellrod that emits shockwaves and twin firebolts, while lobbing Brimstone Charges that shatter cracked dungeon walls and boss armor.',
    weaponType: 'rod',
    relicType: 'bomb',
    armorType: 'robe',
    palette: {
      tunic: '#ef4444',
      trim: '#fbbf24',
      cap: '#b91c1c',
      skin: '#fdba74',
      shield: '#f97316'
    },
    baseStats: { hp: 150, mp: 145, atk: 16, def: 1, spd: 12, dex: 15, vit: 9, wis: 16 },
    growth:    { hp: 19,  mp: 9,   atk: 1.9, def: 0, spd: 1.2, dex: 1.6, vit: 0.9, wis: 1.6 },
    maxStats:  { hp: 670, mp: 385, atk: 75, def: 25, spd: 50, dex: 75, vit: 40, wis: 60 },
    startingGear: ['wep_rod_t1', 'rel_bomb_t1', 'arm_robe_t1', 'rng_atk_t1'],
    perks: ['Dual Spellblade Bolts', 'Wall-Breaching Charges', 'Armor-Shattering Blast']
  },

  paladin: {
    id: 'paladin',
    name: 'Solar Templar',
    subtitle: 'Sunblade & Sanctuary Chronicler',
    lore: 'Keeper of the Sacred Litany. Wields radiant broadswords and sounds the Sanctuary Warhorn to grant Healing, Damaging (+35% ATK), and Armored buffs to all nearby allies.',
    weaponType: 'sword',
    relicType: 'ocarina',
    armorType: 'heavy',
    palette: {
      tunic: '#3b82f6',
      trim: '#fde047',
      cap: '#1d4ed8',
      skin: '#fed7aa',
      shield: '#fbbf24'
    },
    baseStats: { hp: 190, mp: 125, atk: 14, def: 3, spd: 13, dex: 13, vit: 11, wis: 15 },
    growth:    { hp: 23,  mp: 7,   atk: 1.4, def: 0, spd: 1.3, dex: 1.2, vit: 1.1, wis: 1.5 },
    maxStats:  { hp: 750, mp: 320, atk: 55, def: 30, spd: 55, dex: 50, vit: 60, wis: 75 },
    startingGear: ['wep_sword_t1', 'rel_ocarina_t1', 'arm_heavy_t1', 'rng_wis_t1'],
    perks: ['Party-Wide Warhorn Buffs', 'Radiant Heal Aura', 'Sunburst Spin Cleave']
  },

  assassin: {
    id: 'assassin',
    name: 'Nightblade Stalker',
    subtitle: 'Twin Blades & Frost Mystic',
    lore: 'Phantom operative of the Astral Watch. Unleashes ultra-fast twin katana slashes and wields the Scepter of Rime to blink through danger and freeze bullet-hell bosses.',
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
    perks: ['Twin-Strike Crit Arcs', 'Cryo-Freeze Blink Nova', 'Extended Dodge i-Frames']
  }
};

export const STAR_THRESHOLDS = [20, 150, 400, 800, 2000];

export function getStarRankColor(totalStars) {
  if (totalStars >= 25) return { name: 'White Star',      color: '#ffffff', glow: '#38bdf8' };
  if (totalStars >= 20) return { name: 'Yellow Star',     color: '#facc15', glow: '#eab308' };
  if (totalStars >= 15) return { name: 'Orange Star',     color: '#fb923c', glow: '#ea580c' };
  if (totalStars >= 10) return { name: 'Red Star',        color: '#f87171', glow: '#dc2626' };
  if (totalStars >= 5)  return { name: 'Dark Blue Star',  color: '#60a5fa', glow: '#2563eb' };
  return                       { name: 'Light Blue Star', color: '#93c5fd', glow: '#60a5fa' };
}
