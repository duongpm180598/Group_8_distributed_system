<template>
  <main>
    <div class="sm:ml-64">
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
import * as fabric from 'fabric'

const stage = ref(null)
const canvasEl = ref(null)
let canvas

onMounted(() => {
  const containerWidth = stage.value.clientWidth
  const containerHeight = stage.value.clientHeight
  canvas = new fabric.Canvas(canvasEl.value, {
    width: containerWidth,
    height: containerHeight,
    isDrawingMode: true,
  })

  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
  canvas.freeDrawingBrush.color = '#e0245e'
  canvas.freeDrawingBrush.width = 5
  fabric.Object.prototype.transparentCorners = false

  // --- Listen for the path:created event ---
  canvas.on('path:created', (e) => {
    // e.path is the fabric.Path object that was just created
    console.log('A new path was created:', e.path)

    // You can now manipulate the path, for example:
    // e.path.set({ stroke: 'blue' });
    // canvas.renderAll();

    // You can also get its data
    const pathData = e.path.toObject()
    console.log('Path data:', pathData)
  })
})
</script>
