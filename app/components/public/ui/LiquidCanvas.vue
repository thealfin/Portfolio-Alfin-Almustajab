<script setup lang="ts">
import * as THREE from 'three'

const canvasContainer = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let material: THREE.ShaderMaterial | null = null
let mesh: THREE.Mesh | null = null
let animationFrameId: number | null = null
let startTime = 0

// Pointer coordinates for interactive ripples
const targetMouse = { x: 0.5, y: 0.5 }
const currentMouse = { x: 0.5, y: 0.5 }

// Vertex Shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

// Fragment Shader: rich, deep royal blue liquid silk waves inspired by new.studio, matched to --primary #005bb2
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  varying vec2 vUv;

  // Harmonized wave synthesis for organic fluid silk folds
  float wave(vec2 p, float freq, float speed, float angle) {
    float a = angle * 3.14159265 / 180.0;
    vec2 dir = vec2(cos(a), sin(a));
    return sin(dot(p, dir) * freq + uTime * speed);
  }

  void main() {
    float resY = max(uResolution.y, 1.0);
    vec2 p = (vUv - 0.5) * 2.2;
    p.x *= max(uResolution.x, 1.0) / resY;

    // Interactive mouse ripple influence
    vec2 mouseOffset = (uMouse - 0.5) * 0.5;
    vec2 mDist = p - mouseOffset;
    float mLen = length(mDist);
    float mouseWave = sin(mLen * 9.0 - uTime * 2.8) * exp(-mLen * 1.9) * 0.18;

    // Multi-octave undulating silk waves (just like new.studio Three.js cloth simulation)
    float w1 = wave(p, 1.5, 0.42, 28.0);
    float w2 = wave(p + vec2(w1 * 0.28, 0.0), 2.5, -0.58, 72.0);
    float w3 = wave(p - vec2(0.0, w2 * 0.24), 3.4, 0.78, 138.0);
    float w4 = wave(p * 1.35, 4.2, -0.32, 215.0);

    float elevation = (w1 * 0.42 + w2 * 0.32 + w3 * 0.18 + w4 * 0.08) + mouseWave;

    // Single dark tone palette based on portfolio style #005bb2
    // Deep rich sapphire & navy blue shadows, royal primary midtones, bright satin sheen
    vec3 colDeepShadow = vec3(0.020, 0.063, 0.145);  // Deepest fold shadow (#051025)
    vec3 colNavy = vec3(0.035, 0.133, 0.298);        // Shadow tone (#09224c)
    vec3 colPrimary = vec3(0.000, 0.357, 0.698);     // Brand Primary (#005bb2)
    vec3 colBrightBlue = vec3(0.227, 0.482, 0.835);  // Primary Strong (#3a7bd5)
    vec3 colSilkRidge = vec3(0.420, 0.671, 0.965);   // Lighter blue silk crest (#6babf6)
    vec3 colSpecular = vec3(0.920, 0.960, 1.000);    // Crisp white-blue specular reflection

    // Normalized height
    float h = clamp((elevation + 1.1) * 0.45, 0.0, 1.0);

    // Dynamic normal calculation for specular satin sheen
    float dX = wave(p + vec2(0.015, 0.0), 2.5, -0.58, 72.0) - w2;
    float dY = wave(p + vec2(0.0, 0.015), 3.4, 0.78, 138.0) - w3;
    vec3 normal = normalize(vec3(-dX * 3.8, -dY * 3.8, 1.0));
    vec3 lightDir = normalize(vec3(0.45, 0.65, 0.85));
    float diff = max(dot(normal, lightDir), 0.0);
    float spec = pow(max(dot(normal, lightDir), 0.0), 20.0);

    // Smooth gradient blend across the folds
    vec3 color = mix(colDeepShadow, colNavy, smoothstep(0.0, 0.35, h));
    color = mix(color, colPrimary, smoothstep(0.25, 0.65, h));
    color = mix(color, colBrightBlue, smoothstep(0.55, 0.85, h));
    color = mix(color, colSilkRidge, smoothstep(0.80, 1.0, h));

    // Add glossy satin specular highlights and diffuse softness
    color += colSpecular * (spec * 0.45);
    color += colBrightBlue * (diff * 0.15);

    // Deep edge vignette
    float edgeDist = length(p * 0.45);
    color *= clamp(1.2 - edgeDist * 0.35, 0.65, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`

const initThree = () => {
  if (!canvasContainer.value) return

  // Clean previous instance if re-initializing
  if (renderer && renderer.domElement && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
    renderer.dispose()
  }

  const width = Math.max(canvasContainer.value.clientWidth || window.innerWidth, 1)
  const height = Math.max(canvasContainer.value.clientHeight || window.innerHeight, 1)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const uniforms = {
    uTime: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(width * dpr, height * dpr) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  }

  const geometry = new THREE.PlaneGeometry(2, 2)
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    depthWrite: false,
    depthTest: false,
  })

  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  renderer = new THREE.WebGLRenderer({
    powerPreference: 'high-performance',
    antialias: false,
    alpha: false,
  })
  renderer.setPixelRatio(dpr)
  renderer.setSize(width, height, false)
  renderer.domElement.className = 'w-full h-full object-cover pointer-events-none select-none block'

  canvasContainer.value.appendChild(renderer.domElement)

  // Listen for WebGL context loss / restore
  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault()
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }, false)

  renderer.domElement.addEventListener('webglcontextrestored', () => {
    initThree()
  }, false)

  startTime = performance.now()

  // Continuous animation loop: NEVER stops on scroll or inspect
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)

    if (material) {
      const elapsedTime = (performance.now() - startTime) * 0.001
      material.uniforms.uTime.value = elapsedTime

      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.05
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.05
      material.uniforms.uMouse.value.set(currentMouse.x, currentMouse.y)
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  animate()
}

let resizeRaf: number | null = null
const handleResize = () => {
  if (resizeRaf) return
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = null
    if (!canvasContainer.value || !renderer || !material) return
    const width = Math.max(canvasContainer.value.clientWidth || window.innerWidth, 1)
    const height = Math.max(canvasContainer.value.clientHeight || window.innerHeight, 1)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height, false)
    material.uniforms.uResolution.value.set(width * dpr, height * dpr)
  })
}

const handleMouseMove = (e: MouseEvent) => {
  if (!canvasContainer.value) return
  const rect = canvasContainer.value.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    targetMouse.x = (e.clientX - rect.left) / rect.width
    targetMouse.y = 1.0 - (e.clientY - rect.top) / rect.height
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (!canvasContainer.value || !e.touches[0]) return
  const rect = canvasContainer.value.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    targetMouse.x = (e.touches[0].clientX - rect.left) / rect.width
    targetMouse.y = 1.0 - (e.touches[0].clientY - rect.top) / rect.height
  }
}

onMounted(() => {
  nextTick(() => {
    initThree()
    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
  })
})

onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  if (resizeRaf) {
    cancelAnimationFrame(resizeRaf)
    resizeRaf = null
  }

  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchmove', handleTouchMove)

  if (mesh) {
    if (mesh.geometry) mesh.geometry.dispose()
    mesh = null
  }

  if (material) {
    material.dispose()
    material = null
  }

  if (renderer) {
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
    renderer.dispose()
    renderer = null
  }

  scene = null
  camera = null
  clock = null
})
</script>

<template>
  <div
    ref="canvasContainer"
    class="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
    aria-hidden="true"
  />
</template>
