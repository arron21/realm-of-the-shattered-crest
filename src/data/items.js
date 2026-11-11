// ============================================================================
// REALM OF THE SHATTERED CREST — ITEM, RELIC, LOOT BAG & POTION DATABASE
// Includes Tiered Gear (T1-T6), ST Sets, UT White Bags, and 8 Stat Potions
// ============================================================================

// RotMG Bag Types:
// 0 = Brown Bag (Consumables / Low tier)
// 1 = Pink Bag (T1-T2 Gear)
// 2 = Purple Bag (T3-T4 Gear)
// 3 = Cyan Bag (T5-T6 Godlands Gear)
// 4 = Blue Bag (Permanent Stat Potions!)
// 5 = Orange Bag (ST Set Items)
// 6 = WHITE BAG (Untiered / UT Legendary Items!)

export const BAG_TYPES = {
  0: { id: 0, name: 'Brown Bag',  color: '#a16207', ribbon: '#713f12', glow: 'rgba(161,98,7,0.35)' },
  1: { id: 1, name: 'Pink Bag',   color: '#f472b6', ribbon: '#db2777', glow: 'rgba(244,114,182,0.45)' },
  2: { id: 2, name: 'Purple Bag', color: '#a855f7', ribbon: '#eab308', glow: 'rgba(168,85,247,0.5)' },
  3: { id: 3, name: 'Cyan Bag',   color: '#22d3ee', ribbon: '#0284c7', glow: 'rgba(34,211,238,0.6)' },
  4: { id: 4, name: 'Potion Bag', color: '#3b82f6', ribbon: '#e2e8f0', glow: 'rgba(59,130,246,0.75)' },
  5: { id: 5, name: 'Orange Bag', color: '#f97316', ribbon: '#fde047', glow: 'rgba(249,115,22,0.75)' },
  6: { id: 6, name: 'WHITE BAG',  color: '#f8fafc', ribbon: '#06b6d4', glow: 'rgba(34,211,238,0.95)' }
};

