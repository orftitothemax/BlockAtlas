# BlockAtlas

View Minecraft builds in 3D in your browser. Swap blocks to preview how they'd
look. Build layer by layer. Bedrock-first (Switch 2), Java formats supported.

## Status: Phase 1 scaffold (working)

- Parses `.nbt`, `.schematic` / `.schem` (Sponge), legacy `.schematic`,
  and Bedrock `.mcstructure` — 14 automated checks passing
- 3D viewer with orbit/zoom + layer slider
- One known unknown: `.mcstructure` block-index order is assumed x-major
  and flagged for verification (see `src/formats.js`)

## Quick start

```
npm install
npm run dev        # http://localhost:5173
```

Drop `samples/test-hut.schematic` onto the page (generate it first with
`npm run make-sample`).

## Layout

- `index.html` / `src/` — the web app (Vite + Three.js)
- `src/formats.js` — the format detective: NBT in, block list out
- `src/viewer.js` — Three.js scene (InstancedMesh, one draw call)
- `src/palette.js` — flat block colors (real textures = Phase 2)
- `tools/` — sample generator + parser tests
- `PLAN.md` — the full phased plan
- `MORNING_START.md` — start here tomorrow

## Why a web app

Runs on your phone's browser today, installable to the home screen later.
No Play Store, no fees. Your PC hosts it; your phone reaches it over Tailscale.
