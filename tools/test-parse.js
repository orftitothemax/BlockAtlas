// tools/test-parse.js — verifies parseStructure() against the generated
// sample hut. Run: npm run test-parse (after npm run make-sample)
import { readFileSync } from 'node:fs'
import { parseStructure } from '../src/formats.js'

const buf = readFileSync(new URL('../samples/test-hut.schematic', import.meta.url))
const s = await parseStructure(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))

const at = (x, y, z) => s.blocks.find((b) => b.x === x && b.y === y && b.z === z)?.id
let failures = 0
function check(label, actual, expected) {
  const ok = actual === expected
  if (!ok) failures++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: got ${actual}, expected ${expected}`)
}

check('width', s.width, 7)
check('height', s.height, 5)
check('length', s.length, 7)
check('format', s.format, 'Sponge schematic v2')
check('non-air block count', s.blocks.length, 168)
check('floor corner (0,0,0)', at(0, 0, 0), 'minecraft:stone')
check('wall corner log (0,1,0)', at(0, 1, 0), 'minecraft:oak_log')
check('wall plank (1,1,0)', at(1, 1, 0), 'minecraft:oak_planks')
check('door gap (3,1,0)', at(3, 1, 0), undefined)
check('door gap (3,2,0)', at(3, 2, 0), undefined)
check('window glass (3,2,6)', at(3, 2, 6), 'minecraft:glass')
check('roof (3,4,3)', at(3, 4, 3), 'minecraft:cobblestone')
check('interior air (3,2,3)', at(3, 2, 3), undefined)

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`)
  process.exit(1)
}
console.log('\nAll parser checks passed.')
