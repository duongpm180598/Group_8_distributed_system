<template>
  <Disclosure
    v-if="isDesign"
    as="nav"
    class="bg-gradient-to-br from-green-300 to-blue-500"
    v-slot="{ open }"
  >
    <div class="mx-auto px-2 sm:px-6 lg:px-8">
      <div class="relative flex h-16 items-center justify-between">
        <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div class="hidden sm:block">
            <div class="flex space-x-4">
              <a
                @click="navigateHome()"
                class="text-[#111113] hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium cursor-pointer"
                >Home</a
              >
              <a
                @click="exportCanvas()"
                class="text-[#111113] hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium cursor-pointer"
                >Tải xuống</a
              >
            </div>
          </div>
        </div>
        <div
          class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"
        >
          <div class="flex -space-x-4 rtl:space-x-reverse">
            <template v-for="user in filteredRoomUsers" :key="user.id">
              <img
                class="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800"
                :src="
                  user.avatar || 'https://flowbite.com/docs/images/people/profile-picture-1.jpg'
                "
                :alt="user.username || 'User'"
              />
            </template>
          </div>

          <input
            type="text"
            name="name"
            id="name"
            class="block min-w-0 grow py-1.5 ring-offset-0 pr-3 text-base text-white placeholder:text-[#111113] outline-none sm:text-sm/6 title-input"
            placeholder="Untitled"
            :value="design.name"
            @input="debouncedOnChangeDesignName($event)"
          />

          <!-- Profile dropdown -->
          <!-- <Menu as="div" class="relative ml-3">
            <div>
              <MenuButton
                class="relative flex rounded-full bg-gray-800 text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
              >
                <span class="absolute -inset-1.5" />
                <span class="sr-only">Open user menu</span>
                <img
                  class="size-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
              </MenuButton>
            </div>
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems
                class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden"
              >
                <MenuItem v-slot="{ active }">
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-100 outline-hidden' : '',
                      'block px-4 py-2 text-sm text-gray-700',
                    ]"
                    >Your Profile</a
                  >
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-100 outline-hidden' : '',
                      'block px-4 py-2 text-sm text-gray-700',
                    ]"
                    >Settings</a
                  >
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a
                    href="#"
                    :class="[
                      active ? 'bg-gray-100 outline-hidden' : '',
                      'block px-4 py-2 text-sm text-gray-700',
                    ]"
                    >Sign out</a
                  >
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu> -->
        </div>
      </div>
    </div>

    <DisclosurePanel class="sm:hidden">
      <div class="space-y-1 px-2 pt-2 pb-3">
        <DisclosureButton
          v-for="item in navigation"
          :key="item.name"
          as="a"
          :href="item.href"
          :class="[
            item.current
              ? 'bg-gray-900 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white',
            'block rounded-md px-3 py-2 text-base font-medium',
          ]"
          :aria-current="item.current ? 'page' : undefined"
          >{{ item.name }}</DisclosureButton
        >
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup>
import router from '@/router'
import { createOrUpdateDesign } from '@/services/design.service'
import { useCanvasStore } from '@/stores/canvas'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { debounce } from 'lodash'
import { computed, toRaw } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const canvasStore = useCanvasStore()
const { design } = toRaw(canvasStore)
// const currentUsername = localStorage.getItem('username')
const isDesign = computed(() => route.path.toLowerCase().includes('/design'))

const filteredRoomUsers = computed(() => canvasStore.roomUsers)

const navigateHome = async () => {
  await canvasStore.leaveRoom()
  router.push('/')
}

const debouncedOnChangeDesignName = debounce((event) => {
  const newName = event.target.value
  onChangeDesignName(newName)
}, 1000)

const onChangeDesignName = async (name) => {
  const payload = {
    ...toRaw(design.value),
    name,
  }
  const res = await createOrUpdateDesign(payload)
  if (res) {
    canvasStore.setDesign(payload)
  }
}

const exportCanvas = () => {
  const a = document.createElement('a')
  let dt = canvasStore.canvas.toDataURL({
    format: 'png',
    quality: 1,
  })
  dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream')
  dt = dt.replace(
    /^data:application\/octet-stream/,
    'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png',
  )

  a.href = dt
  a.download = `${toRaw(canvasStore).design.value.name}.png`
  a.click()
}
</script>

<style>
.title-input {
  border: unset;
  outline: none;
  background-color: transparent;
}

.title-input:focus {
  border-radius: 4px;
  border: 1px solid #ffffff;
}

.title-input::placeholder {
  color: #ffffff;
}
</style>
