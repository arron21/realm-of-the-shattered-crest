// ============================================================================
// REALM OF THE SHATTERED CREST — ENEMIES, BLIGHTLANDS DEITIES & BOSSES
// ============================================================================

export const ENEMIES = {
  // --------------------------------------------------------------------------
  // BIOME 1: SUNLIT SHOALS & COAST (Levels 1-5)
  // --------------------------------------------------------------------------
  octorok: {
    id: 'octorok', name: 'Crimson Tide-Spitter', biome: 'beach',
    hp: 95, def: 1, xp: 22, speed: 2.1, size: 14, color: '#ef4444', accent: '#fca5a5',
    ai: 'wander_shoot', fireRate: 1.5,
    patterns: [
      { type: 'aimed', count: 1, speed: 6.2, dmg: 16, color: '#f97316', size: 5, range: 7.5 }
    ],
    drops: [
      { id: 'wep_sword_t1', chance: 0.14 },
      { id: 'wep_bow_t1',   chance: 0.14 },
      { id: 'arm_heavy_t1', chance: 0.12 },
      { id: 'con_fairy',    chance: 0.06 }
    ]
  },

  chuchu_blue: {
    id: 'chuchu_blue', name: 'Azure Mire-Slime', biome: 'beach',
    hp: 130, def: 2, xp: 30, speed: 2.4, size: 14, color: '#38bdf8', accent: '#bae6fd',
    ai: 'hop_chase', fireRate: 1.8,
    patterns: [
      { type: 'radial', count: 4, speed: 5.0, dmg: 18, color: '#38bdf8', size: 5, range: 6.0 }
    ],
    drops: [
      { id: 'wep_rod_t1',     chance: 0.14 },
      { id: 'wep_dagger_t1',  chance: 0.14 },
      { id: 'arm_leather_t1', chance: 0.12 },
      { id: 'rng_hp_t1',      chance: 0.10 }
    ]
  },

  pirate_moblin: {
    id: 'pirate_moblin', name: 'Corsair Reaver', biome: 'beach',
    hp: 240, def: 3, xp: 55, speed: 2.7, size: 16, color: '#d97706', accent: '#fef08a',
    ai: 'chase_shoot', fireRate: 1.4,
    portalDrop: { dungeonId: 'pirate_cove', chance: 0.35 },
    patterns: [
      { type: 'spread', count: 3, spreadDeg: 28, speed: 6.8, dmg: 24, color: '#fbbf24', size: 5, range: 7.0 }
    ],
    drops: [
      { id: 'wep_sword_t2', chance: 0.16 },
      { id: 'rel_boom_t1',  chance: 0.12 },
      { id: 'rng_dex_t1',   chance: 0.12 },
      { id: 'con_fairy',    chance: 0.08 }
    ]
  },

  // --------------------------------------------------------------------------
  // BIOME 2: WHISPERING WILDS & LOWLANDS (Levels 5-12)
  // --------------------------------------------------------------------------
  deku_scrub: {
    id: 'deku_scrub', name: 'Blighted Briar-Stalker', biome: 'lowlands',
    hp: 310, def: 4, xp: 75, speed: 2.2, size: 15, color: '#22c55e', accent: '#86efac',
    ai: 'strafe_shoot', fireRate: 1.25,
    portalDrop: { dungeonId: 'deku_temple', chance: 0.25 },
    patterns: [
      { type: 'aimed', count: 2, spreadDeg: 14, speed: 7.8, dmg: 32, color: '#a3e635', size: 6, range: 8.5 }
    ],
    drops: [
      { id: 'wep_bow_t2',     chance: 0.14 },
      { id: 'arm_leather_t2', chance: 0.14 },
      { id: 'rel_hook_t1',    chance: 0.12 },
      { id: 'rng_spd_t1',     chance: 0.12 }
    ]
  },

  stalfos_scout: {
    id: 'stalfos_scout', name: 'Risen Boneblade', biome: 'lowlands',
    hp: 420, def: 6, xp: 95, speed: 3.1, size: 16, color: '#e2e8f0', accent: '#94a3b8',
    ai: 'chase_shoot', fireRate: 1.3,
    patterns: [
      { type: 'spread', count: 3, spreadDeg: 36, speed: 7.2, dmg: 38, color: '#f1f5f9', size: 6, range: 7.5, boomerang: true }
    ],
    drops: [
      { id: 'wep_sword_t2',  chance: 0.15 },
      { id: 'wep_dagger_t2', chance: 0.15 },
      { id: 'arm_heavy_t2',  chance: 0.14 },
      { id: 'rng_atk_t1',    chance: 0.12 }
    ]
  },

  lizalfos_spear: {
    id: 'lizalfos_spear', name: 'Scalebound Lancer', biome: 'lowlands',
    hp: 490, def: 7, xp: 115, speed: 3.4, size: 17, color: '#10b981', accent: '#f43f5e',
    ai: 'lunge_shoot', fireRate: 1.15,
    patterns: [
      { type: 'spread', count: 3, spreadDeg: 20, speed: 8.4, dmg: 44, color: '#34d399', size: 6, range: 8.2 }
    ],
    drops: [
      { id: 'wep_rod_t2',  chance: 0.15 },
      { id: 'arm_robe_t2', chance: 0.15 },
      { id: 'rel_bomb_t1', chance: 0.12 },
      { id: 'pot_spd',     chance: 0.08 }
    ]
  },

  // --------------------------------------------------------------------------
  // BIOME 3: SHATTERED CRAGS & HIGHLANDS (Levels 12-18)
  // --------------------------------------------------------------------------
  darknut_knight: {
    id: 'darknut_knight', name: 'Ironclad Dreadnought', biome: 'highlands',
    hp: 820, def: 14, xp: 195, speed: 2.6, size: 19, color: '#475569', accent: '#eab308',
    frontShield: true, // Takes reduced frontal damage unless flanked, parried, or bombed!
    ai: 'chase_shoot', fireRate: 1.25,
    patterns: [
      { type: 'spread', count: 4, spreadDeg: 40, speed: 7.8, dmg: 58, color: '#fde047', size: 7, range: 7.2 }
    ],
    drops: [
      { id: 'wep_sword_t3', chance: 0.16 },
      { id: 'arm_heavy_t3', chance: 0.14 },
      { id: 'rel_boom_t2',  chance: 0.12 },
      { id: 'rng_para_hp',  chance: 0.12 },
      { id: 'pot_def',      chance: 0.14 },
      { id: 'pot_atk',      chance: 0.12 }
    ]
  },

  wizzrobe_fire: {
    id: 'wizzrobe_fire', name: 'Crimson Pyromage', biome: 'highlands',
    hp: 640, def: 8, xp: 175, speed: 2.8, size: 17, color: '#ef4444', accent: '#fde047',
    ai: 'teleport_cast', fireRate: 1.35,
    patterns: [
      { type: 'radial', count: 8, speed: 6.8, dmg: 52, color: '#f97316', size: 6, range: 8.5 },
      { type: 'aimed',  count: 2, spreadDeg: 10, speed: 8.6, dmg: 60, color: '#fef08a', size: 6, range: 9.0 }
    ],
    drops: [
      { id: 'wep_rod_t3',     chance: 0.15 },
      { id: 'arm_robe_t3',    chance: 0.15 },
      { id: 'rel_ocarina_t2', chance: 0.12 },
      { id: 'pot_wis',        chance: 0.14 },
      { id: 'pot_dex',        chance: 0.12 }
    ]
  },

  // --------------------------------------------------------------------------
  // BIOME 4: THE BLIGHTLANDS / GODLANDS (Level 20 Endgame Bullet-Hell!)
  // --------------------------------------------------------------------------
  medusa_gorgon: {
    id: 'medusa_gorgon', name: 'Serpent Empress of the Blight', biome: 'godlands', isGod: true,
    hp: 1650, def: 16, xp: 380, speed: 3.1, size: 21, color: '#10b981', accent: '#ef4444',
    ai: 'strafe_shoot', fireRate: 1.15,
    portalDrop: { dungeonId: 'deku_temple', chance: 0.28 },
    patterns: [
      { type: 'spread', count: 5, spreadDeg: 48, speed: 8.2, dmg: 78, color: '#22c55e', size: 7, range: 9.2 },
      { type: 'grenade', count: 1, speed: 6.5, dmg: 110, color: '#ef4444', size: 9, range: 8.0 }
    ],
    drops: [
      { id: 'pot_spd',        chance: 0.32 },
      { id: 'pot_atk',        chance: 0.18 },
      { id: 'wep_bow_t3',     chance: 0.14 },
      { id: 'wep_sword_t4',   chance: 0.12 },
      { id: 'arm_leather_t3', chance: 0.14 },
      { id: 'rng_para_hp',    chance: 0.12 }
    ]
  },

  beholder_eye: {
    id: 'beholder_eye', name: 'All-Seeing Eye of Bane', biome: 'godlands', isGod: true,
    hp: 1750, def: 18, xp: 400, speed: 2.8, size: 22, color: '#f8fafc', accent: '#ec4899',
    ai: 'chase_shoot', fireRate: 1.2,
    portalDrop: { dungeonId: 'sprite_world', chance: 0.32 },
    patterns: [
      { type: 'radial', count: 5, speed: 7.6, dmg: 85, color: '#f8fafc', size: 8, range: 9.5, status: 'slowed' },
      { type: 'aimed', count: 1, speed: 9.2, dmg: 95, color: '#f43f5e', size: 8, range: 10.0 }
    ],
    drops: [
      { id: 'pot_def',       chance: 0.32 },
      { id: 'pot_dex',       chance: 0.22 },
      { id: 'wep_rod_t3',    chance: 0.14 },
      { id: 'wep_dagger_t3', chance: 0.14 },
      { id: 'arm_heavy_t3',  chance: 0.14 },
      { id: 'rel_wand_t2',   chance: 0.12 }
    ]
  },

  sprite_archmage: {
    id: 'sprite_archmage', name: 'Astral Conduit Archon', biome: 'godlands', isGod: true,
    hp: 1500, def: 14, xp: 370, speed: 3.3, size: 20, color: '#38bdf8', accent: '#fde047',
    ai: 'strafe_shoot', fireRate: 1.1,
    portalDrop: { dungeonId: 'sprite_world', chance: 0.40 },
    patterns: [
      { type: 'spread', count: 4, spreadDeg: 38, speed: 8.0, dmg: 72, color: '#38bdf8', size: 7, range: 9.0, boomerang: true },
      { type: 'aimed', count: 1, speed: 9.5, dmg: 65, color: '#eab308', size: 7, range: 9.8 }
    ],
    drops: [
      { id: 'pot_dex',     chance: 0.35 },
      { id: 'pot_wis',     chance: 0.22 },
      { id: 'wep_rod_t4',  chance: 0.08 },
      { id: 'arm_robe_t3', chance: 0.15 },
      { id: 'rel_hook_t2', chance: 0.14 }
    ]
  },

  phantom_reaper: {
    id: 'phantom_reaper', name: 'Soul-Reaper Sovereign', biome: 'godlands', isGod: true,
    hp: 1700, def: 15, xp: 390, speed: 3.4, size: 21, color: '#60a5fa', accent: '#e2e8f0',
    ai: 'chase_shoot', fireRate: 1.25,
    portalDrop: { dungeonId: 'undead_lair', chance: 0.35 },
    patterns: [
      { type: 'spread', count: 7, spreadDeg: 65, speed: 8.4, dmg: 80, color: '#93c5fd', size: 7, range: 9.2 }
    ],
    drops: [
      { id: 'pot_wis',        chance: 0.35 },
      { id: 'pot_spd',        chance: 0.22 },
      { id: 'wep_dagger_t4',  chance: 0.08 },
      { id: 'wep_bow_t4',     chance: 0.08 },
      { id: 'rng_exalted_hp', chance: 0.09 }
    ]
  },

  magma_titan: {
    id: 'magma_titan', name: 'Abyssal Cinder Behemoth', biome: 'godlands', isGod: true,
    hp: 2100, def: 20, xp: 450, speed: 2.7, size: 23, color: '#ef4444', accent: '#facc15',
    ai: 'chase_shoot', fireRate: 1.05,
    portalDrop: { dungeonId: 'abyss_mountain', chance: 0.38 },
    patterns: [
      { type: 'spread', count: 3, spreadDeg: 22, speed: 8.8, dmg: 92, color: '#fb923c', size: 8, range: 8.8, pierceArmor: true },
      { type: 'radial', count: 6, speed: 6.5, dmg: 75, color: '#ef4444', size: 7, range: 7.5 }
    ],
    drops: [
      { id: 'pot_vit',      chance: 0.36 },
      { id: 'pot_def',      chance: 0.28 },
      { id: 'wep_sword_t4', chance: 0.14 },
      { id: 'wep_sword_t5', chance: 0.08 },
      { id: 'rel_bomb_t2',  chance: 0.15 }
    ]
  },

  // --------------------------------------------------------------------------
  // REALM EVENT BOSSES (Spawn in Overworld, Tracked on Quest Compass!)
  // --------------------------------------------------------------------------
  event_skull_lord: {
    id: 'event_skull_lord', name: 'Ossuary Skull Shrine', biome: 'event', isEvent: true, isBoss: true,
    hp: 6800, def: 22, xp: 1600, speed: 2.0, size: 28, color: '#f43f5e', accent: '#fde047',
    ai: 'boss_orbit', fireRate: 0.85,
    portalDrop: { dungeonId: 'undead_lair', chance: 1.0 },
    patterns: [
      { type: 'spiral', count: 6, speed: 7.8, dmg: 92, color: '#fb7185', size: 8, range: 11.0 },
      { type: 'spread', count: 5, spreadDeg: 45, speed: 9.0, dmg: 105, color: '#fef04a', size: 8, range: 10.5 }
    ],
    drops: [
      { id: 'pot_def',      chance: 1.0 },
      { id: 'pot_atk',      chance: 0.85 },
      { id: 'pot_wis',      chance: 0.75 },
      { id: 'wep_sword_t5', chance: 0.35 },
      { id: 'arm_heavy_t4', chance: 0.35 },
      { id: 'rel_boom_ut',  chance: 0.28 },
      { id: 'rng_ut_pyra',  chance: 0.22 }
    ]
  },

  event_cube_overseer: {
    id: 'event_cube_overseer', name: 'Astral Cube Overseer', biome: 'event', isEvent: true, isBoss: true,
    hp: 7200, def: 20, xp: 1750, speed: 2.3, size: 28, color: '#22d3ee', accent: '#f97316',
    ai: 'boss_strafe', fireRate: 0.8,
    portalDrop: { dungeonId: 'sprite_world', chance: 1.0 },
    patterns: [
      { type: 'spread', count: 6, spreadDeg: 50, speed: 8.6, dmg: 88, color: '#22d3ee', size: 8, range: 11.0 },
      { type: 'radial', count: 10, speed: 7.2, dmg: 95, color: '#f97316', size: 8, range: 10.0 }
    ],
    drops: [
      { id: 'pot_dex',              chance: 1.0 },
      { id: 'pot_spd',              chance: 0.85 },
      { id: 'pot_def',              chance: 0.75 },
      { id: 'wep_dagger_ut_fierce', chance: 0.28 },
      { id: 'rel_hook_ut',          chance: 0.25 },
      { id: 'arm_leather_t4',       chance: 0.35 }
    ]
  },

  event_molten_colossus: {
    id: 'event_molten_colossus', name: 'Pyroclast the Molten Colossus', biome: 'event', isEvent: true, isBoss: true,
    hp: 8000, def: 25, xp: 2000, speed: 2.5, size: 30, color: '#ef4444', accent: '#facc15',
    ai: 'boss_chase', fireRate: 0.9,
    portalDrop: { dungeonId: 'abyss_mountain', chance: 1.0 },
    patterns: [
      { type: 'spread', count: 5, spreadDeg: 36, speed: 9.2, dmg: 110, color: '#f97316', size: 9, range: 11.0 },
      { type: 'spiral', count: 8, speed: 7.5, dmg: 95, color: '#fde047', size: 8, range: 10.5 }
    ],
    drops: [
      { id: 'pot_vit',            chance: 1.0 },
      { id: 'pot_def',            chance: 0.90 },
      { id: 'pot_life',           chance: 0.45 },
      { id: 'wep_sword_ut_demon', chance: 0.28 },
      { id: 'rel_bomb_ut',        chance: 0.26 },
      { id: 'rng_exalted_hp',     chance: 0.40 }
    ]
  },

  // --------------------------------------------------------------------------
  // DUNGEON GUARDIAN BOSSES (Each drops one of the 5 Sacred Crest Shards!)
  // --------------------------------------------------------------------------
  boss_dread_octorok: {
    id: 'boss_dread_octorok', name: 'Dread Captain Vorath', biome: 'dungeon', isBoss: true,
    crestShardIndex: 0,
    hp: 2600, def: 8, xp: 650, speed: 2.5, size: 26, color: '#dc2626', accent: '#fde047',
    ai: 'boss_strafe', fireRate: 1.0,
    patterns: [
      { type: 'spread', count: 4, spreadDeg: 35, speed: 7.4, dmg: 45, color: '#f97316', size: 7, range: 9.5 },
      { type: 'radial', count: 8, speed: 6.2, dmg: 42, color: '#38bdf8', size: 7, range: 8.5 }
    ],
    drops: [
      { id: 'shard_tide',   chance: 1.0 }, // SACRED CREST SHARD I!
      { id: 'pot_spd',      chance: 1.0 },
      { id: 'pot_dex',      chance: 0.80 },
      { id: 'wep_sword_t3', chance: 0.45 },
      { id: 'wep_bow_t2',   chance: 0.45 },
      { id: 'con_fairy',    chance: 0.60 }
    ]
  },

  boss_queen_gohma: {
    id: 'boss_queen_gohma', name: 'Arachne the Blightweaver', biome: 'dungeon', isBoss: true,
    crestShardIndex: 1,
    hp: 4500, def: 14, xp: 1100, speed: 2.8, size: 28, color: '#059669', accent: '#ef4444',
    ai: 'boss_orbit', fireRate: 0.9,
    patterns: [
      { type: 'spread', count: 5, spreadDeg: 42, speed: 8.2, dmg: 68, color: '#10b981', size: 8, range: 10.0 },
      { type: 'spiral', count: 6, speed: 7.0, dmg: 64, color: '#ef4444', size: 8, range: 9.5 }
    ],
    drops: [
      { id: 'shard_wilds',  chance: 1.0 }, // SACRED CREST SHARD II!
      { id: 'pot_dex',      chance: 1.0 },
      { id: 'pot_atk',      chance: 0.85 },
      { id: 'wep_bow_t3',   chance: 0.45 },
      { id: 'rel_hook_ut',  chance: 0.28 },
      { id: 'rng_para_hp',  chance: 0.45 }
    ]
  },

  boss_limon_sprite: {
    id: 'boss_limon_sprite', name: 'Aetherion the Astral Archon', biome: 'dungeon', isBoss: true,
    crestShardIndex: 2,
    hp: 5200, def: 16, xp: 1350, speed: 3.3, size: 27, color: '#38bdf8', accent: '#f8fafc',
    ai: 'boss_strafe', fireRate: 0.82,
    patterns: [
      { type: 'radial', count: 8, speed: 8.0, dmg: 74, color: '#38bdf8', size: 8, range: 10.5, boomerang: true },
      { type: 'spread', count: 4, spreadDeg: 28, speed: 9.2, dmg: 80, color: '#fde047', size: 7, range: 10.5 }
    ],
    drops: [
      { id: 'shard_astral',       chance: 1.0 }, // SACRED CREST SHARD III!
      { id: 'pot_dex',            chance: 1.0 },
      { id: 'pot_def',            chance: 0.85 },
      { id: 'wep_rod_ut_seasons', chance: 0.30 },
      { id: 'rel_wand_t2',        chance: 0.45 },
      { id: 'arm_robe_t3',        chance: 0.45 }
    ]
  },

  boss_septavius_lich: {
    id: 'boss_septavius_lich', name: 'Mordecai the Undying Lich', biome: 'dungeon', isBoss: true,
    crestShardIndex: 3,
    hp: 6200, def: 18, xp: 1600, speed: 2.6, size: 28, color: '#e2e8f0', accent: '#60a5fa',
    ai: 'boss_orbit', fireRate: 0.85,
    patterns: [
      { type: 'spiral', count: 8, speed: 7.6, dmg: 85, color: '#93c5fd', size: 8, range: 11.0 },
      { type: 'spread', count: 5, spreadDeg: 40, speed: 8.8, dmg: 92, color: '#f8fafc', size: 8, range: 10.5 }
    ],
    drops: [
      { id: 'shard_ossuary',    chance: 1.0 }, // SACRED CREST SHARD IV!
      { id: 'pot_wis',          chance: 1.0 },
      { id: 'pot_atk',          chance: 0.85 },
      { id: 'wep_bow_ut_light', chance: 0.30 },
      { id: 'wep_dagger_t4',    chance: 0.40 },
      { id: 'rng_exalted_hp',   chance: 0.40 }
    ]
  },

  boss_king_dodongo: {
    id: 'boss_king_dodongo', name: 'Ignis the Magma Overlord', biome: 'dungeon', isBoss: true,
    crestShardIndex: 4,
    hp: 7500, def: 24, xp: 1950, speed: 2.7, size: 30, color: '#ef4444', accent: '#fde047',
    ai: 'boss_chase', fireRate: 0.88,
    patterns: [
      { type: 'spread', count: 6, spreadDeg: 48, speed: 8.8, dmg: 102, color: '#f97316', size: 9, range: 10.5 },
      { type: 'radial', count: 10, speed: 7.0, dmg: 88, color: '#ef4444', size: 8, range: 9.5 }
    ],
    drops: [
      { id: 'shard_flame',        chance: 1.0 }, // SACRED CREST SHARD V!
      { id: 'pot_def',            chance: 1.0 },
      { id: 'pot_vit',            chance: 1.0 },
      { id: 'pot_life',           chance: 0.45 },
      { id: 'wep_sword_ut_demon', chance: 0.32 },
      { id: 'rel_bomb_ut',        chance: 0.28 },
      { id: 'arm_heavy_t4',       chance: 0.45 }
    ]
  },

  // --------------------------------------------------------------------------
  // FINAL RAID BOSS: MALAKOR, THE EVIL BANE
  // --------------------------------------------------------------------------
  boss_alderoth_mad_king: {
    id: 'boss_alderoth_mad_king', name: 'Malakor, the Evil Bane', biome: 'sanctum', isBoss: true, isFinalBoss: true,
    hp: 15000, def: 26, xp: 5000, speed: 2.9, size: 34, color: '#facc15', accent: '#ef4444',
    ai: 'mad_king_phases', fireRate: 0.72,
    patterns: [
      { type: 'spiral', count: 8, speed: 8.4, dmg: 115, color: '#facc15', size: 9, range: 12.5 },
      { type: 'spread', count: 7, spreadDeg: 56, speed: 9.6, dmg: 128, color: '#ef4444', size: 9, range: 12.0 },
      { type: 'radial', count: 12, speed: 7.8, dmg: 105, color: '#38bdf8', size: 8, range: 11.5 }
    ],
    drops: [
      { id: 'pot_life',            chance: 1.0 },
      { id: 'pot_mana',            chance: 1.0 },
      { id: 'pot_omni',            chance: 0.55 },
      { id: 'wep_sword_ut_master', chance: 0.42 },
      { id: 'rng_ut_crown',        chance: 0.40 },
      { id: 'arm_ut_magic_armor',  chance: 0.38 },
      { id: 'rel_ocarina_ut',      chance: 0.35 },
      { id: 'rel_wand_ut',         chance: 0.35 },
      { id: 'wep_sword_t5',        chance: 0.65 },
      { id: 'wep_bow_t4',          chance: 0.65 },
      { id: 'wep_rod_t4',          chance: 0.65 }
    ]
  }
};
