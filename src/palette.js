// Block -> color map for the flat-shaded renderer.
// Strategy: Mojang's concrete colors are the "pure" version of each dye color,
// so every dyed block (wool, terracotta, glass, carpet...) uses its concrete
// color as the base. Real Minecraft textures replace all of this in Phase 2
// (see PLAN.md). Unknown blocks render light gray so gaps are visible.

const DYE = {
  white: 0xf1f4f4,
  light_gray: 0x9d9d97,
  gray: 0x616161,
  black: 0x1b1c1e,
  brown: 0x6b4a33,
  red: 0xa02722,
  orange: 0xe46a1e,
  yellow: 0xf7d335,
  lime: 0x70b919,
  green: 0x546d1b,
  cyan: 0x158991,
  light_blue: 0x3ab3da,
  blue: 0x35399d,
  purple: 0x6a2da1,
  magenta: 0xbd44b3,
  pink: 0xe891a8,
}

const COLORS = {}

// Every dyed block family gets its concrete color as the base.
const DYED = [
  'wool', 'concrete', 'concrete_powder', 'terracotta', 'glazed_terracotta',
  'carpet', 'stained_glass', 'shulker_box', 'bed', 'banner', 'candle',
]
for (const [color, hex] of Object.entries(DYE)) {
  for (const block of DYED) COLORS[`minecraft:${color}_${block}`] = hex
}
COLORS['minecraft:wool'] = DYE.white

