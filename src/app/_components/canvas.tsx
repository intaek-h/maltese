'use client'

import { useEffect, useRef } from 'react'
import animals from '@/dummy/animals.json'
import words from '@/dummy/words.json'

type Animal = {
  id: number
  name: string
  image: string
  movement_type: string
  created_at: number
  updated_at: number
  deleted_at: number | null
}

type Word = {
  id: number
  input_1: string
  input_2: string
  author_fingerprint: string
  animal_id: number
  likes: number
  report_count: number
  created_at: number
  updated_at: number
  deleted_at: number | null
}

type MovingAnimal = {
  animal: Animal
  pun: string
  x: number
  y: number
  velocityX: number
  velocityY: number
  width: number
  height: number
  imageElement: HTMLImageElement
  isImageLoaded: boolean
  highlightRemainingMs?: number
}

function pickRandom<T>(items: ReadonlyArray<T>): T | undefined {
  if (items.length === 0) return undefined
  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const ctx = canvasEl.getContext('2d')
    if (!ctx) return
    const canvas: HTMLCanvasElement = canvasEl
    const context: CanvasRenderingContext2D = ctx

    function sizeCanvasToWindow() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    sizeCanvasToWindow()

    // Build moving animals: one sprite per word, using the associated animal image
    const animalById = new Map<number, Animal>()
    for (const animal of animals as Animal[]) animalById.set(animal.id, animal)

    const movingAnimals: MovingAnimal[] = []
    for (const word of words as Word[]) {
      const animal = animalById.get(word.animal_id)
      if (!animal) continue
      const pun = `${word.input_1} ${word.input_2}`.trim() || `${animal.name}`

      const imageElement = new Image()
      imageElement.crossOrigin = 'anonymous'
      imageElement.src = animal.image

      const width = 140
      const height = 100
      const speed = 40 + Math.random() * 80 // px/sec
      const angle = Math.random() * Math.PI * 2
      const velocityX = Math.cos(angle) * speed
      const velocityY = Math.sin(angle) * speed

      movingAnimals.push({
        animal,
        pun,
        x: Math.random() * Math.max(1, canvas.width - width),
        y: Math.random() * Math.max(1, canvas.height - height),
        velocityX,
        velocityY,
        width,
        height,
        imageElement,
        isImageLoaded: false,
      })
    }

    for (const moving of movingAnimals) {
      moving.imageElement.onload = () => {
        moving.isImageLoaded = true
      }
      moving.imageElement.onerror = () => {
        moving.isImageLoaded = false
      }
    }

    let previousTimestampMs: number | null = null

    function update(deltaSeconds: number) {
      for (const moving of movingAnimals) {
        moving.x += moving.velocityX * deltaSeconds
        moving.y += moving.velocityY * deltaSeconds

        if (moving.x < 0) {
          moving.x = 0
          moving.velocityX *= -1
        } else if (moving.x + moving.width > canvas.width) {
          moving.x = canvas.width - moving.width
          moving.velocityX *= -1
        }

        if (moving.y < 0) {
          moving.y = 0
          moving.velocityY *= -1
        } else if (moving.y + moving.height > canvas.height) {
          moving.y = canvas.height - moving.height
          moving.velocityY *= -1
        }
      }
    }

    function draw() {
      context.clearRect(0, 0, canvas.width, canvas.height)

      for (const moving of movingAnimals) {
        if (moving.isImageLoaded) {
          context.drawImage(moving.imageElement, moving.x, moving.y, moving.width, moving.height)
        } else {
          context.fillStyle = '#ddd'
          context.fillRect(moving.x, moving.y, moving.width, moving.height)
        }

        context.fillStyle = '#000'
        context.font = '16px sans-serif'
        context.textBaseline = 'top'
        const textX = moving.x + 6
        const textY = moving.y + 6
        context.fillText(moving.pun, textX, textY)

        if ((moving.highlightRemainingMs ?? 0) > 0) {
          context.strokeStyle = '#facc15'
          context.lineWidth = 3
          context.strokeRect(moving.x - 2, moving.y - 2, moving.width + 4, moving.height + 4)
        }
      }
    }

    function loop(timestampMs: number) {
      if (previousTimestampMs == null) previousTimestampMs = timestampMs
      const deltaSeconds = Math.min(0.05, (timestampMs - previousTimestampMs) / 1000)
      previousTimestampMs = timestampMs
      update(deltaSeconds)
      draw()
      animationFrameRef.current = window.requestAnimationFrame(loop)
    }

    animationFrameRef.current = window.requestAnimationFrame(loop)

    function handleResize() {
      const previousWidth = canvas.width
      const previousHeight = canvas.height
      sizeCanvasToWindow()
      const scaleX = canvas.width / Math.max(1, previousWidth)
      const scaleY = canvas.height / Math.max(1, previousHeight)
      for (const moving of movingAnimals) {
        moving.x *= scaleX
        moving.y *= scaleY
        if (moving.x + moving.width > canvas.width) moving.x = canvas.width - moving.width
        if (moving.y + moving.height > canvas.height) moving.y = canvas.height - moving.height
      }
    }

    window.addEventListener('resize', handleResize)

    function getCanvasPoint(evt: PointerEvent) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = rect.width > 0 ? canvas.width / rect.width : 1
      const scaleY = rect.height > 0 ? canvas.height / rect.height : 1
      const x = (evt.clientX - rect.left) * scaleX
      const y = (evt.clientY - rect.top) * scaleY
      return { x, y }
    }

    function hitTest(x: number, y: number) {
      for (let i = movingAnimals.length - 1; i >= 0; i--) {
        const m = movingAnimals[i]
        if (x >= m.x && x <= m.x + m.width && y >= m.y && y <= m.y + m.height) {
          return m
        }
      }
      return undefined
    }

    function handlePointerMove(evt: PointerEvent) {
      const { x, y } = getCanvasPoint(evt)
      const hit = hitTest(x, y)
      canvas.style.cursor = hit ? 'pointer' : 'default'
    }

    function handlePointerDown(evt: PointerEvent) {
      const { x, y } = getCanvasPoint(evt)
      const hit = hitTest(x, y)
      if (hit) {
        window.alert('clicked')
      }
    }

    function tickHighlight(deltaSeconds: number) {
      for (const m of movingAnimals) {
        if ((m.highlightRemainingMs ?? 0) > 0) {
          m.highlightRemainingMs = Math.max(0, (m.highlightRemainingMs ?? 0) - deltaSeconds * 1000)
        }
      }
    }

    // Wrap update to also tick highlight timers
    const originalUpdate = update
    function updateWithHighlight(deltaSeconds: number) {
      originalUpdate(deltaSeconds)
      tickHighlight(deltaSeconds)
    }

    // Replace loop to call updateWithHighlight
    function loopWithHighlight(timestampMs: number) {
      if (previousTimestampMs == null) previousTimestampMs = timestampMs
      const deltaSeconds = Math.min(0.05, (timestampMs - previousTimestampMs) / 1000)
      previousTimestampMs = timestampMs
      updateWithHighlight(deltaSeconds)
      draw()
      animationFrameRef.current = window.requestAnimationFrame(loopWithHighlight)
    }

    // Switch listener and loop
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerdown', handlePointerDown)
    // Stop old loop if started (defensive), then start new one
    if (animationFrameRef.current != null) {
      window.cancelAnimationFrame(animationFrameRef.current)
    }
    animationFrameRef.current = window.requestAnimationFrame(loopWithHighlight)

    return () => {
      if (animationFrameRef.current != null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  return <canvas ref={canvasRef} className="h-full w-full" />
}
