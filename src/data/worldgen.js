// ============================================================================
// REALM OF THE SHATTERED CREST — WORLD, SANCTUARY HUB & DUNGEON GENERATOR
// ============================================================================

export const TILES = {
  VOID: 0,
  WATER: 1,         // Deep water (impassable except Chain Grapple flight)
  SAND: 2,          // Sunlit Shoals sand
  GRASS: 3,         // Lowlands emerald grass
  FOREST_FLOOR: 4,  // Whispering Wilds moss floor
  HIGHLAND_ROCK: 5, // Shattered Crags ochre floor
  GODLANDS_ASH: 6,  // Blightlands obsidian ash floor
  LAVA: 7,          // Deals magma damage unless dashing/grappling
  MARBLE: 8,        // Sanctuary white/blue floor
  MARBLE_GOLD: 9,   // Sanctuary / Sanctum ornate trim floor
  WOOD_BRIDGE: 10,  // Walkable bridge over water/lava
  DUNGEON_FLOOR: 11,// Stone dungeon floor
  WALL_STONE: 12,   // Solid stone wall
  WALL_TREE: 13,    // Dense forest tree wall
  WALL_OBSIDIAN: 14,// Blightlands / Sanctum wall
  WALL_CRACKED: 15, // Cracked Wall! (Destroyed by Brimstone Charges -> reveals secret!)
  BARRIER_RED: 16,  // Lowered when Runic Switch is BLUE
  BARRIER_BLUE: 17, // Lowered when Runic Switch is RED
  HEAL_SPRING: 18   // Lumina healing fountain tile
};

