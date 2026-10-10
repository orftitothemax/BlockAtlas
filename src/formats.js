// formats.js — detect and normalize structure files into one shape:
//
//   { width, height, length, blocks: [{x, y, z, id}], format }
//
// Supported inputs:
//   - Sponge .schematic / .schem (v1/v2/v3, incl. gzip) — Java WorldEdit
//   - Vanilla structure .nbt — Java structure blocks / data packs
//   - Bedrock .mcstructure — structure blocks on Bedrock (Switch!)
//   - Legacy MCEdit .schematic — pre-1.13 numeric block IDs (partial table)
//
// Parsing is done with prismarine-nbt, the standard JS NBT library.
// It auto-decompresses gzip and auto-detects big/little endian
// (Java = big-endian, Bedrock = little-endian).

import nbt from 'prismarine-nbt'

function cleanName(name) {
  // "minecraft:oak_stairs[facing=north,half=bottom]" -> "minecraft:oak_stairs"
  const i = name.indexOf('[')
  return i === -1 ? name : name.slice(0, i)
}

function isAir(id) {
  return id === 'minecraft:air' || id === 'minecraft:cave_air' || id === 'minecraft:void_air'
}

function readVarint(bytes, offset) {
  let value = 0, shift = 0, pos = offset
  for (;;) {
    if (pos >= bytes.length) throw new Error('Truncated varint in BlockData')
    const b = bytes[pos++]
    value |= (b & 0x7f) << shift
    if ((b & 0x80) === 0) break
    shift += 7
    if (shift > 35) throw new Error('Varint too long in BlockData')
  }
  return [value, pos]
}

// prismarine-nbt represents a list tag as { type:'list', value:{ type, value:[...] } }
// but some real-world files store raw arrays / unwrapped entries, so be lenient.
function asArray(listTag) {
  const v = listTag?.value
  if (Array.isArray(v)) return v
  return v?.value ?? []
}

function asIntArray(tag) {
  const v = tag?.value
  return Array.isArray(v) ? v : (v?.value ?? [])
}

// Technical blocks that are part of the file, not the build.
function isSkipped(id) {
  return (
    id === 'minecraft:air' ||
    id === 'minecraft:cave_air' ||
    id === 'minecraft:void_air' ||
    id === 'minecraft:structure_block' ||
    id === 'minecraft:structure_void'
  )
}

export async function parseStructure(arrayBuffer) {
  const { parsed } = await nbt.parse(Buffer.from(arrayBuffer))
  const root = parsed?.value
  if (!root) throw new Error('Could not parse NBT data.')

  if (root.Schematic) return fromSponge(root.Schematic.value)
  if (root.structure?.value?.palette || root.block_palette || root.palette) {
    return fromMcstructure(root)
  }
  if (root.palette && root.blocks && root.size) return fromVanillaNbt(root)
  if (root.Blocks && root.Width) return fromLegacy(root)

  throw new Error(
    'Unrecognized format. Expected a vanilla .nbt structure, ' +
    'Sponge .schematic/.schem, legacy MCEdit .schematic, or Bedrock .mcstructure.'
  )
}

// ---- Sponge schematic (WorldEdit, .schematic / .schem) ----
function fromSponge(s) {
  const v = (k) => s[k]?.value
  const version = v('Version') ?? 1
  const width = v('Width'), height = v('Height'), length = v('Length')
  if (width == null || height == null || length == null) {
    throw new Error('Sponge schematic is missing dimensions.')
  }

  // Palette: { "minecraft:stone": {value: 0}, ... } -> array indexed by id
  const paletteTag = s.Palette?.value ?? {}
  const palArray = []
  for (const [name, tag] of Object.entries(paletteTag)) {
    palArray[tag.value] = cleanName(name)
  }

  // BlockData: varint-encoded palette indices, order y -> z -> x
  const data = Buffer.from(v('BlockData') ?? [])
  const blocks = []
  let offset = 0
  for (let y = 0; y < height; y++) {
    for (let z = 0; z < length; z++) {
      for (let x = 0; x < width; x++) {
        const [id, next] = readVarint(data, offset)
        offset = next
        const name = palArray[id]
        if (name && !isAir(name)) blocks.push({ x, y, z, id: name })
      }
    }
  }
  return { width, height, length, blocks, format: `Sponge schematic v${version}` }
}

// ---- Vanilla Java structure block .nbt ----
function fromVanillaNbt(root) {
  const [width, height, length] = asArray(root.size)
  const palArray = asArray(root.palette).map((e) => cleanName(e.value.Name.value))
  const blocks = []
  for (const b of asArray(root.blocks)) {
    const [x, y, z] = asArray(b.value.pos)
    const id = palArray[b.value.state.value]
    if (id && !isAir(id)) blocks.push({ x, y, z, id })
  }
  return { width, height, length, blocks, format: 'Vanilla structure (.nbt)' }
}

