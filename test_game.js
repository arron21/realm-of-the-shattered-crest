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
assert.strictEqual(game.aiPlayers.length, 0, 'Starting area (nexus) must have zero fake AI characters');
assert(
  !/btn-warp-nexus|btn-warp-realm|btn-warp-godlands|btn-warp-sanctum|elder-warp-btn/.test(html),
  'Top action bar and Elder menu must not contain automatic teleport buttons'
);
console.log('✓ 2. GameEngine booted cleanly in The Radiant Sanctuary Hub (zero fake characters, no menu auto-teleport)');

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

// Suite 11: Mobile Phone UI/UX — Twin-Stick Touch Controls, Smart Auto-Aim, Quick-Belt & Slide-Over Drawer
game.spawnNewHero('knight');
game.warpToMap('nexus');
const startX = game.player.x;
game.touch.active = true;
game.touch.moveX = 1.0;
game.touch.moveY = 0;
game.updatePlayer(0.1);
assert(game.player.x > startX, 'Mobile left virtual joystick (touch.moveX) must move the hero smoothly');
game.touch.moveX = 0;

// Test Smart Auto-Aim toward nearest enemy when right attack pad is tapped without dragging
game.enemies.push({
  id: 'mob_test_1',
  name: 'Test Construct',
  x: game.player.x,
  y: game.player.y - 4.0,
  hp: 100,
  maxHp: 100
});
const autoAngle = game.findAutoAimAngle();
assert(Math.abs(autoAngle - (-Math.PI / 2)) < 0.05, 'Smart Auto-Aim must lock onto the nearest enemy within range');

// Test Mobile Dash button trigger
game.player.dashCooldown = 0;
const dashed = game.triggerDash();
assert.strictEqual(dashed, true, 'Mobile Dash button (triggerDash) must activate Windstep Dash');

// Test Mobile 4-Slot Quick-Belt & Slide-Over Drawer
game.player.inventory[0] = 'pot_def';
hud.refreshAllStatsAndSlots();
assert(
  getMockEl('mobile-quick-belt').innerHTML.includes('pot_def'),
  'Mobile 4-Slot Quick-Belt (#mobile-quick-belt) must render the first 4 backpack slots'
);
hud.toggleMobileDrawer(true);
assert.strictEqual(hud.mobileDrawerOpen, true, 'Mobile Gear Drawer must open when toggled on');
hud.toggleMobileDrawer(false);
assert.strictEqual(hud.mobileDrawerOpen, false, 'Mobile Gear Drawer must close when toggled off');
console.log('✓ 11. Mobile Phone UI/UX (Twin-Stick Touch Controls, Smart Auto-Aim, Quick-Belt & Slide-Over Gear Drawer) verified');

// Suite 12: Tap-to-View Item Stats & Tap-to-Equip / Drink / Drop Inspector Panel
game.player.inventory[1] = 'wep_sword_t2';
hud.refreshAllStatsAndSlots();
const selectedOk = hud.selectItemSlot('inventory', 1);
assert.strictEqual(selectedOk, true, 'Tapping an inventory slot must select the item for inspection');
const inspectorPanel = getMockEl('item-inspector-panel');
assert.strictEqual(inspectorPanel.style.display, 'block', 'Selecting an inventory item must display #item-inspector-panel');
assert(
  inspectorPanel.innerHTML.includes('Damage:') && inspectorPanel.innerHTML.includes('Equip WEAPON'),
  '#item-inspector-panel must show the weapon damage stats and an explicit Equip WEAPON button'
);

// Tap the Equip WEAPON button in the inspector
const equippedOk = hud.executeInspectorAction('primary', 'inventory', 1);
assert.strictEqual(equippedOk, true, 'Tapping the Equip button in the inspector must equip the weapon');
assert.strictEqual(game.player.equipment.weapon, 'wep_sword_t2', 'Hero weapon slot must now hold wep_sword_t2');
assert.strictEqual(inspectorPanel.style.display, 'none', 'Inspector panel must close cleanly after equipping');

// Tap Quick-Belt slot 0 (pot_def) to inspect on the main combat screen, then tap Drink
const beltSelected = hud.selectItemSlot('quick_belt', 0);
assert.strictEqual(beltSelected, true, 'Tapping a Quick-Belt slot must select it');
const beltInspector = getMockEl('quick-belt-inspector');
assert.strictEqual(beltInspector.style.display, 'block', 'Tapping a Quick-Belt slot must open #quick-belt-inspector');
assert(
  beltInspector.innerHTML.includes('Drink Potion'),
  '#quick-belt-inspector must show potion stats and a Drink Potion button'
);
const defBeforeDrink = game.player.baseStats.def;
hud.executeInspectorAction('primary', 'quick_belt', 0);
assert.strictEqual(game.player.baseStats.def, defBeforeDrink + 1, 'Tapping Drink Potion in #quick-belt-inspector must consume the potion');
console.log('✓ 12. Tap-to-View Stats & Tap-to-Equip / Drink Inspector Panel verified');