export const ITEMS = {
  // ==========================================================================
  // SWORDS (180° Zelda Arc Slash + Full-HP Sword Beam + Hurricane Spin)
  // ==========================================================================
  wep_sword_t1: {
    id: 'wep_sword_t1', name: 'Kokiri Broadsword', tier: 'T1', slot: 'weapon', subType: 'sword',
    bagType: 1, minDmg: 45, maxDmg: 70, shots: 1, range: 4.4, arcDeg: 115, beamDmg: 0.55,
    color: '#94a3b8', bladeColor: '#cbd5e1', fameBonus: 1,
    desc: 'A trusty forest blade. Unleashes a sweeping melee slash and a piercing beam at full health.'
  },
  wep_sword_t2: {
    id: 'wep_sword_t2', name: 'Hylian Soldier Blade', tier: 'T3', slot: 'weapon', subType: 'sword',
    bagType: 2, minDmg: 75, maxDmg: 110, shots: 1, range: 4.6, arcDeg: 120, beamDmg: 0.65,
    color: '#60a5fa', bladeColor: '#93c5fd', fameBonus: 2,
    desc: 'Forged in Castle Town armories. Balanced for swift parries and wide cleaves.'
  },
  wep_sword_t3: {
    id: 'wep_sword_t3', name: 'Tempered Razor Sword', tier: 'T5', slot: 'weapon', subType: 'sword',
    bagType: 2, minDmg: 110, maxDmg: 155, shots: 1, range: 4.8, arcDeg: 125, beamDmg: 0.75,
    color: '#f43f5e', bladeColor: '#fda4af', fameBonus: 3,
    desc: 'Honed with Goron mountain dust. Cuts through multiple foes and emits crimson beams.'
  },
  wep_sword_t4: {
    id: 'wep_sword_t4', name: 'Gilded Greatblade', tier: 'T8', slot: 'weapon', subType: 'sword',
    bagType: 3, minDmg: 155, maxDmg: 210, shots: 1, range: 5.0, arcDeg: 130, beamDmg: 0.85,
    color: '#eab308', bladeColor: '#fef08a', fameBonus: 4,
    desc: 'Gold-inlaid blade that never dulls. Emits a radiant golden wave even above 75% HP.'
  },
  wep_sword_t5: {
    id: 'wep_sword_t5', name: 'Skyward Acclaim Blade', tier: 'T12', slot: 'weapon', subType: 'sword',
    bagType: 3, minDmg: 215, maxDmg: 280, shots: 1, range: 5.3, arcDeg: 140, beamDmg: 1.0,
    color: '#38bdf8', bladeColor: '#e0f2fe', fameBonus: 6,
    desc: 'Supreme tiered broadsword blessed by the Skyloft winds. Always fires a Skyward Beam.'
  },
  wep_sword_ut_master: {
    id: 'wep_sword_ut_master', name: 'Blade of Evil\'s Bane', tier: 'UT', slot: 'weapon', subType: 'sword',
    bagType: 6, minDmg: 240, maxDmg: 310, shots: 2, spreadDeg: 18, range: 5.8, arcDeg: 150, beamDmg: 1.15,
    alwaysBeam: true, pierceArmor: false, stats: { def: 4, wis: 4 },
    color: '#38bdf8', bladeColor: '#67e8f9', fameBonus: 8,
    desc: 'LEGENDARY UT: Fires twin sacred crescent waves with every swing regardless of HP.'
  },
  wep_sword_ut_demon: {
    id: 'wep_sword_ut_demon', name: 'Goron Demon Edge', tier: 'UT', slot: 'weapon', subType: 'sword',
    bagType: 6, minDmg: 195, maxDmg: 255, shots: 2, spreadDeg: 38, range: 4.3, arcDeg: 145, beamDmg: 0.9,
    alwaysBeam: true, stats: { atk: 5, vit: 5 },
    color: '#ef4444', bladeColor: '#fca5a5', fameBonus: 7,
    desc: 'LEGENDARY UT (Abyss Drop): Twin-forked obsidian blade that fires two magma waves at point-blank.'
  },

  // ==========================================================================
  // BOWS (Close-quarters slash + Ranged Piercing Arrow Volleys)
  // ==========================================================================
  wep_bow_t1: {
    id: 'wep_bow_t1', name: 'Fairy Slingshot Bow', tier: 'T1', slot: 'weapon', subType: 'bow',
    bagType: 1, minDmg: 38, maxDmg: 60, shots: 1, spreadDeg: 0, range: 7.8, pierce: true,
    color: '#a3e635', bladeColor: '#d9f99d', fameBonus: 1,
    desc: 'Carved from Deku wood. Fires piercing arrows and slashes adjacent enemies.'
  },
  wep_bow_t2: {
    id: 'wep_bow_t2', name: 'Hero\'s Recurve Bow', tier: 'T4', slot: 'weapon', subType: 'bow',
    bagType: 2, minDmg: 58, maxDmg: 88, shots: 2, spreadDeg: 10, range: 8.0, pierce: true,
    color: '#22c55e', bladeColor: '#86efac', fameBonus: 2,
    desc: 'Fires two synchronized piercing arrows that skewer entire columns of foes.'
  },
  wep_bow_t3: {
    id: 'wep_bow_t3', name: 'Golden Tri-Bow', tier: 'T8', slot: 'weapon', subType: 'bow',
    bagType: 3, minDmg: 75, maxDmg: 110, shots: 3, spreadDeg: 14, range: 8.2, pierce: true,
    color: '#eab308', bladeColor: '#fef08a', fameBonus: 4,
    desc: 'Iconic three-arrow spread bow of the Godlands. Devastating crowd control.'
  },
  wep_bow_t4: {
    id: 'wep_bow_t4', name: 'Bow of the Ancient Sages', tier: 'T12', slot: 'weapon', subType: 'bow',
    bagType: 3, minDmg: 105, maxDmg: 145, shots: 3, spreadDeg: 11, range: 8.6, pierce: true,
    color: '#38bdf8', bladeColor: '#bae6fd', fameBonus: 6,
    desc: 'Tightly grouped triple-shot bow infused with ancient light energy.'
  },
  wep_bow_ut_light: {
    id: 'wep_bow_ut_light', name: 'Doom Bow of Sacred Light', tier: 'UT', slot: 'weapon', subType: 'bow',
    bagType: 6, minDmg: 420, maxDmg: 540, shots: 1, spreadDeg: 0, range: 9.5, pierce: true,
    rateMult: 0.55, stats: { atk: 6, wis: 4 },
    color: '#fde047', bladeColor: '#ffffff', fameBonus: 8,
    desc: 'LEGENDARY UT (Catacombs Drop): Slow-firing celestial rail-bow that obliterates lines of enemies.'
  },

  // ==========================================================================
  // MAGIC RODS (Arcane Melee Shockwave + Homing/Dual Spellbolts)
  // ==========================================================================
  wep_rod_t1: {
    id: 'wep_rod_t1', name: 'Apprentice Ember Rod', tier: 'T1', slot: 'weapon', subType: 'rod',
    bagType: 1, minDmg: 32, maxDmg: 52, shots: 2, spreadDeg: 8, range: 8.2, wave: true,
    color: '#f97316', bladeColor: '#fdba74', fameBonus: 1,
    desc: 'Channels twin firebolts in a wavy spiral while emitting a close-range heat pulse.'
  },
  wep_rod_t2: {
    id: 'wep_rod_t2', name: 'Rod of Somaria', tier: 'T4', slot: 'weapon', subType: 'rod',
    bagType: 2, minDmg: 55, maxDmg: 85, shots: 2, spreadDeg: 7, range: 8.5, wave: true,
    color: '#ec4899', bladeColor: '#f9a8d4', fameBonus: 2,
    desc: 'Fires twin crimson energy orbs that weave toward their target.'
  },
  wep_rod_t3: {
    id: 'wep_rod_t3', name: 'Staff of Din\'s Inferno', tier: 'T8', slot: 'weapon', subType: 'rod',
    bagType: 3, minDmg: 85, maxDmg: 125, shots: 2, spreadDeg: 6, range: 8.8, wave: true,
    color: '#ef4444', bladeColor: '#fca5a5', fameBonus: 4,
    desc: 'High-tier volcanic rod that scorches Godlands deities.'
  },
  wep_rod_t4: {
    id: 'wep_rod_t4', name: 'Cosmic Triforce Scepter', tier: 'T12', slot: 'weapon', subType: 'rod',
    bagType: 3, minDmg: 118, maxDmg: 165, shots: 2, spreadDeg: 5, range: 9.0, wave: true,
    color: '#eab308', bladeColor: '#fef08a', fameBonus: 6,
    desc: 'Pinnacle spellcaster rod radiating twin golden astral bolts.'
  },
  wep_rod_ut_seasons: {
    id: 'wep_rod_ut_seasons', name: 'Rod of the Four Seasons', tier: 'UT', slot: 'weapon', subType: 'rod',
    bagType: 6, minDmg: 95, maxDmg: 135, shots: 4, spreadDeg: 16, range: 8.4, pierceArmor: true,
    stats: { mp: 40, atk: 5, dex: 5 },
    color: '#10b981', bladeColor: '#6ee7b7', fameBonus: 8,
    desc: 'LEGENDARY UT (Sprite World Drop): Fires 4 elemental bolts that completely ignore enemy DEF.'
  },

  // ==========================================================================
  // DAGGERS / TWIN BLADES (Ultra-Fast Double Arc + Kunai Blades)
  // ==========================================================================
  wep_dagger_t1: {
    id: 'wep_dagger_t1', name: 'Sheikah Kunai', tier: 'T1', slot: 'weapon', subType: 'dagger',
    bagType: 1, minDmg: 36, maxDmg: 58, shots: 1, range: 5.8, rateMult: 1.25,
    color: '#38bdf8', bladeColor: '#bae6fd', fameBonus: 1,
    desc: 'Lightning-fast throwing dagger and twin-slash wakizashi.'
  },
  wep_dagger_t2: {
    id: 'wep_dagger_t2', name: 'Phantom Twin-Edge', tier: 'T4', slot: 'weapon', subType: 'dagger',
    bagType: 2, minDmg: 65, maxDmg: 98, shots: 1, range: 6.1, rateMult: 1.28,
    color: '#2dd4bf', bladeColor: '#99f6e4', fameBonus: 2,
    desc: 'Shadow-forged twin blades with blistering attack cadence.'
  },
  wep_dagger_t3: {
    id: 'wep_dagger_t3', name: 'Emerald Foul Blade', tier: 'T8', slot: 'weapon', subType: 'dagger',
    bagType: 3, minDmg: 102, maxDmg: 150, shots: 1, range: 6.3, rateMult: 1.32,
    color: '#10b981', bladeColor: '#6ee7b7', fameBonus: 4,
    desc: 'Deadly Kakariko assassin blade that shreds targets before they can react.'
  },
  wep_dagger_t4: {
    id: 'wep_dagger_t4', name: 'Twilight Shadow Katana', tier: 'T12', slot: 'weapon', subType: 'dagger',
    bagType: 3, minDmg: 145, maxDmg: 205, shots: 1, range: 6.6, rateMult: 1.35,
    color: '#f43f5e', bladeColor: '#fecdd3', fameBonus: 6,
    desc: 'Masterwork Sheikah katana that slices the very fabric of twilight.'
  },
  wep_dagger_ut_fierce: {
    id: 'wep_dagger_ut_fierce', name: 'Fierce Deity Double-Helix', tier: 'UT', slot: 'weapon', subType: 'dagger',
    bagType: 6, minDmg: 175, maxDmg: 245, shots: 2, spreadDeg: 8, range: 7.2, rateMult: 1.3,
    pierce: true, stats: { spd: 6, dex: 6 },
    color: '#f8fafc', bladeColor: '#38bdf8', fameBonus: 8,
    desc: 'LEGENDARY UT (Mad King Drop): Unleashes double-helix crescent waves that pierce all targets.'
  },

  // ==========================================================================
  // ZELDA RELICS / ABILITIES (Slot 2 — Press Q or Space/Middle-Click)
  // ==========================================================================
  // 1. BOOMERANGS (Stuns enemies, cuts bushes, pulls loot bags & hearts to you!)
  rel_boom_t1: {
    id: 'rel_boom_t1', name: 'Wooden Boomerang', tier: 'T1', slot: 'relic', subType: 'boomerang',
    bagType: 1, mpCost: 35, dmg: 140, stunSec: 1.8, range: 7.5, stats: { def: 2 },
    color: '#d97706', fameBonus: 1,
    desc: 'Stuns enemies in its path, cuts bushes, and pulls Loot Bags & Hearts back to you!'
  },
  rel_boom_t2: {
    id: 'rel_boom_t2', name: 'Magical Gale Boomerang', tier: 'T4', slot: 'relic', subType: 'boomerang',
    bagType: 2, mpCost: 45, dmg: 290, stunSec: 2.6, range: 9.0, stats: { def: 5, spd: 3 },
    color: '#38bdf8', fameBonus: 3,
    desc: 'Summons a whirlwind that stuns enemies for 2.6s and vacuums distant loot bags.'
  },
  rel_boom_ut: {
    id: 'rel_boom_ut', name: 'Mirror Shield & Cyclone Crest', tier: 'UT', slot: 'relic', subType: 'boomerang',
    bagType: 6, mpCost: 50, dmg: 480, stunSec: 3.4, range: 10.5, reflectNova: true,
    stats: { hp: 60, def: 10, spd: 4 },
    color: '#facc15', fameBonus: 7,
    desc: 'LEGENDARY UT: Throws twin golden cyclones AND reflects all nearby enemy bullets on cast!'
  },

  // 2. HOOKSHOTS (Grapples to pillars across chasms/lava OR pulls/stuns enemies!)
  rel_hook_t1: {
    id: 'rel_hook_t1', name: 'Iron Hookshot', tier: 'T1', slot: 'relic', subType: 'hookshot',
    bagType: 1, mpCost: 30, dmg: 160, stunSec: 1.5, range: 8.5, stats: { dex: 2 },
    color: '#94a3b8', fameBonus: 1,
    desc: 'Grapples you across chasms to Grapple Pillars with i-frames, or stuns & pierces foes!'
  },
  rel_hook_t2: {
    id: 'rel_hook_t2', name: 'Longshot of Lake Hylia', tier: 'T4', slot: 'relic', subType: 'hookshot',
    bagType: 2, mpCost: 40, dmg: 320, stunSec: 2.2, range: 11.0, stats: { dex: 5, atk: 3 },
    color: '#38bdf8', fameBonus: 3,
    desc: 'Extended titanium chain that reaches distant anchors and deals heavy armor-piercing damage.'
  },
  rel_hook_ut: {
    id: 'rel_hook_ut', name: 'Double Clawshot of the Sky', tier: 'UT', slot: 'relic', subType: 'hookshot',
    bagType: 6, mpCost: 35, dmg: 520, stunSec: 2.8, range: 12.5, shockwave: true,
    stats: { atk: 7, dex: 7, spd: 5 },
    color: '#f59e0b', fameBonus: 7,
    desc: 'LEGENDARY UT: Zips to any target and unleashes a lightning shockwave upon arrival!'
  },

  // 3. BOMBS (Blasts open Cracked Walls / Boulders + Massive Armor-Piercing AoE!)
  rel_bomb_t1: {
    id: 'rel_bomb_t1', name: 'Dodongo Bomb Bag', tier: 'T1', slot: 'relic', subType: 'bomb',
    bagType: 1, mpCost: 40, dmg: 260, blastRadius: 3.4, stats: { atk: 2 },
    color: '#3b82f6', fameBonus: 1,
    desc: 'Lobs an explosive bomb that shatters Cracked Dungeon Walls and deals armor-piercing AoE.'
  },
  rel_bomb_t2: {
    id: 'rel_bomb_t2', name: 'Super Powder Keg', tier: 'T4', slot: 'relic', subType: 'bomb',
    bagType: 2, mpCost: 55, dmg: 520, blastRadius: 4.2, stats: { atk: 5, wis: 4 },
    color: '#ef4444', fameBonus: 3,
    desc: 'Goron-certified demolition keg. Inflicts Armor Broken on bosses for 4 seconds!'
  },
  rel_bomb_ut: {
    id: 'rel_bomb_ut', name: 'Golden Bombchu Swarm', tier: 'UT', slot: 'relic', subType: 'bomb',
    bagType: 6, mpCost: 50, dmg: 780, blastRadius: 4.8, cluster: 3,
    stats: { hp: 50, atk: 8, wis: 6 },
    color: '#eab308', fameBonus: 7,
    desc: 'LEGENDARY UT: Deploys 3 homing Bombchus that breach walls, stun bosses, and shred armor!'
  },

  // 4. OCARINAS (RotMG Seal/Tome Party Buffs — Heals + Damaging + Armored)
  rel_ocarina_t1: {
    id: 'rel_ocarina_t1', name: 'Fairy Ocarina', tier: 'T1', slot: 'relic', subType: 'ocarina',
    bagType: 1, mpCost: 45, heal: 90, buffSec: 4.5, radius: 6.5, stats: { wis: 3 },
    color: '#d97706', fameBonus: 1,
    desc: 'Plays Saria\'s Melody: Heals nearby allies and grants Damaging (+35% ATK) & Speedy!'
  },
  rel_ocarina_t2: {
    id: 'rel_ocarina_t2', name: 'Ocarina of Sacred Time', tier: 'T4', slot: 'relic', subType: 'ocarina',
    bagType: 2, mpCost: 60, heal: 175, buffSec: 6.0, radius: 8.0, stats: { hp: 40, wis: 6 },
    color: '#3b82f6', fameBonus: 3,
    desc: 'Restores 175 HP to the party and grants Damaging, Armored (+50% DEF), and Speedy!'
  },
  rel_ocarina_ut: {
    id: 'rel_ocarina_ut', name: 'Wind Waker Conductor Baton', tier: 'UT', slot: 'relic', subType: 'ocarina',
    bagType: 6, mpCost: 65, heal: 260, buffSec: 7.5, radius: 9.5, purify: true,
    stats: { hp: 80, def: 6, wis: 8 },
    color: '#f8fafc', fameBonus: 7,
    desc: 'LEGENDARY UT: Purifies all debuffs, heals 260 HP, grants Berserk/Damaging/Armored, and slows bullets!'
  },

  // 5. FROST / SHADOW WANDS (Phase Dash + Freeze Nova)
  rel_wand_t1: {
    id: 'rel_wand_t1', name: 'Ice Rod of Lanayru', tier: 'T1', slot: 'relic', subType: 'wand',
    bagType: 1, mpCost: 35, dmg: 180, slowSec: 3.0, stats: { spd: 3 },
    color: '#38bdf8', fameBonus: 1,
    desc: 'Blinks forward in a frost mist and unleashes an Ice Nova that freezes & slows foes.'
  },
  rel_wand_t2: {
    id: 'rel_wand_t2', name: 'Byrna Cane of Invulnerability', tier: 'T4', slot: 'relic', subType: 'wand',
    bagType: 2, mpCost: 50, dmg: 350, slowSec: 4.0, invulnSec: 1.2, stats: { spd: 6, dex: 4 },
    color: '#22d3ee', fameBonus: 3,
    desc: 'Surrounds you with the Orbit of Byrna (1.2s Invulnerability) and freezes enemies.'
  },
  rel_wand_ut: {
    id: 'rel_wand_ut', name: 'Fierce Mask of Twilight', tier: 'UT', slot: 'relic', subType: 'wand',
    bagType: 6, mpCost: 55, dmg: 600, slowSec: 5.0, invulnSec: 1.8,
    stats: { atk: 6, spd: 8, dex: 8 },
    color: '#f43f5e', fameBonus: 7,
    desc: 'LEGENDARY UT: Shadow-teleports to cursor, grants 1.8s Invulnerability, and unleashes 12 twilight blades!'
  },

  // ==========================================================================
  // ARMORS (Tunics, Mails, Robes)
  // ==========================================================================
  arm_heavy_t1: {
    id: 'arm_heavy_t1', name: 'Hylian Chainmail', tier: 'T1', slot: 'armor', subType: 'heavy',
    bagType: 1, stats: { def: 7, hp: 20 }, color: '#94a3b8', fameBonus: 1,
    desc: 'Standard issue steel links worn by Hyrule Castle sentries.'
  },
  arm_heavy_t2: {
    id: 'arm_heavy_t2', name: 'Zora Scale Armor', tier: 'T4', slot: 'armor', subType: 'heavy',
    bagType: 2, stats: { def: 14, hp: 45, wis: 3 }, color: '#3b82f6', fameBonus: 2,
    desc: 'Sapphire dragon-scales that deflect high-velocity projectiles.'
  },
  arm_heavy_t3: {
    id: 'arm_heavy_t3', name: 'Goron Mythril Plate', tier: 'T8', slot: 'armor', subType: 'heavy',
    bagType: 3, stats: { def: 21, hp: 70, vit: 5 }, color: '#ef4444', fameBonus: 4,
    desc: 'Forged in Death Mountain magma. Resistant to volcanic fire and demonic blades.'
  },
  arm_heavy_t4: {
    id: 'arm_heavy_t4', name: 'Acropolis Triforce Cuirass', tier: 'T12', slot: 'armor', subType: 'heavy',
    bagType: 3, stats: { def: 26, hp: 100, vit: 6 }, color: '#eab308', fameBonus: 6,
    desc: 'Royal golden plate armor engraved with the Crest of Courage.'
  },

  arm_leather_t1: {
    id: 'arm_leather_t1', name: 'Kokiri Forest Tunic', tier: 'T1', slot: 'armor', subType: 'leather',
    bagType: 1, stats: { def: 5, spd: 2, dex: 2 }, color: '#22c55e', fameBonus: 1,
    desc: 'Woven by the Great Deku Tree. Light and effortless to roll in.'
  },
  arm_leather_t2: {
    id: 'arm_leather_t2', name: 'Sheikah Stealth Garb', tier: 'T4', slot: 'armor', subType: 'leather',
    bagType: 2, stats: { def: 10, spd: 4, dex: 4, hp: 30 }, color: '#0ea5e9', fameBonus: 2,
    desc: 'Reinforced shadow-weave tunic favored by Kakariko scouts.'
  },
  arm_leather_t3: {
    id: 'arm_leather_t3', name: 'Wyvern Hide Brigandine', tier: 'T8', slot: 'armor', subType: 'leather',
    bagType: 3, stats: { def: 16, spd: 5, dex: 6, hp: 55 }, color: '#10b981', fameBonus: 4,
    desc: 'Crafted from Valoo\'s shed scales. Balances agility with formidable protection.'
  },
  arm_leather_t4: {
    id: 'arm_leather_t4', name: 'Hydra Tunic of the Wild', tier: 'T12', slot: 'armor', subType: 'leather',
    bagType: 3, stats: { def: 20, spd: 7, dex: 7, atk: 4, hp: 75 }, color: '#38bdf8', fameBonus: 6,
    desc: 'Legendary Champion\'s Tunic granting unmatched dexterity and poise.'
  },

  arm_robe_t1: {
    id: 'arm_robe_t1', name: 'Novice Sage Vestment', tier: 'T1', slot: 'armor', subType: 'robe',
    bagType: 1, stats: { def: 4, mp: 30, wis: 3, atk: 2 }, color: '#f97316', fameBonus: 1,
    desc: 'Simple linen robe inscribed with minor mana runes.'
  },
  arm_robe_t2: {
    id: 'arm_robe_t2', name: 'Robe of the Fire Sanctuary', tier: 'T4', slot: 'armor', subType: 'robe',
    bagType: 2, stats: { def: 8, mp: 55, wis: 5, atk: 4 }, color: '#ef4444', fameBonus: 2,
    desc: 'Amplifies offensive spellblade weaving and magic regeneration.'
  },
  arm_robe_t3: {
    id: 'arm_robe_t3', name: 'Elder Wizzrobe Mantle', tier: 'T8', slot: 'armor', subType: 'robe',
    bagType: 3, stats: { def: 13, mp: 85, wis: 7, atk: 6, dex: 3 }, color: '#ec4899', fameBonus: 4,
    desc: 'Worn by high archmages of the Dark World.'
  },
  arm_robe_t4: {
    id: 'arm_robe_t4', name: 'Grand Sorcerer Vestment of Nayru', tier: 'T12', slot: 'armor', subType: 'robe',
    bagType: 3, stats: { def: 16, mp: 120, wis: 9, atk: 8, dex: 5 }, color: '#eab308', fameBonus: 6,
    desc: 'Radiates divine wisdom and boundless arcane power.'
  },
  arm_ut_magic_armor: {
    id: 'arm_ut_magic_armor', name: 'Golden Magic Armor of the Hero', tier: 'UT', slot: 'armor', subType: 'any',
    bagType: 6, stats: { hp: 130, mp: 70, def: 24, atk: 6, spd: 5 }, color: '#facc15', fameBonus: 8,
    desc: 'LEGENDARY UT (Wearable by ANY Class!): Forged from pure Triforce gold. Supreme protection and vigor.'
  },

  // ==========================================================================
  // RINGS & RELIC CHARMS (Slot 4)
  // ==========================================================================
  rng_hp_t1: {
    id: 'rng_hp_t1', name: 'Piece of Heart Ring', tier: 'T1', slot: 'ring',
    bagType: 1, stats: { hp: 50, def: 2 }, color: '#ef4444', fameBonus: 1,
    desc: 'A crystallized Heart Piece that bolsters your life force (+50 HP, +2 DEF).'
  },
  rng_dex_t1: {
    id: 'rng_dex_t1', name: 'Pegasus Anklet', tier: 'T1', slot: 'ring',
    bagType: 1, stats: { dex: 4, spd: 4 }, color: '#22c55e', fameBonus: 1,
    desc: 'Feather-light charm that accelerates both footsteps and sword swings.'
  },
  rng_atk_t1: {
    id: 'rng_atk_t1', name: 'Goron Ruby Bracelet', tier: 'T1', slot: 'ring',
    bagType: 1, stats: { atk: 4, hp: 30 }, color: '#f97316', fameBonus: 1,
    desc: 'Sworn symbol of Goron brotherhood (+4 ATK, +30 HP).'
  },
  rng_wis_t1: {
    id: 'rng_wis_t1', name: 'Zora Sapphire Ring', tier: 'T1', slot: 'ring',
    bagType: 1, stats: { wis: 5, mp: 40 }, color: '#3b82f6', fameBonus: 1,
    desc: 'Cool ocean gem that accelerates mana flow (+5 WIS, +40 MP).'
  },
  rng_spd_t1: {
    id: 'rng_spd_t1', name: 'Bunny Hood Charm', tier: 'T1', slot: 'ring',
    bagType: 1, stats: { spd: 6, dex: 3 }, color: '#eab308', fameBonus: 1,
    desc: 'Lets the wearer dash like the wind across Hyrule Field.'
  },
  rng_para_hp: {
    id: 'rng_para_hp', name: 'Ring of Paramount Heart', tier: 'T4', slot: 'ring',
    bagType: 2, stats: { hp: 120, def: 5, vit: 4 }, color: '#f43f5e', fameBonus: 3,
    desc: 'A full Heart Container bound in silver filigree.'
  },
  rng_exalted_hp: {
    id: 'rng_exalted_hp', name: 'Ring of the Exalted Hero', tier: 'T6', slot: 'ring',
    bagType: 3, stats: { hp: 180, def: 8, atk: 5, spd: 5 }, color: '#eab308', fameBonus: 5,
    desc: 'Godlands treasure pulsing with the resilience of ancient heroes.'
  },
  rng_ut_crown: {
    id: 'rng_ut_crown', name: 'Crown of the Shattered Triforce', tier: 'UT', slot: 'ring',
    bagType: 6, stats: { hp: 160, mp: 80, atk: 10, dex: 10, def: 6, spd: 6 }, color: '#f8fafc', fameBonus: 8,
    desc: 'LEGENDARY UT (Mad King Drop): The apex relic of the Realm. Massive boost to offensive & defensive stats.'
  },
  rng_ut_pyra: {
    id: 'rng_ut_pyra', name: 'Ring of the Ancient Pyramid', tier: 'UT', slot: 'ring',
    bagType: 6, stats: { hp: 140, atk: 8, def: 8, vit: 6 }, color: '#facc15', fameBonus: 7,
    desc: 'LEGENDARY UT (Desert Sphinx / Tomb Drop): Balanced perfection of Life, Attack, and Defense.'
  },

  // ==========================================================================
  // ROTMG PERMANENT STAT POTIONS (Blue Bags! Drink to reach 8/8 Maxed!)
  // ==========================================================================
  pot_atk: {
    id: 'pot_atk', name: 'Potion of Attack', tier: 'POT', slot: 'consumable', subType: 'stat_pot',
    bagType: 4, stat: 'atk', amount: 1, color: '#c084fc', fameBonus: 0,
    desc: 'PERMANENTLY increases Attack (ATK) by +1 toward your 8/8 Class Cap!'
  },
  pot_def: {
    id: 'pot_def', name: 'Potion of Defense', tier: 'POT', slot: 'consumable', subType: 'stat_pot',
    bagType: 4, stat: 'def', amount: 1, color: '#38bdf8', fameBonus: 0,
    desc: 'PERMANENTLY increases Defense (DEF) by +1 toward your 8/8 Class Cap!'
  },
  pot_spd: {
    id: 'pot_spd', name: 'Potion of Speed', tier: 'POT', slot: 'consumable', subType: 'stat_pot',
    bagType: 4, stat: 'spd', amount: 1, color: '#4ade80', fameBonus: 0,
    desc: 'PERMANENTLY increases Speed (SPD) by +1 toward your 8/8 Class Cap!'
  },
  pot_dex: {
    id: 'pot_dex', name: 'Potion of Dexterity', tier: 'POT', slot: 'consumable', subType: 'stat_pot',
    bagType: 4, stat: 'dex', amount: 1, color: '#fb923c', fameBonus: 0,
    desc: 'PERMANENTLY increases Dexterity (DEX) by +1 toward your 8/8 Class Cap!'
  },
  pot_vit: {
    id: 'pot_vit', name: 'Potion of Vitality', tier: 'POT', slot: 'consumable', subType: 'stat_pot',
    bagType: 4, stat: 'vit', amount: 1, color: '#f87171', fameBonus: 0,
    desc: 'PERMANENTLY increases Vitality (VIT) by +1 toward your 8/8 Class Cap!'
  },
  pot_wis: {
    id: 'pot_wis', name: 'Potion of Wisdom', tier: 'POT', slot: 'consumable', subType: 'stat_pot',
    bagType: 4, stat: 'wis', amount: 1, color: '#60a5fa', fameBonus: 0,
    desc: 'PERMANENTLY increases Wisdom (WIS) by +1 toward your 8/8 Class Cap!'
  },
  pot_life: {
    id: 'pot_life', name: 'Potion of Life (Heart Elixir)', tier: 'POT', slot: 'consumable', subType: 'stat_pot',
    bagType: 4, stat: 'hp', amount: 15, color: '#2dd4bf', fameBonus: 0,
    desc: 'PERMANENTLY increases Maximum HP by +15 toward your 8/8 Class Cap!'
  },
  pot_mana: {
    id: 'pot_mana', name: 'Potion of Mana (Golden Elixir)', tier: 'POT', slot: 'consumable', subType: 'stat_pot',
    bagType: 4, stat: 'mp', amount: 10, color: '#facc15', fameBonus: 0,
    desc: 'PERMANENTLY increases Maximum MP by +10 toward your 8/8 Class Cap!'
  },
  pot_omni: {
    id: 'pot_omni', name: 'Nectar of the Triforce (Max-All)', tier: 'UT', slot: 'consumable', subType: 'stat_omni',
    bagType: 6, color: '#fde047', fameBonus: 0,
    desc: 'LEGENDARY ELIXIR: Boosts ALL 8 stats significantly toward 8/8 Maxed!'
  },

  // ==========================================================================
  // CONSUMABLES (Bottled Fairies & Elixirs)
  // ==========================================================================
  con_fairy: {
    id: 'con_fairy', name: 'Bottled Fairy', tier: 'CON', slot: 'consumable', subType: 'heal',
    bagType: 0, healHp: 250, healMp: 100, color: '#f472b6', fameBonus: 0,
    desc: 'Restores 250 HP & 100 MP on use—OR automatically revives you from a fatal blow if in inventory!'
  }
};

export function canClassEquip(classId, item) {
  if (!item) return false;
  const cls = {
    knight:     { weapon: 'sword',  relic: 'boomerang', armor: 'heavy' },
    ranger:     { weapon: 'bow',    relic: 'hookshot',  armor: 'leather' },
    pyromancer: { weapon: 'rod',    relic: 'bomb',      armor: 'robe' },
    paladin:    { weapon: 'sword',  relic: 'ocarina',   armor: 'heavy' },
    assassin:   { weapon: 'dagger', relic: 'wand',      armor: 'leather' }
  }[classId];
  if (!cls) return false;
  if (item.slot === 'ring') return true;
  if (item.slot === 'weapon') return item.subType === cls.weapon;
  if (item.slot === 'relic')  return item.subType === cls.relic;
  if (item.slot === 'armor')  return item.subType === cls.armor || item.subType === 'any';
  return false;
}
