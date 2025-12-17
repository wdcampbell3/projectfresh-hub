import * as THREE from "three"

/**
 * Creates a circular texture for round particle effects (like snowflakes)
 * @returns A THREE.CanvasTexture with a radial gradient circle
 */
export function createCircleTexture(): THREE.CanvasTexture | null {
  const canvas = document.createElement("canvas")
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  // Draw a white circle with soft edges
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)")
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.8)")
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 32, 32)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

/**
 * Creates a rain particle system
 * @param scene - The THREE.Scene to add the rain system to
 * @returns The rain particle system (THREE.Points)
 */
export function createRain(scene: THREE.Scene): THREE.Points {
  const particleCount = 20000
  const geometry = new THREE.BufferGeometry()
  const positions = []

  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * 400 - 200
    const y = Math.random() * 200
    const z = Math.random() * 400 - 200
    positions.push(x, y, z)
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  )

  const material = new THREE.PointsMaterial({
    color: 0xdddddd, // Lighter rain
    size: 0.3,
    transparent: true,
    opacity: 0.8,
    map: createCircleTexture(), // Use circular texture for round raindrops
  })

  const rainSystem = new THREE.Points(geometry, material)
  scene.add(rainSystem)
  return rainSystem
}

/**
 * Creates a snow particle system with small, round snowflakes
 * @param scene - The THREE.Scene to add the snow system to
 * @returns The snow particle system (THREE.Points)
 */
export function createSnow(scene: THREE.Scene): THREE.Points {
  const particleCount = 60000 // 3x heavier snowfall (was 20000)
  const geometry = new THREE.BufferGeometry()
  const positions = []

  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * 400 - 200
    const y = Math.random() * 200
    const z = Math.random() * 400 - 200
    positions.push(x, y, z)
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  )

  const material = new THREE.PointsMaterial({
    color: 0xffffff, // Pure white
    size: 0.15, // Small size (~1/4 of original 0.5)
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true, // Makes particles scale with distance
    map: createCircleTexture(), // Use circular texture for round snowflakes
  })

  const snowSystem = new THREE.Points(geometry, material)
  scene.add(snowSystem)
  return snowSystem
}

/**
 * Animates weather particles (rain and snow)
 * @param delta - Time delta from the animation loop
 * @param rainSystem - The rain particle system (or null if not active)
 * @param snowSystem - The snow particle system (or null if not active)
 * @param center - The center point to follow (usually player/camera position)
 */
export function animateWeather(
  delta: number,
  rainSystem: THREE.Points | null,
  snowSystem: THREE.Points | null,
  center: THREE.Vector3,
): void {
  // Animate rain
  if (rainSystem) {
    const positions = rainSystem.geometry.attributes.position
      .array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      // Fall down
      positions[i + 1] -= 50 * delta
      if (positions[i + 1] < 0) positions[i + 1] += 200

      // Follow center point (wrap around)
      if (positions[i] < center.x - 200) positions[i] += 400
      if (positions[i] > center.x + 200) positions[i] -= 400
      if (positions[i + 2] < center.z - 200) positions[i + 2] += 400
      if (positions[i + 2] > center.z + 200) positions[i + 2] -= 400
    }
    rainSystem.geometry.attributes.position.needsUpdate = true
  }

  // Animate snow
  if (snowSystem) {
    const positions = snowSystem.geometry.attributes.position
      .array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      // Fall down slowly
      positions[i + 1] -= 5 * delta
      // Drift sideways (gentle swaying motion)
      positions[i] += Math.sin(Date.now() * 0.001 + positions[i + 1]) * 0.1

      // Reset when reaching ground
      if (positions[i + 1] < 0) positions[i + 1] = 200

      // Follow center point (wrap around)
      if (positions[i] < center.x - 200) positions[i] += 400
      if (positions[i] > center.x + 200) positions[i] -= 400
      if (positions[i + 2] < center.z - 200) positions[i + 2] += 400
      if (positions[i + 2] > center.z + 200) positions[i + 2] -= 400
    }
    snowSystem.geometry.attributes.position.needsUpdate = true
  }
}