export const DUNGEON_META = {
  pirate_cove: {
    id: 'pirate_cove', name: 'Sunken Corsair Grotto', difficulty: 1, shardIndex: 0,
    bossId: 'boss_dread_octorok', minionIds: ['octorok', 'pirate_moblin'],
    floorTile: TILES.SAND, wallTile: TILES.WALL_STONE, liquidTile: TILES.WATER,
    color: '#f59e0b', desc: 'Smuggler caverns where Dread Captain Vorath guards Crest Shard I: Silver Tide.'
  },
  deku_temple: {
    id: 'deku_temple', name: 'Blighted Sylvan Temple', difficulty: 2, shardIndex: 1,
    bossId: 'boss_queen_gohma', minionIds: ['deku_scrub', 'stalfos_scout', 'lizalfos_spear'],
    floorTile: TILES.FOREST_FLOOR, wallTile: TILES.WALL_TREE, liquidTile: TILES.WATER,
    color: '#10b981', desc: 'Overgrown ancient shrine where Arachne the Blightweaver guards Crest Shard II: Sylvan Root.'
  },
  sprite_world: {
    id: 'sprite_world', name: 'The Astral Conduit', difficulty: 3, shardIndex: 2,
    bossId: 'boss_limon_sprite', minionIds: ['sprite_archmage', 'beholder_eye'],
    floorTile: TILES.MARBLE, wallTile: TILES.WALL_OBSIDIAN, liquidTile: TILES.VOID,
    color: '#38bdf8', desc: 'Floating star-spires where Aetherion the Astral Archon guards Crest Shard III: Astral Wind.'
  },
  undead_lair: {
    id: 'undead_lair', name: 'Sunken Catacombs', difficulty: 4, shardIndex: 3,
    bossId: 'boss_septavius_lich', minionIds: ['stalfos_scout', 'phantom_reaper', 'darknut_knight'],
    floorTile: TILES.DUNGEON_FLOOR, wallTile: TILES.WALL_STONE, liquidTile: TILES.WATER,
    color: '#a855f7', desc: 'Haunted crypts where Mordecai the Undying Lich guards Crest Shard IV: Dawn Vigil.'
  },
  abyss_mountain: {
    id: 'abyss_mountain', name: 'Caldera of the Abyss', difficulty: 5, shardIndex: 4,
    bossId: 'boss_king_dodongo', minionIds: ['darknut_knight', 'wizzrobe_fire', 'magma_titan'],
    floorTile: TILES.GODLANDS_ASH, wallTile: TILES.WALL_OBSIDIAN, liquidTile: TILES.LAVA,
    color: '#ef4444', desc: 'Volcanic caldera where Ignis the Magma Overlord guards Crest Shard V: Primordial Flame.'
  },
  mad_sanctum: {
    id: 'mad_sanctum', name: 'Sanctum of the Evil Bane', difficulty: 5,
    bossId: 'boss_alderoth_mad_king', minionIds: ['darknut_knight', 'medusa_gorgon', 'beholder_eye', 'magma_titan'],
    floorTile: TILES.MARBLE_GOLD, wallTile: TILES.WALL_OBSIDIAN, liquidTile: TILES.LAVA,
    color: '#facc15', desc: 'The dark throne room of Malakor, the Evil Bane, who shattered the Holy Crest!'
  }
};

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ============================================================================
// 1. GENERATE THE RADIANT SANCTUARY HUB (With High Elder Vaelen & Crest Altar)
// ============================================================================
export function generateNexusMap() {
  const width = 48;
  const height = 48;
  const tiles = new Uint8Array(width * height);
  const props = [];
  const portals = [];

  const setTile = (x, y, t) => {
    if (x >= 0 && x < width && y >= 0 && y < height) tiles[y * width + x] = t;
  };

  tiles.fill(TILES.WATER);

  // Main Sanctuary Plaza (10..38, 8..40)
  for (let y = 8; y <= 39; y++) {
    for (let x = 8; x <= 39; x++) {
      const isBorder = x === 8 || x === 39 || y === 8 || y === 39;
      if (isBorder) {
        setTile(x, y, TILES.WALL_STONE);
      } else if ((x + y) % 5 === 0) {
        setTile(x, y, TILES.MARBLE_GOLD);
      } else {
        setTile(x, y, TILES.MARBLE);
      }
    }
  }

  // Central Lumina Healing Fountains (24, 24)
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 2) {
        setTile(24 + dx, 24 + dy, TILES.HEAL_SPRING);
      } else {
        setTile(24 + dx, 24 + dy, TILES.MARBLE_GOLD);
      }
    }
  }

  // Golden Celestial Clock Track around the Sanctuary Center (24, 24) at radius 8.5
  for (let y = 13; y <= 35; y++) {
    for (let x = 13; x <= 35; x++) {
      const dist = Math.hypot(x + 0.5 - 24.0, y + 0.5 - 24.0);
      if (Math.abs(dist - 8.5) <= 0.65) {
        setTile(x, y, TILES.MARBLE_GOLD);
      }
    }
  }

  // HIGH ELDER VAELEN & THE ALTAR OF THE SHATTERED CREST (Center Plaza, North of Fountain)
  props.push({
    id: 'nexus_elder_vaelen',
    type: 'elder_npc',
    x: 24.0,
    y: 20.0,
    name: 'High Elder Vaelen (Keeper of the Holy Crest)'
  });

  // SOUL WARDEN MORRIGAN — DEATH COUNTER & FALLEN HEROES CHRONICLER (Center Plaza, East of Spawn)
  props.push({
    id: 'nexus_death_npc',
    type: 'death_npc',
    x: 27.5,
    y: 26.5,
    name: 'Soul Warden Morrigan (Chronicler of Deaths)'
  });

  // South-West Combat & DPS Courtyard (Training Dummies + Master Tactician Kael Next to Dummy)
  for (let y = 26; y <= 33; y++) {
    for (let x = 10; x <= 15; x++) {
      setTile(x, y, TILES.GRASS);
    }
  }

  // MASTER TACTICIAN KAEL — TOP DPS RECORDER NPC (Standing right next to the Combat Dummies!)
  props.push({
    id: 'nexus_dps_npc',
    type: 'dps_npc',
    x: 12.75,
    y: 26.6,
    name: 'Master Tactician Kael (Top DPS Recorder)'
  });

  // North-West Warden Training Courtyard (Grapple Canal, Bushes, Urns, Runic Switch, Cracked Wall)
  for (let y = 12; y <= 23; y++) {
    for (let x = 10; x <= 14; x++) {
      setTile(x, y, TILES.GRASS);
    }
  }
  for (let y = 12; y <= 15; y++) {
    setTile(12, y, TILES.WATER);
  }
  setTile(12, 16, TILES.WOOD_BRIDGE);
  props.push({ id: 'n_grapple_1', type: 'grapple_post', x: 10.5, y: 14.0 });
  props.push({ id: 'n_grapple_2', type: 'grapple_post', x: 13.8, y: 14.0 });

  for (let y = 18; y <= 22; y += 2) {
    props.push({ id: `n_bush_${y}`, type: 'bush', x: 10.5, y: y + 0.5, hp: 1 });
    props.push({ id: `n_pot_${y}`,  type: 'pot',  x: 13.5, y: y + 0.5, hp: 1 });
  }
  props.push({ id: 'n_switch_1', type: 'crystal_switch', x: 12.0, y: 17.5, state: 'red' });

  // Secret Brimstone-Breachable Vault Nook in North-West Corner of Sanctuary!
  setTile(11, 9, TILES.WALL_STONE);
  setTile(12, 9, TILES.WALL_CRACKED);
  setTile(13, 9, TILES.WALL_STONE);
  setTile(12, 8, TILES.MARBLE_GOLD);
  props.push({
    id: 'nexus_secret_chest',
    type: 'chest',
    x: 12.5,
    y: 8.5,
    opened: false,
    loot: ['pot_spd', 'pot_dex', 'con_fairy']
  });

  // East Wing: Account Vault Chest & Relic Forge Anvil
  props.push({ id: 'nexus_vault_chest', type: 'vault_chest', x: 36.5, y: 22.5, name: 'Account Vault & Potion Storage' });
  props.push({ id: 'nexus_forge_anvil', type: 'forge_anvil', x: 36.5, y: 25.5, name: 'Sanctuary Relic & UT Forge' });

  // ============================================================================
  // CELESTIAL CLOCK RING OF TELEPORTERS (Organized Around Center 24,24 Like a Clock)
  // ============================================================================
  const clockCenterX = 24.0;
  const clockCenterY = 24.0;
  const clockRadius = 8.5;
  const clockPortalsSpec = [
    {
      clockPos: '12:00',
      angleDeg: -90,
      id: 'portal_realm_beach',
      name: 'Aethelgard Realm (Sunlit Shoals)',
      targetMap: 'realm',
      targetZone: 'beach',
      color: '#22c55e',
      playersCount: 24
    },
    {
      clockPos: '1:30',
      angleDeg: -45,
      id: 'portal_cove_direct',
      name: 'I. Sunken Corsair Grotto (Shard I)',
      targetMap: 'dungeon',
      dungeonId: 'pirate_cove',
      color: '#f59e0b'
    },
    {
      clockPos: '3:00',
      angleDeg: 0,
      id: 'portal_deku_direct',
      name: 'II. Blighted Sylvan Temple (Shard II)',
      targetMap: 'dungeon',
      dungeonId: 'deku_temple',
      color: '#10b981'
    },
    {
      clockPos: '4:30',
      angleDeg: 45,
      id: 'portal_sprite_direct',
      name: 'III. The Astral Conduit (Shard III)',
      targetMap: 'dungeon',
      dungeonId: 'sprite_world',
      color: '#38bdf8'
    },
    {
      clockPos: '6:00',
      angleDeg: 90,
      id: 'portal_udl_direct',
      name: 'IV. Sunken Catacombs (Shard IV)',
      targetMap: 'dungeon',
      dungeonId: 'undead_lair',
      color: '#c084fc'
    },
    {
      clockPos: '7:30',
      angleDeg: 135,
      id: 'portal_abyss_direct',
      name: 'V. Caldera of the Abyss (Shard V)',
      targetMap: 'dungeon',
      dungeonId: 'abyss_mountain',
      color: '#ef4444'
    },
    {
      clockPos: '9:00',
      angleDeg: 180,
      id: 'portal_realm_godlands',
      name: 'The Blightlands Rift (Lvl 20)',
      targetMap: 'realm',
      targetZone: 'godlands',
      color: '#a855f7',
      playersCount: 14
    },
    {
      clockPos: '10:30',
      angleDeg: -135,
      id: 'portal_sanctum_direct',
      name: 'Sanctum of the Evil Bane (Raid)',
      targetMap: 'dungeon',
      dungeonId: 'mad_sanctum',
      color: '#facc15'
    }
  ];

  for (const spec of clockPortalsSpec) {
    const rad = (spec.angleDeg * Math.PI) / 180;
    portals.push({
      ...spec,
      clockAngle: rad,
      clockRadius,
      x: Number((clockCenterX + Math.cos(rad) * clockRadius).toFixed(2)),
      y: Number((clockCenterY + Math.sin(rad) * clockRadius).toFixed(2))
    });
  }

  return {
    id: 'nexus',
    name: 'The Radiant Sanctuary Hub',
    width,
    height,
    cx: clockCenterX,
    cy: clockCenterY,
    clockRadius,
    tiles,
    props,
    portals,
    spawnX: 24.0,
    spawnY: 27.5,
    switchState: 'red'
  };
}

