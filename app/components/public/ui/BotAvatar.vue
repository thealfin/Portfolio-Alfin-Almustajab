<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import {
  BotAvatarSim,
  drawBotAvatarFrame,
  botAvatarPresets,
  botAvatarShapes,
  botAvatarParts,
  autoInk,
  BOT_AVATAR_OVERSCAN,
  BOT_AVATAR_RISE,
} from 'bot-avatars'

const props = withDefaults(
  defineProps<{
    type?: string
    state?: 'default' | 'working' | 'sleeping'
    size?: number
    interactive?: boolean
    face?: 'eyes' | 'mouth'
    color?: string
    speed?: number
    shading?: 'plastic' | 'crisp' | 'smooth' | 'flat'
    paused?: boolean
  }>(),
  {
    type: 'clover',
    state: 'default',
    size: 32,
    interactive: true,
    face: 'eyes',
    color: undefined,
    speed: 1,
    shading: 'plastic',
    paused: false,
  }
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let sim: any = null
let animationFrameId: number | null = null
let lastTime = 0
let pointerX = Number.NaN
let pointerY = Number.NaN
let isMounted = false

// Cached Path2D and config object to avoid per-frame allocations
let shapePath: Path2D | null = null
let partsPath: Path2D | null = null
let cachedConfig: any = null

// Cached canvas bounding rect to avoid per-frame layout thrashing (getBoundingClientRect)
let cachedRect: DOMRect | null = null
let lastRectTime = 0

const updateBoundingRect = () => {
  if (canvasRef.value) {
    cachedRect = canvasRef.value.getBoundingClientRect()
    lastRectTime = performance.now()
  }
}

const initPathsAndConfig = () => {
  if (typeof Path2D === 'undefined' || typeof window === 'undefined') return
  const shapeSvg = (botAvatarShapes as any)[props.type] || botAvatarShapes.clover
  shapePath = new Path2D(shapeSvg)
  const partsSvg = (botAvatarParts as any)[props.type]
  partsPath = partsSvg ? new Path2D(partsSvg) : null

  const preset = (botAvatarPresets as any)[props.type] || botAvatarPresets.clover
  const activeColor = props.color || preset.color

  cachedConfig = {
    path: shapePath,
    face: props.face || preset.face,
    faceX: preset.faceX,
    faceY: preset.faceY,
    faceScale: preset.faceScale,
    color: activeColor,
    ink: autoInk(activeColor),
    shading: props.shading,
    shadow: 0.35,
    highlight: 1.3,
    depth: 0.65,
    light: 265,
    rim: 0.5,
    spread: 1.55,
    typeKey: props.type,
    still: false,
    whirl: { strength: 0, size: 1, width: 1, length: 1, tilt: 1 },
    parts: partsPath || undefined,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    theme: 'auto',
  }
}

const onGlobalPointerMove = (e: PointerEvent | MouseEvent) => {
  pointerX = e.clientX
  pointerY = e.clientY
  const now = performance.now()
  if (!cachedRect || now - lastRectTime > 150) {
    updateBoundingRect()
  }
}

const poke = () => {
  if (sim) {
    sim.poke()
  }
}

defineExpose({
  poke,
})

const handleClick = (e: MouseEvent) => {
  if (props.interactive) {
    poke()
  }
  emit('click', e)
}

const startLoop = () => {
  if (!canvasRef.value || typeof window === 'undefined' || !isMounted || props.paused) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  initPathsAndConfig()
  if (!shapePath || !cachedConfig) return

  if (!sim) {
    sim = new BotAvatarSim(Math.random(), props.state)
  }

  const overscan = BOT_AVATAR_OVERSCAN || 1.5
  const rise = BOT_AVATAR_RISE || 0.1

  lastTime = performance.now()
  updateBoundingRect()

  const loop = (now: number) => {
    if (!isMounted || props.paused) return

    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const renderSize = Math.round(props.size * overscan * dpr)

    if (canvas.width !== renderSize || canvas.height !== renderSize) {
      canvas.width = renderSize
      canvas.height = renderSize
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // Cursor tracking: look towards pointer using CACHED rect (avoids layout reflow)
    if (props.interactive && !Number.isNaN(pointerX) && !Number.isNaN(pointerY)) {
      const rect = cachedRect || canvas.getBoundingClientRect()
      const headSize = rect.width / overscan || 1
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2 + rise * headSize
      const dx = (pointerX - centerX) / headSize
      const dy = (pointerY - centerY) / headSize
      const dist = Math.hypot(dx, dy)
      const maxRange = 3
      const weight = dist < 1 ? 1 : dist > maxRange ? 0 : 1 - (dist - 1) / (maxRange - 1)
      sim.setPointer(dx / Math.max(1, dist), dy / Math.max(1, dist), weight)
    } else {
      sim.setPointer(0, 0, 0)
    }

    sim.update(dt * props.speed)

    cachedConfig.dpr = dpr
    drawBotAvatarFrame(ctx, props.size, sim.pose, cachedConfig)

    animationFrameId = requestAnimationFrame(loop)
  }

  animationFrameId = requestAnimationFrame(loop)
}

const stopLoop = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

watch(
  () => props.paused,
  (isPaused) => {
    if (isPaused) {
      stopLoop()
    } else if (isMounted) {
      startLoop()
    }
  }
)

watch(
  () => props.state,
  (newVal) => {
    if (sim) {
      sim.setState(newVal)
    }
  }
)

watch(
  () => [props.type, props.color, props.shading, props.face],
  () => {
    initPathsAndConfig()
  }
)

onMounted(() => {
  isMounted = true
  startLoop()
  if (typeof window !== 'undefined' && props.interactive) {
    window.addEventListener('pointermove', onGlobalPointerMove, { passive: true })
    window.addEventListener('resize', updateBoundingRect, { passive: true })
    window.addEventListener('scroll', updateBoundingRect, { passive: true })
  }
})

onBeforeUnmount(() => {
  isMounted = false
  stopLoop()
  sim = null
  if (typeof window !== 'undefined') {
    window.removeEventListener('pointermove', onGlobalPointerMove)
    window.removeEventListener('resize', updateBoundingRect)
    window.removeEventListener('scroll', updateBoundingRect)
  }
})
</script>

<template>
  <div
    class="inline-flex items-center justify-center select-none"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      cursor: interactive ? 'pointer' : 'default',
    }"
    @click="handleClick"
  >
    <canvas
      ref="canvasRef"
      role="img"
      :aria-label="`Bot avatar ${type} in ${state} state`"
      :style="{
        width: `${size * 1.5}px`,
        height: `${size * 1.5}px`,
        marginLeft: `${-size * 0.25}px`,
        marginRight: `${-size * 0.25}px`,
        marginTop: `${-size * 0.35}px`,
        marginBottom: `${-size * 0.15}px`,
        pointerEvents: 'none',
      }"
    />
  </div>
</template>
