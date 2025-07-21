import { CIRCLE, SQUARE, TEXT_OPTIONS, TRIANGLE } from '@/constants/shape'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useCanvasStore = defineStore('canvas', {
  state: () => ({
    canvas: null,
    selectedLayer: null,
    isDrawingMode: false,
    socket: null,
    connectionStatus: false,
  }),
  actions: {
    setCanvas(canvasInstance) {
      this.canvas = canvasInstance
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
        this.canvas.isDrawingMode = false
        this.canvas.add(text)
        this.selectedLayer = text
        console.log(this.selectedLayer)
        this.canvas.renderAll()
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
        this.canvas.isDrawingMode = false
        this.canvas.add(shape)
        this.canvas.renderAll()
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
        this.canvas.add(img)
        this.canvas.renderAll()
      })
    },
    connectWebSocket() {
      if (this.socket && this.socket.connected) {
        console.log('Socket already connected for canvas sync.')
        return
      }

      this.socket = io('http://localhost:3000') // Kết nối đến NestJS WebSocket Gateway

      this.socket.on('connect', () => {
        this.connectionStatus = true
        console.log('Connected to NestJS WebSocket server for canvas sync.')
        // Nếu dùng phòng, gửi event joinRoom ở đây
        // if (this.currentDesignId) {
        //   this.socket.emit('joinRoom', this.currentDesignId);
        // }
      })

      this.socket.on('disconnect', () => {
        this.connectionStatus = false
        console.log('Disconnected from NestJS WebSocket server for canvas sync.')
      })

      this.socket.on('connect_error', (err) => {
        console.error('Connection Error for canvas sync:', err)
        this.connectionStatus = false
      })

      // Lắng nghe sự kiện 'canvasUpdated' từ server
      this.socket.on('canvasUpdated', (canvasState) => {
        console.log(canvasState)
        if (this.canvas && canvasState) {
          // Ngăn chặn việc gửi lại update đến server khi mình nhận được update từ server
          // Đây là một kỹ thuật quan trọng để tránh vòng lặp vô hạn
          this.canvas.loadFromJSON(canvasState, () => {
            // console.log(canvasState)
            // this.canvas.renderAll()
            console.log('Canvas state loaded from server.')
          })
        }
      })

      // Lắng nghe các sự kiện đồng bộ hóa chi tiết (nếu bạn chọn cách này)
      this.socket.on('objectAdded', ({ object, senderId }) => {
        if (this.canvas && this.socket.id !== senderId) {
          // Chỉ thêm nếu không phải là người gửi
          fabric.util.enlivenObjects([object], (objects) => {
            objects.forEach((obj) => {
              this.canvas.add(obj)
            })
            this.canvas.renderAll()
          })
          console.log('Object added from remote user.')
        }
      })

      this.socket.on('objectModified', ({ object, senderId }) => {
        if (this.canvas && this.socket.id !== senderId) {
          const targetObject = this.canvas.getObjects().find((obj) => obj.id === object.id)
          if (targetObject) {
            targetObject.set(object) // Cập nhật thuộc tính của đối tượng
            this.canvas.renderAll()
            console.log('Object modified from remote user.')
          }
        }
      })

      this.socket.on('objectDeleted', ({ objectId, senderId }) => {
        if (this.canvas && this.socket.id !== senderId) {
          const targetObject = this.canvas.getObjects().find((obj) => obj.id === objectId)
          if (targetObject) {
            this.canvas.remove(targetObject)
            this.canvas.renderAll()
            console.log('Object deleted from remote user.')
          }
        }
      })
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

      // --- Lắng nghe object:removed (khi một đối tượng bị xóa) ---
      this.canvas.on('object:removed', (e) => {
        // Gửi toàn bộ trạng thái canvas
        this.sendCanvasState()
        // Hoặc chỉ gửi ID của đối tượng bị xóa:
        // this.sendObjectDeleted(e.target.id); // Bạn cần gán ID duy nhất cho các đối tượng Fabric.js
      })

      // Lắng nghe sự kiện selection:cleared để gửi update khi không còn chọn gì
      this.canvas.on('selection:cleared', () => {
        // Thường không cần thiết trừ khi bạn muốn đồng bộ bỏ chọn
      })
    },

    // Phương thức gửi toàn bộ trạng thái canvas đến server
    sendCanvasState() {
      if (this.socket && this.socket.connected && this.canvas) {
        const json = this.canvas.toJSON()
        this.socket.emit('updateCanvas', json)
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
