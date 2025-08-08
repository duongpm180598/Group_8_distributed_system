import { CIRCLE, SQUARE, TEXT_OPTIONS, TRIANGLE } from '@/constants/shape'
import { createOrUpdateDesign } from '@/services/design.service'
import { uploadFile } from '@/services/image.service'
import { debounce } from 'lodash'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { toRaw } from 'vue'

export const useCanvasStore = defineStore('canvas', {
  state: () => ({
    design: {},
    canvas: null,
    selectedLayer: null,
    isDrawingMode: false,
    socket: null,
    currentRoomId: '',
    connectionStatus: false,
    isUpdatingFromRemote: false,
    roomUsers: [],
    loading: false,
  }),
  actions: {
    setCanvas(canvasInstance) {
      this.canvas = canvasInstance
    },
    setDesign(designInstance) {
      this.design = designInstance
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
    updateColor(callback) {
      if (typeof callback === 'function' && callback) {
        callback()
      }
      if (this.canvas) {
        toRaw(this.canvas).renderAll()
      }
      this.sendCanvasState('updateColor')
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
        const text = new fabric.IText('Sample text', options)
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
        this.selectedLayer = shape
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

      this.socket = io('http://localhost:3000')

      this.socket.on('connect', () => {
        console.log('Connected to NestJS WebSocket server for canvas sync.', this.currentRoomId)
        if (this.currentRoomId && !this.connectionStatus) {
          const payload = {
            roomId: this.currentRoomId,
            username: JSON.parse(localStorage.getItem('username')),
            username: JSON.parse(localStorage.getItem('avatar')),
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
          this.canvas.off()
          toRaw(this.canvas).loadFromJSON(canvasState, () => {
            this.canvas.renderAll()
            this.setupAllCanvasListeners()
          })
        }
      })

      this.socket.on('canvasUpdated', (data) => {
        const { roomId, canvasState } = data
        const rawCanvas = toRaw(this.canvas)
        if (this.canvas && canvasState && roomId === this.currentRoomId) {
          console.log(`Received canvas update for room ${roomId} from server.`)
          this.canvas.off()

          const isLocalUserActive = !!rawCanvas.getActiveObject()

          if (isLocalUserActive) {
            rawCanvas.discardActiveObject()
          }

          this.isUpdatingFromRemote = true
          rawCanvas.loadFromJSON(canvasState, () => {
            rawCanvas.renderAll()
            this.isUpdatingFromRemote = false
            setTimeout(() => {
              this.setupAllCanvasListeners()
            }, 1000)
          })
        } else if (roomId !== this.currentRoomId) {
          console.log(
            `Received update for room ${roomId}, but current room is ${this.currentRoomId}. Ignoring.`,
          )
        }
      })

      this.socket.on('roomUsersUpdated', (users) => {
        this.roomUsers = users
      })

      fabric.Text.fromObject = function (object, callback) {
        return callback && callback(new fabric.IText(object.text, object))
      }
    },

    setupAllCanvasListeners() {
      if (!this.canvas) return

      const rawCanvas = toRaw(this.canvas)
      rawCanvas.off()

      const debouncedSendCanvasState = debounce(() => {
        this.sendCanvasState('debounced')
      }, 300)

      rawCanvas.on('object:added', () => {
        if (!this.isUpdatingFromRemote) this.sendCanvasState('object:added')
      })
      rawCanvas.on('object:modified', () => {
        if (!this.isUpdatingFromRemote) this.sendCanvasState('object:modified')
      })
      rawCanvas.on('object:removed', () => {
        if (!this.isUpdatingFromRemote) this.sendCanvasState('object:removed')
      })
      rawCanvas.on('canvas:cleared', () => {
        if (!this.isUpdatingFromRemote) this.sendCanvasState('canvas:cleared')
      })
      rawCanvas.on('path:created', () => {
        if (!this.isUpdatingFromRemote) this.sendCanvasState('path:created')
      })

      rawCanvas.on('object:moving', () => {
        if (!this.isUpdatingFromRemote) {
          debouncedSendCanvasState()
        }
      })

      rawCanvas.on('selection:created', (e) => {
        if (e.selected && e.selected.length === 1) {
          this.setSelectedLayer(e.selected[0])
        } else {
          this.setSelectedLayer(null)
        }
      })
      rawCanvas.on('selection:updated', (e) => {
        if (e.selected && e.selected.length === 1) {
          this.setSelectedLayer(e.selected[0])
        } else {
          this.setSelectedLayer(null)
        }
      })
      rawCanvas.on('selection:cleared', () => {
        this.setSelectedLayer(null)
      })

      rawCanvas.isDrawingMode = false
      rawCanvas.selection = true
    },

    async leaveRoom() {
      try {
        if (!this.loading) {
          this.loading = true
          if (this.socket && this.currentRoomId) {
            let canvasState = null
            if (this.canvas) {
              canvasState = toRaw(this.canvas).toJSON()
            }
            this.socket.emit('leaveRoom', this.currentRoomId)
          }
          let canvasImage = null
          if (this.canvas) {
            canvasImage = this.canvas.toDataURL({
              format: 'png ',
              quality: 0.5,
              background: '#ffffff',
            })
            const thumbnail = await uploadFile(canvasImage)
            if (this.canvas) {
              const payload = {
                ...toRaw(this.design),
                canvas: toRaw(this.canvas).toJSON(),
                thumbnail,
              }
              await createOrUpdateDesign(payload)
              this.currentRoomId = null
              this.canvas.dispose()
              this.canvas = null
            }
          }
        }
      } catch (error) {
        console.error('Failed to save canvas state and image:', error)
      } finally {
        this.loading = false
      }
    },

    disconnectWebSocket() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
    },
    setupCanvasListeners() {
      if (!this.canvas) return

      this.canvas.on('path:created', (e) => {
        console.log('Path created locally, sending to server.')
        this.sendCanvasState('path:created')
      })

      this.canvas.on('object:modified', (e) => {
        console.log('Object modified locally, sending to server.')
        this.sendCanvasState('object:modified')
      })

      this.canvas.on('object:added', (e) => {
        console.log('Object added locally, sending to server.')
        if (e.target && e.target.type !== 'path') {
          this.sendCanvasState('object:added')
        }
      })

      //   this.canvas.on('object:moving', (e) => {
      //     const activeObject = e.target
      //     if (activeObject) {
      //       this.canvas.bringToFront(activeObject)
      //       this.canvas.renderAll()
      //     }
      //   })

      this.canvas.on('selection:created', (e) => {
        if (e.selected && e.selected.length === 1) {
          this.setSelectedLayer(e.selected[0])
        } else if (e.selected && e.selected.length > 1) {
          this.setSelectedLayer(null)
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
    sendCanvasState(method) {
      if (this.socket && this.socket.connected && this.canvas && !this.isUpdatingFromRemote) {
        const canvasState = this.canvas.toJSON()
        this.socket.emit('updateCanvas', { roomId: this.currentRoomId, canvasState })
        console.log('Sent canvas state to server.', method)
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
