// ============================================================================
// REALM OF THE SHATTERED CREST — AUTOMATED ENGINE, LORE & MECHANICS TEST SUITE
// ============================================================================

const assert = require('assert');
const vm = require('vm');
const { buildHtmlBundle } = require('./build.js');

// 1. Build bundle & verify zero Zelda references exist anywhere in the bundle
const html = buildHtmlBundle();
assert(html.length > 40000, 'Bundle should be substantial and self-contained');
assert(
  !/zelda|hylian|hyrule|kokiri|goron|sheikah|zora|triforce/i.test(html),
  'Bundle must contain zero Zelda references'
);
console.log('✓ 1. Bundle built cleanly with zero Zelda references');

// Extract inline JS from bundle to run in a mocked DOM/Canvas VM context
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert(scriptMatch, 'Bundle must contain inline script');

function createMockCanvas() {
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    lineCap: 'butt',
    save() {},
    restore() {},
    translate() {},
    rotate() {},
    scale() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    arc() {},
    ellipse() {},
    roundRect() {},
    fillRect() {},
    strokeRect() {},
    fill() {},
    stroke() {},
    fillText() {},
    drawImage() {},
    setLineDash() {},
    createRadialGradient() {
      return { addColorStop() {} };
    }
  };
  return {
    width: 960,
    height: 640,
    clientWidth: 960,
    clientHeight: 640,
    getContext: () => ctx,
    toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    addEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 960, height: 640 })
  };
}

const elements = new Map();
function getMockEl(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      id,
      style: {},
      innerHTML: '',
      textContent: '',
      value: '',
      clientWidth: 960,
      clientHeight: 640,
      width: 268,
      height: 148,
      children: [],
      classList: { toggle() {}, add() {}, remove() {} },
      addEventListener() {},
      appendChild(c) { this.children.push(c); },
      removeChild() { this.children.shift(); },
      querySelectorAll: () => [],
      getContext: () => createMockCanvas().getContext('2d'),
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 268, height: 148 })
    });
  }
  return elements.get(id);
}

const sandbox = {
  console,
  Math,
  Date,
  Uint8Array,
  Set,
  Map,
  Object,
  Array,
  JSON,
  parseInt,
  setTimeout: () => {},
  setInterval: () => {},
  requestAnimationFrame: () => {},
  performance: { now: () => 1000 },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = v; }
  },
  location: { protocol: 'http:', hostname: 'localhost', port: '4000' },
  addEventListener: (ev, fn) => {
    if (ev === 'DOMContentLoaded') sandbox._boot = fn;
  },
  window: null,
  document: {
    activeElement: null,
    getElementById: (id) => (id === 'game-canvas' ? createMockCanvas() : getMockEl(id)),
    createElement: (tag) => (tag === 'canvas' ? createMockCanvas() : getMockEl('dyn_' + Math.random())),
    querySelectorAll: () => [],
    addEventListener: () => {}
  }
};
sandbox.window = sandbox;

vm.createContext(sandbox);
vm.runInContext(scriptMatch[1], sandbox);

// Boot the game in sandbox
sandbox._boot();
const game = sandbox.__ROTSC_GAME__;
const hud = sandbox.__ROTSC_HUD__;
assert(game, 'GameEngine instance should be exposed on window.__ROTSC_GAME__');
assert(hud, 'HudController instance should be exposed on window.__ROTSC_HUD__');

assert.strictEqual(game.currentMap.id, 'nexus');
assert.strictEqual(game.player.classId, 'knight');
console.log('✓ 2. GameEngine booted cleanly in The Radiant Sanctuary Hub');

