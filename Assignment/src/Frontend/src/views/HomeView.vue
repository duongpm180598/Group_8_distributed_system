<template>
  <main>
    <div class="sm:ml-64">
      <Sidebar />
      <div>
        <canvas
          style="margin: 0 auto; border: 2px solid"
          width="585"
          height="328"
          id="canvas"
        ></canvas>
        <div style="margin: 1rem">
          <button @click="drawPolygon">Draw</button>
          <button @click="showPolygon">Show</button>
          <button @click="editPolygon">Edit</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import { ref, onMounted } from 'vue'
import * as fabric from 'fabric'

// A ref to hold the canvas element
const canvasEl = ref(null)
// A ref to hold the fabric.js canvas instance
const fabricCanvas = ref(null)

let isDown = false
let line = null
const vertices = ref([])

onMounted(() => {
  // Set default fabric object properties
  fabric.Object.prototype.transparentCorners = false
  fabric.Object.prototype.cornerStyle = 'circle'
  fabric.Object.prototype.cornerSize = 10
  fabric.Object.prototype.cornerColor = 'blue'

  // Initialize the fabric canvas
  fabricCanvas.value = new fabric.Canvas('canvas', {
    backgroundColor: '#f0f0f0',
    selection: false,
  })
})

const addVertice = (point) => {
  // Avoid adding duplicate points
  const lastPoint = vertices.value[vertices.value.length - 1]
  if (!lastPoint || lastPoint.x !== point.x || lastPoint.y !== point.y) {
    vertices.value.push(point)
  }
}

const drawPolygon = () => {
  const fc = fabricCanvas.value
  if (!fc) return

  // Detach existing listeners to avoid duplicates
  fc.off('mouse:down')
  fc.off('mouse:move')
  fc.off('mouse:up')

  // Attach new listeners for drawing
  fc.on('mouse:down', (o) => {
    isDown = true
    const pointer = fc.getPointer(o.e)
    const startPoint = { x: pointer.x, y: pointer.y }
    addVertice(startPoint)

    const points = [pointer.x, pointer.y, pointer.x, pointer.y]
    line = new fabric.Line(points, {
      strokeWidth: 2,
      stroke: 'black',
      originX: 'center',
      originY: 'center',
      selectable: false,
    })
    fc.add(line)
  })

  fc.on('mouse:move', (o) => {
    if (!isDown || !line) return
    const pointer = fc.getPointer(o.e)
    line.set({ x2: pointer.x, y2: pointer.y })
    fc.renderAll()
  })

  fc.on('mouse:up', (o) => {
    isDown = false
    const pointer = fc.getPointer(o.e)
    addVertice({ x: pointer.x, y: pointer.y })

    // To complete the polygon, you might want to connect the last point to the first
    // This part of the logic can be expanded in the `showPolygon` function.
  })
}

const showPolygon = () => {
  const fc = fabricCanvas.value
  if (!fc || vertices.value.length < 2) return

  // Clear the temporary lines
  fc.getObjects('line').forEach((obj) => fc.remove(obj))

  // Create the final polygon
  const polygon = new fabric.Polygon(vertices.value, {
    fill: 'rgba(100, 200, 200, 0.5)',
    stroke: 'blue',
    strokeWidth: 2,
  })
  fc.add(polygon)
  fc.renderAll()

  // Reset vertices for the next polygon
  vertices.value = []
}

const editPolygon = () => {
  // Logic to enable editing of the created polygon will go here.
  // This typically involves making the polygon selectable and its points editable.
  console.log('Edit function called')
}
</script>

<style lang="scss">
// #app {
//   font-family: Avenir, Helvetica, Arial, sans-serif;
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
//   text-align: center;
//   color: #2c3e50;
//   margin-top: 60px;
// }
</style>
