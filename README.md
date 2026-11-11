# Realm of the Shattered Crest

An MMO Action RPG in the spirit of **Realm of the Mad God (RotMG)** that plays like a traditional top-down **Legend of Zelda** game (*A Link to the Past* / *Minish Cap*).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Farron21%2Frealm-of-the-shattered-crest)

## 1-Click Vercel Deployment
- **Import / Clone on Vercel**: [https://vercel.com/new/clone?repository-url=https://github.com/arron21/realm-of-the-shattered-crest](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Farron21%2Frealm-of-the-shattered-crest)
- **Or Import Existing Repo**: Go to [https://vercel.com/new](https://vercel.com/new) and select `arron21/realm-of-the-shattered-crest`.

## Core Features
- **Top-Down Zelda Combat + RotMG Bullet-Hell**:
  - Wide `180°` directional sword arcs that cleave enemies, cut bushes, smash ceramic pots, and flip Crystal Switches.
  - **Full-Health Sword Beams** and charged **`360°` Hurricane Spin Attacks** (hold Left-Click for `0.55s` and release) that deflect enemy projectiles.
  - **Hylian Shield Blocking & Perfect Parry**: Hold Right-Click to block `80%` of frontal projectile damage, or time your shield raise within `0.25s` of impact to **reflect enemy bullets back at `300%` damage**.
  - **Zelda Dungeon Relics (`Q`)**: Gale Boomerang (stuns & vacuums loot bags/hearts), Hookshot (grapples across water/lava to Grapple Pillars with i-frames), Bombs (shatters armor & blasts open secret Cracked Walls), Sacred Ocarina (party-wide heal + `Damaging`/`Speedy`/`Armored` buffs), and Frost/Byrna Wand.
- **RotMG `8/8` Stat Maxing, Loot Bags & Permadeath**:
  - 5 Playable Classes (`Hylian Knight`, `Kokiri Ranger`, `Goron Pyromancer`, `Royal Paladin`, `Sheikah Shadow`).
  - Level `1–20` progression + permanent **Stat Potions** (`LIFE`, `MANA`, `ATK`, `DEF`, `SPD`, `DEX`, `VIT`, `WIS`) up to glowing gold **`8/8 MAXED`**.
  - Physical colored Loot Bags (`Brown`, `Pink`, `Purple`, `Cyan`, `Blue Potion Bag`, `Orange ST Bag`, and **Legendary `WHITE BAG`** with `UT` items).
  - **Bottled Fairy** auto-revival on fatal damage, or **Permadeath** with tiered Gravestones, Fame Bonuses, Class Star Ranks, and a persistent **Account Vault**.

## Local Development & Build

```bash
npm run build   # Bundles modular ES source into public/index.html
npm test        # Runs automated verification test suite
npm start       # Starts HTTP + WebSocket MMO server on port 4000
```
