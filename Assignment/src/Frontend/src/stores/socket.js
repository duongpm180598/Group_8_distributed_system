import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useSocketStore = defineStore('chat', {
  state: () => ({
    socket: null,
    messages: [],
    connectionStatus: false,
  }),
  actions: {
    // Phương thức để kết nối WebSocket
    connectWebSocket() {
      if (this.socket && this.socket.connected) {
        console.log('Socket already connected.')
        return
      }

      this.socket = io('http://localhost:3000', {
        // Tùy chọn cấu hình socket.io-client nếu cần
        // Ví dụ: autoConnect: false,
      })

      this.socket.on('connect', () => {
        this.connectionStatus = true
        console.log('Connected to NestJS WebSocket server (via store)')
      })

      this.socket.on('disconnect', () => {
        this.connectionStatus = false
        console.log('Disconnected from NestJS WebSocket server (via store)')
      })

      this.socket.on('connect_error', (err) => {
        console.error('Connection Error (via store):', err)
        this.connectionStatus = false
      })

      // Lắng nghe sự kiện 'connectionSuccess' từ server
      this.socket.on('connectionSuccess', (data) => {
        this.addMessage({ message: data })
      })

      // Lắng nghe sự kiện 'receiveMessage' từ server
      this.socket.on('receiveMessage', (data) => {
        this.addMessage(data)
      })

      // Lắng nghe sự kiện 'roomMessage' từ server
      this.socket.on('roomMessage', (data) => {
        this.addMessage({ message: data })
      })
    },

    // Phương thức để ngắt kết nối WebSocket
    disconnectWebSocket() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null // Đặt lại socket
      }
    },

    // Phương thức để gửi tin nhắn
    sendMessage(message) {
      if (this.socket && this.socket.connected && message.trim() !== '') {
        this.socket.emit('sendMessage', message)
      } else {
        console.warn('Socket not connected or message is empty. Cannot send.')
      }
    },

    // Phương thức để tham gia phòng
    joinRoom(roomName) {
      if (this.socket && this.socket.connected && roomName.trim() !== '') {
        this.socket.emit('joinRoom', roomName)
      } else {
        console.warn('Socket not connected or room name is empty. Cannot join room.')
      }
    },

    // Phương thức để rời phòng
    leaveRoom(roomName) {
      if (this.socket && this.socket.connected && roomName.trim() !== '') {
        this.socket.emit('leaveRoom', roomName)
      } else {
        console.warn('Socket not connected or room name is empty. Cannot leave room.')
      }
    },

    // Thêm tin nhắn vào danh sách (để quản lý trong store)
    addMessage(msg) {
      this.messages.push(msg)
    },

    // Xóa tất cả tin nhắn (ví dụ)
    clearMessages() {
      this.messages = []
    },
  },
})
