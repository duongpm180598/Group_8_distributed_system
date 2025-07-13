<template>
  <main>
    <div class="sm:ml-16">
      <Sidebar />
      <div class="w-full h-[calc(100vh-64px)]" ref="stage">
        <canvas ref="canvasEl" id="canvas"></canvas>
      </div>
    </div>
  </main>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import { ref, onMounted } from 'vue'
import { fabric } from 'fabric'
import { useCanvasStore } from '@/stores/canvas'

const stage = ref(null)
const canvasEl = ref(null)
const canvasStore = useCanvasStore()

onMounted(() => {
  const containerWidth = stage.value.clientWidth
  const containerHeight = stage.value.clientHeight
  const canvas = new fabric.Canvas(canvasEl.value, {
    width: containerWidth,
    height: containerHeight,
    // isDrawingMode: true,
  })

  // Set the canvas instance in your Pinia store
  canvasStore.setCanvas(canvas)

  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
  canvas.freeDrawingBrush.color = '#e0245e'
  canvas.freeDrawingBrush.width = 5
  fabric.Object.prototype.transparentCorners = false

  // --- Listen for the path:created event ---
  canvas.on('path:created', (e) => {
    console.log('A new path was created:', e.path)
    const pathData = e.path.toObject()
    console.log('Path data:', pathData)
  })

//   canvasStore.addRectangle({
//     width: 200,
//     height: 100,
//     left: 0,
//     top: 50,
//     angle: 30,
//     fill: 'rgba(255,0,0,0.5)',
//   })
})
</script>
