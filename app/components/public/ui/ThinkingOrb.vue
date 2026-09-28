<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { resolvePreset, scaleRadii, MODE_FRAMES } from 'thinking-orbs'

const props = withDefaults(
  defineProps<{
    state?: 'working' | 'searching' | 'solving' | 'listening' | 'connecting' | 'weaving' | 'composing' | 'breathing' | 'shaping'
    size?: number
    speed?: number
    color?: string
    theme?: 'auto' | 'dark' | 'light'
    dotSize?: number
    paused?: boolean
  }>(),
  {
    state: 'working',
    size: 26,
    speed: 1,
    color: '#0284c7', // Primary Sky/Royal brand blue
    theme: 'auto',
    dotSize: 1.8,
    paused: false,
  }
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number | null = null
let isRunning = false
let isMounted = false

// Parse hex or rgb color to RGB object
const parseTint = (c?: string) => {
  if (!c) return { r: 2, g: 132, b: 199 } // fallback brand blue
  const hex = c.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (hex) {
    let h = hex[1]
    if (h.length === 3) h = h.replace(/./g, (ch) => ch + ch)
    const n = parseInt(h, 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
  }
  const fn = c.trim().match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i)
  if (fn) return { r: Number(fn[1]), g: Number(fn[2]), b: Number(fn[3]) }
  return { r: 2, g: 132, b: 199 }
}

const parsedTint = computed(() => parseTint(props.color))

// Theme detection: returns true if dark background, false if light
const isDark = ref(false)

const updateTheme = () => {
  if (typeof document === 'undefined') return
  if (props.theme === 'dark') {
    isDark.value = true
  } else if (props.theme === 'light') {
    isDark.value = false
  } else {
    // auto: check class="dark" on root or data-theme
    isDark.value = document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark'
  }
}

// Custom high-contrast ink color calculation
const getInkColor = (w: number, alpha: number, dark: boolean, tint: { r: number; g: number; b: number }) => {
  if (dark) {
    // Dark mode background: blend towards bright white-tint
    const ramp = (c: number) => Math.round(c + (255 - c) * (1 - w))
    return `rgba(${ramp(tint.r)},${ramp(tint.g)},${ramp(tint.b)},${alpha})`
  } else {
    // Light mode background: blend towards rich deep tint
    const ramp = (c: number) => Math.round(c * (1 - w * 0.55))
    return `rgba(${ramp(tint.r)},${ramp(tint.g)},${ramp(tint.b)},${alpha})`
  }
}

// High performance frame rendering
const paintFrame = (
  ctx: CanvasRenderingContext2D,
  frame: { dots: any[]; lines?: any[] },
  dark: boolean,
  tint: { r: number; g: number; b: number }
) => {
  if (frame.lines && frame.lines.length) {
    for (let i = 0; i < frame.lines.length; i++) {
      const l = frame.lines[i]
      const alpha = l.a ?? 1
      const w = Math.min(1, Math.max(0, l.white))
      ctx.strokeStyle = getInkColor(w, alpha, dark, tint)
      ctx.lineWidth = l.w
      ctx.beginPath()
      ctx.moveTo(l.x1, l.y1)
      ctx.lineTo(l.x2, l.y2)
      ctx.stroke()
    }
  }

  for (let i = 0; i < frame.dots.length; i++) {
    const d = frame.dots[i]
    const alpha = d.a ?? 1
    const w = Math.min(1, Math.max(0, d.white))
    ctx.fillStyle = getInkColor(w, alpha, dark, tint)
    ctx.beginPath()
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

const runLoop = () => {
  if (!canvasRef.value || typeof window === 'undefined' || !isMounted) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  updateTheme()

  // Select optimal base engine size (20 for compact inline, 64 for avatar)
  const engineSize: 20 | 32 | 64 = props.size >= 48 ? 64 : props.size >= 32 ? 32 : 20
  let preset: any = null

  try {
    preset = resolvePreset(props.state || 'working', engineSize)
  } catch (err) {
    console.error('ThinkingOrb resolvePreset error:', err)
    return
  }

  if (!preset) return
  const frameFn = (MODE_FRAMES as any)[preset.mode]
  if (!frameFn) return

  // Apply dotSize scaling for enhanced visibility and sharpness
  const scaledOpts = props.dotSize !== 1 ? scaleRadii(preset.opts, props.dotSize) : preset.opts
  const scale = props.size / engineSize

  const loop = () => {
    if (!isRunning || props.paused || !isMounted) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const targetPx = Math.round(props.size * dpr)

    if (canvas.width !== targetPx || canvas.height !== targetPx) {
      canvas.width = targetPx
      canvas.height = targetPx
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, props.size, props.size)

    const tSec = (performance.now() / 1000) * preset.speed * props.speed

    ctx.save()
    ctx.scale(scale, scale)
    const frame = frameFn(engineSize, tSec, scaledOpts)
    paintFrame(ctx, frame, isDark.value, parsedTint.value)
    ctx.restore()

    animationFrameId = requestAnimationFrame(loop)
  }

  isRunning = true
  animationFrameId = requestAnimationFrame(loop)
}

const stopLoop = () => {
  isRunning = false
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

watch(
  () => [props.state, props.size, props.speed, props.color, props.theme, props.dotSize, props.paused],
  () => {
    stopLoop()
    if (!props.paused && isMounted) {
      runLoop()
    }
  }
)

onMounted(() => {
  isMounted = true
  runLoop()
})

onBeforeUnmount(() => {
  isMounted = false
  stopLoop()
})
</script>

<template>
  <canvas
    ref="canvasRef"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
    }"
    role="img"
    :aria-label="`Thinking Orb — ${state}`"
  />
</template>
