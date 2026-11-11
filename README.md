# Realm of the Shattered Crest

A top-down bullet-hell **MMO Action RPG** in the spirit of *Realm of the Mad God (RotMG)* with classic top-down action-adventure swordplay, dungeon puzzle relics, and permadeath progression.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Farron21%2Frealm-of-the-shattered-crest)

## Lore: Chronicle of the Shattered Holy Crest
For a thousand generations, the **Holy Crest of Aethelgard** blazed atop the Radiant Spire, holding back **Malakor, the Evil Bane** and his legions of Abyssal Blight. On the Night of the Blood Eclipse, Malakor struck the Spire with the Abyssal Calamity Spear. Rather than surrender its light, the Holy Crest shattered into **Five Sacred Shards**, scattering across five fallen sanctums:
1. **The Tide-Crest Shard** — Guarded by *Dread Captain Vorath* in the **Sunken Corsair Grotto** (`+25 Max HP, +2 SPD`)
2. **The Wild-Crest Shard** — Guarded by *Arachne the Blightweaver* in the **Blighted Briar Sanctum** (`+25 Max HP, +2 DEX`)
3. **The Astral-Crest Shard** — Guarded by *Aetherion the Astral Archon* in the **Astral Nexus Spire** (`+20 Max MP, +2 WIS`)
4. **The Ossuary-Crest Shard** — Guarded by *Mordecai the Undying Lich* in the **Forsaken Ossuary Crypt** (`+2 ATK, +2 VIT`)
5. **The Flame-Crest Shard** — Guarded by *Ignis the Magma Overlord* in the **Caldera of the Cinder King** (`+25 Max HP, +3 DEF`)

Speak with **High Elder Vaelen** (`[E]` or `📜 Elder & Lore`) in the center of **The Radiant Sanctuary Hub** to read the full four-chapter chronicle, track your restored shards, and warp into each sanctum to rebuild the Holy Crest piece by piece!

## Core Features
- **Top-Down Action-Adventure Combat + Bullet-Hell**:
  - Wide `180°` directional weapon arcs that cleave enemies, cut bushes, smash ancient urns, and flip Crystal Switches.
  - **Full-Health Blade Beams** and charged **`360°` Hurricane Spin Attacks** (hold Left-Click for `0.55s` and release) that deflect enemy projectiles.
  - **Bulwark Shield Blocking & Perfect Parry**: Hold Right-Click to block `80%` of frontal projectile damage, or time your shield raise within `0.25s` of impact to **reflect enemy bullets back at `300%` damage**.
  - **Sacred Dungeon Relics (`Q`)**: Tempest Chakram (stuns & vacuums loot bags/hearts), Chain-Grapple (grapples across water/lava to Anchor Pillars with i-frames), Brimstone Bombs (shatters armor & blasts open secret Cracked Walls), Sanctuary Warhorn (party-wide heal + `Damaging`/`Speedy`/`Armored` buffs), and Scepter of Rime.
- **`8/8` Stat Maxing, Loot Bags & Permadeath**:
  - 5 Playable Classes (`Aethelgard Vanguard`, `Sylvan Warden`, `Cinder Pyromancer`, `Solar Templar`, `Nightblade Stalker`).
  - Level `1–20` progression + permanent **Stat Potions** (`LIFE`, `MANA`, `ATK`, `DEF`, `SPD`, `DEX`, `VIT`, `WIS`) up to glowing gold **`8/8 MAXED`**.
  - Physical colored Loot Bags (`Brown`, `Pink`, `Purple`, `Cyan`, `Blue Potion Bag`, `Orange ST Bag`, and **Legendary `WHITE BAG`** with `UT` items and **Holy Crest Shards**).
  - **Bottled Lumina Wisp** auto-revival on fatal damage, or **Permadeath** with tiered Gravestones, Fame Bonuses, Class Star Ranks, and a persistent **Account Vault**.

## Local Development & Build

```bash
npm run build   # Bundles modular ES source into public/index.html
npm test        # Runs automated verification test suite
npm start       # Starts HTTP + WebSocket MMO server on port 4000
```
