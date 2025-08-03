<template>
  <main>
    <div class="mt-24 px-12">
      <div class="max-w-md mx-auto flex items-center space-x-4">
        <form class="flex-grow">
          <label
            for="default-search"
            class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >Search</label
          >
          <div class="relative">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                class="w-4 h-4 text-gray-500 dark:text-gray-400"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              type="search"
              id="default-search"
              class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search Mockups, Logos..."
              required
            />
          </div>
        </form>

        <button
          @click="createDesign()"
          type="button"
          class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-4 me-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        >
          <svg
            class="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span class="sr-only">Thêm mới</span>
        </button>
      </div>

      <div class="mt-5">
        <p class="max-w-lg text-3xl font-semibold leading-loose text-gray-900 dark:text-white">
          Thiết kế gần đây
        </p>

        <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
          <template v-for="design in designs" :key="designs.designId">
            <a :href="'/design/' + design.designId" class="block">
              <template v-if="design.thumbnail">
                <div class="h-full border-1 rounded-sm">
                  <img class="h-auto max-w-full rounded-lg" :src="design.thumbnail" alt="" />
                </div>
              </template>
              <template v-else>
                <div class="bg-white h-full border-1 rounded-sm"></div>
              </template>
            </a>
          </template>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import router from '@/router'
import { createOrUpdateDesign, getDesigns } from '@/services/design.service'

const designs = ref([])

onMounted(() => {
  getAllDesigns()
})

const getAllDesigns = async () => {
  const res = await getDesigns()
  designs.value = res ?? []
}

const createDesign = async () => {
  const res = await createOrUpdateDesign({})
  router.push(`/design/${res.designId}`)
}
</script>
