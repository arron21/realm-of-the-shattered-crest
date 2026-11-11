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
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
        <div class="hud-card">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:5px;">
            <strong id="hud-zone-title" style="font-size:12px;color:#fde047;letter-spacing:0.03em;">The Radiant Sanctuary Hub</strong>
            <span id="hud-star-badge" style="font-size:11.5px;font-weight:900;color:#93c5fd;" title="Class Star Rank">★ 2</span>
          </div>
          <div id="life-hearts-row" title="Life Heart Containers (Each Heart = 50 HP)"></div>
          <div style="display:flex;align-items:center;gap:12px;margin-top:6px;font-size:11px;font-weight:800;flex-wrap:wrap;">
            <span id="hud-crest-badge" style="color:#22d3ee;cursor:pointer;" title="Click to inspect the 5 Shards of the Holy Crest & Elder Vaelen's Lore">✨ <span id="hud-crest-shards">0/5</span> Crest Shards</span>
            <span style="color:#4ade80;" title="Sunshards (Collected from Bushes, Urns & Enemies)">◆ <span id="hud-sunshards">150</span> Sunshards</span>
            <span style="color:#facc15;" title="Persistent Account Fame">★ <span id="hud-account-fame">250</span> Fame</span>
          </div>
        </div>

        <div class="hud-card" style="padding:6px 10px;font-size:10.5px;color:#cbd5e1;line-height:1.45;">
          <div><strong style="color:#fde047;">L-Click:</strong> Blade Slash + Beam <em>(Hold: 360° Spin!)</em></div>
          <div><strong style="color:#38bdf8;">R-Click:</strong> Shield Block &amp; <strong>Perfect Parry</strong> | <strong style="color:#4ade80;">Shift:</strong> Roll</div>
          <div><strong style="color:#f472b6;">Q:</strong> Sacred Relic | <strong style="color:#22d3ee;">E / L:</strong> Elder &amp; Lore | <strong style="color:#60a5fa;">R:</strong> Sanctuary</div>
        </div>
      </div>

      <!-- TOP-CENTER ACTION BAR (MODALS & AUDIO) -->
      <nav id="top-action-bar" aria-label="Sanctuary Modals and Audio">
        <button id="btn-open-elder" class="hud-btn primary-gold" title="Speak with High Elder Vaelen — Lore & Holy Crest Shards (Hotkey: L)">📜 Elder &amp; Lore</button>
        <button id="btn-open-classes" class="hud-btn" title="Switch or Inspect 5 Hero Classes">🛡️ Classes (5)</button>
        <button id="btn-open-vault" class="hud-btn" title="Open Persistent Account Vault & Potion Storage">📦 Vault</button>
        <button id="btn-open-forge" class="hud-btn" title="Craft Stat Potions & Legendary UT White Bag Relics">⚒️ Forge</button>
        <button id="btn-toggle-audio" class="hud-btn" title="Toggle 16-Bit Chiptune Audio">🔊 Audio</button>
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
        <div class="world-loot-hint">Click item to loot/drink • Auto-closes when moving away</div>
      </div>

      <!-- BOTTOM-LEFT MMO CHAT & CALLOUTS -->
      <aside id="bottom-left-chat" aria-label="MMO Realm Chat">
        <div id="chat-messages"></div>
        <div id="chat-input-row">
          <input id="chat-input" type="text" placeholder="Press Enter to chat or type /elder, /glands, /boss, /max88, /whitebag..." />
        </div>
      </aside>
    </section>

    <!-- RIGHT-SIDE SIDEBAR -->
    <aside id="rotmg-sidebar" aria-label="Character HUD and Inventory">
      <!-- 1. MINIMAP -->
      <div class="sidebar-section">
        <div class="section-header">
          <span>Realm Radar</span>
          <span style="color:#38bdf8;font-size:9.5px;">Click Green Dot to TP</span>
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
          <span style="color:#fde047;font-size:9.5px;">[Q] Use Relic</span>
        </div>
        <div id="equipment-grid" class="item-grid-4"></div>
      </div>

      <!-- 6. 8-SLOT INVENTORY BACKPACK -->
      <div class="sidebar-section">
        <div class="section-header">
          <span>Backpack (Keys 1–8)</span>
          <span style="color:#94a3b8;font-size:9.5px;">Click to Drink/Equip</span>
        </div>
        <div id="inventory-grid" class="item-grid-4"></div>
      </div>

      <!-- 7. GROUND LOOT BAG VIEWER (DYNAMIC) -->
      <div id="loot-bag-section" class="sidebar-section">
        <div class="section-header">
          <span id="loot-bag-title">Loot Bag</span>
          <span style="color:#fde047;font-size:9.5px;">Nearby Drop</span>
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
        Click any item in your Backpack to deposit it into your Account Vault, or click a Vault slot to withdraw it.
      </p>
      <div style="font-size:11px;font-weight:800;color:#fde047;margin-bottom:6px;">YOUR HERO BACKPACK (CLICK TO DEPOSIT)</div>
      <div id="vault-player-inv" class="item-grid-4" style="margin-bottom:16px;"></div>
      <div style="font-size:11px;font-weight:800;color:#38bdf8;margin-bottom:6px;">ACCOUNT VAULT CHESTS (CLICK TO WITHDRAW)</div>
      <div id="vault-chest-grid" class="item-grid-4"></div>
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
