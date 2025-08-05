<template>
  <main>
    <div class="mt-24 px-12">
      <div class="max-w-md mx-auto flex items-center space-x-4">
        <form class="flex-grow">
          <label
            for="default-search"
            class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >Tìm kiếm</label
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
              placeholder="Tìm kiếm theo tên"
              required
              @input="onFilter($event)"
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

        <div class="grid grid-cols-3 md:grid-cols-6 gap-4" v-if="designs.length > 0">
          <template v-for="design in designs" :key="design.designId">
            <div class="relative group min-h-[250px] h-full">
              <a :href="'/design/' + design.designId" class="block h-full">
                <template v-if="design.thumbnail">
                  <div class="h-full border-1 rounded-sm">
                    <img
                      class="w-full h-full object-cover rounded-lg"
                      :src="design.thumbnail"
                      alt=""
                    />
                  </div>
                </template>
                <template v-else>
                  <div class="bg-white h-full border-1 rounded-sm"></div>
                </template>

                <div class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  <div class="truncate">{{ design.name }}</div>
                </div>
              </a>

              <button
                @click="setSelectedDesign(design.designId)"
                class="cursor-pointer absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <svg
                  class="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </main>
  <template v-if="openModal">
    <div
      tabindex="-1"
      class="fixed top-0 right-0 left-0 bottom-0 z-50 flex justify-center items-center backdrop-blur-sm bg-opacity-50"
    >
      <div class="relative p-4 w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <button
            type="button"
            class="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            data-modal-hide="popup-modal"
          >
            <svg
              class="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
          <div class="p-4 md:p-5 text-center">
            <svg
              class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
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
                d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Bạn có chắc muốn xóa thiết kế này không?
            </h3>
            <button
              @click="closeModal()"
              type="button"
              class="py-2.5 px-5 me-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
            >
              Hủy
            </button>
            <button
              @click="handleDelete()"
              data-modal-hide="popup-modal"
              type="button"
              class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import router from '@/router'
import { createOrUpdateDesign, deleteDesignById, getDesigns } from '@/services/design.service'
import { initModals } from 'flowbite'

const designs = ref([])
const originDesigns = ref([])
const selectedId = ref('')
const openModal = ref(false)

onMounted(() => {
  initModals()
  getAllDesigns()
})
const setSelectedDesign = (designId) => {
  openModal.value = true
  selectedId.value = designId
}
const getAllDesigns = async () => {
  const res = await getDesigns()
  designs.value = res ?? []
  originDesigns.value = res ?? []
}

const createDesign = async () => {
  const res = await createOrUpdateDesign({})
  router.push(`/design/${res.designId}`)
}
const closeModal = () => {
  openModal.value = false
}
const handleDelete = async () => {
  const id = selectedId.value
  if (id) {
    const res = await deleteDesignById(selectedId.value)
    if (res) {
      selectedId.value = ''
      await getAllDesigns()
      closeModal()
    }
  }
}
const onFilter = (event) => {
  const value = event.target.value
  if (value) {
    const filtered = originDesigns.value.filter((design) =>
      design.name.toLowerCase().includes(value),
    )
    designs.value = filtered
  } else {
    designs.value = originDesigns.value
  }
}
</script>
<style>
#popup-modal {
  backdrop-filter: blur(4px);
  background: rgba(0, 0, 0, 0.15);
}
</style>
