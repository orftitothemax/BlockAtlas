# BlockAtlas — Morning Start

You have a bigger block of time today. Here's the whole ramp, setup to first
real feature. Each step says what "done" looks like.

## Setup (~30 min)

1. **Install Node.js LTS** from https://nodejs.org (the big green LTS button).
   Verify: open a terminal and run `node --version` — you should see v22 or v24.
2. **Unzip** `blockatlas.zip` somewhere you'll find it (e.g. `Documents\blockatlas`).
3. **Install dependencies.** In a terminal inside the folder:
   ```
   npm install
   ```
   Takes a few minutes the first time.
4. **Verify the parser** (no browser needed):
   ```
   npm run make-sample
   npm run test-parse
   ```
   Done = "All parser checks passed." (14/14 — this already passed overnight.)

## See it in 3D (~10 min)

5. **Start the app:**
   ```
   npm run dev
   ```
   Open http://localhost:5173 in your browser.
6. **Drag `samples/test-hut.schematic`** onto the page.
   Done = a little stone hut with log corners and a cobblestone roof, orbiting
   with the mouse. The Layer slider at the bottom reveals it floor by floor.

## Phone access (optional, 5 min)

7. Run `npm run dev -- --host`, then on your phone (on Tailscale) open
   `http://<your-PC's-Tailscale-IP>:5173`. Same app, touch controls.

## The work block

Pick in order — stop whenever you've had enough, each is self-contained:

- **A. Verify `.mcstructure` (30–45 min).** The Bedrock index order is our one
  unverified guess (flagged in `src/formats.js`). Grab any real `.mcstructure`
  file, load it, and see if it renders correctly or scrambled. If scrambled,
  flip the one constant. This unblocks everything Bedrock.
- **B. Block inventory panel (1–2 hrs).** Show every block type + count for the
  loaded build — the "shopping list" before you build. The data is already
  parsed; this is pure UI work in `src/main.js`.
- **C. Click-to-identify (1–2 hrs).** Click a block in 3D, see its name.
  Three.js raycasting against the InstancedMesh. First step toward Phase 2.

Stuck on anything? Paste the terminal error to Muse — that's the loop.