// Suite 13: Multiplayer Login & 1 Unified Shared MMO Instance (Aethelgard-Prime)
const mmoApi = require('./api/mmo.js');
const loginRes1 = mmoApi.processMmoRequest('POST', {
  action: 'login',
  username: 'SirVaelen',
  password: 'pin123',
  playerId: 'hero_vaelen_1',
  classId: 'paladin',
  accountData: { sunshards: 300, accountFame: 500, crestShards: [true, true, false, false, false] }
});
assert.strictEqual(loginRes1.ok, true, 'Server /api/mmo login must succeed for Hero 1');
assert.strictEqual(loginRes1.instanceId, 'aethelgard-prime', 'All players must join the unified aethelgard-prime MMO instance');

// Wrong password check for protected Hero Name
const wrongPassRes = mmoApi.processMmoRequest('POST', {
  action: 'login',
  username: 'SirVaelen',
  password: 'wrong',
  playerId: 'impersonator_99'
});
assert.strictEqual(wrongPassRes.ok, false, 'Protected Hero Name must reject wrong passcode');

// Sync Hero 1 & Hero 2 into the same shared MMO instance
mmoApi.processMmoRequest('POST', {
  action: 'sync',
  player: {
    id: 'hero_vaelen_1',
    name: 'SirVaelen',
    classId: 'paladin',
    className: 'Solar Templar',
    x: 55,
    y: 55,
    mapId: 'realm',
    zoneName: 'Shattered Realm',
    maxedCount: 6,
    stars: 18
  },
  events: [
    { type: 'chat', sender: 'SirVaelen', text: 'Fighting Blight Gods in the Realm! TP to me!', color: '#4ade80' }
  ]
});

const syncRes2 = mmoApi.processMmoRequest('POST', {
  action: 'sync',
  player: {
    id: 'hero_solaris_2',
    name: 'Solaris',
    classId: 'ranger',
    className: 'Sylvan Windrunner',
    x: 22,
    y: 22,
    mapId: 'nexus',
    zoneName: 'The Radiant Sanctuary Hub',
    maxedCount: 8,
    stars: 25
  },
  sinceSeq: 0,
  sinceChatId: 0
});
assert.strictEqual(syncRes2.ok, true, 'Server /api/mmo sync must succeed for Hero 2');
assert(syncRes2.onlineCount >= 2, 'Shared MMO instance must report both logged-in heroes online');
assert(syncRes2.players.some((p) => p.name === 'SirVaelen'), 'Hero 2 sync response must include Hero 1 in the shared instance');
assert(syncRes2.chat.some((c) => c.sender === 'SirVaelen'), 'Global MMO chat must replicate across players in the instance');

// Client-side: Test remote player upsert, interpolation, party list rendering, and cross-map Teleport (TP)
game.warpToMap('nexus');
game.upsertRemotePlayer({
  id: 'hero_vaelen_1',
  name: 'SirVaelen',
  classId: 'paladin',
  className: 'Solar Templar',
  x: 60,
  y: 62,
  mapId: 'realm',
  zoneName: 'Shattered Realm',
  maxedCount: 6,
  stars: 18
}, true);
hud.renderPartyList();
assert(
  getMockEl('party-list').innerHTML.includes('SirVaelen') && getMockEl('party-list').innerHTML.includes('TP ➔'),
  'MMO Realm Party list (#party-list) must display real online players with TP button'
);

// Teleport to SirVaelen (who is in 'realm' while local player is in 'nexus')
const remoteAlly = game.remotePlayers.get('hero_vaelen_1');
game.teleportToPlayer(remoteAlly);
assert.strictEqual(game.currentMap.id, 'realm', 'Teleporting to an ally in another zone must warp the player to their map');
assert(Math.hypot(game.player.x - 60, game.player.y - 62) < 2.0, 'Teleporting to an ally must place the player at their coordinates');

// Test co-op Solar Templar Warhorn party buff replication
game.player.hp = 100;
const hpBeforeBuff = game.player.hp;
game.handleNetworkPacket({
  type: 'party_buff',
  id: 'hero_vaelen_1',
  senderName: 'SirVaelen',
  mapId: 'realm',
  x: game.player.x + 1.0,
  y: game.player.y,
  radius: 6.5,
  heal: 110,
  duration: 5.0,
  evId: 'test_warhorn_1'
});
assert(game.player.hp > hpBeforeBuff, 'Remote ally Solar Templar Warhorn must heal nearby players in the shared instance');
assert(game.player.buffs.damaging >= 4.5, 'Remote ally Solar Templar Warhorn must grant Damaging buff to nearby players');
console.log('✓ 13. Multiplayer Login & 1 Shared MMO Instance (Aethelgard-Prime sync, chat, party buff & cross-map TP) verified');

console.log('\nALL 13 REALM OF THE SHATTERED CREST TEST SUITES PASSED!');



