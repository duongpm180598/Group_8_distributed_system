<template>
  <main>
    <div class="sm:ml-16">
      <Sidebar />
      <div class="relative w-full h-[calc(100vh-64px)]" ref="stage">
        <TextToolbar />
        <ShapeToolbar />
        <BrushToolbar />
        <canvas ref="canvasEl" id="canvas"></canvas>
      </div>
    </div>
  </main>
</template>

<script setup>
import BrushToolbar from '@/components/BrushToolbar.vue'
import ShapeToolbar from '@/components/ShapeToolbar.vue'
import Sidebar from '@/components/Sidebar.vue'
import TextToolbar from '@/components/TextToolbar.vue'
import { getDesignById } from '@/services/design.service'
import { useCanvasStore } from '@/stores/canvas'
import { fabric } from 'fabric'
import { onBeforeUnmount, onMounted, onUnmounted, ref, toRaw, watch } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})
const roomId = props.id
const stage = ref(null)
const canvasEl = ref(null)
const canvasStore = useCanvasStore()
onMounted(async () => {
  const containerWidth = stage.value.clientWidth
  const containerHeight = stage.value.clientHeight
  const canvas = new fabric.Canvas(canvasEl.value, {
    width: containerWidth,
    height: containerHeight,
    isDrawingMode: canvasStore.isDrawingMode,
  })
  canvasStore.setCanvas(canvas)

  if (roomId) {
    canvasStore.setRoomId(roomId)
  }

  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
  canvas.freeDrawingBrush.color = '#000000'
  canvas.freeDrawingBrush.width = 5
  fabric.Object.prototype.hasControls = true
  fabric.Object.prototype.hasBorders = true
  fabric.Object.prototype.lockRotation = false
  fabric.Object.prototype.transparentCorners = false
  fabric.Object.prototype.hasControls = true

  const design = await fetchDesign(roomId)

  if (design) {
    console.log(design)
    canvasStore.setDesign(design)
  }

  canvasStore.connectWebSocket()

  canvasStore.setupCanvasListeners()

  watch(
    () => canvasStore.isDrawingMode,
    (newVal) => {
      if (canvasStore.canvas) {
        canvasStore.canvas.isDrawingMode = newVal
      }
    },
    { immediate: true },
  )
  window.addEventListener('keydown', handleKeyDown)
})

const handleKeyDown = (event) => {
  if (event.key === 'Delete') {
    const rawCanvas = toRaw(canvasStore.canvas)
    const activeObject = rawCanvas.getActiveObject()

    if (activeObject) {
      rawCanvas.remove(activeObject)
      rawCanvas.discardActiveObject()
      rawCanvas.renderAll()
      canvasStore.sendCanvasState()
    }
  }
}

const fetchDesign = async (id) => {
  const res = await getDesignById(id)
  return res
}

onUnmounted(async () => {
  canvasStore.leaveRoom()
})

onBeforeUnmount(() => {
  canvasStore.disconnectWebSocket()
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