// ============================================================================
// 2. GENERATE THE OVERWORLD REALM (Concentric Biomes + Landmarks)
// ============================================================================
export function generateRealmMap(seed = 1337) {
  const rng = seededRandom(seed);
  const width = 140;
  const height = 140;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = 62;

  const tiles = new Uint8Array(width * height);
  const props = [];
  const portals = [];

  const setTile = (x, y, t) => {
    if (x >= 0 && x < width && y >= 0 && y < height) tiles[y * width + x] = t;
  };
  const getTile = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return TILES.WATER;
    return tiles[y * width + x];
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const wobble = Math.sin(angle * 5) * 2.5 + Math.cos(angle * 3) * 2.0;
      const r = dist + wobble;

      if (r > maxR) {
        setTile(x, y, TILES.WATER);
      } else if (r > maxR - 9) {
        setTile(x, y, TILES.SAND);
      } else if (r > maxR - 26) {
        setTile(x, y, (x + y) % 7 === 0 ? TILES.FOREST_FLOOR : TILES.GRASS);
      } else if (r > 21) {
        setTile(x, y, TILES.HIGHLAND_ROCK);
      } else {
        if (rng() < 0.035 && dist > 5) {
          setTile(x, y, TILES.LAVA);
        } else {
          setTile(x, y, TILES.GODLANDS_ASH);
        }
      }
    }
  }

  for (let i = -maxR + 4; i <= maxR - 4; i++) {
    setTile(Math.floor(cx + i), Math.floor(cy), TILES.MARBLE_GOLD);
    setTile(Math.floor(cx + i), Math.floor(cy + 1), TILES.WOOD_BRIDGE);
    setTile(Math.floor(cx), Math.floor(cy + i), TILES.MARBLE_GOLD);
    setTile(Math.floor(cx + 1), Math.floor(cy + i), TILES.WOOD_BRIDGE);
  }

  const springCoords = [
    [cx, cy + 36],
    [cx, cy - 36],
    [cx + 36, cy],
    [cx - 36, cy]
  ];
  springCoords.forEach(([sx, sy], idx) => {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        setTile(sx + dx, sy + dy, TILES.HEAL_SPRING);
      }
    }
    props.push({ id: `realm_grapple_s_${idx}`, type: 'grapple_post', x: sx + 3.5, y: sy + 0.5 });
  });

  let propCounter = 0;
  for (let y = 10; y < height - 10; y += 3) {
    for (let x = 10; x < width - 10; x += 3) {
      const t = getTile(x, y);
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < 6 || Math.abs(x - cx) <= 2 || Math.abs(y - cy) <= 2) continue;

      if (t === TILES.GRASS || t === TILES.FOREST_FLOOR) {
        const roll = rng();
        if (roll < 0.18) {
          props.push({ id: `r_bush_${propCounter++}`, type: 'bush', x: x + 0.5, y: y + 0.5, hp: 1 });
          if (rng() < 0.7) props.push({ id: `r_bush_${propCounter++}`, type: 'bush', x: x + 1.5, y: y + 0.5, hp: 1 });
        } else if (roll < 0.22) {
          props.push({ id: `r_pot_${propCounter++}`, type: 'pot', x: x + 0.5, y: y + 0.5, hp: 1 });
        } else if (roll < 0.24) {
          setTile(x, y, TILES.WALL_TREE);
        }
      } else if (t === TILES.HIGHLAND_ROCK) {
        const roll = rng();
        if (roll < 0.08) {
          props.push({ id: `r_pot_${propCounter++}`, type: 'pot', x: x + 0.5, y: y + 0.5, hp: 1 });
        } else if (roll < 0.10) {
          setTile(x, y, TILES.WALL_CRACKED);
          props.push({
            id: `r_chest_${propCounter++}`,
            type: 'chest',
            x: x + 0.5,
            y: y - 0.5,
            opened: false,
            loot: ['pot_atk', 'pot_def', 'wep_sword_t3']
          });
        }
      } else if (t === TILES.GODLANDS_ASH) {
        const roll = rng();
        if (roll < 0.04) {
          props.push({ id: `r_grapple_${propCounter++}`, type: 'grapple_post', x: x + 0.5, y: y + 0.5 });
        } else if (roll < 0.06) {
          setTile(x, y, TILES.WALL_OBSIDIAN);
        }
      }
    }
  }

  const southSpawnX = cx;
  const southSpawnY = cy + maxR - 5;
  portals.push({
    id: 'portal_back_nexus_beach',
    name: 'Return to Radiant Sanctuary',
    targetMap: 'nexus',
    x: southSpawnX + 2.5,
    y: southSpawnY,
    color: '#38bdf8'
  });

  const godlandsOutpostX = cx;
  const godlandsOutpostY = cy + 20;
  portals.push({
    id: 'portal_back_nexus_glands',
    name: 'Sanctuary Warp Pillar',
    targetMap: 'nexus',
    x: godlandsOutpostX - 2.5,
    y: godlandsOutpostY,
    color: '#38bdf8'
  });

  return {
    id: 'realm',
    name: 'Realm of the Shattered Crest',
    width,
    height,
    cx,
    cy,
    tiles,
    props,
    portals,
    spawnX: southSpawnX,
    spawnY: southSpawnY,
    godlandsSpawnX: godlandsOutpostX,
    godlandsSpawnY: godlandsOutpostY,
    switchState: 'red'
  };
}