// ---- Natural blocks ----
Object.assign(COLORS, {
  // stone family
  'minecraft:stone': 0x7d7d7d,
  'minecraft:cobblestone': 0x6e6e6e,
  'minecraft:stone_bricks': 0x6f6f6f,
  'minecraft:stone_brick_stairs': 0x6f6f6f,
  'minecraft:stone_brick_slab': 0x707070,
  'minecraft:mossy_cobblestone': 0x5f705f,
  'minecraft:mossy_stone_bricks': 0x5f705f,
  'minecraft:cobblestone_wall': 0x6e6e6e,
  'minecraft:andesite': 0x8a8a8a,
  'minecraft:polished_andesite': 0x8a8a8a,
  'minecraft:diorite': 0xd8d8d8,
  'minecraft:polished_diorite': 0xd8d8d8,
  'minecraft:granite': 0x9a6a5a,
  'minecraft:polished_granite': 0x9a6a5a,
  'minecraft:deepslate': 0x4a4a52,
  'minecraft:cobbled_deepslate': 0x4a4a52,
  'minecraft:polished_deepslate': 0x50505a,
  'minecraft:deepslate_bricks': 0x4a4a52,
  'minecraft:deepslate_tiles': 0x3e3e46,
  'minecraft:tuff': 0x7a7a72,
  'minecraft:polished_tuff': 0x7a7a72,
  'minecraft:sandstone': 0xe3d9a3,
  'minecraft:smooth_sandstone': 0xe3d9a3,
  'minecraft:red_sandstone': 0xb5651d,
  'minecraft:smooth_stone': 0x7d7d7d,
  'minecraft:bedrock': 0x2b2b2b,
  'minecraft:obsidian': 0x1a1226,

  // dirt / sand / gravel
  'minecraft:dirt': 0x8a5f3c,
  'minecraft:grass_block': 0x5fae3f,
  'minecraft:sand': 0xe3d9a3,
  'minecraft:red_sand': 0xb5651d,
  'minecraft:gravel': 0x8a7f72,
  'minecraft:clay': 0x9aa4b5,

  // ores (stone base tinted toward the mineral)
  'minecraft:coal_ore': 0x4a4a4a,
  'minecraft:iron_ore': 0xb5a08a,
  'minecraft:gold_ore': 0xd8c05a,
  'minecraft:diamond_ore': 0x5ff2e0,
  'minecraft:emerald_ore': 0x3fd95f,
  'minecraft:lapis_ore': 0x3a5ad9,
  'minecraft:redstone_ore': 0xd93a3a,
  'minecraft:copper_ore': 0xd97a3a,
  'minecraft:quartz_ore': 0xd8c8c0,
  'minecraft:iron_block': 0xd8d8d8,
  'minecraft:gold_block': 0xf5d020,
  'minecraft:diamond_block': 0x5ff2e0,
  'minecraft:emerald_block': 0x3fd95f,
  'minecraft:copper_block': 0xd97a3a,

  // glass & liquids
  'minecraft:glass': 0xc8e8f0,
  'minecraft:tinted_glass': 0x4a4a52,
  'minecraft:water': 0x3f76e4,
  'minecraft:lava': 0xe25822,
  'minecraft:ice': 0xa8d8f0,
  'minecraft:packed_ice': 0x8ab8d8,

  // plants
  'minecraft:oak_leaves': 0x3e8f35,
  'minecraft:spruce_leaves': 0x2f6b2f,
  'minecraft:birch_leaves': 0x6aa84f,
  'minecraft:jungle_leaves': 0x3e8f35,
  'minecraft:acacia_leaves': 0x4a8f35,
  'minecraft:dark_oak_leaves': 0x2f6b2f,
  'minecraft:mangrove_leaves': 0x3e7a35,
  'minecraft:cherry_leaves': 0xf0a0b8,
  'minecraft:azalea_leaves': 0x5aa84f,
  'minecraft:grass': 0x5fae3f,
  'minecraft:tall_grass': 0x5fae3f,
  'minecraft:vine': 0x3e8f35,

  // wood: planks / logs / doors / slabs / stairs per type
  'minecraft:oak_planks': 0xa0824f,
  'minecraft:oak_log': 0x6b5230,
  'minecraft:stripped_oak_log': 0xa0824f,
  'minecraft:oak_door': 0xa0824f,
  'minecraft:oak_slab': 0xa0824f,
  'minecraft:oak_stairs': 0xa0824f,
  'minecraft:spruce_planks': 0x6e4f2a,
  'minecraft:spruce_log': 0x4a3520,
  'minecraft:stripped_spruce_log': 0x8a6a3f,
  'minecraft:spruce_door': 0x6e4f2a,
  'minecraft:spruce_slab': 0x6e4f2a,
  'minecraft:spruce_stairs': 0x6e4f2a,
  'minecraft:birch_planks': 0xc9b177,
  'minecraft:birch_log': 0xd8d0b8,
  'minecraft:stripped_birch_log': 0xc9b177,
  'minecraft:birch_door': 0xc9b177,
  'minecraft:jungle_planks': 0x9a6b4f,
  'minecraft:jungle_log': 0x5a4a30,
  'minecraft:stripped_jungle_log': 0x9a6b4f,
  'minecraft:acacia_planks': 0xb06a3b,
  'minecraft:acacia_log': 0x6b4a30,
  'minecraft:stripped_acacia_log': 0xb06a3b,
  'minecraft:dark_oak_planks': 0x4a3520,
  'minecraft:dark_oak_log': 0x3b2a1a,
  'minecraft:stripped_dark_oak_log': 0x4a3520,
  'minecraft:mangrove_planks': 0x7a3b2e,
  'minecraft:mangrove_log': 0x5a2e24,
  'minecraft:cherry_planks': 0xe8b4a0,
  'minecraft:cherry_log': 0x8a5a48,
  'minecraft:bamboo_planks': 0xb8a03c,
  'minecraft:bamboo_block': 0x8a7a2e,
  'minecraft:crimson_planks': 0x6e3b4f,
  'minecraft:crimson_stem': 0x5a2e3e,
  'minecraft:warped_planks': 0x3b7a6e,
  'minecraft:warped_stem': 0x2e5a52,

  // brick & misc
  'minecraft:brick': 0x9c5a4a,
  'minecraft:bricks': 0x9c5a4a,
  'minecraft:mud_bricks': 0x8a6a5a,
  'minecraft:bookshelf': 0x8a6a3f,
  'minecraft:crafting_table': 0x9a7448,
  'minecraft:furnace': 0x6e6e6e,
  'minecraft:chest': 0xb08a4f,
  'minecraft:tnt': 0xd23c28,
  'minecraft:torch': 0xf5e08a,
  'minecraft:iron_bars': 0x9a9a9a,
  'minecraft:hopper': 0x5a5a5a,
  'minecraft:cauldron': 0x4a4a4a,
  'minecraft:anvil': 0x5a5a5a,
  'minecraft:sponge': 0xd8c83a,
  'minecraft:hay_block': 0xd8b83a,
  'minecraft:melon': 0x5aa83a,
  'minecraft:pumpkin': 0xd8842a,
})

export function colorFor(id) {
  return COLORS[id] ?? 0xb0b0b0
}
