<template>
  <div
    v-if="selectedLayer && selectedLayer.type === 'text'"
    class="bg-white z-9999 absolute top-[24px] left-[50%] -translate-x-1/2 rounded-lg shadow-sm m-4 dark:bg-gray-800"
  >
    <div class="w-full mx-auto max-w-screen-xl p-1 md:flex md:items-center md:justify-between">
      <ul
        class="flex flex-wrap gap-3 items-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0"
      >
        <li class="relative">
          <input
            type="text"
            :value="selectedLayer.fontFamily"
            @click="toggleSelectFont()"
            class="border rounded-sm w-36 border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />

          <div
            v-if="showSelectFonts"
            id="dropdownDelay"
            class="absolute w-full bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 h-[300px] overflow-x-hidden overflow-y-auto"
          >
            <ul
              class="py-2 text-sm text-gray-700 dark:text-gray-200"
              aria-labelledby="dropdownDelayButton"
            >
              <li v-for="font in fonts" :key="font">
                <a
                  @click="selectFont(font)"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer w-full text-ellipsis text-nowrap overflow-hidden"
                  :style="{ fontFamily: font.family, fontWeight: font.fontWeight }"
                >
                  {{ font.family }}
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <div class="inline-flex rounded-md shadow-xs" role="group">
            <button
              @click="changeTextSize('minus')"
              type="button"
              class="px-2 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2 6a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 2 6Z"
                  fill="currentColor"
                ></path>
              </svg>
            </button>
            <input
              type="text"
              :value="selectedLayer.fontSize"
              class="w-16 border border-gray-300 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            <button
              @click="changeTextSize('plus')"
              type="button"
              class="px-2 py-1 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M5.25 9.25a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5Z"
                  fill="currentColor"
                ></path>
              </svg>
            </button>
          </div>
        </li>
        <li>
          <div class="center relative" @click="toggleColorPicker()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 24">
              <path
                d="M11 2 5.5 16h2.25l1.12-3h6.25l1.12 3h2.25L13 2h-2zm-1.38 9L12 4.67 14.38 11H9.62z"
                fill="currentColor"
              ></path>
            </svg>
            <img
              class="h-[5px] rounded-sm"
              width="24"
              src="../assets/images/text-color.webp"
              alt=""
            />
            <input
              ref="colorPicker"
              type="color"
              class="absolute opacity-0 p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
              id="hs-color-input"
              :value="selectedLayer.fill ?? '#000000'"
              title="Choose your color"
              @input="onChangeLayerColor($event)"
            />
          </div>
        </li>
        <li
          @click="toggleTextStyle('fontWeight')"
          v-bind:class="
            selectedLayer.fontWeight === 'bold' ? 'bg-[#a570ff26] text-[#612dae] rounded-sm' : ''
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M7.08 4.72h4.44c2.03 0 3.5.3 4.41.87.92.57 1.37 1.49 1.37 2.75 0 .85-.2 1.55-.6 2.1-.4.54-.93.87-1.6.98v.1c.91.2 1.56.58 1.96 1.13.4.56.6 1.3.6 2.2 0 1.31-.47 2.33-1.4 3.06A6.1 6.1 0 0 1 12.41 19H7.08V4.72zm3.03 5.66h1.75c.82 0 1.42-.13 1.79-.38.36-.26.55-.68.55-1.26 0-.55-.2-.94-.6-1.18a3.86 3.86 0 0 0-1.9-.36h-1.6v3.18zm0 2.4v3.72h1.97c.83 0 1.45-.16 1.84-.48.4-.32.6-.8.6-1.46 0-1.19-.85-1.78-2.54-1.78h-1.87z"
            ></path>
          </svg>
        </li>
        <li
          @click="toggleTextStyle('italic')"
          v-bind:class="
            selectedLayer.fontStyle === 'italic' ? 'bg-[#a570ff26] text-[#612dae] rounded-sm' : ''
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="m14.73 6.5-3.67 11H14l-.3 1.5H6l.3-1.5h2.81l3.68-11H10l.3-1.5H18l-.3 1.5h-2.97z"
            ></path>
          </svg>
        </li>
        <!-- <li
          @click="toggleTextStyle('underline')"
          v-bind:class="selectedLayer.underline ? 'bg-[#a570ff26] text-[#612dae] rounded-sm' : ''"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M6 21.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM15.754 14.006V5h1.528v8.95c0 1.574-.476 2.807-1.424 3.703-.948.896-2.253 1.347-3.92 1.347-1.667 0-2.952-.454-3.862-1.356-.904-.902-1.358-2.145-1.358-3.733V5h1.528v9.025c0 1.168.32 2.072.966 2.704.646.632 1.592.945 2.83.945 1.183 0 2.1-.313 2.746-.945.646-.638.966-1.548.966-2.723Z"
              fill="currentColor"
            ></path>
          </svg>
        </li>
        <li
          @click="toggleTextStyle('linethrough')"
          v-bind:class="selectedLayer.linethrough ? 'bg-[#a570ff26] text-[#612dae] rounded-sm' : ''"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7.349 15.508c0 1.263.43 2.249 1.292 2.957.861.708 2.01 1.063 3.445 1.063 1.436 0 2.571-.355 3.407-1.063.836-.708 1.254-1.636 1.254-2.785 0-.885-.205-1.611-.614-2.18H18V12H6.432v1.5h7.175c.388.185.688.367.9.544.492.408.737.957.737 1.646 0 .753-.27 1.362-.813 1.828-.542.46-1.324.689-2.345.689-1.02 0-1.815-.227-2.383-.68-.561-.453-.842-1.126-.842-2.019v-.23H7.349v.23ZM8.351 11h2.918c-.667-.268-1.147-.523-1.441-.765-.473-.396-.709-.916-.709-1.56 0-.715.233-1.28.699-1.694.466-.415 1.193-.622 2.182-.622.983 0 1.723.242 2.22.727.498.485.747 1.117.747 1.895v.21h1.512v-.21c0-1.148-.405-2.093-1.215-2.833-.804-.74-1.892-1.11-3.264-1.11-1.372 0-2.447.348-3.225 1.043-.772.69-1.158 1.573-1.158 2.651 0 .948.245 1.704.734 2.268Z"
              fill="currentColor"
            ></path>
          </svg>
        </li> -->
        <li
          @click="toggleTextStyle('textTransform')"
          v-bind:class="
            selectedLayer.textTransform ? 'bg-[#a570ff26] text-[#612dae] rounded-sm' : ''
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="m15.494 6-4.487 12.018h1.534l1.135-3.134h4.982l1.127 3.134h1.6L16.896 6zm2.71 7.62L16.52 8.938a10 10 0 0 1-.173-.533 7 7 0 0 1-.13-.525h-.075a10 10 0 0 1-.312 1.058l-1.696 4.684h4.07Zm-14.392-.238q-1.05.738-1.05 2.066 0 1.326.865 2.032.864.697 2.116.697 1.083 0 1.772-.411.697-.42 1-.966.025.336.117.672.1.336.219.546h1.47v-.135a3.8 3.8 0 0 1-.244-.848A7 7 0 0 1 10 16.002v-3.99q0-1.494-.865-2.242-.865-.747-2.444-.747-1.57 0-2.494.773t-.924 1.805v.059h1.503v-.05q0-.555.437-.966.437-.412 1.445-.412.999 0 1.41.496.412.487.412 1.285v.621H6.499q-1.638 0-2.687.748m.898 3.166q-.437-.428-.437-1.184t.605-1.201 1.789-.445h1.814v1.26q0 .72-.747 1.36-.748.63-1.663.63-.925 0-1.36-.42Z"
              clip-rule="evenodd"
            ></path>
          </svg>
        </li>
        <li></li>
      </ul>
    </div>
  </div>
