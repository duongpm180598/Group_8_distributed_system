import { CIRCLE, SQUARE, TEXT_OPTIONS, TRIANGLE } from '@/constants/shape'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { toRaw } from 'vue'

export const useCanvasStore = defineStore('canvas', {
  state: () => ({
    canvas: null,
    selectedLayer: null,
    isDrawingMode: false,
    socket: null,
    currentRoomId: '',
    connectionStatus: false,
    isUpdatingFromRemote: false,
    roomUsers: [],
  }),
  actions: {
    setCanvas(canvasInstance) {
      this.canvas = canvasInstance
    },
    setRoomId(roomId) {
      this.currentRoomId = roomId
    },
    setSelectedLayer(layer) {
      this.selectedLayer = layer
      if (this.canvas) {
        toRaw(this.canvas).renderAll()
      }
    },
    clearCanvas() {
      if (this.canvas) {
        this.canvas.clear()
        this.canvas = null
        this.selectedLayer = null
      }
    },
    setDrawingMode(isDrawingMode) {
      if (this.canvas) {
        this.isDrawingMode = isDrawingMode
        this.canvas.isDrawingMode = this.isDrawingMode
      }
    },

    async addText() {
      if (this.canvas) {
        const options = TEXT_OPTIONS
        const text = new fabric.Text('Sample text', options)
        text.set({
          left: this.canvas.width / 2,
          top: this.canvas.height / 2,
          originX: 'center',
          originY: 'center',
        })
        toRaw(this.canvas).isDrawingMode = false
        toRaw(this.canvas).add(text)
        toRaw(this.canvas).renderAll()
        this.selectedLayer = text
      }
    },
    addLine() {},
    addShape(shapeType = 'square') {
      if (this.canvas) {
        let shape
        let options = SQUARE
        switch (shapeType) {
          case 'circle':
            options = CIRCLE
            shape = new fabric.Circle(options)
            break
          case 'triangle':
            options = TRIANGLE
            shape = new fabric.Triangle(options)
            break
          default:
            shape = new fabric.Rect(options)
            break
        }
        const centerX = this.canvas.width / 2
        const centerY = this.canvas.height / 2
        shape.set({
          left: centerX,
          top: centerY,
          originX: 'center',
          originY: 'center',
        })
        toRaw(this.canvas).isDrawingMode = false
        toRaw(this.canvas).add(shape)
        toRaw(this.canvas).renderAll()
      }
    },
    addImage(imageUrl) {
      new fabric.Image.fromURL(imageUrl, (img) => {
        img.set({
          width: img.width,
          height: img.height,
          left: (this.canvas.width - img.width * (this.canvas.width / (img.width + 100))) / 2,
          top: (this.canvas.height - img.height * (this.canvas.height / (img.height + 100))) / 2,
          scaleX: 1,
          scaleY: 1,
        })
        if (img.width > this.canvas.width || img.height > this.canvas.height) {
          const scaleFactor =
            Math.min(this.canvas.width / img.width, this.canvas.height / img.height) * 0.8
          img.scale(scaleFactor)
          img.set({
            left: (canvas.width - img.scaledWidth) / 2,
            top: (canvas.height - img.scaledHeight) / 2,
          })
        }
        toRaw(this.canvas).add(img)
        toRaw(this.canvas).renderAll()
      })
    },
    connectWebSocket() {
      if (this.socket && this.socket.connected) {
        console.log('Socket already connected for canvas sync.')
        return
      }

      this.socket = io('http://localhost:3000') // Kết nối đến NestJS WebSocket Gateway

      this.socket.on('connect', () => {
        console.log('Connected to NestJS WebSocket server for canvas sync.', this.currentRoomId)
        if (this.currentRoomId && !this.connectionStatus) {
          const payload = {
            roomId: this.currentRoomId,
            username: localStorage.getItem('username'),
          }
          this.socket.emit('joinRoom', payload)
          this.connectionStatus = true
        }
      })

      this.socket.on('disconnect', () => {
        this.connectionStatus = false
        console.log('Disconnected from NestJS WebSocket server for canvas sync.')
      })

      this.socket.on('connect_error', (err) => {
        console.error('Connection Error for canvas sync:', err)
        this.connectionStatus = false
      })

      this.socket.on('canvasRestored', (canvasState) => {
        if (this.canvas && canvasState) {
          this.canvas.off('object:added')
          this.canvas.off('object:modified')
          this.canvas.off('object:removed')
          this.canvas.off('canvas:cleared')

          this.canvas.loadFromJSON(canvasState, () => {
            this.canvas.renderAll()
            this.setupCanvasEvents()
          })
        }
      })

      this.socket.on('canvasUpdated', (data) => {
        const { roomId, canvasState } = data

        if (this.canvas && canvasState && roomId === this.currentRoomId) {
          console.log(`Received canvas update for room ${roomId} from server.`)

          this.isUpdatingFromRemote = true

          this.canvas.off()

          this.canvas.loadFromJSON(canvasState, () => {
            this.canvas.renderAll()
            this.isUpdatingFromRemote = false
            this.setupCanvasEvents()
          })
        } else if (roomId !== this.currentRoomId) {
          console.log(
            `Received update for room ${roomId}, but current room is ${this.currentRoomId}. Ignoring.`,
          )
        }
      })

      this.socket.on('roomUsersUpdated', (users) => {
        console.log('CLIENT: Received updated room user list:', users)
        this.roomUsers = users
      })
    },

    setupCanvasEvents() {
      if (!this.canvas) return
      this.canvas.on('object:added', () => {
        if (!this.isUpdatingFromRemote) this.sendCanvasState()
      })
      this.canvas.on('object:modified', () => {
        if (!this.isUpdatingFromRemote) this.sendCanvasState()
      })
      this.canvas.on('object:removed', () => {
        if (!this.isUpdatingFromRemote) this.sendCanvasState()
      })
      this.canvas.on('canvas:cleared', () => {
        if (!this.isUpdatingFromRemote) this.sendCanvasState()
      })
    },

    leaveRoom() {
      if (this.socket && this.currentRoomId) {
        this.socket.emit('leaveRoom', this.currentRoomId)
        this.currentRoomId = null
        if (this.canvas) {
          this.canvas.dispose()
          this.canvas = null
        }
      }
    },

    disconnectWebSocket() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
    },

    // Hàm để thiết lập lắng nghe sự kiện Fabric.js và gửi lên server
    setupCanvasListeners() {
      if (!this.canvas) return
      this.canvas.on('path:created', (e) => {
        console.log('Path created locally, sending to server.')
        // Gửi toàn bộ trạng thái canvas
        this.sendCanvasState()
        // Hoặc chỉ gửi dữ liệu path mới:
        // this.sendObjectAdded(e.path.toObject());
      })

      // --- Lắng nghe object:modified (khi một đối tượng được kéo, resize, rotate) ---
      this.canvas.on('object:modified', (e) => {
        console.log('Object modified locally, sending to server.')
        this.sendCanvasState()
        // Hoặc chỉ gửi dữ liệu đối tượng bị thay đổi:
        // this.sendObjectModified(e.target.toObject());
      })

      // --- Lắng nghe object:added (khi thêm hình dạng, text, image) ---
      this.canvas.on('object:added', (e) => {
        console.log('Object added locally, sending to server.')
        // Kiểm tra xem đối tượng có phải là path:created đã được xử lý không
        // Fabric.js tạo object:added sau path:created, tránh gửi 2 lần
        if (e.target && e.target.type !== 'path') {
          this.sendCanvasState()
          // Hoặc chỉ gửi dữ liệu đối tượng mới:
          // this.sendObjectAdded(e.target.toObject());
        }
      })

      this.canvas.on('selection:created', (e) => {
        if (e.selected && e.selected.length === 1) {
          this.setSelectedLayer(e.selected[0])
        } else if (e.selected && e.selected.length > 1) {
          this.setSelectedLayer(null) // Hoặc e.selected nếu bạn muốn lưu tất cả
        }
      })

      this.canvas.on('selection:updated', (e) => {
        if (e.selected && e.selected.length === 1) {
          this.setSelectedLayer(e.selected[0])
        } else if (e.selected && e.selected.length > 1) {
          this.setSelectedLayer(null)
        }
      })

      this.canvas.on('selection:cleared', () => {
        this.setSelectedLayer(null)
      })
    },

    // Phương thức gửi toàn bộ trạng thái canvas đến server
    sendCanvasState() {
      if (this.socket && this.socket.connected && this.canvas && !this.isUpdatingFromRemote) {
        const canvasState = this.canvas.toJSON()
        this.socket.emit('updateCanvas', { roomId: this.currentRoomId, canvasState })
        console.log('Sent canvas state to server.')
      }
    },

    // Các phương thức gửi cập nhật chi tiết (nếu bạn chọn cách này)
    sendObjectAdded(objectData) {
      if (this.socket && this.socket.connected) {
        this.socket.emit('addObject', objectData)
      }
    },
    sendObjectModified(objectData) {
      if (this.socket && this.socket.connected) {
        this.socket.emit('modifyObject', objectData)
      }
    },
    sendObjectDeleted(objectId) {
      if (this.socket && this.socket.connected) {
        this.socket.emit('deleteObject', objectId)
      }
    },
  },
  getters: {
    getSelectedLayer: (state) => state.selectedLayer,
    getCanvas: (state) => state.canvas,
    isCanvasInitialized: (state) => !!state.canvas,
  },
})
