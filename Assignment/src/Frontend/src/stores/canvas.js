import { CIRCLE, SQUARE, TEXT_OPTIONS, TRIANGLE } from '@/constants/shape'
import { defineStore } from 'pinia'

export const useCanvasStore = defineStore('canvas', {
  state: () => ({
    canvas: null, // This will hold our fabric.Canvas instance
  }),
  actions: {
    setCanvas(canvasInstance) {
      this.canvas = canvasInstance
    },
    clearCanvas() {
      if (this.canvas) {
        this.canvas.clear()
        this.canvas = null
      }
    },
    addText() {
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
        this.canvas.renderAll()

        if (text.editable) {
          text.enterEditing()
          text.setSelectionStart(0) // Optional: Set cursor at beginning
          text.setSelectionEnd(text.text.length) // Optional: Select all text
        }
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
  },
  getters: {
    getCanvas: (state) => state.canvas,
    isCanvasInitialized: (state) => !!state.canvas,
  },
})