</template>
<script setup>
import { getGoogleFonts } from '@/services/font.service'
import { useCanvasStore } from '@/stores/canvas'
import { storeToRefs } from 'pinia'
import { onMounted, ref, toRaw, watch } from 'vue'
import WebFont from 'webfontloader'

const fonts = ref([])
const showSelectFonts = ref(false)
const canvasStore = useCanvasStore()
const colorPicker = ref(null)
const { selectedLayer } = storeToRefs(canvasStore)

const toggleSelectFont = () => {
  showSelectFonts.value = !showSelectFonts.value
}

const populateFontSelect = async () => {
  const res = await getGoogleFonts()
  fonts.value = res
}

const selectFont = (font) => {
  selectedLayer.value.fontFamily = font.family
  console.log(selectedLayer)
  toRaw(canvasStore.canvas).renderAll()
  showSelectFonts.value = false
}

// Hàm tải các font hiển thị trong dropdown
const loadDropdownFonts = (fontsToLoad) => {
  if (fontsToLoad.length === 0) return

  const fontFamilies = fontsToLoad.map((font) => {
    const variant = font.variants.includes('regular') ? 'regular' : font.variants[0]
    return `${font.family}:${variant}`
  })

  WebFont.load({
    google: {
      families: fontFamilies,
    },
    timeout: 2000, // Tăng timeout nếu cần
  })
}

const changeTextSize = (type) => {
  if (type === 'minus') {
    selectedLayer.value.fontSize =
      selectedLayer.value.fontSize > 1 ? selectedLayer.value.fontSize - 1 : 1
  } else {
    selectedLayer.value.fontSize = selectedLayer.value.fontSize + 1
  }
  toRaw(canvasStore.canvas).renderAll()
}

const toggleColorPicker = () => {
  colorPicker.value.click()
}

const onChangeLayerColor = (event) => {
  const newColor = event.target.value
  selectedLayer.value.set({
    fill: newColor,
    stroke: newColor,
  })
  toRaw(canvasStore.canvas).renderAll()
}

const toggleTextStyle = (style) => {
  if (style === 'fontWeight') {
    selectedLayer.value.fontWeight = selectedLayer.value.fontWeight === 'normal' ? 'bold' : 'normal'
  } else if (style === 'italic') {
    selectedLayer.value.fontStyle = selectedLayer.value.fontStyle === 'normal' ? 'italic' : 'normal'
  } else if (style === 'underline') {
    selectedLayer.value.underline = !selectedLayer.value.underline
  } else if (style === 'linethrough') {
    selectedLayer.value.linethrough = !selectedLayer.value.linethrough
  } else if (style === 'textTransform') {
    selectedLayer.value.textTransform = !selectedLayer.value.textTransform
    selectedLayer.value.text = selectedLayer.value.textTransform
      ? selectedLayer.value.text.toUpperCase()
      : selectedLayer.value.text.toLowerCase()
  }
  toRaw(canvasStore.canvas).renderAll()
}

watch(showSelectFonts, (newValue) => {
  if (newValue && fonts.value.length > 0) {
    loadDropdownFonts(fonts.value)
  }
})

onMounted(async () => {
  await populateFontSelect()
})
</script>
