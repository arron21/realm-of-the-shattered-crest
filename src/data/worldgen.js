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

  // HIGH ELDER VAELEN & THE ALTAR OF THE SHATTERED CREST (Center Plaza, North of Fountain)
  props.push({
    id: 'nexus_elder_vaelen',
    type: 'elder_npc',
    x: 24.0,
    y: 19.5,
    name: 'High Elder Vaelen (Keeper of the Holy Crest)'
  });

  // West Wing: Warden Training Courtyard (Bushes, Urns, Runic Switch, Grapple Canal, Cracked Wall)
  for (let y = 18; y <= 30; y++) {
    for (let x = 10; x <= 17; x++) {
      setTile(x, y, TILES.GRASS);
    }
  }
  for (let y = 20; y <= 25; y++) {
    setTile(13, y, TILES.WATER);
  }
  setTile(13, 26, TILES.WOOD_BRIDGE);
  props.push({ id: 'n_grapple_1', type: 'grapple_post', x: 11.5, y: 22.5 });
  props.push({ id: 'n_grapple_2', type: 'grapple_post', x: 15.5, y: 22.5 });

  for (let y = 19; y <= 29; y += 2) {
    props.push({ id: `n_bush_${y}`, type: 'bush', x: 10.5, y: y + 0.5, hp: 1 });
    props.push({ id: `n_pot_${y}`,  type: 'pot',  x: 16.5, y: y + 0.5, hp: 1 });
  }
  props.push({ id: 'n_switch_1', type: 'crystal_switch', x: 15.5, y: 18.5, state: 'red' });

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
  props.push({ id: 'nexus_vault_chest', type: 'vault_chest', x: 33.5, y: 23.5, name: 'Account Vault & Potion Storage' });
  props.push({ id: 'nexus_forge_anvil', type: 'forge_anvil', x: 33.5, y: 26.5, name: 'Sanctuary Relic & UT Forge' });

  // North Wing: Realm & Dungeon Portals (Where the 5 Crest Shards are hidden!)
  portals.push({
    id: 'portal_realm_beach',
    name: 'Aethelgard Realm (Sunlit Shoals)',
    targetMap: 'realm',
    targetZone: 'beach',
    x: 24.0,
    y: 14.0,
    color: '#22c55e',
    playersCount: 24
  });

  portals.push({
    id: 'portal_realm_godlands',
    name: 'The Blightlands Rift (Lvl 20)',
    targetMap: 'realm',
    targetZone: 'godlands',
    x: 19.5,
    y: 14.0,
    color: '#a855f7',
    playersCount: 14
  });

  portals.push({
    id: 'portal_sanctum_direct',
    name: 'Sanctum of the Evil Bane (Raid)',
    targetMap: 'dungeon',
    dungeonId: 'mad_sanctum',
    x: 28.5,
    y: 14.0,
    color: '#facc15'
  });

  // 5 Shard Dungeon Trial Portals row along North Alcove (y = 10.5)
  portals.push({
    id: 'portal_cove_direct',
    name: 'I. Sunken Corsair Grotto (Shard I)',
    targetMap: 'dungeon',
    dungeonId: 'pirate_cove',
    x: 15.5,
    y: 10.8,
    color: '#f59e0b'
  });
  portals.push({
    id: 'portal_deku_direct',
    name: 'II. Blighted Sylvan Temple (Shard II)',
    targetMap: 'dungeon',
    dungeonId: 'deku_temple',
    x: 19.8,
    y: 10.8,
    color: '#10b981'
  });
  portals.push({
    id: 'portal_sprite_direct',
    name: 'III. The Astral Conduit (Shard III)',
    targetMap: 'dungeon',
    dungeonId: 'sprite_world',
    x: 24.0,
    y: 10.8,
    color: '#38bdf8'
  });
  portals.push({
    id: 'portal_udl_direct',
    name: 'IV. Sunken Catacombs (Shard IV)',
    targetMap: 'dungeon',
    dungeonId: 'undead_lair',
    x: 28.2,
    y: 10.8,
    color: '#c084fc'
  });
  portals.push({
    id: 'portal_abyss_direct',
    name: 'V. Caldera of the Abyss (Shard V)',
    targetMap: 'dungeon',
    dungeonId: 'abyss_mountain',
    x: 32.5,
    y: 10.8,
    color: '#ef4444'
  });

  return {
    id: 'nexus',
    name: 'The Radiant Sanctuary Hub',
    width,
    height,
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

  tiles.fill(meta.wallTile);

  const carveRect = (x1, y1, x2, y2, tile = meta.floorTile) => {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        setTile(x, y, tile);
      }
    }
  };

  // Room 1 (South Entrance Hall: y = 48..58, x = 16..28)
  carveRect(16, 48, 28, 58);
  setTile(22, 53, TILES.HEAL_SPRING);
  portals.push({
    id: 'dungeon_exit_nexus',
    name: 'Return to Sanctuary',
    targetMap: 'nexus',
    x: 22.0,
    y: 56.5,
    color: '#38bdf8'
  });

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

  return {
    id: `dungeon_${dungeonId}`,
    dungeonId,
    name: meta.name,
    difficulty: meta.difficulty,
    width,
    height,
    tiles,
    props,
    portals,
    spawnX: 22.0,
    spawnY: 54.0,
    bossSpawnX: 22.0,
    bossSpawnY: 13.5,
    switchState: 'red'
  };
}
