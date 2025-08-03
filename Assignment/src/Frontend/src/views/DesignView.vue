<template>
  <main>
    <div class="sm:ml-16">
      <Sidebar />
      <div class="relative w-full h-[calc(100vh-64px)]" ref="stage">
        <TextToolbar />
        <canvas ref="canvasEl" id="canvas"></canvas>
      </div>
    </div>
  </main>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import TextToolbar from '@/components/TextToolbar.vue'
import { getDesignById } from '@/services/design.service'
import { useCanvasStore } from '@/stores/canvas'
import { fabric } from 'fabric'
import { onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue'

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
  console.log('ehh', canvas)
  canvasStore.setCanvas(canvas)
  if (roomId) {
    canvasStore.setRoomId(roomId)
  }

  canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
  canvas.freeDrawingBrush.color = '#e0245e'
  canvas.freeDrawingBrush.width = 5
  fabric.Object.prototype.hasControls = true
  fabric.Object.prototype.hasBorders = true
  fabric.Object.prototype.lockRotation = false
  fabric.Object.prototype.transparentCorners = false

  const design = await fetchDesign(roomId)
  canvasStore.setDesign(design)
  //   design.canvas

  // Kết nối WebSocket khi component được mount
  canvasStore.connectWebSocket()

  // Watch for changes in isDrawingMode from the store
  canvasStore.setupCanvasListeners()
  // và cập nhật canvas tương ứng
  watch(
    () => canvasStore.isDrawingMode,
    (newVal) => {
      if (canvasStore.canvas) {
        canvasStore.canvas.isDrawingMode = newVal
      }
    },
    { immediate: true },
  )
})

const fetchDesign = async (id) => {
  const res = await getDesignById(id)
  return res
}

onUnmounted(async () => {
  canvasStore.leaveRoom()
})

onBeforeUnmount(() => {
  canvasStore.disconnectWebSocket()
})
</script>
