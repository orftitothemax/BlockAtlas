# BlockAtlas — Build Plan

**Goal:** a web app (runs in your phone's browser) that views Minecraft builds
in 3D, lets you swap blocks to preview looks, shows layer-by-layer build
instructions, imports/exports structure files, and eventually lets people
share builds. Bedrock-first (you're on Switch 2), Java formats supported too.

**How we work:** short sessions. Each task below is sized for one sitting.
Muse scaffolds, you run and test, we iterate. Nothing here requires writing
an NBT parser or 3D engine from scratch — we glue together proven libraries.

---

## Phase 1 — View (current)

Load structure files and orbit them in 3D. The foundation everything else
builds on.

- [x] Project scaffold: Vite + Three.js + prismarine-nbt (browser-safe via polyfills)
- [x] Parse `.nbt` (vanilla structure), `.schematic` / `.schem` (Sponge v1/v2/v3),
      legacy MCEdit `.schematic`, and Bedrock `.mcstructure` into one block list
- [x] 3D viewer: orbit/zoom, flat-shaded blocks, layer slider (0–N shows floors)
- [x] Sample hut generator + 14 automated parser checks (all passing)
- [ ] **Verify `.mcstructure` index order** against a real Bedrock file
      (order is currently assumed x-major and flagged in `src/formats.js`;
      if a real file renders scrambled, flip the one constant)
- [ ] Block inventory panel: list every block type + count (the "shopping list")
- [ ] Click a block to identify it (raycasting → show `minecraft:oak_planks`)
- [ ] Real Minecraft textures instead of flat colors: fetch the texture atlas
      from Mojang's piston-meta version manifest at build time
      (each user downloads Mojang's assets locally — we never ship them)

## Phase 2 — Swap

Preview material changes before committing to them in-game.

- [ ] Palette picker UI: click a block type in the inventory, choose a replacement
- [ ] Live re-render with the swap applied (no file changes yet)
- [ ] "Replace all" for a block type across the whole build
- [ ] Save the edited structure back to `.schematic` / `.mcstructure`
- [ ] Import via URL: paste a download link, fetch and load it directly
- [ ] Research: is there a public API for any build-sharing library
      (Planet Minecraft, minecraft-schematics.com)? Expectation: no —
      fallback is file upload + URL import, which covers 95% of use.

## Phase 3 — Build guides

Turn a structure into instructions a human (or the game) can follow.

- [ ] Layer-by-layer numbered guide view, printable / phone-friendly
- [ ] **`.mcfunction` export (Seth's idea):** generate a Bedrock behavior-pack
      function full of `/fill` commands that builds the structure in-game.
      Drop in a behavior pack, run `/function build_hut`, done.
- [ ] Material list grouped by "chest runs" (what to gather per trip)

## Phase 4 — Community (only if you still want it)

Uploading, sharing, accounts, discovery. This is the only phase with server
costs — and the only phase where monetization matters. Deliberately last:
everything before it runs free on your PC with zero hosting.

- [ ] Upload + browse + search for shared builds
- [ ] Accounts (start with simple tokens, not full auth)
- [ ] Basic moderation / reporting
- [ ] Cost check: static hosting + file storage is a few dollars/month at
      small scale. Revisit income (donations vs freemium vs ads) only here.

---

## Tech decisions (locked)

| Choice | Why |
|---|---|
| Web app (Vite), not native | Runs on your phone today, no Play Store, installable as PWA |
| Three.js `InstancedMesh` | One draw call per build; 20k+ blocks at 60fps |
| prismarine-nbt | Standard JS NBT lib; handles gzip + big/little endian |
| Flat colors first, textures later | Get the loop working before the asset pipeline |
| No backend until Phase 4 | Keeps costs at $0 while learning |