// ============================================================================
// 3. GENERATE MULTI-ROOM DUNGEONS (Where the 5 Crest Shards are Guarded)
// ============================================================================
export function generateDungeonMap(dungeonId = 'deku_temple') {
  const meta = DUNGEON_META[dungeonId] || DUNGEON_META.deku_temple;
  const width = 44;
  const height = 64;
  const tiles = new Uint8Array(width * height);
  const props = [];
  const portals = [];

  const setTile = (x, y, t) => {
    if (x >= 0 && x < width && y >= 0 && y < height) tiles[y * width + x] = t;
  };

  const carveRect = (x1, y1, x2, y2, tile = meta.floorTile) => {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        setTile(x, y, tile);
      }
    }
  };

  const carveCircle = (cx, cy, radius, tile = meta.floorTile) => {
    const rSq = radius * radius;
    for (let y = Math.floor(cy - radius - 1); y <= Math.ceil(cy + radius + 1); y++) {
      for (let x = Math.floor(cx - radius - 1); x <= Math.ceil(cx + radius + 1); x++) {
        if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= rSq) {
          setTile(x, y, tile);
        }
      }
    }
  };

  tiles.fill(meta.wallTile);

  // Common Sanctuary Return Portal in the South Entrance Hall
  portals.push({
    id: 'dungeon_exit_nexus',
    name: 'Return to Sanctuary',
    targetMap: 'nexus',
    x: 22.0,
    y: 56.5,
    color: '#38bdf8'
  });

  let layoutType = 'corsair_grotto';
  let bossSpawnX = 22.0;
  let bossSpawnY = 13.5;
  let enemySpawns = [];

  if (dungeonId === 'deku_temple') {
    // =========================================================================
    // DUNGEON 2: BLIGHTED SYLVAN TEMPLE (Twin-Wing Cloisters & Sunken Lagoon)
    // =========================================================================
    layoutType = 'twin_cloister_lagoon';
    bossSpawnX = 22.0;
    bossSpawnY = 12.5;

    // 1. South Root Atrium (x = 17..27, y = 49..58)
    carveRect(17, 49, 27, 58, TILES.FOREST_FLOOR);
    setTile(22, 53, TILES.HEAL_SPRING);

    // Split Corridors into West & East Overgrown Cloister Wings
    carveRect(9, 46, 27, 49, TILES.FOREST_FLOOR);
    carveRect(27, 46, 35, 49, TILES.FOREST_FLOOR);

    // 2. West Overgrown Cloister Wing (x = 6..14, y = 26..48)
    carveRect(6, 26, 14, 48, TILES.FOREST_FLOOR);
    // Living tree pillars & overgrown brush in West Cloister
    setTile(9, 32, TILES.WALL_TREE);
    setTile(11, 42, TILES.WALL_TREE);
    for (let y = 29; y <= 45; y += 4) {
      props.push({ id: `d2_wbush_${y}`, type: 'bush', x: 7.5, y: y + 0.5, hp: 1 });
    }

    // 3. East Overgrown Cloister Wing (x = 30..38, y = 26..48)
    carveRect(30, 26, 38, 48, TILES.FOREST_FLOOR);
    setTile(35, 32, TILES.WALL_TREE);
    setTile(33, 42, TILES.WALL_TREE);
    for (let y = 29; y <= 45; y += 4) {
      props.push({ id: `d2_ebush_${y}`, type: 'bush', x: 36.5, y: y + 0.5, hp: 1 });
    }

    // 4. Central Sunken Marsh Lagoon (x = 15..29, y = 28..45)
    carveRect(15, 28, 29, 45, TILES.WATER);
    // Sacred Moss Sanctuary Island in center of Lagoon (x = 19..25, y = 34..40)
    carveRect(19, 34, 25, 40, TILES.GRASS);
    setTile(22, 37, TILES.HEAL_SPRING);

    // Wooden suspension bridges linking West Cloister <-> Lagoon Island <-> East Cloister & North Gate
    carveRect(15, 36, 18, 38, TILES.WOOD_BRIDGE);
    carveRect(26, 36, 29, 38, TILES.WOOD_BRIDGE);
    carveRect(21, 28, 23, 33, TILES.WOOD_BRIDGE);
    carveRect(21, 41, 23, 48, TILES.WOOD_BRIDGE);

    // Grapple posts across the lagoon and cloisters
    props.push({ id: 'd2_grapple_w', type: 'grapple_post', x: 13.5, y: 37.5 });
    props.push({ id: 'd2_grapple_c1', type: 'grapple_post', x: 20.5, y: 35.5 });
    props.push({ id: 'd2_grapple_c2', type: 'grapple_post', x: 23.5, y: 35.5 });
    props.push({ id: 'd2_grapple_e', type: 'grapple_post', x: 30.5, y: 37.5 });

    // Dual Crystal Switches in West & East Cloisters
    props.push({ id: 'd_switch_1', type: 'crystal_switch', x: 10.5, y: 37.5, state: 'red' });
    props.push({ id: 'd_switch_2', type: 'crystal_switch', x: 33.5, y: 37.5, state: 'red' });

    // Secret West Root Reliquary behind Cracked Bark Wall (x = 2..4, y = 35..40)
    carveRect(2, 35, 4, 40, TILES.MARBLE_GOLD);
    setTile(5, 37, TILES.WALL_CRACKED);
    setTile(5, 38, TILES.WALL_CRACKED);
    props.push({
      id: 'd_secret_chest',
      type: 'chest',
      x: 3.5,
      y: 37.5,
      opened: false,
      loot: ['pot_def', 'pot_atk', 'pot_wis', 'con_fairy']
    });

    // North Convergence Hall & Red Runic Root-Gate (x = 9..35, y = 25..27)
    carveRect(9, 25, 35, 27, TILES.FOREST_FLOOR);
    carveRect(20, 21, 24, 25, TILES.MARBLE_GOLD);
    setTile(20, 24, TILES.BARRIER_RED);
    setTile(21, 24, TILES.BARRIER_RED);
    setTile(22, 24, TILES.BARRIER_RED);
    setTile(23, 24, TILES.BARRIER_RED);
    setTile(24, 24, TILES.BARRIER_RED);

    // 5. Circular Webbed Canopy Grove Boss Arena (center (22, 13), radius 9.5)
    carveCircle(22, 13, 9.5, TILES.FOREST_FLOOR);
    // Radial web-strands of emerald grass & ancient living tree pillars
    for (let r = 2; r <= 8; r++) {
      setTile(22 + r, 13, TILES.GRASS);
      setTile(22 - r, 13, TILES.GRASS);
      setTile(22, 13 + r, TILES.GRASS);
      setTile(22, 13 - r, TILES.GRASS);
    }
    setTile(17, 9, TILES.WALL_TREE);
    setTile(27, 9, TILES.WALL_TREE);
    setTile(17, 17, TILES.WALL_TREE);
    setTile(27, 17, TILES.WALL_TREE);
    props.push({ id: 'boss_pillar_nw', type: 'grapple_post', x: 15.5, y: 10.5 });
    props.push({ id: 'boss_pillar_ne', type: 'grapple_post', x: 28.5, y: 10.5 });
    props.push({ id: 'boss_pillar_sw', type: 'grapple_post', x: 15.5, y: 16.5 });
    props.push({ id: 'boss_pillar_se', type: 'grapple_post', x: 28.5, y: 16.5 });
    props.push({ id: 'boss_pot_w', type: 'pot', x: 14.5, y: 13.5, hp: 1 });
    props.push({ id: 'boss_pot_e', type: 'pot', x: 29.5, y: 13.5, hp: 1 });

    enemySpawns = [
      { id: 'deku_scrub', x: 10.5, y: 45.5 },
      { id: 'deku_scrub', x: 33.5, y: 45.5 },
      { id: 'stalfos_scout', x: 10.5, y: 34.5 },
      { id: 'stalfos_scout', x: 33.5, y: 34.5 },
      { id: 'lizalfos_spear', x: 22.5, y: 38.5 },
      { id: 'lizalfos_spear', x: 10.5, y: 28.5 },
      { id: 'lizalfos_spear', x: 33.5, y: 28.5 },
      { id: 'deku_scrub', x: 22.5, y: 26.5 },
      { id: 'lizalfos_spear', x: 18.5, y: 16.5 },
      { id: 'lizalfos_spear', x: 26.5, y: 16.5 }
    ];
  } else if (dungeonId === 'sprite_world') {
    // =========================================================================
    // DUNGEON 3: THE ASTRAL CONDUIT (7 Floating Star-Islands over Cosmic Void)
    // =========================================================================
    layoutType = 'floating_star_constellation';
    bossSpawnX = 22.0;
    bossSpawnY = 12.5;

    // Entire realm is suspended over Open Cosmic Void
    tiles.fill(TILES.VOID);

    // Island 1: South Arrival Star-Platform (x = 17..27, y = 50..58)
    carveRect(17, 50, 27, 58, TILES.MARBLE);
    carveRect(19, 52, 25, 56, TILES.MARBLE_GOLD);
    setTile(22, 53, TILES.HEAL_SPRING);

    // Island 2: SW Starlight Node (x = 6..14, y = 39..47)
    carveRect(6, 39, 14, 47, TILES.MARBLE);
    carveRect(8, 41, 12, 45, TILES.MARBLE_GOLD);
    props.push({ id: 'd3_sw_grapple', type: 'grapple_post', x: 10.5, y: 43.5 });
    props.push({ id: 'd_switch_1', type: 'crystal_switch', x: 8.5, y: 41.5, state: 'red' });

    // Island 3: SE Starlight Node (x = 30..38, y = 39..47)
    carveRect(30, 39, 38, 47, TILES.MARBLE);
    carveRect(32, 41, 36, 45, TILES.MARBLE_GOLD);
    props.push({ id: 'd3_se_grapple', type: 'grapple_post', x: 34.5, y: 43.5 });
    props.push({ id: 'd_switch_2', type: 'crystal_switch', x: 36.5, y: 41.5, state: 'red' });

    // Sky-Bridges from South Arrival Platform to SW & SE Starlight Nodes
    carveRect(14, 46, 17, 51, TILES.WOOD_BRIDGE);
    carveRect(27, 46, 30, 51, TILES.WOOD_BRIDGE);

    // Island 4: Central Nexus Conduit Island (x = 17..27, y = 31..40)
    carveRect(17, 31, 27, 40, TILES.MARBLE);
    carveRect(19, 33, 25, 38, TILES.MARBLE_GOLD);
    setTile(22, 35, TILES.HEAL_SPRING);
    props.push({ id: 'd3_c_grapple_w', type: 'grapple_post', x: 18.5, y: 35.5 });
    props.push({ id: 'd3_c_grapple_e', type: 'grapple_post', x: 25.5, y: 35.5 });

    // Bridges linking SW <-> Central <-> SE
    carveRect(14, 39, 17, 41, TILES.WOOD_BRIDGE);
    carveRect(27, 39, 30, 41, TILES.WOOD_BRIDGE);

    // Island 5: NW Prism Relay Island (x = 7..15, y = 24..31)
    carveRect(7, 24, 15, 31, TILES.MARBLE);
    carveRect(9, 26, 13, 29, TILES.MARBLE_GOLD);
    props.push({ id: 'd3_nw_grapple', type: 'grapple_post', x: 11.5, y: 27.5 });
    // Bridge SW -> NW
    carveRect(9, 31, 11, 39, TILES.WOOD_BRIDGE);
    setTile(9, 34, TILES.BARRIER_BLUE);
    setTile(10, 34, TILES.BARRIER_BLUE);
    setTile(11, 34, TILES.BARRIER_BLUE);

    // Island 6: NE Secret Star-Vault Island (x = 30..39, y = 24..31)
    carveRect(30, 24, 39, 31, TILES.MARBLE_GOLD);
    // Bridge SE -> NE gated by Cracked Astral Seal
    carveRect(33, 31, 35, 39, TILES.WOOD_BRIDGE);
    setTile(33, 33, TILES.WALL_CRACKED);
    setTile(34, 33, TILES.WALL_CRACKED);
    setTile(35, 33, TILES.WALL_CRACKED);
    props.push({
      id: 'd_secret_chest',
      type: 'chest',
      x: 34.5,
      y: 27.5,
      opened: false,
      loot: ['pot_spd', 'pot_dex', 'pot_wis', 'con_fairy']
    });

    // Central & NW Astral Bridges into North Sovereign Star-Spire
    carveRect(20, 21, 24, 31, TILES.MARBLE_GOLD);
    setTile(20, 25, TILES.BARRIER_RED);
    setTile(21, 25, TILES.BARRIER_RED);
    setTile(22, 25, TILES.BARRIER_RED);
    setTile(23, 25, TILES.BARRIER_RED);
    setTile(24, 25, TILES.BARRIER_RED);
    carveRect(12, 20, 18, 24, TILES.WOOD_BRIDGE);

    // Island 7: North Sovereign Star-Spire Boss Arena (Diamond/Star geometry around (22, 13))
    for (let y = 5; y <= 21; y++) {
      for (let x = 10; x <= 34; x++) {
        const dx = Math.abs(x - 22);
        const dy = Math.abs(y - 13);
        if (dx + dy <= 11 || (dx <= 8 && dy <= 6)) {
          setTile(x, y, (dx + dy) % 3 === 0 ? TILES.MARBLE_GOLD : TILES.MARBLE);
        }
      }
    }
    props.push({ id: 'boss_pillar_nw', type: 'grapple_post', x: 16.5, y: 9.5 });
    props.push({ id: 'boss_pillar_ne', type: 'grapple_post', x: 27.5, y: 9.5 });
    props.push({ id: 'boss_pillar_sw', type: 'grapple_post', x: 16.5, y: 17.5 });
    props.push({ id: 'boss_pillar_se', type: 'grapple_post', x: 27.5, y: 17.5 });
    props.push({ id: 'boss_pot_1', type: 'pot', x: 22.0, y: 7.5, hp: 1 });
    props.push({ id: 'boss_pot_2', type: 'pot', x: 14.5, y: 13.5, hp: 1 });
    props.push({ id: 'boss_pot_3', type: 'pot', x: 29.5, y: 13.5, hp: 1 });

    enemySpawns = [
      { id: 'sprite_archmage', x: 10.5, y: 44.5 },
      { id: 'beholder_eye', x: 34.5, y: 44.5 },
      { id: 'sprite_archmage', x: 20.5, y: 37.5 },
      { id: 'beholder_eye', x: 24.5, y: 37.5 },
      { id: 'sprite_archmage', x: 22.5, y: 33.5 },
      { id: 'beholder_eye', x: 11.5, y: 28.5 },
      { id: 'sprite_archmage', x: 11.5, y: 25.5 },
      { id: 'beholder_eye', x: 22.5, y: 27.5 },
      { id: 'sprite_archmage', x: 18.5, y: 16.5 },
      { id: 'beholder_eye', x: 25.5, y: 16.5 }
    ];
  } else if (dungeonId === 'undead_lair') {
    // =========================================================================
    // DUNGEON 4: SUNKEN CATACOMBS (Winding S-Curve Ossuary & Gothic Cathedral)
    // =========================================================================
    layoutType = 's_curve_ossuary_cathedral';
    bossSpawnX = 22.0;
    bossSpawnY = 12.5;

    // 1. South Crypt Entrance (x = 17..27, y = 50..58)
    carveRect(17, 50, 27, 58, TILES.DUNGEON_FLOOR);
    setTile(22, 53, TILES.HEAL_SPRING);

    // 2. Leg 1 — East Ossuary Gallery (winds EAST: x = 17..38, y = 43..49)
    // Note: Direct north (x=17..27, y=35..42) remains solid WALL_STONE!
    carveRect(17, 43, 38, 49, TILES.DUNGEON_FLOOR);
    setTile(24, 46, TILES.WALL_STONE);
    setTile(30, 46, TILES.WALL_STONE);
    for (let x = 21; x <= 36; x += 5) {
      props.push({ id: `d4_urn_e_${x}`, type: 'pot', x: x + 0.5, y: 44.5, hp: 1 });
    }

    // 3. NE Flooded Subterranean Styx Canal (x = 31..38, y = 34..42)
    carveRect(31, 34, 38, 42, TILES.DUNGEON_FLOOR);
    carveRect(31, 37, 38, 39, TILES.WATER);
    carveRect(34, 37, 36, 39, TILES.WOOD_BRIDGE);
    props.push({ id: 'd4_canal_s', type: 'grapple_post', x: 32.5, y: 41.5 });
    props.push({ id: 'd4_canal_n', type: 'grapple_post', x: 32.5, y: 35.5 });

    // 4. Leg 2 — Central Ritual & Torture Hall (winds WEST: x = 7..38, y = 27..34)
    carveRect(7, 27, 38, 34, TILES.DUNGEON_FLOOR);
    setTile(22, 30, TILES.HEAL_SPRING);
    setTile(28, 30, TILES.WALL_STONE);
    setTile(17, 30, TILES.WALL_STONE);
    props.push({ id: 'd_switch_1', type: 'crystal_switch', x: 25.5, y: 30.5, state: 'red' });

    // Red Runic Portcullis across West end of Central Hall (x = 13, y = 27..34)
    for (let y = 27; y <= 34; y++) {
      setTile(13, y, TILES.BARRIER_RED);
    }

    // 5. Secret Royal Mausoleum Vault (South off West end of Central Hall: x = 6..13, y = 36..42)
    carveRect(6, 36, 13, 42, TILES.MARBLE_GOLD);
    setTile(9, 35, TILES.WALL_CRACKED);
    setTile(10, 35, TILES.WALL_CRACKED);
    props.push({
      id: 'd_secret_chest',
      type: 'chest',
      x: 9.5,
      y: 39.5,
      opened: false,
      loot: ['pot_def', 'pot_vit', 'pot_wis', 'con_fairy']
    });

    // 6. Leg 3 — NW Bone Stairwell & Crypt Approach (winds NORTH then EAST: x = 7..12, y = 18..27 -> x = 12..23, y = 18..22)
    carveRect(7, 18, 12, 27, TILES.DUNGEON_FLOOR);
    carveRect(12, 18, 24, 22, TILES.MARBLE_GOLD);

    // 7. North Gothic Cathedral Boss Sanctum (x = 11..35, y = 6..20, plus East Apse x = 36..39, y = 10..16)
    carveRect(11, 6, 35, 20, TILES.DUNGEON_FLOOR);
    carveRect(36, 10, 39, 16, TILES.MARBLE_GOLD);
    carveRect(19, 7, 25, 11, TILES.MARBLE_GOLD);
    // Double colonnade of 6 Gothic Nave Pillars
    for (const px of [16, 22, 28]) {
      setTile(px, 9, TILES.WALL_STONE);
      setTile(px, 17, TILES.WALL_STONE);
    }
    props.push({ id: 'boss_pillar_nw', type: 'grapple_post', x: 14.5, y: 8.5 });
    props.push({ id: 'boss_pillar_ne', type: 'grapple_post', x: 31.5, y: 8.5 });
    props.push({ id: 'boss_pillar_sw', type: 'grapple_post', x: 14.5, y: 18.5 });
    props.push({ id: 'boss_pillar_se', type: 'grapple_post', x: 31.5, y: 18.5 });
    for (let y = 8; y <= 18; y += 5) {
      props.push({ id: `boss_urn_l_${y}`, type: 'pot', x: 12.5, y: y + 0.5, hp: 1 });
      props.push({ id: `boss_urn_r_${y}`, type: 'pot', x: 34.5, y: y + 0.5, hp: 1 });
    }

    enemySpawns = [
      { id: 'stalfos_scout', x: 21.5, y: 47.5 },
      { id: 'phantom_reaper', x: 27.5, y: 46.5 },
      { id: 'darknut_knight', x: 34.5, y: 45.5 },
      { id: 'stalfos_scout', x: 35.5, y: 35.5 },
      { id: 'phantom_reaper', x: 31.5, y: 30.5 },
      { id: 'darknut_knight', x: 24.5, y: 31.5 },
      { id: 'phantom_reaper', x: 19.5, y: 29.5 },
      { id: 'stalfos_scout', x: 9.5, y: 24.5 },
      { id: 'darknut_knight', x: 18.5, y: 15.5 },
      { id: 'phantom_reaper', x: 26.5, y: 15.5 }
    ];
  } else if (dungeonId === 'abyss_mountain') {
    // =========================================================================
    // DUNGEON 5: CALDERA OF THE ABYSS (Magma Sea, 3 Basalt Islands & Lava Core Ring)
    // =========================================================================
    layoutType = 'volcanic_magma_caldera';
    bossSpawnX = 22.0;
    bossSpawnY = 9.0;

    // 1. South Basalt Landing (x = 17..27, y = 50..58)
    carveRect(17, 50, 27, 58, TILES.GODLANDS_ASH);
    setTile(22, 53, TILES.HEAL_SPRING);

    // 2. Great Molten Magma Sea (x = 5..39, y = 24..49)
    carveRect(5, 24, 39, 49, TILES.LAVA);

    // West Magma Forge Island (x = 7..15, y = 35..45)
    carveRect(7, 35, 15, 45, TILES.GODLANDS_ASH);
    carveRect(9, 37, 13, 43, TILES.HIGHLAND_ROCK);
    props.push({ id: 'd_switch_1', type: 'crystal_switch', x: 11.5, y: 40.5, state: 'red' });
    props.push({ id: 'd5_w_grapple', type: 'grapple_post', x: 11.5, y: 36.5 });

    // Center Caldera Spine Island (x = 19..25, y = 29..43)
    carveRect(19, 29, 25, 43, TILES.GODLANDS_ASH);
    setTile(22, 36, TILES.HEAL_SPRING);
    props.push({ id: 'd5_c_grapple_s', type: 'grapple_post', x: 22.0, y: 41.5 });
    props.push({ id: 'd5_c_grapple_n', type: 'grapple_post', x: 22.0, y: 30.5 });

    // East Brimstone Island (x = 29..36, y = 35..45)
    carveRect(29, 35, 36, 45, TILES.GODLANDS_ASH);
    carveRect(31, 37, 34, 43, TILES.HIGHLAND_ROCK);
    props.push({ id: 'd5_e_grapple', type: 'grapple_post', x: 32.5, y: 36.5 });
    for (let y = 37; y <= 43; y += 3) {
      props.push({ id: `d5_pot_${y}`, type: 'pot', x: 34.5, y: y + 0.5, hp: 1 });
    }

    // Charred Basalt Bridges linking South Landing -> West/East/Center Islands
    carveRect(14, 45, 17, 50, TILES.WOOD_BRIDGE);
    carveRect(27, 45, 30, 50, TILES.WOOD_BRIDGE);
    carveRect(21, 43, 23, 50, TILES.WOOD_BRIDGE);
    carveRect(15, 38, 19, 40, TILES.WOOD_BRIDGE);
    carveRect(25, 38, 29, 40, TILES.WOOD_BRIDGE);

    // 3. Secret Obsidian Hoard Chamber off East Brimstone Island (x = 38..41, y = 37..42)
    carveRect(38, 37, 41, 42, TILES.MARBLE_GOLD);
    setTile(37, 39, TILES.WALL_CRACKED);
    setTile(37, 40, TILES.WALL_CRACKED);
    props.push({
      id: 'd_secret_chest',
      type: 'chest',
      x: 39.5,
      y: 39.5,
      opened: false,
      loot: ['pot_atk', 'pot_def', 'pot_vit', 'con_fairy']
    });

    // 4. North Magma Causeway & Gate (x = 20..24, y = 22..29)
    carveRect(20, 22, 24, 29, TILES.WOOD_BRIDGE);
    for (let x = 20; x <= 24; x++) {
      setTile(x, 25, TILES.BARRIER_RED);
    }

    // 5. North Obsidian Ring Caldera Boss Arena (center (22, 13), radius 10.5 with Central Lava Core)
    carveCircle(22, 13, 10.5, TILES.GODLANDS_ASH);
    // Central Bubbling Lava Core (x = 19..25, y = 11..15) spanned by narrow golden bridge (x = 22)
    carveRect(19, 11, 25, 15, TILES.LAVA);
    carveRect(22, 11, 22, 15, TILES.MARBLE_GOLD);
    props.push({ id: 'boss_pillar_nw', type: 'grapple_post', x: 17.5, y: 9.5 });
    props.push({ id: 'boss_pillar_ne', type: 'grapple_post', x: 26.5, y: 9.5 });
    props.push({ id: 'boss_pillar_sw', type: 'grapple_post', x: 17.5, y: 17.5 });
    props.push({ id: 'boss_pillar_se', type: 'grapple_post', x: 26.5, y: 17.5 });

    enemySpawns = [
      { id: 'darknut_knight', x: 11.5, y: 42.5 },
      { id: 'wizzrobe_fire', x: 11.5, y: 37.5 },
      { id: 'darknut_knight', x: 32.5, y: 42.5 },
      { id: 'wizzrobe_fire', x: 32.5, y: 37.5 },
      { id: 'magma_titan', x: 22.5, y: 40.5 },
      { id: 'wizzrobe_fire', x: 20.5, y: 34.5 },
      { id: 'magma_titan', x: 24.5, y: 34.5 },
      { id: 'darknut_knight', x: 22.5, y: 31.5 },
      { id: 'magma_titan', x: 15.5, y: 14.5 },
      { id: 'magma_titan', x: 28.5, y: 14.5 }
    ];
  } else {
    // =========================================================================
    // DUNGEON 1 (pirate_cove) & RAID SANCTUM (mad_sanctum)
    // =========================================================================
    layoutType = dungeonId === 'mad_sanctum' ? 'citadel_throne_sanctum' : 'corsair_smuggler_grotto';

    // Room 1 (South Entrance Hall: y = 48..58, x = 16..28)
    carveRect(16, 48, 28, 58);
    setTile(22, 53, TILES.HEAL_SPRING);

    // Corridor 1 -> Room 2
    carveRect(20, 42, 24, 48);

    // Room 2 (Runic Puzzle & Combat Hall: y = 28..42, x = 12..32)
    carveRect(12, 28, 32, 42);

    for (let x = 12; x <= 32; x++) {
      setTile(x, 34, meta.liquidTile);
      setTile(x, 35, meta.liquidTile);
    }
    setTile(21, 34, TILES.WOOD_BRIDGE);
    setTile(22, 34, TILES.WOOD_BRIDGE);
    setTile(23, 34, TILES.WOOD_BRIDGE);
    setTile(21, 35, TILES.WOOD_BRIDGE);
    setTile(22, 35, TILES.WOOD_BRIDGE);
    setTile(23, 35, TILES.WOOD_BRIDGE);
    setTile(21, 33, TILES.BARRIER_RED);
    setTile(22, 33, TILES.BARRIER_RED);
    setTile(23, 33, TILES.BARRIER_RED);

    props.push({ id: 'd_switch_1', type: 'crystal_switch', x: 18.5, y: 37.5, state: 'red' });
    props.push({ id: 'd_grapple_n1', type: 'grapple_post', x: 15.5, y: 31.5 });
    props.push({ id: 'd_grapple_n2', type: 'grapple_post', x: 28.5, y: 31.5 });
    props.push({ id: 'd_grapple_s1', type: 'grapple_post', x: 15.5, y: 37.5 });
    props.push({ id: 'd_grapple_s2', type: 'grapple_post', x: 28.5, y: 37.5 });

    // Secret Brimstone-Breachable Treasure Room off East Wall of Room 2
    carveRect(34, 30, 39, 35, TILES.MARBLE_GOLD);
    setTile(33, 32, TILES.WALL_CRACKED);
    setTile(33, 33, TILES.WALL_CRACKED);
    props.push({
      id: 'd_secret_chest',
      type: 'chest',
      x: 36.5,
      y: 32.5,
      opened: false,
      loot: ['pot_def', 'pot_atk', 'pot_wis', 'con_fairy']
    });

    for (let x = 14; x <= 30; x += 4) {
      props.push({ id: `d_bush_${x}`, type: 'bush', x: x + 0.5, y: 39.5, hp: 1 });
      props.push({ id: `d_pot_${x}`,  type: 'pot',  x: x + 0.5, y: 29.5, hp: 1 });
    }

    // Corridor 2 -> Boss Sanctum (y = 22..28, x = 20..24)
    carveRect(20, 22, 24, 28, TILES.MARBLE_GOLD);

    // Room 3: BOSS SANCTUM (y = 6..22, x = 10..34)
    carveRect(10, 6, 34, 22, dungeonId === 'mad_sanctum' ? TILES.MARBLE_GOLD : meta.floorTile);
    props.push({ id: 'boss_pillar_nw', type: 'grapple_post', x: 13.5, y: 9.5 });
    props.push({ id: 'boss_pillar_ne', type: 'grapple_post', x: 30.5, y: 9.5 });
    props.push({ id: 'boss_pillar_sw', type: 'grapple_post', x: 13.5, y: 19.5 });
    props.push({ id: 'boss_pillar_se', type: 'grapple_post', x: 30.5, y: 19.5 });

    for (let y = 10; y <= 18; y += 4) {
      props.push({ id: `boss_pot_l_${y}`, type: 'pot', x: 11.5, y: y + 0.5, hp: 1 });
      props.push({ id: `boss_pot_r_${y}`, type: 'pot', x: 32.5, y: y + 0.5, hp: 1 });
    }

    const defaultCoords = [
      [19, 50], [25, 50],
      [16, 39], [22, 39], [28, 39],
      [16, 30], [22, 30], [28, 30],
      [18, 18], [26, 18]
    ];
    enemySpawns = defaultCoords.map(([x, y], idx) => ({
      id: meta.minionIds[idx % meta.minionIds.length],
      x: x + 0.5,
      y: y + 0.5
    }));
  }

  return {
    id: `dungeon_${dungeonId}`,
    dungeonId,
    layoutType,
    name: meta.name,
    difficulty: meta.difficulty,
    width,
    height,
    tiles,
    props,
    portals,
    enemySpawns,
    spawnX: 22.0,
    spawnY: 54.0,
    bossSpawnX,
    bossSpawnY,
    switchState: 'red'
  };
}
