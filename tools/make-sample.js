// tools/make-sample.js — generates samples/test-hut.schematic,
// a tiny 7x5x7 Sponge v2 schematic used to verify the parser and viewer.
// Run: npm run make-sample
import nbt from 'prismarine-nbt'
import { writeFileSync, mkdirSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const W = 7, H = 5, L = 7
const P = {
  'minecraft:air': 0,
  'minecraft:stone': 1,
  'minecraft:oak_planks': 2,
  'minecraft:oak_log': 3,
  'minecraft:glass': 4,
  'minecraft:cobblestone': 5,
}

const grid = Array.from({ length: H }, () =>
  Array.from({ length: L }, () => new Array(W).fill(P['minecraft:air']))
)

// Floor
for (let x = 0; x < W; x++)
  for (let z = 0; z < L; z++) grid[0][z][x] = P['minecraft:stone']

// Walls (y=1..3): log corners, plank edges
for (let y = 1; y <= 3; y++) {
  for (let x = 0; x < W; x++) {
    for (let z = 0; z < L; z++) {
      const edge = x === 0 || x === W - 1 || z === 0 || z === L - 1
      if (!edge) continue
      const corner = (x === 0 || x === W - 1) && (z === 0 || z === L - 1)
      grid[y][z][x] = corner ? P['minecraft:oak_log'] : P['minecraft:oak_planks']
    }
  }
}

// Door: south wall (z=0), x=3, y=1..2
grid[1][0][3] = P['minecraft:air']
grid[2][0][3] = P['minecraft:air']

// Windows: north/east/west walls, y=2
for (const x of [2, 3, 4]) grid[2][L - 1][x] = P['minecraft:glass']
for (const z of [2, 3, 4]) {
  grid[2][z][W - 1] = P['minecraft:glass']
  grid[2][z][0] = P['minecraft:glass']
}

// Flat roof
for (let x = 0; x < W; x++)
  for (let z = 0; z < L; z++) grid[4][z][x] = P['minecraft:cobblestone']

// Encode palette indices as varints, order y -> z -> x (Sponge)
const bytes = []
for (let y = 0; y < H; y++) {
  for (let z = 0; z < L; z++) {
    for (let x = 0; x < W; x++) {
      let v = grid[y][z][x]
      do {
        let b = v & 0x7f
        v >>>= 7
        if (v !== 0) b |= 0x80
        bytes.push(b)
      } while (v !== 0)
    }
  }
}

const schematic = {
  type: 'compound',
  name: 'Schematic',
  value: {
    Version: nbt.int(2),
    DataVersion: nbt.int(4189),
    Width: nbt.short(W),
    Height: nbt.short(H),
    Length: nbt.short(L),
    Palette: {
      type: 'compound',
      name: '',
      value: Object.fromEntries(
        Object.entries(P).map(([name, id]) => [name, nbt.int(id)])
      ),
    },
    BlockData: { type: 'byteArray', name: '', value: Buffer.from(bytes) },
  },
}

const raw = nbt.writeUncompressed({
  type: 'compound',
  name: '',
  value: { Schematic: schematic },
})

mkdirSync(new URL('../samples', import.meta.url), { recursive: true })
writeFileSync(
  new URL('../samples/test-hut.schematic', import.meta.url),
  gzipSync(raw)
)
console.log('Wrote samples/test-hut.schematic (7x5x7 hut, Sponge v2, gzipped)')
