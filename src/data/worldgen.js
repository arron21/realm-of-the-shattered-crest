// ============================================================================
// REALM OF THE SHATTERED CREST — WORLD, NEXUS & ZELDA DUNGEON GENERATOR
// ============================================================================

export const TILES = {
  VOID: 0,
  WATER: 1,         // Deep water (impassable except Hookshot grapple flight)
  SAND: 2,          // Beach sand
  GRASS: 3,         // Hyrule Lowlands emerald grass
  FOREST_FLOOR: 4,  // Lost Woods moss floor
  HIGHLAND_ROCK: 5, // Death Mountain ochre floor
  GODLANDS_ASH: 6,  // Dark World obsidian ash floor
  LAVA: 7,          // Deals magma damage unless dashing/grappling
  MARBLE: 8,        // Nexus white/blue sanctuary floor
  MARBLE_GOLD: 9,   // Nexus / Sanctum ornate trim floor
  WOOD_BRIDGE: 10,  // Walkable bridge over water/lava
  DUNGEON_FLOOR: 11,// Stone dungeon floor
  WALL_STONE: 12,   // Solid stone wall
  WALL_TREE: 13,    // Dense forest tree wall
  WALL_OBSIDIAN: 14,// Dark World / Sanctum wall
  WALL_CRACKED: 15, // Zelda Bombable Cracked Wall! (Destroyed by Bombs -> reveals secret!)
  BARRIER_RED: 16,  // Lowered when Crystal Switch is BLUE
  BARRIER_BLUE: 17, // Lowered when Crystal Switch is RED
  HEAL_SPRING: 18   // Fairy healing fountain tile
};

export const DUNGEON_META = {
  pirate_cove: {
    id: 'pirate_cove', name: 'Pirate Cove Grotto', difficulty: 1,
    bossId: 'boss_dread_octorok', minionIds: ['octorok', 'pirate_moblin'],
    floorTile: TILES.SAND, wallTile: TILES.WALL_STONE, liquidTile: TILES.WATER,
    color: '#f59e0b', desc: 'Smuggler caverns teeming with Corsair Moblins and Dread Captain Octorok.'
  },
  deku_temple: {
    id: 'deku_temple', name: 'Forbidden Deku Temple', difficulty: 2,
    bossId: 'boss_queen_gohma', minionIds: ['deku_scrub', 'stalfos_scout', 'lizalfos_spear'],
    floorTile: TILES.FOREST_FLOOR, wallTile: TILES.WALL_TREE, liquidTile: TILES.WATER,
    color: '#10b981', desc: 'Overgrown ancient shrine with Crystal Switches, Cracked Walls, and Queen Gohma.'
  },
  sprite_world: {
    id: 'sprite_world', name: 'Sprite World of Twilight', difficulty: 3,
    bossId: 'boss_limon_sprite', minionIds: ['sprite_archmage', 'beholder_eye'],
    floorTile: TILES.MARBLE, wallTile: TILES.WALL_OBSIDIAN, liquidTile: TILES.VOID,
    color: '#38bdf8', desc: 'Astral plane of floating platforms, Grapple Chasms, and Limon the Twilight Sprite.'
  },
  undead_lair: {
    id: 'undead_lair', name: 'Undead Lair Catacombs', difficulty: 4,
    bossId: 'boss_septavius_lich', minionIds: ['stalfos_scout', 'phantom_reaper', 'darknut_knight'],
    floorTile: TILES.DUNGEON_FLOOR, wallTile: TILES.WALL_STONE, liquidTile: TILES.WATER,
    color: '#a855f7', desc: 'Haunted crypts guarded by Stalfos legions and Septavius the Archlich.'
  },
  abyss_mountain: {
    id: 'abyss_mountain', name: 'Abyss of Death Mountain', difficulty: 5,
    bossId: 'boss_king_dodongo', minionIds: ['darknut_knight', 'wizzrobe_fire', 'magma_titan'],
    floorTile: TILES.GODLANDS_ASH, wallTile: TILES.WALL_OBSIDIAN, liquidTile: TILES.LAVA,
    color: '#ef4444', desc: 'Volcanic caldera of rivers of magma, Grapple Pillars, and Archdemon Dodongo.'
  },
  mad_sanctum: {
    id: 'mad_sanctum', name: 'Sanctum of the Mad Calamity', difficulty: 5,
    bossId: 'boss_alderoth_mad_king', minionIds: ['darknut_knight', 'medusa_gorgon', 'beholder_eye', 'magma_titan'],
    floorTile: TILES.MARBLE_GOLD, wallTile: TILES.WALL_OBSIDIAN, liquidTile: TILES.LAVA,
    color: '#facc15', desc: 'The throne room of Alderoth, Mad King of the Shattered Crest!'
  }
};