// Verify High Elder Vaelen NPC in the Sanctuary Hub & Lore Chapters
const elderProp = game.currentMap.props.find((p) => p.type === 'elder_npc');
assert(elderProp, 'High Elder Vaelen (elder_npc) must be present in The Radiant Sanctuary Hub');
game.player.x = elderProp.x;
game.player.y = elderProp.y + 0.8;
const target = game.getNearestInteractiveTarget();
assert(target && target.kind === 'elder', 'Standing near High Elder Vaelen must prompt Elder interaction');
const interacted = game.interactWithNearest();
assert.strictEqual(interacted, true, 'Interacting with High Elder Vaelen must open the Elder Lore & Holy Crest modal');
assert(
  getMockEl('elder-lore-chapters').innerHTML.includes('Malakor, the Evil Bane'),
  'Elder Lore modal must explain how the Holy Crest held back Malakor, the Evil Bane and was shattered'
);
console.log('✓ 3. High Elder Vaelen NPC & 4-Chapter Holy Crest Lore verified in Sanctuary Hub');

// Verify rebuilding the Holy Crest piece by piece (5 Shards)
assert.strictEqual(game.getRestoredShardsCount(), 0, 'New account starts with 0/5 Holy Crest Shards');
const baseHpBeforeShards = game.player.stats.hp;
game.player.inventory[0] = 'shard_tide';
game.useOrEquipItem('inventory', 0);
assert.strictEqual(game.getRestoredShardsCount(), 1, 'Attuning Tide-Crest Shard should advance progress to 1/5');
assert.strictEqual(game.player.stats.hp, baseHpBeforeShards + 25, 'Tide-Crest Shard must grant permanent +25 Max HP blessing');

for (let i = 1; i < 5; i++) {
  game.attuneCrestShard(i);
}
assert.strictEqual(game.getRestoredShardsCount(), 5, 'All 5 Holy Crest Shards should be restored (5/5)');
console.log('✓ 4. Rebuilding the 5-Piece Holy Crest & permanent Shard stat blessings verified');

// Test all 5 classes
for (const cid of ['knight', 'ranger', 'pyromancer', 'paladin', 'assassin']) {
  game.spawnNewHero(cid);
  assert.strictEqual(game.player.classId, cid);
  assert(game.player.stats.hp >= 150, `Class ${cid} should have valid HP`);
}
game.spawnNewHero('knight');
console.log('✓ 5. All 5 Champion classes verified');

// Test Melee Slash & Blade Beam + 360° Spin Attack
const initialProjCount = game.projectiles.length;
game.performPrimaryAttack(false);
assert(game.projectiles.length > initialProjCount, 'Full-HP Vanguard should fire a Blade Beam on slash');
game.performPrimaryAttack(true);
assert(game.player.isSpinSlash === true, 'Spin attack flag should activate on charged spin');
console.log('✓ 6. Blade Slash, Full-HP Beam & 360° Hurricane Spin verified');

// Test Bulwark Perfect Shield Parry reflecting an enemy bullet
game.projectiles = [];
game.player.shielding = true;
game.player.shieldRaiseTime = game.time;
game.player.aimAngle = 0;
const enemyBullet = {
  x: game.player.x + 0.3,
  y: game.player.y,
  vx: -8,
  vy: 0,
  dmg: 80,
  fromEnemy: true,
  ownerName: 'Serpent Empress of the Blight'
};
game.projectiles.push(enemyBullet);
game.damagePlayer(80, enemyBullet, 'Serpent Empress of the Blight');
assert.strictEqual(enemyBullet.fromEnemy, false, 'Perfect Parry must reflect enemy bullet back at enemies!');
assert.strictEqual(game.player.parries, 1, 'Parry counter should increment');
console.log('✓ 7. Bulwark Shield Perfect Parry bullet reflection verified');

// Test Sacred Relics (Chakram & Bomb cracking secret wall)
game.player.mp = 250;
game.useRelicAbility();
assert(game.boomerangs.length > 0, 'Chakram relic should spawn active chakram');

const crackedIdx = game.currentMap.tiles.findIndex((t) => t === 15);
assert(crackedIdx !== -1, 'Sanctuary should have a secret Cracked Wall');
const cx = (crackedIdx % game.currentMap.width) + 0.5;
const cy = Math.floor(crackedIdx / game.currentMap.width) + 0.5;
game.detonateBomb({ x: cx, y: cy, radius: 3.0, dmg: 300, armorBreak: true });
assert.notStrictEqual(game.currentMap.tiles[crackedIdx], 15, 'Bomb explosion must blast open Cracked Wall!');
console.log('✓ 8. Sacred Relics & Secret Cracked Wall destruction verified');

