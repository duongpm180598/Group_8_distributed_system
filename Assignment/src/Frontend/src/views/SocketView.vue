<template>
  <div>
    <h1>Vue.js WebSocket Chat (using Pinia)</h1>
    <p v-if="chatStore.connectionStatus">Connected to server!</p>
    <p v-else>Connecting...</p>

    <div>
      <input v-model="message" @keyup.enter="sendMessage" placeholder="Type your message..." />
      <button @click="sendMessage">Send</button>
    </div>

    <div style="margin-top: 20px">
      <input v-model="roomName" placeholder="Room name" />
      <button @click="joinRoom">Join Room</button>
      <button @click="leaveRoom">Leave Room</button>
    </div>

    <div class="messages">
      <div v-for="(msg, index) in chatStore.messages" :key="index">
        <strong>{{ msg.senderId || 'Server' }}:</strong> {{ msg.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { useSocketStore } from '@/stores/socket' // Thay đổi đường dẫn nếu store của bạn ở vị trí khác
import { ref, onMounted, onBeforeUnmount } from 'vue' // Dùng Composition API để code gọn hơn

export default {
  name: 'ChatComponent',
  setup() {
    const chatStore = useSocketStore()

    const message = ref('')
    const roomName = ref('')

    onMounted(() => {
      chatStore.connectWebSocket() // Kết nối khi component được mount
    })

    onBeforeUnmount(() => {
      chatStore.disconnectWebSocket() // Ngắt kết nối khi component bị unmount
    })

    const sendMessage = () => {
      if (message.value.trim() !== '') {
        chatStore.sendMessage(message.value)
        message.value = ''
      }
    }

    const joinRoom = () => {
      if (roomName.value.trim() !== '') {
        chatStore.joinRoom(roomName.value)
      }
    }

    const leaveRoom = () => {
      if (roomName.value.trim() !== '') {
        chatStore.leaveRoom(roomName.value)
      }
    }

    return {
      chatStore, // Truy cập trạng thái và hành động từ store
      message,
      roomName,
      sendMessage,
      joinRoom,
      leaveRoom,
    }
  },
}
</script>

<style scoped>
.messages {
  border: 1px solid #eee;
  padding: 10px;
  height: 200px;
  overflow-y: scroll;
  margin-top: 20px;
}
</style>
