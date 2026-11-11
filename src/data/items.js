// ============================================================================
// REALM OF THE SHATTERED CREST — ITEM, RELIC, LOOT BAG & POTION DATABASE
// ============================================================================

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
  // SWORDS (180° Arc Cleave + Full-HP Blade Wave + 360° Whirlwind Spin)
  // ==========================================================================
  wep_sword_t1: {
    id: 'wep_sword_t1', name: 'Initiate Broadsword', tier: 'T1', slot: 'weapon', subType: 'sword',
    bagType: 1, minDmg: 45, maxDmg: 70, shots: 1, range: 4.4, arcDeg: 115, beamDmg: 0.55,
    color: '#94a3b8', bladeColor: '#cbd5e1', fameBonus: 1,
    desc: 'A sturdy steel broadsword. Unleashes a sweeping melee cleave and a piercing energy wave at high life.'
  },
  wep_sword_t2: {
    id: 'wep_sword_t2', name: 'Citadel Longblade', tier: 'T3', slot: 'weapon', subType: 'sword',
    bagType: 2, minDmg: 75, maxDmg: 110, shots: 1, range: 4.6, arcDeg: 120, beamDmg: 0.65,
    color: '#60a5fa', bladeColor: '#93c5fd', fameBonus: 2,
    desc: 'Forged in the Aethelgard armories. Balanced for swift parries and wide cleaves.'
  },
  wep_sword_t3: {
    id: 'wep_sword_t3', name: 'Tempered Crimson Edge', tier: 'T5', slot: 'weapon', subType: 'sword',
    bagType: 2, minDmg: 110, maxDmg: 155, shots: 1, range: 4.8, arcDeg: 125, beamDmg: 0.75,
    color: '#f43f5e', bladeColor: '#fda4af', fameBonus: 3,
    desc: 'Honed with volcanic cinder-ash. Cuts through multiple foes and emits crimson waves.'
  },
  wep_sword_t4: {
    id: 'wep_sword_t4', name: 'Gilded Sunblade', tier: 'T8', slot: 'weapon', subType: 'sword',
    bagType: 3, minDmg: 155, maxDmg: 210, shots: 1, range: 5.0, arcDeg: 130, beamDmg: 0.85,
    color: '#eab308', bladeColor: '#fef08a', fameBonus: 4,
    desc: 'Gold-inlaid blade that never dulls. Emits a radiant solar wave.'
  },
  wep_sword_t5: {
    id: 'wep_sword_t5', name: 'Astral Acclaim Greatsword', tier: 'T12', slot: 'weapon', subType: 'sword',
    bagType: 3, minDmg: 215, maxDmg: 280, shots: 1, range: 5.3, arcDeg: 140, beamDmg: 1.0,
    color: '#38bdf8', bladeColor: '#e0f2fe', fameBonus: 6,
    desc: 'Supreme tiered broadsword blessed by the First Wardens. Always fires an Astral Wave.'
  },
  wep_sword_ut_master: {
    id: 'wep_sword_ut_master', name: 'Blade of the Reborn Crest', tier: 'UT', slot: 'weapon', subType: 'sword',
    bagType: 6, minDmg: 240, maxDmg: 310, shots: 2, spreadDeg: 18, range: 5.8, arcDeg: 150, beamDmg: 1.15,
    alwaysBeam: true, pierceArmor: false, stats: { def: 4, wis: 4 },
    color: '#38bdf8', bladeColor: '#67e8f9', fameBonus: 8,
    desc: 'LEGENDARY UT: Forged to vanquish the Evil Bane. Fires twin sacred crescent waves with every swing.'
  },
  wep_sword_ut_demon: {
    id: 'wep_sword_ut_demon', name: 'Abyssal Magma Cleaver', tier: 'UT', slot: 'weapon', subType: 'sword',
    bagType: 6, minDmg: 195, maxDmg: 255, shots: 2, spreadDeg: 38, range: 4.3, arcDeg: 145, beamDmg: 0.9,
    alwaysBeam: true, stats: { atk: 5, vit: 5 },
    color: '#ef4444', bladeColor: '#fca5a5', fameBonus: 7,
    desc: 'LEGENDARY UT (Caldera Drop): Twin-forked obsidian blade that fires two magma waves at point-blank.'
  },

  // ==========================================================================
  // BOWS (Close-Quarters Riposte + Ranged Piercing Arrow Volleys)
  // ==========================================================================
  wep_bow_t1: {
    id: 'wep_bow_t1', name: 'Ashwood Shortbow', tier: 'T1', slot: 'weapon', subType: 'bow',
    bagType: 1, minDmg: 38, maxDmg: 60, shots: 1, spreadDeg: 0, range: 7.8, pierce: true,
    color: '#a3e635', bladeColor: '#d9f99d', fameBonus: 1,
    desc: 'Carved from ironwood heart. Fires piercing arrows and slashes adjacent enemies.'
  },
  wep_bow_t2: {
    id: 'wep_bow_t2', name: 'Warden\'s Recurve Bow', tier: 'T4', slot: 'weapon', subType: 'bow',
    bagType: 2, minDmg: 58, maxDmg: 88, shots: 2, spreadDeg: 10, range: 8.0, pierce: true,
    color: '#22c55e', bladeColor: '#86efac', fameBonus: 2,
    desc: 'Fires two synchronized piercing arrows that skewer entire columns of foes.'
  },
  wep_bow_t3: {
    id: 'wep_bow_t3', name: 'Gilded Tri-Bow', tier: 'T8', slot: 'weapon', subType: 'bow',
    bagType: 3, minDmg: 75, maxDmg: 110, shots: 3, spreadDeg: 14, range: 8.2, pierce: true,
    color: '#eab308', bladeColor: '#fef08a', fameBonus: 4,
    desc: 'Iconic three-arrow spread bow of the Blightlands. Devastating crowd control.'
  },
  wep_bow_t4: {
    id: 'wep_bow_t4', name: 'Longbow of the First Watch', tier: 'T12', slot: 'weapon', subType: 'bow',
    bagType: 3, minDmg: 105, maxDmg: 145, shots: 3, spreadDeg: 11, range: 8.6, pierce: true,
    color: '#38bdf8', bladeColor: '#bae6fd', fameBonus: 6,
    desc: 'Tightly grouped triple-shot bow infused with ancient radiant energy.'
  },
  wep_bow_ut_light: {
    id: 'wep_bow_ut_light', name: 'Starfall Sovereign Greatbow', tier: 'UT', slot: 'weapon', subType: 'bow',
    bagType: 6, minDmg: 420, maxDmg: 540, shots: 1, spreadDeg: 0, range: 9.5, pierce: true,
    rateMult: 0.55, stats: { atk: 6, wis: 4 },
    color: '#fde047', bladeColor: '#ffffff', fameBonus: 8,
    desc: 'LEGENDARY UT (Catacombs Drop): Slow-firing celestial rail-bow that obliterates lines of enemies.'
  },

  // ==========================================================================
  // SPELLRODS (Arcane Melee Shockwave + Dual Weaving Spellbolts)
  // ==========================================================================
  wep_rod_t1: {
    id: 'wep_rod_t1', name: 'Apprentice Ember Rod', tier: 'T1', slot: 'weapon', subType: 'rod',
    bagType: 1, minDmg: 32, maxDmg: 52, shots: 2, spreadDeg: 8, range: 8.2, wave: true,
    color: '#f97316', bladeColor: '#fdba74', fameBonus: 1,
    desc: 'Channels twin firebolts in a wavy spiral while emitting a close-range heat pulse.'
  },
  wep_rod_t2: {
    id: 'wep_rod_t2', name: 'Scepter of Crimson Flux', tier: 'T4', slot: 'weapon', subType: 'rod',
    bagType: 2, minDmg: 55, maxDmg: 85, shots: 2, spreadDeg: 7, range: 8.5, wave: true,
    color: '#ec4899', bladeColor: '#f9a8d4', fameBonus: 2,
    desc: 'Fires twin crimson energy orbs that weave toward their target.'
  },
  wep_rod_t3: {
    id: 'wep_rod_t3', name: 'Staff of the Magma Spire', tier: 'T8', slot: 'weapon', subType: 'rod',
    bagType: 3, minDmg: 85, maxDmg: 125, shots: 2, spreadDeg: 6, range: 8.8, wave: true,
    color: '#ef4444', bladeColor: '#fca5a5', fameBonus: 4,
    desc: 'High-tier volcanic rod that scorches Blightlands deities.'
  },
  wep_rod_t4: {
    id: 'wep_rod_t4', name: 'Scepter of the Holy Crest', tier: 'T12', slot: 'weapon', subType: 'rod',
    bagType: 3, minDmg: 118, maxDmg: 165, shots: 2, spreadDeg: 5, range: 9.0, wave: true,
    color: '#eab308', bladeColor: '#fef08a', fameBonus: 6,
    desc: 'Pinnacle spellcaster rod radiating twin golden astral bolts.'
  },
  wep_rod_ut_seasons: {
    id: 'wep_rod_ut_seasons', name: 'Conduit of the Four Elements', tier: 'UT', slot: 'weapon', subType: 'rod',
    bagType: 6, minDmg: 95, maxDmg: 135, shots: 4, spreadDeg: 16, range: 8.4, pierceArmor: true,
    stats: { mp: 40, atk: 5, dex: 5 },
    color: '#10b981', bladeColor: '#6ee7b7', fameBonus: 8,
    desc: 'LEGENDARY UT (Astral Conduit Drop): Fires 4 elemental bolts that completely ignore enemy DEF.'
  },

  // ==========================================================================
  // DAGGERS / TWIN BLADES (Ultra-Fast Double Arc + Throwing Blades)
  // ==========================================================================
  wep_dagger_t1: {
    id: 'wep_dagger_t1', name: 'Shadow Steel Stiletto', tier: 'T1', slot: 'weapon', subType: 'dagger',
    bagType: 1, minDmg: 36, maxDmg: 58, shots: 1, range: 5.8, rateMult: 1.25,
    color: '#38bdf8', bladeColor: '#bae6fd', fameBonus: 1,
    desc: 'Lightning-fast throwing dagger and twin-slash shortblade.'
  },
  wep_dagger_t2: {
    id: 'wep_dagger_t2', name: 'Phantom Twin-Edge', tier: 'T4', slot: 'weapon', subType: 'dagger',
    bagType: 2, minDmg: 65, maxDmg: 98, shots: 1, range: 6.1, rateMult: 1.28,
    color: '#2dd4bf', bladeColor: '#99f6e4', fameBonus: 2,
    desc: 'Shadow-forged twin blades with blistering attack cadence.'
  },
  wep_dagger_t3: {
    id: 'wep_dagger_t3', name: 'Emerald Viper Dirk', tier: 'T8', slot: 'weapon', subType: 'dagger',
    bagType: 3, minDmg: 102, maxDmg: 150, shots: 1, range: 6.3, rateMult: 1.32,
    color: '#10b981', bladeColor: '#6ee7b7', fameBonus: 4,
    desc: 'Deadly Nightblade dirk that shreds targets before they can react.'
  },
  wep_dagger_t4: {
    id: 'wep_dagger_t4', name: 'Eclipse Shadow Katana', tier: 'T12', slot: 'weapon', subType: 'dagger',
    bagType: 3, minDmg: 145, maxDmg: 205, shots: 1, range: 6.6, rateMult: 1.35,
    color: '#f43f5e', bladeColor: '#fecdd3', fameBonus: 6,
    desc: 'Masterwork Nightblade katana that slices through shadow and steel alike.'
  },
  wep_dagger_ut_fierce: {
    id: 'wep_dagger_ut_fierce', name: 'Astral Helix Twin-Blades', tier: 'UT', slot: 'weapon', subType: 'dagger',
    bagType: 6, minDmg: 175, maxDmg: 245, shots: 2, spreadDeg: 8, range: 7.2, rateMult: 1.3,
    pierce: true, stats: { spd: 6, dex: 6 },
    color: '#f8fafc', bladeColor: '#38bdf8', fameBonus: 8,
    desc: 'LEGENDARY UT (Evil Bane Drop): Unleashes double-helix crescent waves that pierce all targets.'
  },

  // ==========================================================================
  // RELIC ABILITIES (Slot 2 — Press Q or Middle-Click)
  // ==========================================================================
  // 1. CHAKRAMS (Stuns enemies, cuts bushes, pulls loot bags & life hearts to you!)
  rel_boom_t1: {
    id: 'rel_boom_t1', name: 'Iron Wind-Chakram', tier: 'T1', slot: 'relic', subType: 'boomerang',
    bagType: 1, mpCost: 35, dmg: 140, stunSec: 1.8, range: 7.5, stats: { def: 2 },
    color: '#d97706', fameBonus: 1,
    desc: 'Hurls a returning chakram that stuns foes, cuts bushes, and pulls Loot Bags & Life Hearts to you!'
  },
  rel_boom_t2: {
    id: 'rel_boom_t2', name: 'Tempest Gale Chakram', tier: 'T4', slot: 'relic', subType: 'boomerang',
    bagType: 2, mpCost: 45, dmg: 290, stunSec: 2.6, range: 9.0, stats: { def: 5, spd: 3 },
    color: '#38bdf8', fameBonus: 3,
    desc: 'Summons a returning whirlwind blade that stuns enemies for 2.6s and vacuums distant loot bags.'
  },
  rel_boom_ut: {
    id: 'rel_boom_ut', name: 'Aegis of the Cyclone Crest', tier: 'UT', slot: 'relic', subType: 'boomerang',
    bagType: 6, mpCost: 50, dmg: 480, stunSec: 3.4, range: 10.5, reflectNova: true,
    stats: { hp: 60, def: 10, spd: 4 },
    color: '#facc15', fameBonus: 7,
    desc: 'LEGENDARY UT: Throws twin golden cyclone chakrams AND reflects all nearby enemy bullets on cast!'
  },

  // 2. CHAIN GRAPPLES (Vaults to pillars across chasms/lava OR stuns enemies!)
  rel_hook_t1: {
    id: 'rel_hook_t1', name: 'Iron Chain-Grapple', tier: 'T1', slot: 'relic', subType: 'hookshot',
    bagType: 1, mpCost: 30, dmg: 160, stunSec: 1.5, range: 8.5, stats: { dex: 2 },
    color: '#94a3b8', fameBonus: 1,
    desc: 'Grapples you across chasms to Anchor Pillars with i-frames, or stuns & pierces foes!'
  },
  rel_hook_t2: {
    id: 'rel_hook_t2', name: 'Titan Anchor-Grapple', tier: 'T4', slot: 'relic', subType: 'hookshot',
    bagType: 2, mpCost: 40, dmg: 320, stunSec: 2.2, range: 11.0, stats: { dex: 5, atk: 3 },
    color: '#38bdf8', fameBonus: 3,
    desc: 'Extended titanium chain that reaches distant anchors and deals heavy armor-piercing damage.'
  },
  rel_hook_ut: {
    id: 'rel_hook_ut', name: 'Twin Sky-Claw Grapple', tier: 'UT', slot: 'relic', subType: 'hookshot',
    bagType: 6, mpCost: 35, dmg: 520, stunSec: 2.8, range: 12.5, shockwave: true,
    stats: { atk: 7, dex: 7, spd: 5 },
    color: '#f59e0b', fameBonus: 7,
    desc: 'LEGENDARY UT: Zips to any target and unleashes a lightning shockwave upon arrival!'
  },

  // 3. BRIMSTONE CHARGES (Blasts open Cracked Walls + Massive Armor-Piercing AoE!)
  rel_bomb_t1: {
    id: 'rel_bomb_t1', name: 'Sapper\'s Brimstone Satchel', tier: 'T1', slot: 'relic', subType: 'bomb',
    bagType: 1, mpCost: 40, dmg: 260, blastRadius: 3.4, stats: { atk: 2 },
    color: '#3b82f6', fameBonus: 1,
    desc: 'Lobs an explosive charge that shatters Cracked Dungeon Walls and deals armor-piercing AoE.'
  },
  rel_bomb_t2: {
    id: 'rel_bomb_t2', name: 'Caldera Demolition Keg', tier: 'T4', slot: 'relic', subType: 'bomb',
    bagType: 2, mpCost: 55, dmg: 520, blastRadius: 4.2, stats: { atk: 5, wis: 4 },
    color: '#ef4444', fameBonus: 3,
    desc: 'Heavy siege keg. Inflicts Armor Broken on bosses for 4.5 seconds!'
  },
  rel_bomb_ut: {
    id: 'rel_bomb_ut', name: 'Sunfire Seeker Cluster', tier: 'UT', slot: 'relic', subType: 'bomb',
    bagType: 6, mpCost: 50, dmg: 780, blastRadius: 4.8, cluster: 3,
    stats: { hp: 50, atk: 8, wis: 6 },
    color: '#eab308', fameBonus: 7,
    desc: 'LEGENDARY UT: Deploys 3 cluster charges that breach walls, stun bosses, and shred armor!'
  },

  // 4. SANCTUARY WARHORNS (Party Buffs — Heals + Damaging + Armored)
  rel_ocarina_t1: {
    id: 'rel_ocarina_t1', name: 'Sanctuary Chime', tier: 'T1', slot: 'relic', subType: 'ocarina',
    bagType: 1, mpCost: 45, heal: 90, buffSec: 4.5, radius: 6.5, stats: { wis: 3 },
    color: '#d97706', fameBonus: 1,
    desc: 'Sounds the Warden’s Litany: Heals nearby allies and grants Damaging (+35% ATK) & Speedy!'
  },
  rel_ocarina_t2: {
    id: 'rel_ocarina_t2', name: 'Warhorn of the First Dawn', tier: 'T4', slot: 'relic', subType: 'ocarina',
    bagType: 2, mpCost: 60, heal: 175, buffSec: 6.0, radius: 8.0, stats: { hp: 40, wis: 6 },
    color: '#3b82f6', fameBonus: 3,
    desc: 'Restores 175 HP to the party and grants Damaging, Armored (+50% DEF), and Speedy!'
  },
  rel_ocarina_ut: {
    id: 'rel_ocarina_ut', name: 'Anthem of the Holy Crest', tier: 'UT', slot: 'relic', subType: 'ocarina',
    bagType: 6, mpCost: 65, heal: 260, buffSec: 7.5, radius: 9.5, purify: true,
    stats: { hp: 80, def: 6, wis: 8 },
    color: '#f8fafc', fameBonus: 7,
    desc: 'LEGENDARY UT: Purifies all debuffs, heals 260 HP, and grants Damaging, Armored & Speedy!'
  },

  // 5. FROST / PHASE SCEPTERS (Phase Blink + Freeze Nova)
  rel_wand_t1: {
    id: 'rel_wand_t1', name: 'Scepter of Rime', tier: 'T1', slot: 'relic', subType: 'wand',
    bagType: 1, mpCost: 35, dmg: 180, slowSec: 3.0, stats: { spd: 3 },
    color: '#38bdf8', fameBonus: 1,
    desc: 'Blinks forward in a frost mist and unleashes an Ice Nova that freezes & slows foes.'
  },
  rel_wand_t2: {
    id: 'rel_wand_t2', name: 'Cane of the Astral Ward', tier: 'T4', slot: 'relic', subType: 'wand',
    bagType: 2, mpCost: 50, dmg: 350, slowSec: 4.0, invulnSec: 1.2, stats: { spd: 6, dex: 4 },
    color: '#22d3ee', fameBonus: 3,
    desc: 'Surrounds you with an Astral Ward (1.2s Invulnerability) and freezes enemies.'
  },
  rel_wand_ut: {
    id: 'rel_wand_ut', name: 'Mantle of the Blood Eclipse', tier: 'UT', slot: 'relic', subType: 'wand',
    bagType: 6, mpCost: 55, dmg: 600, slowSec: 5.0, invulnSec: 1.8,
    stats: { atk: 6, spd: 8, dex: 8 },
    color: '#f43f5e', fameBonus: 7,
    desc: 'LEGENDARY UT: Shadow-blinks toward cursor, grants 1.8s Invulnerability, and shatters nearby foes!'
  },

  // ==========================================================================
  // ARMORS (Heavy Plate, Warden Leather, Arcane Robes)
  // ==========================================================================
  arm_heavy_t1: {
    id: 'arm_heavy_t1', name: 'Citadel Chainmail', tier: 'T1', slot: 'armor', subType: 'heavy',
    bagType: 1, stats: { def: 7, hp: 20 }, color: '#94a3b8', fameBonus: 1,
    desc: 'Standard steel links worn by Aethelgard Citadel sentries.'
  },
  arm_heavy_t2: {
    id: 'arm_heavy_t2', name: 'Tideforged Scale Mail', tier: 'T4', slot: 'armor', subType: 'heavy',
    bagType: 2, stats: { def: 14, hp: 45, wis: 3 }, color: '#3b82f6', fameBonus: 2,
    desc: 'Sapphire sea-scales that deflect high-velocity projectiles.'
  },
  arm_heavy_t3: {
    id: 'arm_heavy_t3', name: 'Caldera Mythril Plate', tier: 'T8', slot: 'armor', subType: 'heavy',
    bagType: 3, stats: { def: 21, hp: 70, vit: 5 }, color: '#ef4444', fameBonus: 4,
    desc: 'Forged in volcanic magma. Resistant to dragonfire and demonic blades.'
  },
  arm_heavy_t4: {
    id: 'arm_heavy_t4', name: 'Aethelgard Sovereign Cuirass', tier: 'T12', slot: 'armor', subType: 'heavy',
    bagType: 3, stats: { def: 26, hp: 100, vit: 6 }, color: '#eab308', fameBonus: 6,
    desc: 'Royal golden plate armor engraved with the emblem of the Holy Crest.'
  },

  arm_leather_t1: {
    id: 'arm_leather_t1', name: 'Sylvan Scout Tunic', tier: 'T1', slot: 'armor', subType: 'leather',
    bagType: 1, stats: { def: 5, spd: 2, dex: 2 }, color: '#22c55e', fameBonus: 1,
    desc: 'Woven by forest wardens. Light and effortless to roll in.'
  },
  arm_leather_t2: {
    id: 'arm_leather_t2', name: 'Nightblade Stealth Garb', tier: 'T4', slot: 'armor', subType: 'leather',
    bagType: 2, stats: { def: 10, spd: 4, dex: 4, hp: 30 }, color: '#0ea5e9', fameBonus: 2,
    desc: 'Reinforced shadow-weave tunic favored by Astral Watch scouts.'
  },
  arm_leather_t3: {
    id: 'arm_leather_t3', name: 'Wyvern Hide Brigandine', tier: 'T8', slot: 'armor', subType: 'leather',
    bagType: 3, stats: { def: 16, spd: 5, dex: 6, hp: 55 }, color: '#10b981', fameBonus: 4,
    desc: 'Crafted from drake scales. Balances agility with formidable protection.'
  },
  arm_leather_t4: {
    id: 'arm_leather_t4', name: 'Strider Armor of the First Watch', tier: 'T12', slot: 'armor', subType: 'leather',
    bagType: 3, stats: { def: 20, spd: 7, dex: 7, atk: 4, hp: 75 }, color: '#38bdf8', fameBonus: 6,
    desc: 'Legendary Warden armor granting unmatched dexterity and poise.'
  },

  arm_robe_t1: {
    id: 'arm_robe_t1', name: 'Novice Chronicler Vestment', tier: 'T1', slot: 'armor', subType: 'robe',
    bagType: 1, stats: { def: 4, mp: 30, wis: 3, atk: 2 }, color: '#f97316', fameBonus: 1,
    desc: 'Simple linen robe inscribed with minor mana runes.'
  },
  arm_robe_t2: {
    id: 'arm_robe_t2', name: 'Robe of the Ember Sanctum', tier: 'T4', slot: 'armor', subType: 'robe',
    bagType: 2, stats: { def: 8, mp: 55, wis: 5, atk: 4 }, color: '#ef4444', fameBonus: 2,
    desc: 'Amplifies offensive spellblade weaving and mana regeneration.'
  },
  arm_robe_t3: {
    id: 'arm_robe_t3', name: 'Elder Arcanist Mantle', tier: 'T8', slot: 'armor', subType: 'robe',
    bagType: 3, stats: { def: 13, mp: 85, wis: 7, atk: 6, dex: 3 }, color: '#ec4899', fameBonus: 4,
    desc: 'Worn by high battle-mages of the Blightlands.'
  },
  arm_robe_t4: {
    id: 'arm_robe_t4', name: 'Grand Vestment of the Astral Elder', tier: 'T12', slot: 'armor', subType: 'robe',
    bagType: 3, stats: { def: 16, mp: 120, wis: 9, atk: 8, dex: 5 }, color: '#eab308', fameBonus: 6,
    desc: 'Radiates ancient wisdom and boundless arcane power.'
  },
  arm_ut_magic_armor: {
    id: 'arm_ut_magic_armor', name: 'Radiant Aegis of the Holy Crest', tier: 'UT', slot: 'armor', subType: 'any',
    bagType: 6, stats: { hp: 130, mp: 70, def: 24, atk: 6, spd: 5 }, color: '#facc15', fameBonus: 8,
    desc: 'LEGENDARY UT (Wearable by ANY Class!): Forged from pure Crest gold. Supreme protection and vigor.'
  },

  // ==========================================================================
  // RINGS & SIGNETS (Slot 4)
  // ==========================================================================
  rng_hp_t1: {
    id: 'rng_hp_t1', name: 'Heartstone Band', tier: 'T1', slot: 'ring',
    bagType: 1, stats: { hp: 50, def: 2 }, color: '#ef4444', fameBonus: 1,
    desc: 'A crimson vitality stone that bolsters your life force (+50 HP, +2 DEF).'
  },
  rng_dex_t1: {
    id: 'rng_dex_t1', name: 'Zephyr Anklet', tier: 'T1', slot: 'ring',
    bagType: 1, stats: { dex: 4, spd: 4 }, color: '#22c55e', fameBonus: 1,
    desc: 'Feather-light charm that accelerates both footsteps and weapon swings.'
  },
  rng_atk_t1: {
    id: 'rng_atk_t1', name: 'Cinder Garnet Ring', tier: 'T1', slot: 'ring',
    bagType: 1, stats: { atk: 4, hp: 30 }, color: '#f97316', fameBonus: 1,
    desc: 'Sworn emblem of Caldera vanguards (+4 ATK, +30 HP).'
  },
  rng_wis_t1: {
    id: 'rng_wis_t1', name: 'Tide Sapphire Ring', tier: 'T1', slot: 'ring',
    bagType: 1, stats: { wis: 5, mp: 40 }, color: '#3b82f6', fameBonus: 1,
    desc: 'Deep ocean gem that accelerates mana flow (+5 WIS, +40 MP).'
  },
  rng_spd_t1: {
    id: 'rng_spd_t1', name: 'Windrunner Charm', tier: 'T1', slot: 'ring',
    bagType: 1, stats: { spd: 6, dex: 3 }, color: '#eab308', fameBonus: 1,
    desc: 'Lets the wearer dash like a gale across the realm.'
  },
  rng_para_hp: {
    id: 'rng_para_hp', name: 'Ring of Paramount Vitality', tier: 'T4', slot: 'ring',
    bagType: 2, stats: { hp: 120, def: 5, vit: 4 }, color: '#f43f5e', fameBonus: 3,
    desc: 'A pure life-vessel bound in silver filigree.'
  },
  rng_exalted_hp: {
    id: 'rng_exalted_hp', name: 'Ring of the Exalted Warden', tier: 'T6', slot: 'ring',
    bagType: 3, stats: { hp: 180, def: 8, atk: 5, spd: 5 }, color: '#eab308', fameBonus: 5,
    desc: 'Blightlands treasure pulsing with the resilience of the First Wardens.'
  },
  rng_ut_crown: {
    id: 'rng_ut_crown', name: 'Crown of the Reborn Crest', tier: 'UT', slot: 'ring',
    bagType: 6, stats: { hp: 160, mp: 80, atk: 10, dex: 10, def: 6, spd: 6 }, color: '#f8fafc', fameBonus: 8,
    desc: 'LEGENDARY UT (Evil Bane Drop): The apex relic of Aethelgard. Massive boost to offensive & defensive stats.'
  },
  rng_ut_pyra: {
    id: 'rng_ut_pyra', name: 'Signet of the Ancient Obelisk', tier: 'UT', slot: 'ring',
    bagType: 6, stats: { hp: 140, atk: 8, def: 8, vit: 6 }, color: '#facc15', fameBonus: 7,
    desc: 'LEGENDARY UT: Balanced perfection of Life, Attack, and Defense.'
  },

  // ==========================================================================
  // PERMANENT STAT POTIONS (Blue Bags! Drink to reach 8/8 Maxed!)
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
    id: 'pot_life', name: 'Potion of Life (Vitality Elixir)', tier: 'POT', slot: 'consumable', subType: 'stat_pot',
    bagType: 4, stat: 'hp', amount: 15, color: '#2dd4bf', fameBonus: 0,
    desc: 'PERMANENTLY increases Maximum HP by +15 toward your 8/8 Class Cap!'
  },
  pot_mana: {
    id: 'pot_mana', name: 'Potion of Mana (Astral Elixir)', tier: 'POT', slot: 'consumable', subType: 'stat_pot',
    bagType: 4, stat: 'mp', amount: 10, color: '#facc15', fameBonus: 0,
    desc: 'PERMANENTLY increases Maximum MP by +10 toward your 8/8 Class Cap!'
  },
  pot_omni: {
    id: 'pot_omni', name: 'Nectar of the Holy Crest (Max-All)', tier: 'UT', slot: 'consumable', subType: 'stat_omni',
    bagType: 6, color: '#fde047', fameBonus: 0,
    desc: 'LEGENDARY ELIXIR: Boosts ALL 8 stats significantly toward 8/8 Maxed!'
  },

  // ==========================================================================
  // CONSUMABLES & SACRED CREST SHARDS
  // ==========================================================================
  con_fairy: {
    id: 'con_fairy', name: 'Bottled Lumina Wisp', tier: 'CON', slot: 'consumable', subType: 'heal',
    bagType: 0, healHp: 250, healMp: 100, color: '#f472b6', fameBonus: 0,
    desc: 'Restores 250 HP & 100 MP on use—OR automatically revives you from a fatal blow if in your backpack!'
  },

  shard_tide: {
    id: 'shard_tide', name: 'Crest Shard I: Silver Tide', tier: 'UT', slot: 'consumable', subType: 'crest_shard',
    shardIndex: 0, bagType: 6, color: '#38bdf8', fameBonus: 10,
    desc: 'SACRED CREST FRAGMENT (1/5): Click to attune and rebuild the First Point of the Holy Crest!'
  },
  shard_wilds: {
    id: 'shard_wilds', name: 'Crest Shard II: Sylvan Root', tier: 'UT', slot: 'consumable', subType: 'crest_shard',
    shardIndex: 1, bagType: 6, color: '#22c55e', fameBonus: 10,
    desc: 'SACRED CREST FRAGMENT (2/5): Click to attune and rebuild the Second Point of the Holy Crest!'
  },
  shard_astral: {
    id: 'shard_astral', name: 'Crest Shard III: Astral Wind', tier: 'UT', slot: 'consumable', subType: 'crest_shard',
    shardIndex: 2, bagType: 6, color: '#c084fc', fameBonus: 10,
    desc: 'SACRED CREST FRAGMENT (3/5): Click to attune and rebuild the Third Point of the Holy Crest!'
  },
  shard_ossuary: {
    id: 'shard_ossuary', name: 'Crest Shard IV: Dawn Vigil', tier: 'UT', slot: 'consumable', subType: 'crest_shard',
    shardIndex: 3, bagType: 6, color: '#facc15', fameBonus: 10,
    desc: 'SACRED CREST FRAGMENT (4/5): Click to attune and rebuild the Fourth Point of the Holy Crest!'
  },
  shard_flame: {
    id: 'shard_flame', name: 'Crest Shard V: Primordial Flame', tier: 'UT', slot: 'consumable', subType: 'crest_shard',
    shardIndex: 4, bagType: 6, color: '#ef4444', fameBonus: 10,
    desc: 'SACRED CREST FRAGMENT (5/5): Click to attune and rebuild the Fifth Point of the Holy Crest!'
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
