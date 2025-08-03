<template>
  <aside
    id="sidebar-multi-level-sidebar"
    class="fixed top-[64px] left-0 w-16 h-screen transition-transform -translate-x-full sm:translate-x-0 z-9999"
    aria-label="Sidebar"
  >
    <div class="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
      <ul class="space-y-2 h-full relative font-medium">
        <li>
          <a
            @click="addText()"
            data-tooltip-target="text-tooltip"
            data-tooltip-placement="right"
            class="flex items-center p-2 cursor-pointer text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.266 5.792a1.5 1.5 0 0 1 1.5-1.5h12.468a1.5 1.5 0 0 1 1.5 1.5v1.85a.75.75 0 0 1-1.5 0v-1.35a.5.5 0 0 0-.5-.5H12.75v11.939a.5.5 0 0 0 .5.5h1.875a.75.75 0 0 1 0 1.5h-6.25a.75.75 0 1 1 0-1.5h1.875a.5.5 0 0 0 .5-.5V5.792H6.266a.5.5 0 0 0-.5.5V7.67a.75.75 0 1 1-1.5 0V5.792Z"
                fill="currentColor"
              ></path>
            </svg>
            <div
              id="text-tooltip"
              role="tooltip"
              class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              Text
              <div class="tooltip-arrow" data-popper-arrow></div>
            </div>
          </a>
        </li>
        <li @click="toggleDraw()">
          <a
            data-tooltip-target="draw-tooltip"
            data-tooltip-placement="right"
            class="flex items-center p-2 cursor-pointer text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
              />
            </svg>
            <div
              id="draw-tooltip"
              role="tooltip"
              class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
            >
              Draw
              <div class="tooltip-arrow" data-popper-arrow></div>
            </div>
          </a>
        </li>
        <li class="relative" @click="toggleShapePopover()">
          <a
            class="flex items-center p-2 cursor-pointer text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.367 8.609A2.08 2.08 0 0 0 17.9 8H7.006v.5h-.002V18.9c0 1.143.935 2.078 2.078 2.078H17.9a2.084 2.084 0 0 0 2.078-2.078v-8.825a2.08 2.08 0 0 0-.61-1.466Z"
                fill="#11171D"
              ></path>
              <path
                d="M8.478 16H8.5A6.5 6.5 0 0 0 15 9.5L15 9.479a6.504 6.504 0 0 0-.186-1.5A6.496 6.496 0 0 0 2.21 7.856a6.497 6.497 0 0 0 4.767 7.958c.482.116.983.184 1.5.186Z"
                fill="#6B6F73"
              ></path>
            </svg>
          </a>
          <div
            v-if="showShapePopover"
            class="shape-popover inline-block w-12 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-xs dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800"
          >
            <div class="px-3 py-2">
              <ul class="space-y-3 text-gray-500 list-none list-inside dark:text-gray-400">
                <li @click="addShape('square')">
                  <svg width="24" height="24" viewBox="0 0 64 64">
                    <path d="M0 0H64V64H0z" vector-effect="non-scaling-stroke"></path>
                  </svg>
                </li>
                <li @click="addShape('circle')">
                  <svg width="24" height="24" viewBox="0 0 64 64">
                    <path
                      d="M32 0A32 32 0 1 0 32 64A32 32 0 1 0 32 0Z"
                      vector-effect="non-scaling-stroke"
                    ></path>
                  </svg>
                </li>
                <li @click="addShape('triangle')">
                  <svg width="24" height="24" viewBox="0 0 64 56">
                    <path d="M32 0L64 56H0L32 0Z" vector-effect="non-scaling-stroke"></path>
                  </svg>
                </li>
              </ul>
            </div>
            <div data-popper-arrow></div>
          </div>
        </li>
        <li>
          <a
            @click="addImage()"
            data-tooltip-target="image-tooltip"
            data-tooltip-placement="right"
            class="flex items-center cursor-pointer p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </a>
          <input type="file" ref="imageRef" @change="handleImageUpload" hidden />
          <div
            id="image-tooltip"
            role="tooltip"
            class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
          >
            Image
            <div class="tooltip-arrow" data-popper-arrow></div>
          </div>
        </li>
        <li class="absolute bottom-[50px]">
          <a
            @click="logout()"
            class="flex items-center p-2 cursor-pointer text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
          >
            <svg
              class="shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 16"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 8h11m0 0L8 4m4 4-4 4m4-11h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3"
              />
            </svg>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>
<script setup>
import { useCanvasStore } from '@/stores/canvas'
import { ref } from 'vue'

const imageRef = ref(null)
const canvasStore = useCanvasStore()
const showShapePopover = ref(false)

const addText = () => {
  canvasStore.addText()
  canvasStore.setDrawingMode(false)
}

const addShape = (shapeType) => {
  canvasStore.addShape(shapeType)
  canvasStore.setDrawingMode(false)
}

const addImage = () => {
  imageRef.value.click()
  canvasStore.setDrawingMode(false)
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]

  if (file) {
    const reader = new FileReader()

    reader.onload = (e) => {
      // e.target.result contains the Data URL of the image
      const imageUrl = e.target.result

      canvasStore.addImage(imageUrl)
    }

    // Read the file as a Data URL
    reader.readAsDataURL(file)
  }
}
const toggleDraw = () => {
  canvasStore.setDrawingMode(true)
  canvasStore.setSelectedLayer(null)
}
const toggleShapePopover = () => {
  showShapePopover.value = !showShapePopover.value
}
const logout = () => {
  localStorage.removeItem('username')
  localStorage.removeItem('accessToken')
  router.push(`/login`)
}
</script>
<style>
.shape-popover {
  top: 80px;
  right: -50px;
  z-index: 99999999;
  display: block;
  position: fixed;
}
</style>
