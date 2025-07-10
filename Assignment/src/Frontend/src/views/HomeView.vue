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
  })
  var rect = new fabric.Rect({
    top: 100,
    left: 100,
    width: 60,
    height: 70,
    fill: 'red',
  })

  canvas.add(rect)
})
</script>
