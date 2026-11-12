// ============================================================================
// REALM OF THE SHATTERED CREST — SELF-CONTAINED BUNDLER & ARTIFACT BUILDER
// Bundles modular ES modules + CSS into public/index.html AND the Artifact HTML
// ============================================================================

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

function stripImportsAndExports(code) {
  return code
    .replace(/^\s*import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*export\s+default\s+/gm, '')
    .replace(/^\s*export\s+(const|let|var|function|class)\s+/gm, '$1 ');
}

function buildHtmlBundle() {
  const css = fs.readFileSync(path.join(ROOT, 'src/styles/main.css'), 'utf8');

  const moduleOrder = [
    'src/data/classes.js',
    'src/data/items.js',
    'src/data/enemies.js',
    'src/data/worldgen.js',
    'src/audio/sound.js',
    'src/graphics/sprites.js',
    'src/engine/game.js',
    'src/ui/hud.js',
    'src/main.js'
  ];

  const combinedJs = moduleOrder
    .map((relPath) => {
      const raw = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
      return `// --- MODULE: ${relPath} ---\n` + stripImportsAndExports(raw);
    })
    .join('\n\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Realm of the Shattered Crest — Top-Down Bullet-Hell MMO Action RPG</title>
  <meta name="description" content="Rebuild the shattered Holy Crest piece by piece across five fallen realms to vanquish Malakor, the Evil Bane in this top-down bullet-hell MMO Action RPG." />
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
${css}
  </style>
</head>
<body>
  <h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);">Realm of the Shattered Crest — Top-Down Bullet-Hell MMO Action RPG</h1>

  <main id="app-root">
    <!-- CENTER / LEFT GAME VIEWPORT -->
    <section id="viewport-wrap" aria-label="Game World Viewport">
      <canvas id="game-canvas"></canvas>

      <!-- TOP-LEFT LIFE HEARTS, HOLY CREST SHARDS & CURRENCY HUD -->
      <div id="top-left-hud">
        <div class="hud-card" id="status-hud-card">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:4px;">
            <strong id="hud-zone-title" style="font-size:12px;color:#fde047;letter-spacing:0.03em;">The Radiant Sanctuary Hub</strong>
            <span id="hud-star-badge" style="font-size:11.5px;font-weight:900;color:#93c5fd;" title="Class Star Rank">★ 2</span>
          </div>
          <div id="life-hearts-row" title="Life Heart Containers (Each Heart = 50 HP)"></div>
          <!-- Compact Mobile HP/MP Live Bars (Shown on Mobile when Drawer is Closed) -->
          <div id="mobile-status-bars">
            <div class="mobile-mini-bar">
              <div id="mobile-hp-fill" class="mobile-mini-fill" style="width:100%;background:linear-gradient(90deg,#dc2626,#ef4444);"></div>
              <span id="mobile-hp-text" class="mobile-mini-label">HP 200/200</span>
            </div>
            <div class="mobile-mini-bar">
              <div id="mobile-mp-fill" class="mobile-mini-fill" style="width:100%;background:linear-gradient(90deg,#2563eb,#3b82f6);"></div>
              <span id="mobile-mp-text" class="mobile-mini-label">MP 100/100</span>
            </div>
          </div>
          <div id="hud-currencies-row" style="display:flex;align-items:center;gap:10px;margin-top:5px;font-size:10.5px;font-weight:800;flex-wrap:wrap;">
            <span id="hud-crest-badge" style="color:#22d3ee;cursor:pointer;" title="Inspect the 5 Shards of the Holy Crest & Elder Vaelen's Lore">✨ <span id="hud-crest-shards">0/5</span> Shards</span>
            <span style="color:#4ade80;" title="Sunshards (Collected from Bushes, Urns & Enemies)">◆ <span id="hud-sunshards">150</span></span>
            <span style="color:#facc15;" title="Persistent Account Fame">★ <span id="hud-account-fame">250</span></span>
          </div>
        </div>

        <div class="hud-card desktop-controls-legend" style="padding:6px 10px;font-size:10.5px;color:#cbd5e1;line-height:1.45;">
          <div><strong style="color:#fde047;">L-Click:</strong> Blade Slash + Beam <em>(Hold: 360° Spin!)</em></div>
          <div><strong style="color:#38bdf8;">R-Click:</strong> Shield Block &amp; <strong>Perfect Parry</strong> | <strong style="color:#4ade80;">Shift:</strong> Roll</div>
          <div><strong style="color:#f472b6;">Q:</strong> Sacred Relic | <strong style="color:#22d3ee;">E / L:</strong> Elder &amp; Lore | <strong style="color:#60a5fa;">R:</strong> Sanctuary</div>
        </div>
      </div>

      <!-- TOP-CENTER ACTION BAR (MODALS, DRAWER & AUDIO) -->
      <nav id="top-action-bar" aria-label="Sanctuary Modals and Audio">
        <button id="btn-toggle-drawer" class="hud-btn mobile-only-btn primary-gold" title="Open Hero Stats, Radar, Gear & Backpack">🎒 <span class="btn-label">Gear</span> <span id="mobile-bag-badge">0/8</span></button>
        <button id="btn-open-elder" class="hud-btn primary-gold" title="Speak with High Elder Vaelen — Lore & Holy Crest Shards (Hotkey: L)">📜 <span class="btn-label">Lore</span></button>
        <button id="btn-open-classes" class="hud-btn" title="Switch or Inspect 5 Hero Classes">🛡️ <span class="btn-label">Classes</span></button>
        <button id="btn-open-vault" class="hud-btn" title="Open Persistent Account Vault & Potion Storage">📦 <span class="btn-label">Vault</span></button>
        <button id="btn-open-forge" class="hud-btn" title="Craft Stat Potions & Legendary UT White Bag Relics">⚒️ <span class="btn-label">Forge</span></button>
        <button id="btn-toggle-chat" class="hud-btn mobile-only-btn" title="Toggle Realm Chat">💬</button>
        <button id="btn-toggle-audio" class="hud-btn" title="Toggle 16-Bit Chiptune Audio">🔊</button>
      </nav>

      <!-- INTERACT PROMPT BANNER -->
      <div id="interact-banner">Speak with High Elder Vaelen [E]</div>

      <!-- AUTO-OPENING / AUTO-CLOSING FLOATING LOOT CHEST POPUP NEXT TO CHEST -->
      <div id="world-loot-popup" aria-live="polite">
        <div class="world-loot-header">
          <span id="world-loot-title">Loot Chest</span>
          <button id="world-loot-take-all" type="button" title="Loot or Drink All Items">Loot All</button>
        </div>
        <div id="world-loot-grid" class="item-grid-4"></div>
        <div id="world-loot-inspector" class="inline-item-inspector" style="display:none;"></div>
        <div class="world-loot-hint">Tap item to view stats • Auto-closes when moving away</div>
      </div>

      <!-- MOBILE QUICK-BELT (First 4 Backpack Slots — Tap to View Stats & Equip/Drink!) -->
      <div id="quick-belt-inspector" class="inline-item-inspector floating-belt-inspector" style="display:none;"></div>
      <div id="mobile-quick-belt" aria-label="Quick Backpack Belt"></div>

      <!-- MOBILE TWIN-STICK VIRTUAL TOUCH CONTROLS (Left Move Stick + Right Aim/Attack & Skills) -->
      <div id="mobile-touch-controls" aria-label="Mobile Touch Controls">
        <!-- Left Thumb: 360° Analog Movement Joystick -->
        <div id="touch-joystick-zone">
          <div id="joystick-base">
            <div id="joystick-knob"></div>
          </div>
        </div>

        <!-- Right Thumb: Twin-Stick Attack/Aim Pad + Radial Skill Arc -->
        <div id="touch-action-cluster">
          <button id="btn-touch-relic" class="touch-skill-btn relic-btn" type="button" aria-label="Use Sacred Relic">
            <span class="touch-icon">✨</span>
            <span class="touch-sub">RELIC</span>
          </button>
          <button id="btn-touch-shield" class="touch-skill-btn shield-btn" type="button" aria-label="Raise Shield or Perfect Parry">
            <span class="touch-icon">🛡️</span>
            <span class="touch-sub">PARRY</span>
          </button>
          <button id="btn-touch-dash" class="touch-skill-btn dash-btn" type="button" aria-label="Dodge Roll">
            <span class="touch-icon">💨</span>
            <span class="touch-sub">DASH</span>
          </button>
          <button id="btn-touch-pot" class="touch-skill-btn pot-btn" type="button" aria-label="Lift or Throw Urn">
            <span class="touch-icon">🏺</span>
            <span class="touch-sub">URN</span>
          </button>
          <div id="btn-touch-attack" role="button" aria-label="Hold or Drag to Aim and Attack">
            <div id="attack-stick-knob">
              <span class="attack-icon">⚔️</span>
              <span class="attack-sub">SLASH</span>
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOM-LEFT MMO CHAT & CALLOUTS -->
      <aside id="bottom-left-chat" aria-label="MMO Realm Chat">
        <div id="chat-messages"></div>
        <div id="chat-input-row">
          <input id="chat-input" type="text" placeholder="Tap to chat or type /elder, /glands, /boss, /max88, /whitebag..." />
        </div>
      </aside>
    </section>

    <!-- MOBILE DRAWER BACKDROP SCRIM -->
    <div id="mobile-drawer-backdrop"></div>

    <!-- RIGHT-SIDE SIDEBAR (SLIDE-OVER DRAWER ON MOBILE PHONES) -->
    <aside id="rotmg-sidebar" aria-label="Character HUD and Inventory">
      <div id="mobile-drawer-header">
        <strong style="color:#fde047;font-size:13px;letter-spacing:0.04em;">🎒 HERO, RADAR &amp; BACKPACK</strong>
        <button id="btn-close-drawer" class="hud-btn" type="button">✕ Close</button>
      </div>
      <!-- 1. MINIMAP -->
      <div class="sidebar-section">
        <div class="section-header">
          <span>Realm Radar</span>
          <span style="color:#38bdf8;font-size:9.5px;">Tap Green Dot to TP</span>
        </div>
        <div id="minimap-wrap">
          <canvas id="minimap-canvas" width="268" height="148"></canvas>
        </div>
      </div>

      <!-- 2. NEARBY MMO PARTY PLAYERS (CLICK TO TELEPORT!) -->
      <div class="sidebar-section">
        <div class="section-header">
          <span>MMO Realm Party</span>
          <span style="color:#4ade80;">● Online</span>
        </div>
        <div id="party-list"></div>
      </div>

      <!-- 3. LEVEL / FAME / HP / MP BARS -->
      <div class="sidebar-section">
        <div class="stat-bar-outer">
          <div id="bar-xp-fill" class="stat-bar-fill" style="width:0%;background:#22c55e;"></div>
          <div id="bar-xp-label" class="stat-bar-label"><span>LVL 1</span><span>0/100 XP</span></div>
        </div>
        <div class="stat-bar-outer">
          <div id="bar-hp-fill" class="stat-bar-fill" style="width:100%;background:linear-gradient(90deg,#dc2626,#ef4444);"></div>
          <div id="bar-hp-label" class="stat-bar-label"><span>HP</span><span>200/200</span></div>
        </div>
        <div class="stat-bar-outer" style="margin-bottom:0;">
          <div id="bar-mp-fill" class="stat-bar-fill" style="width:100%;background:linear-gradient(90deg,#2563eb,#3b82f6);"></div>
          <div id="bar-mp-label" class="stat-bar-label"><span>MP</span><span>100/100</span></div>
        </div>
      </div>

      <!-- 4. 8-STAT MAXING PANEL (0/8 TO 8/8) -->
      <div class="sidebar-section">
        <div class="section-header">
          <span>Hero Stats</span>
          <span id="maxed-counter-badge" style="color:#93c5fd;">0/8 MAXED</span>
        </div>
        <div id="stats-grid"></div>
      </div>

      <!-- 5. EQUIPPED GEAR (WEAPON, SACRED RELIC, ARMOR, RING) -->
      <div class="sidebar-section">
        <div class="section-header">
          <span>Equipped Relics</span>
          <span style="color:#fde047;font-size:9.5px;">Tap to View Stats</span>
        </div>
        <div id="equipment-grid" class="item-grid-4"></div>
      </div>

      <!-- 6. 8-SLOT INVENTORY BACKPACK -->
      <div class="sidebar-section">
        <div class="section-header">
          <span>Backpack (Keys 1–8)</span>
          <span style="color:#38bdf8;font-size:9.5px;">Tap to View Stats</span>
        </div>
        <div id="inventory-grid" class="item-grid-4"></div>
      </div>

      <!-- 6b. SELECTED ITEM STATS & EQUIP INSPECTOR PANEL -->
      <div id="item-inspector-panel" class="sidebar-section inline-item-inspector" style="display:none;"></div>

      <!-- 7. GROUND LOOT BAG VIEWER (DYNAMIC) -->
      <div id="loot-bag-section" class="sidebar-section">
        <div class="section-header">
          <span id="loot-bag-title">Loot Bag</span>
          <span style="color:#fde047;font-size:9.5px;">Tap to View Stats</span>
        </div>
        <div id="loot-bag-grid" class="item-grid-4"></div>
      </div>
    </aside>
  </main>

  <!-- HOVER ITEM TOOLTIP -->
  <div id="item-tooltip"></div>

  <!-- MODAL 0: HIGH ELDER VAELEN — CHRONICLE OF THE SHATTERED HOLY CREST -->
  <div id="modal-elder" class="modal-backdrop">
    <div class="modal-card" style="width:760px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h2 style="margin:0;font-size:18px;color:#fde047;">📜 High Elder Vaelen — Chronicle of the Shattered Crest</h2>
          <div style="font-size:11.5px;color:#38bdf8;font-weight:700;margin-top:2px;">
            Keeper of the Radiant Sanctuary &amp; Guardian of the Five Sacred Seals
          </div>
        </div>
        <button class="hud-btn modal-close-btn">✕ Close</button>
      </div>

      <div id="elder-crest-status" style="margin:10px 0;padding:8px 12px;background:rgba(234,179,8,0.12);border:1px solid rgba(250,204,21,0.45);border-radius:6px;font-size:12px;"></div>

      <div style="font-size:11.5px;font-weight:800;color:#22d3ee;text-transform:uppercase;letter-spacing:0.05em;margin-top:8px;">
        The Five Shattered Shards of the Holy Crest (Rebuild Piece by Piece)
      </div>
      <div id="elder-shards-grid" class="class-cards-grid" style="margin-bottom:14px;"></div>

      <div style="font-size:11.5px;font-weight:800;color:#fde047;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">
        The Elder's Chronicle: How the Holy Crest Held Back Evil Bane
      </div>
      <div id="elder-lore-chapters"></div>
    </div>
  </div>

  <!-- MODAL 1: PLAYABLE CLASSES SELECTOR -->
  <div id="modal-classes" class="modal-backdrop">
    <div class="modal-card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="margin:0;font-size:18px;color:#fde047;">Choose Your Champion of the Reborn Crest</h2>
        <button class="hud-btn modal-close-btn">✕ Close</button>
      </div>
      <p style="font-size:12px;color:#94a3b8;margin:6px 0 0;">
        Each champion pairs a signature primary weapon with a Sacred Dungeon Relic and unique 8/8 stat caps.
      </p>
      <div id="classes-modal-grid" class="class-cards-grid"></div>
    </div>
  </div>

  <!-- MODAL 2: PERSISTENT ACCOUNT VAULT -->
  <div id="modal-vault" class="modal-backdrop">
    <div class="modal-card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="margin:0;font-size:18px;color:#38bdf8;">Sacred Account Vault (Persists Across Permadeath!)</h2>
        <button class="hud-btn modal-close-btn">✕ Close</button>
      </div>
      <p style="font-size:12px;color:#94a3b8;margin:6px 0 12px;">
        Tap any item in your Backpack or Vault Chests to view its stats, then tap Deposit, Withdraw, or Equip.
      </p>
      <div style="font-size:11px;font-weight:800;color:#fde047;margin-bottom:6px;">YOUR HERO BACKPACK (TAP ITEM TO VIEW STATS)</div>
      <div id="vault-player-inv" class="item-grid-4" style="margin-bottom:14px;"></div>
      <div style="font-size:11px;font-weight:800;color:#38bdf8;margin-bottom:6px;">ACCOUNT VAULT CHESTS (TAP ITEM TO VIEW STATS)</div>
      <div id="vault-chest-grid" class="item-grid-4"></div>
      <div id="vault-item-inspector" class="inline-item-inspector" style="display:none;margin-top:12px;"></div>
    </div>
  </div>

  <!-- MODAL 3: ANCIENT RELIC & UT FORGE -->
  <div id="modal-forge" class="modal-backdrop">
    <div class="modal-card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h2 style="margin:0;font-size:18px;color:#f97316;">Ancient Relic &amp; White Bag Forge</h2>
        <button class="hud-btn modal-close-btn">✕ Close</button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0 10px;">
        <span style="font-size:12px;color:#94a3b8;">Spend Sunshards &amp; Account Fame to forge Stat Potions or Legendary UT White Bag items!</span>
        <strong id="forge-sunshard-balance" style="font-size:12px;color:#4ade80;">150 Sunshards</strong>
      </div>
      <div id="forge-recipes-grid" class="class-cards-grid"></div>
    </div>
  </div>

  <!-- MODAL 4: PERMADEATH & FAME LEGACY SUMMARY -->
  <div id="modal-death" class="modal-backdrop">
    <div class="modal-card" style="max-width:480px;">
      <div id="death-summary-body"></div>
      <div style="display:flex;justify-content:center;">
        <button id="btn-respawn-hero" class="hud-btn primary-gold" style="padding:9px 22px;font-size:13px;">
          ★ Reincarnate in the Radiant Sanctuary ★
        </button>
      </div>
    </div>
  </div>

  <script>
(() => {
${combinedJs}
})();
  </script>
</body>
</html>`;

  try {
    const pubDir = path.join(ROOT, 'public');
    if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
    const pubFile = path.join(pubDir, 'index.html');
    fs.writeFileSync(pubFile, html, 'utf8');
    fs.writeFileSync(path.join(ROOT, 'index.html'), html, 'utf8');
    fs.writeFileSync(
      path.join(pubDir, 'health.json'),
      JSON.stringify({ status: 'ok', game: 'Realm of the Shattered Crest', onlinePlayers: 12 }),
      'utf8'
    );
    console.log('Built:', pubFile, `(${Math.round(html.length / 1024)} KB)`);
  } catch (e) {
    console.warn('Skipping disk write (read-only environment):', e.message);
  }

  try {
    const artifactDir = '/home/antigravity/.gemini/jetski/brain/v1/default/jetski_remote_agents_3p/9892f356-4096-4a6f-8f06-ec30c24612d9';
    if (fs.existsSync(artifactDir)) {
      const artifactFile = path.join(artifactDir, 'realm_of_the_shattered_crest.html');
      fs.writeFileSync(artifactFile, html, 'utf8');
    }
  } catch (e) {}

  return html;
}

if (require.main === module) {
  buildHtmlBundle();
}

module.exports = { buildHtmlBundle };