// ---- Bedrock .mcstructure ----
//
// Real-world layout (verified Oct 10 2026 against castillo_medieval.mcstructure):
//   root: format_version, size, structure_world_origin
//   root.structure: block_indices (list of 2 int layers), entities,
//                   palette.default.block_palette (list of {name, states, version})
//
// Block index order is ZYX: index = x*height*length + y*length + z
// (z varies fastest). Per the Bedrock spec (bedrock-wiki docs/nbt/mcstructure.md):
// for size [2,3,4], indices map to [(0,0,0),(0,0,1),(0,0,2),(0,0,3),(0,1,0),...].
// Verified Oct 10 2026 against castillo_medieval.mcstructure: structure block
// lands at the origin corner, and top-down slices show the castle walls +
// round tower exactly as the reference. (An earlier x-major guess rendered
// a scrambled shape; coherence heuristics alone couldn't catch it.)
function mcIndex(x, y, z, width, height, length) {
  return x * height * length + y * length + z
}

function fromMcstructure(root) {
  const struct = root.structure?.value ?? root
  const [width, height, length] = asArray(root.size ?? struct.size)
  // Palette naming varies between files: block_palette vs palette,
  // nested under structure.palette.default in real Bedrock exports.
  const palScope = struct.palette?.value?.default?.value ?? struct
  const palTag = palScope.block_palette ?? palScope.palette
  const palArray = asArray(palTag).map((e) =>
    cleanName((e.value?.name ?? e.name)?.value ?? 'minecraft:air')
  )
  const layers = asArray(struct.block_indices)
  if (layers.length === 0) throw new Error('Empty .mcstructure: no block layers found.')
  const fg = asIntArray(layers[0]) // foreground layer (background holds waterlogging)
  const blocks = []
  for (let x = 0; x < width; x++) {
    for (let z = 0; z < length; z++) {
      for (let y = 0; y < height; y++) {
        const id = palArray[fg[mcIndex(x, y, z, width, height, length)]]
        if (id && !isSkipped(id)) blocks.push({ x, y, z, id })
      }
    }
  }
  return { width, height, length, blocks, format: 'Bedrock structure (.mcstructure)' }
}

// ---- Legacy MCEdit .schematic (pre-1.13 numeric IDs) ----
// Only common blocks are mapped here; the full 1.13 "flattening" table
// is a TODO (see PLAN.md). Unknown IDs render gray as "legacy:<id>".
const LEGACY_IDS = {
  1: 'minecraft:stone', 2: 'minecraft:grass_block', 3: 'minecraft:dirt',
  4: 'minecraft:cobblestone', 5: 'minecraft:oak_planks', 7: 'minecraft:bedrock',
  8: 'minecraft:water', 9: 'minecraft:water', 10: 'minecraft:lava', 11: 'minecraft:lava',
  12: 'minecraft:sand', 13: 'minecraft:gravel', 14: 'minecraft:gold_block',
  15: 'minecraft:iron_block', 17: 'minecraft:oak_log', 18: 'minecraft:oak_leaves',
  20: 'minecraft:glass', 35: 'minecraft:wool', 41: 'minecraft:gold_block',
  42: 'minecraft:iron_block', 43: 'minecraft:stone', 44: 'minecraft:stone',
  45: 'minecraft:brick', 46: 'minecraft:tnt', 47: 'minecraft:bookshelf',
  48: 'minecraft:cobblestone', 49: 'minecraft:obsidian', 50: 'minecraft:torch',
  53: 'minecraft:oak_planks', 54: 'minecraft:chest', 58: 'minecraft:crafting_table',
  61: 'minecraft:furnace', 80: 'minecraft:sand', 98: 'minecraft:stone_bricks',
}

function fromLegacy(root) {
  const width = root.Width.value, height = root.Height.value, length = root.Length.value
  const blockIds = Buffer.from(root.Blocks.value)
  const blocks = []
  let i = 0
  for (let y = 0; y < height; y++) {
    for (let z = 0; z < length; z++) {
      for (let x = 0; x < width; x++, i++) {
        const numId = blockIds[i]
        if (numId === 0) continue // air
        const id = LEGACY_IDS[numId] ?? `legacy:${numId}`
        blocks.push({ x, y, z, id })
      }
    }
  }
  return { width, height, length, blocks, format: 'Legacy MCEdit schematic' }
}