// Deterministic pseudo-random helper for reproducible world generation
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ============================================================================
// 1. GENERATE THE NEXUS SANCTUARY (Safe Hub + Training Grounds + Portals)
// ============================================================================
export function generateNexusMap() {
  const width = 48;
  const height = 48;
  const tiles = new Uint8Array(width * height);
  const props = [];   // Bushes, Pots, Grapple Posts, Crystal Switches, Chests, Anvil, Vault
  const portals = []; // Realm & Dungeon Portals

  const setTile = (x, y, t) => {
    if (x >= 0 && x < width && y >= 0 && y < height) tiles[y * width + x] = t;
  };

  // Fill outer water moat
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

  // Central Fairy Healing Fountains (24, 24)
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 2) {
        setTile(24 + dx, 24 + dy, TILES.HEAL_SPRING);
      } else {
        setTile(24 + dx, 24 + dy, TILES.MARBLE_GOLD);
      }
    }
  }

  // West Wing: Zelda Courtyard (Bushes, Pots, Crystal Switch, Grapple Canal, Cracked Wall)
  for (let y = 18; y <= 30; y++) {
    for (let x = 10; x <= 17; x++) {
      setTile(x, y, TILES.GRASS);
    }
  }
  // Small canal with Grapple Post across it
  for (let y = 20; y <= 25; y++) {
    setTile(13, y, TILES.WATER);
  }
  setTile(13, 26, TILES.WOOD_BRIDGE);
  props.push({ id: 'n_grapple_1', type: 'grapple_post', x: 11.5, y: 22.5 });
  props.push({ id: 'n_grapple_2', type: 'grapple_post', x: 15.5, y: 22.5 });

  // Cuttable Zelda Bushes & Smashable Pots in West Wing
  for (let y = 19; y <= 29; y += 2) {
    props.push({ id: `n_bush_${y}`, type: 'bush', x: 10.5, y: y + 0.5, hp: 1 });
    props.push({ id: `n_pot_${y}`,  type: 'pot',  x: 16.5, y: y + 0.5, hp: 1 });
  }
  props.push({ id: 'n_switch_1', type: 'crystal_switch', x: 15.5, y: 18.5, state: 'red' });

  // Secret Bombable Nook in North-West Corner of Nexus!
  setTile(11, 9, TILES.WALL_STONE);
  setTile(12, 9, TILES.WALL_CRACKED); // Bomb this wall!
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

  // East Wing: Account Vault Chest & Goron Relic Forge Anvil
  props.push({ id: 'nexus_vault_chest', type: 'vault_chest', x: 33.5, y: 23.5, name: 'Account Vault & Potion Storage' });
  props.push({ id: 'nexus_forge_anvil', type: 'forge_anvil', x: 33.5, y: 26.5, name: 'Goron Relic & UT Forge' });

  // North Wing: Realm & Dungeon Portals!
  portals.push({
    id: 'portal_realm_beach',
    name: 'Realm of Hyrule (Kokiri Shore)',
    targetMap: 'realm',
    targetZone: 'beach',
    x: 24.0,
    y: 13.5,
    color: '#22c55e',
    playersCount: 24
  });

  portals.push({
    id: 'portal_realm_godlands',
    name: 'Dark World Godlands Rift (Lvl 20)',
    targetMap: 'realm',
    targetZone: 'godlands',
    x: 20.0,
    y: 13.5,
    color: '#a855f7',
    playersCount: 14
  });

  portals.push({
    id: 'portal_sanctum_direct',
    name: 'Sanctum of the Mad Calamity (Raid)',
    targetMap: 'dungeon',
    dungeonId: 'mad_sanctum',
    x: 28.0,
    y: 13.5,
    color: '#facc15'
  });

  // Dungeon Trial Portals row along North Alcove (y = 10.5)
  portals.push({
    id: 'portal_deku_direct',
    name: 'Forbidden Deku Temple (2★)',
    targetMap: 'dungeon',
    dungeonId: 'deku_temple',
    x: 17.5,
    y: 11.0,
    color: '#10b981'
  });
  portals.push({
    id: 'portal_sprite_direct',
    name: 'Sprite World of Twilight (3★)',
    targetMap: 'dungeon',
    dungeonId: 'sprite_world',
    x: 21.5,
    y: 11.0,
    color: '#38bdf8'
  });
  portals.push({
    id: 'portal_udl_direct',
    name: 'Undead Lair Catacombs (4★)',
    targetMap: 'dungeon',
    dungeonId: 'undead_lair',
    x: 26.5,
    y: 11.0,
    color: '#c084fc'
  });
  portals.push({
    id: 'portal_abyss_direct',
    name: 'Abyss of Death Mountain (5★)',
    targetMap: 'dungeon',
    dungeonId: 'abyss_mountain',
    x: 30.5,
    y: 11.0,
    color: '#ef4444'
  });

  return {
    id: 'nexus',
    name: 'The Sacred Nexus Sanctuary',
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
// 2. GENERATE THE OVERWORLD REALM (Concentric Biomes + Zelda Landmarks)
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
        // Biome 1: Kokiri Shore & Golden Beach
        setTile(x, y, TILES.SAND);
      } else if (r > maxR - 26) {
        // Biome 2: Lost Woods & Hyrule Lowlands
        setTile(x, y, (x + y) % 7 === 0 ? TILES.FOREST_FLOOR : TILES.GRASS);
      } else if (r > 21) {
        // Biome 3: Death Mountain Highlands
        setTile(x, y, TILES.HIGHLAND_ROCK);
      } else {
        // Biome 4: Central Dark World Godlands Crater!
        if (rng() < 0.035 && dist > 5) {
          setTile(x, y, TILES.LAVA);
        } else {
          setTile(x, y, TILES.GODLANDS_ASH);
        }
      }
    }
  }

  // Carve 4 Cardinal Highways & Bridges from Shore to Godlands so navigation is smooth
  for (let i = -maxR + 4; i <= maxR - 4; i++) {
    setTile(Math.floor(cx + i), Math.floor(cy), TILES.MARBLE_GOLD);
    setTile(Math.floor(cx + i), Math.floor(cy + 1), TILES.WOOD_BRIDGE);
    setTile(Math.floor(cx), Math.floor(cy + i), TILES.MARBLE_GOLD);
    setTile(Math.floor(cx + 1), Math.floor(cy + i), TILES.WOOD_BRIDGE);
  }

  // Add Fairy Healing Springs at each cardinal Lowland/Highland border
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

  // Add Zelda Interactive Props (Cuttable Bush Patches, Ceramic Pots, Grapple Posts, Bomb Grottos)
  let propCounter = 0;
  for (let y = 10; y < height - 10; y += 3) {
    for (let x = 10; x < width - 10; x += 3) {
      const t = getTile(x, y);
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < 6 || Math.abs(x - cx) <= 2 || Math.abs(y - cy) <= 2) continue;

      if (t === TILES.GRASS || t === TILES.FOREST_FLOOR) {
        const roll = rng();
        if (roll < 0.18) {
          // 2x2 Zelda Bush Cluster!
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
          // Mini Bombable Secret Chest Alcove in Highlands!
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

  // Return Portal to Nexus at South Beach Spawn & Godlands Outpost
  const southSpawnX = cx;
  const southSpawnY = cy + maxR - 5;
  portals.push({
    id: 'portal_back_nexus_beach',
    name: 'Return to Nexus Sanctuary',
    targetMap: 'nexus',
    x: southSpawnX + 2.5,
    y: southSpawnY,
    color: '#38bdf8'
  });

  const godlandsOutpostX = cx;
  const godlandsOutpostY = cy + 20;
  portals.push({
    id: 'portal_back_nexus_glands',
    name: 'Nexus Warp Pillar',
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
// 3. GENERATE MULTI-ROOM ZELDA + ROTMG DUNGEONS
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
    name: 'Escape to Nexus',
    targetMap: 'nexus',
    x: 22.0,
    y: 56.5,
    color: '#38bdf8'
  });

  // Corridor 1 -> Room 2
  carveRect(20, 42, 24, 48);

  // Room 2 (Zelda Puzzle & Combat Hall: y = 28..42, x = 12..32)
  carveRect(12, 28, 32, 42);

  // Chasm / Liquid hazard across middle of Room 2 with Grapple Posts & Bridge controlled by Crystal Switch!
  for (let x = 12; x <= 32; x++) {
    setTile(x, 34, meta.liquidTile);
    setTile(x, 35, meta.liquidTile);
  }
  // Central bridge blocked by Red Barrier (hit the Crystal Switch to lower it, or Hookshot across!)
  setTile(21, 34, TILES.WOOD_BRIDGE);
  setTile(22, 34, TILES.WOOD_BRIDGE);
  setTile(23, 34, TILES.WOOD_BRIDGE);
  setTile(21, 35, TILES.WOOD_BRIDGE);
  setTile(22, 35, TILES.WOOD_BRIDGE);
  setTile(23, 35, TILES.WOOD_BRIDGE);
  setTile(21, 33, TILES.BARRIER_RED);
  setTile(22, 33, TILES.BARRIER_RED);
  setTile(23, 33, TILES.BARRIER_RED);

  // Crystal Switch on South side of chasm + Grapple Pillars on North side!
  props.push({ id: 'd_switch_1', type: 'crystal_switch', x: 18.5, y: 37.5, state: 'red' });
  props.push({ id: 'd_grapple_n1', type: 'grapple_post', x: 15.5, y: 31.5 });
  props.push({ id: 'd_grapple_n2', type: 'grapple_post', x: 28.5, y: 31.5 });
  props.push({ id: 'd_grapple_s1', type: 'grapple_post', x: 15.5, y: 37.5 });
  props.push({ id: 'd_grapple_s2', type: 'grapple_post', x: 28.5, y: 37.5 });

  // Secret Bombable Treasure Room off East Wall of Room 2 (x = 33..39, y = 30..36)
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

  // Bushes & Pots in Room 2
  for (let x = 14; x <= 30; x += 4) {
    props.push({ id: `d_bush_${x}`, type: 'bush', x: x + 0.5, y: 39.5, hp: 1 });
    props.push({ id: `d_pot_${x}`,  type: 'pot',  x: x + 0.5, y: 29.5, hp: 1 });
  }

  // Corridor 2 -> Boss Sanctum (y = 22..28, x = 20..24)
  carveRect(20, 22, 24, 28, TILES.MARBLE_GOLD);

  // Room 3: BOSS SANCTUM (y = 6..22, x = 10..34)
  carveRect(10, 6, 34, 22, dungeonId === 'mad_sanctum' ? TILES.MARBLE_GOLD : meta.floorTile);
  // 4 Grapple Pillars around Boss Arena corners for dodging bullet-hell waves!
  props.push({ id: 'boss_pillar_nw', type: 'grapple_post', x: 13.5, y: 9.5 });
  props.push({ id: 'boss_pillar_ne', type: 'grapple_post', x: 30.5, y: 9.5 });
  props.push({ id: 'boss_pillar_sw', type: 'grapple_post', x: 13.5, y: 19.5 });
  props.push({ id: 'boss_pillar_se', type: 'grapple_post', x: 30.5, y: 19.5 });

  // Pots with emergency hearts along arena edges
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
