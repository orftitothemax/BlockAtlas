import { createViewer } from './viewer.js'
import { parseStructure } from './formats.js'
import { colorFor } from './palette.js'


const canvas = document.getElementById('scene')
const fileInput = document.getElementById('file-input')
const fileName = document.getElementById('file-name')
const dropZone = document.getElementById('drop-zone')
const slider = document.getElementById('layer-slider')
const layerDown = document.getElementById('layer-down')
const layerUp = document.getElementById('layer-up')
const layerLabel = document.getElementById('layer-label')
const stats = document.getElementById('stats')
const status = document.getElementById('status')
const inventoryList = document.getElementById('inventory-list')


const viewer = createViewer(canvas)
let current = null

function setStatus(msg, isError = false) {
  status.textContent = msg
  status.classList.toggle('error', isError)
}

async function loadFile(file) {
  setStatus(`Parsing ${file.name}…`)
  try {
    const buf = await file.arrayBuffer()
    const structure = await parseStructure(buf)
    current = structure
    viewer.show(structure)

    fileName.textContent = file.name
    dropZone.classList.remove('empty')
    const types = new Set(structure.blocks.map((b) => b.id)).size
    stats.textContent =
      `${structure.format} · ${structure.width}×${structure.height}×${structure.length} · ` +
      `${structure.blocks.length.toLocaleString()} blocks · ${types} block types`

    slider.max = structure.height - 1
    slider.value = structure.height - 1
    slider.disabled = false
    layerDown.disabled = false
    layerUp.disabled = false
    layerLabel.textContent = `0–${structure.height - 1}`
    // Inventory: count blocks per type, most common first
const counts = {}
for (const b of structure.blocks) counts[b.id] = (counts[b.id] || 0) + 1
const byCount = Object.entries(counts).sort((a, b) => b[1] - a[1])
inventoryList.innerHTML = ''
for (const [id, count] of byCount) {
  const li = document.createElement('li')
  const pretty = id.replace('minecraft:', '').replaceAll('_', ' ')
  const hex = '#' + colorFor(id).toString(16).padStart(6, '0')
  li.innerHTML =
    `<span class="swatch" style="background:${hex}"></span>` +
    `<span>${pretty}</span><b>×${count.toLocaleString()}</b>`
  inventoryList.appendChild(li)
}

    setStatus('Loaded. Drag to orbit, scroll to zoom.')
  } catch (err) {
    console.error(err)
    setStatus(`Could not read that file: ${err.message}`, true)
  }
  
}

fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) loadFile(e.target.files[0])
  e.target.value = ''
})

function setLayer(y) {
  if (!current) return
  y = Math.max(0, Math.min(current.height - 1, y))
  slider.value = y
  viewer.setMaxLayer(y)
  layerLabel.textContent = `0–${y}`
}

slider.addEventListener('input', () => setLayer(Number(slider.value)))
layerDown.addEventListener('click', () => setLayer(Number(slider.value) - 1))
layerUp.addEventListener('click', () => setLayer(Number(slider.value) + 1))

// Drag-and-drop onto the whole window
let dragDepth = 0
window.addEventListener('dragenter', (e) => {
  e.preventDefault()
  dragDepth++
  dropZone.classList.add('over')
})
window.addEventListener('dragleave', (e) => {
  e.preventDefault()
  if (--dragDepth <= 0) {
    dragDepth = 0
    dropZone.classList.remove('over')
  }
})
window.addEventListener('dragover', (e) => e.preventDefault())
window.addEventListener('drop', (e) => {
  e.preventDefault()
  dragDepth = 0
  dropZone.classList.remove('over')
  const f = e.dataTransfer.files?.[0]
  if (f) loadFile(f)
})

dropZone.classList.add('empty')
setStatus('Drop a structure file to begin.')
