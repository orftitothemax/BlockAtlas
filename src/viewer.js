import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { colorFor } from './palette.js'

// Creates the 3D viewport. Blocks are rendered as a single InstancedMesh
// (one draw call per whole build), sorted by Y so the layer slider can
// reveal the build floor by floor with mesh.count.
export function createViewer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f0f1a)

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000)
  camera.position.set(24, 20, 24)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  scene.add(new THREE.AmbientLight(0xffffff, 0.85))
  const sun = new THREE.DirectionalLight(0xffffff, 1.4)
  sun.position.set(40, 60, 25)
  scene.add(sun)

  const grid = new THREE.GridHelper(64, 64, 0x3a3a55, 0x23232f)
  grid.position.y = -0.01
  scene.add(grid)

  let mesh = null
  let sorted = []

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
  }

  function show(structure) {
    if (mesh) {
      scene.remove(mesh)
      mesh.geometry.dispose()
      mesh.material.dispose()
      mesh = null
    }
    sorted = [...structure.blocks].sort((a, b) => a.y - b.y)
    const { width, length } = structure
    const geo = new THREE.BoxGeometry(0.98, 0.98, 0.98)
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff })
    mesh = new THREE.InstancedMesh(geo, mat, sorted.length)
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    sorted.forEach((b, i) => {
      m.makeTranslation(b.x + 0.5 - width / 2, b.y + 0.5, b.z + 0.5 - length / 2)
      mesh.setMatrixAt(i, m)
      mesh.setColorAt(i, c.set(colorFor(b.id)))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    scene.add(mesh)

    // Frame the build
    const r = Math.max(width, structure.height, length)
    camera.position.set(r * 1.1, r * 0.95, r * 1.1)
    controls.target.set(0, structure.height / 2, 0)
    controls.update()
    setMaxLayer(structure.height - 1)
  }

  // Show only blocks at or below layer y (for layer-by-layer building).
  function setMaxLayer(y) {
    if (!mesh) return
    let n = 0
    while (n < sorted.length && sorted[n].y <= y) n++
    mesh.count = n
  }

  function blockCount() {
    return sorted.length
  }

  renderer.setAnimationLoop(() => {
    resize()
    controls.update()
    renderer.render(scene, camera)
  })

  return { show, setMaxLayer, blockCount }
}