// Test Stat Potions, 6 Dungeons & Lumina Wisp Revival / Permadeath
game.player.inventory[0] = 'pot_def';
const prevDef = game.player.baseStats.def;
game.useOrEquipItem('inventory', 0);
assert.strictEqual(game.player.baseStats.def, prevDef + 1, 'Drinking Potion of Defense must permanently increase base DEF');

for (const did of ['pirate_cove', 'deku_temple', 'sprite_world', 'undead_lair', 'abyss_mountain', 'mad_sanctum']) {
  game.warpToMap('dungeon', { dungeonId: did });
  assert.strictEqual(game.currentMap.id, `dungeon_${did}`);
  const hasBoss = game.enemies.some((e) => e.isBoss);
  assert(hasBoss, `Dungeon ${did} must spawn its Sanctum Guardian Boss`);
}

// Test Auto-Opening & Auto-Closing World-Space Loot Chest Popup (#world-loot-popup)
game.warpToMap('nexus');
const testChestProp = { type: 'chest', x: 18, y: 18, opened: false, loot: ['wep_sword_t2', 'pot_spd'] };
game.currentMap.props.push(testChestProp);
// Walk near the treasure chest (within 2.15 tiles)
game.player.x = 18.8;
game.player.y = 18.0;
game.updateDropsAndBags(0.016);
hud.updateFrameHud();

assert.strictEqual(testChestProp.opened, true, 'Walking near a Treasure Chest must auto-open it');
const worldPopup = getMockEl('world-loot-popup');
assert.strictEqual(worldPopup.style.display, 'block', 'Walking near a Loot Chest must auto-open #world-loot-popup next to it');
assert(
  getMockEl('world-loot-grid').innerHTML.includes('wep_sword_t2'),
  '#world-loot-grid must display the chest contents'
);

// Walk away from the chest (> 2.25 tiles) -> popup must auto-close!
game.player.x = 24.0;
game.player.y = 24.0;
hud.updateFrameHud();
assert.strictEqual(worldPopup.style.display, 'none', 'Walking away from the Loot Chest must auto-close #world-loot-popup');

// Walk back near the chest & Loot All -> popup must auto-close when emptied!
game.player.x = 18.5;
game.player.y = 18.0;
hud.updateFrameHud();
assert.strictEqual(worldPopup.style.display, 'block', 'Walking back near the Loot Chest must re-open #world-loot-popup');
const activeBag = game.getNearestBag();
assert(activeBag, 'Nearest bag should be found when standing next to chest');
game.lootAllFromBag(activeBag);
hud.updateFrameHud();
assert.strictEqual(worldPopup.style.display, 'none', 'Emptying the Loot Chest must auto-close #world-loot-popup');
console.log('✓ 9. Auto-opening & auto-closing floating Loot Chest popup (#world-loot-popup) verified');

game.player.shielding = false;
game.player.invulnTimer = 0;
game.player.dashTimer = 0;
game.player.inventory[0] = 'con_fairy';
game.damagePlayer(9999, null, 'Malakor, the Evil Bane');
assert.strictEqual(game.player.dead, false, 'Bottled Lumina Wisp in inventory must save player from fatal hit!');
assert.strictEqual(game.player.inventory[0], null, 'Bottled Lumina Wisp should be consumed on revival');

game.player.invulnTimer = 0;
game.damagePlayer(9999, null, 'Malakor, the Evil Bane');
assert.strictEqual(game.player.dead, true, 'Fatal hit without Lumina Wisp must trigger Permadeath');
assert(game.gravestones.length === 1, 'Permadeath must leave a physical Gravestone on the map');
console.log('✓ 10. Dungeons, Stat Potions, Lumina Wisp Revival & Permadeath verified');

console.log('\nALL 10 REALM OF THE SHATTERED CREST TEST SUITES PASSED!');
