<template>
  <div
    v-if="selectedLayer && selectedLayer.type === 'path'"
    class="bg-white z-9999 absolute top-[24px] left-[50%] -translate-x-1/2 rounded-lg shadow-sm m-4 dark:bg-gray-800"
  >
    <div class="w-full mx-auto max-w-screen-xl p-1 md:flex md:items-center md:justify-between">
      <ul
        class="flex flex-wrap gap-3 items-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0"
      >
        <li>
          <input
            type="color"
            id="hs-color-input"
            :value="selectedLayer.stroke ?? '#000000'"
            title="Choose your color"
            @input="onChangeLayerColor($event)"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup>
import { useCanvasStore } from '@/stores/canvas'
import { storeToRefs } from 'pinia'
import { toRaw } from 'vue'

const canvasStore = useCanvasStore()
const { selectedLayer } = storeToRefs(canvasStore)

const onChangeLayerColor = (event) => {
  const newColor = event.target.value
  toRaw(canvasStore.canvas).renderAll()
  canvasStore.updateColor(
    selectedLayer.value.set({
      stroke: newColor,
    }),
  )
  toRaw(canvasStore.canvas).freeDrawingBrush.color = newColor
}
</script>
