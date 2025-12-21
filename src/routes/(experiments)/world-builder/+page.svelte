<script lang="ts">
  /* eslint-disable @typescript-eslint/no-unused-vars, no-case-declarations, no-empty, @typescript-eslint/no-explicit-any, svelte/valid-compile */
  import { onMount } from "svelte"
  import * as THREE from "three"
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
  import Fuse from "fuse.js"
  import modelCatalogData from "./modelCatalog.json"
  import {
    createRain,
    createSnow,
    animateWeather as animateWeatherShared,
  } from "$lib/weatherSystem"

  let container: HTMLDivElement
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let controls: OrbitControls
  let animationId: number
  let raycaster = new THREE.Raycaster()
  let mouse = new THREE.Vector2()
  let ground: THREE.Mesh

  // Model catalog
  interface ModelInfo {
    name: string
    path: string
    category: string
    scale?: number
  }

  let modelCatalog = $state<ModelInfo[]>(modelCatalogData)
  let selectedModel = $state<ModelInfo | null>(null)
  let previewMesh: THREE.Group | null = null
  let placedObjects = $state<Array<{ mesh: THREE.Group; modelPath: string }>>(
    [],
  )
  let currentRotation = 0
  let currentScale = 1.0
  let gridHelper: THREE.GridHelper
  let showGrid = $state(true)
  let selectedCategory = $state("All")
  let selectedPlacedObjects = $state<
    Array<{ mesh: THREE.Group; modelPath: string }>
  >([])
  // Keep selectedPlacedObject as a derived getter for backward compatibility/ease of use
  let selectedPlacedObject = $derived(
    selectedPlacedObjects.length > 0
      ? selectedPlacedObjects[selectedPlacedObjects.length - 1]
      : null,
  )

  let recentModels = $state<ModelInfo[]>([])
  let clipboard = $state<
    Array<{
      modelPath: string
      rotation: { x: number; y: number; z: number }
      scale: { x: number; y: number; z: number }
    }>
  >([])

  let isPanning = $state(false)
  let isDraggingObject = $state(false)
  let isRotatingCamera = $state(false)
  let isOptionKeyHeld = $state(false)
  let isCommandKeyHeld = $state(false)
  let isShiftKeyHeld = $state(false)
  let hoveredObject = $state<{ mesh: THREE.Group; modelPath: string } | null>(
    null,
  )
  let animationsEnabled = $state(false)
  let hasMouseMoved = $state(false) // Track if mouse moved during click
  let mouseDownPosition = { x: 0, y: 0 } // Track mouse position on down
  let previewHasBeenPositioned = $state(false) // Track if preview mesh has been positioned by mouse

  // Dragging multiple objects
  let dragStartPoint = new THREE.Vector3()
  let dragObjectOffsets = new Map<THREE.Group, THREE.Vector3>()

  // Box Selection
  let isBoxSelecting = $state(false)
  let boxSelectionStart = $state({ x: 0, y: 0 })
  let boxSelectionEnd = $state({ x: 0, y: 0 })

  // Maps Management
  interface MapData {
    id: string
    name: string
    games?: string
    description: string
    created: number
    modified: number
    thumbnail: string
    environment: {
      timeOfDay: "dawn" | "day" | "sunset" | "night"
      weather: "clear" | "rain" | "snow" | "fog"
      fogDensity: number
    }
    objects: Array<{
      modelPath: string
      position: { x: number; y: number; z: number }
      rotation: { x: number; y: number; z: number }
      scale: { x: number; y: number; z: number }
    }>
    stats: {
      objectCount: number
      polygonCount: number
    }
    planeVisible?: boolean
  }

  let savedMaps = $state<MapData[]>([])
  let currentMapId = $state<string | null>(null)
  let selectedGame = $state("all")
  let currentMapName = $state<string>("")
  let activeTab = $state<"models" | "maps" | "options">("models")
  let timeOfDay = $state<"dawn" | "day" | "sunset" | "night">("sunset")
  let weather = $state<"clear" | "rain" | "snow" | "fog">("clear")
  let polygonCount = $state(0)

  const MAX_POLYGON_WARNING = 250000

  // Auto-generate settings
  let autoGenTrees = $state(16) // Trees & Plants
  let autoGenBuildings = $state(16)
  let autoGenVehicles = $state(8)
  let autoGenAnimals = $state(8)
  let autoGenCity = $state(0)
  let autoGenSpace = $state(0)
  let autoGenRocks = $state(0)
  let autoGenPlanets = $state(0)
  let quickStartPreset = $state("town")
  let distributeVertically = $state(false)
  let mapFilter = $state("all_levels")
  let hideInstructions = $state(false)

  // First-person mode (POV Mode)
  let isFirstPersonMode = $state(false)
  let isPOVPaused = $state(false) // Track if POV mode is paused
  let fpPosition = new THREE.Vector3(0, 10, 0) // Start at height 10 (drop from sky)
  let fpVelocity = new THREE.Vector3(0, 0, 0) // Velocity for jumping and falling
  let fpYaw = 0
  let fpPitch = 0
  let fpKeysPressed = new Set<string>()
  let savedCameraPosition: THREE.Vector3 | null = null
  let savedCameraRotation: THREE.Euler | null = null
  let savedControlsTarget: THREE.Vector3 | null = null
  const GRAVITY = -20 // Gravity acceleration
  const JUMP_VELOCITY = 8 // Initial upward velocity for jump
  const GROUND_LEVEL = 1.65 // Eye height above ground (matches animated woman model)

  // Stuck detection for POV mode
  let lastPOVPosition = new THREE.Vector3()
  let stuckCheckTimer = 0
  let stuckCounter = 0
  const STUCK_CHECK_INTERVAL = 1000 // Check every second
  const STUCK_THRESHOLD = 0.1 // Minimum distance to consider movement
  const STUCK_COUNT_LIMIT = 2 // How many checks before unstuck action

  // Animation mixers for animated models
  interface AnimatedObject {
    mesh: THREE.Group
    mixer: THREE.AnimationMixer
    clips: THREE.AnimationClip[]
  }
  let animatedObjects: AnimatedObject[] = []

  // Selection outline
  let selectionHelpers: THREE.BoxHelper[] = []
  let hoverHelper: THREE.BoxHelper | null = null

  // Weather Systems
  let rainSystem: THREE.Points | null = null
  let snowSystem: THREE.Points | null = null

  // Thumbnail previews
  interface ModelThumbnail {
    model: ModelInfo
    dataUrl: string
  }
  let thumbnails = $state<Map<string, string>>(new Map())
  let thumbnailsLoading = $state(true)
  const THUMBNAIL_CACHE_KEY = "worldBuilder_thumbnailCache"
  const THUMBNAIL_VERSION_KEY = "worldBuilder_thumbnailVersion"
  const CURRENT_THUMBNAIL_VERSION = "1.2" // Increment to invalidate cache

  // Undo/Redo history
  interface HistoryState {
    placedObjects: Array<{
      modelPath: string
      position: { x: number; y: number; z: number }
      rotation: { x: number; y: number; z: number }
      scale: { x: number; y: number; z: number }
    }>
  }
  let history = $state<HistoryState[]>([])
  let historyIndex = $state(-1)

  const categories = [
    "All",
    ...Array.from(new Set(modelCatalog.map((m) => m.category)))
      .filter((c) => c !== "Props")
      .sort(),
  ]

  // Randomize model catalog on load
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  onMount(async () => {
    // Randomize the catalog order
    modelCatalog = shuffleArray(modelCatalog)

    // Load saved maps from localStorage
    loadMapsFromStorage()

    initScene()
    animate()
    generateThumbnails()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }

      if (scene) {
        dispose3DObject(scene)
        scene.clear()
      }

      if (renderer) {
        renderer.dispose()
      }

      // Cleanup thumbnails renderer if exists
      // (It's created locally in generateThumbnails but might persist in closures)
    }
  })

  function dispose3DObject(
    obj: THREE.Object3D | THREE.Group | THREE.Mesh | undefined,
  ) {
    if (!obj) return

    // Recursively dispose children first
    while (obj.children.length > 0) {
      dispose3DObject(obj.children[0])
      obj.remove(obj.children[0])
    }

    if (obj instanceof THREE.Mesh) {
      if (obj.geometry) {
        obj.geometry.dispose()
      }

      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            if (m.map) m.map.dispose()
            m.dispose()
          })
        } else {
          if (obj.material.map) obj.material.map.dispose()
          obj.material.dispose()
        }
      }
    }
  }

  function loadMapsFromStorage() {
    const stored = localStorage.getItem("worldBuilder_maps")
    if (stored) {
      try {
        savedMaps = JSON.parse(stored)
      } catch (e) {
        console.error("Failed to load maps:", e)
        savedMaps = []
      }
    }
  }

  function saveMapsToStorage() {
    localStorage.setItem("worldBuilder_maps", JSON.stringify(savedMaps))
  }

  function initScene() {
    // Scene
    scene = new THREE.Scene()
    updateEnvironment()

    // Camera
    camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    )

    camera.position.set(20, 20, 20)
    camera.lookAt(0, 0, 0)

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1 // Snappier damping (was 0.05)
    controls.maxPolarAngle = Math.PI / 2 - 0.1 // Prevent going below ground
    controls.minDistance = 0.5 // Allow zooming much closer (was 5)
    controls.maxDistance = 1000
    controls.enablePan = true
    controls.screenSpacePanning = false // Pan parallel to ground plane
    controls.panSpeed = 2.0 // Faster panning (was 1.0)
    controls.zoomSpeed = 2.0 // Increased zoom sensitivity
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    ambientLight.name = "ambientLight"
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.name = "directionalLight"
    directionalLight.position.set(50, 50, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.camera.left = -100
    directionalLight.shadow.camera.right = 100
    directionalLight.shadow.camera.top = 100
    directionalLight.shadow.camera.bottom = -100
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Ground - large invisible plane for raycasting (prevents objects getting stuck)
    const groundGeometry = new THREE.PlaneGeometry(2000, 2000)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d5016,
      roughness: 0.8,
      transparent: true,
      opacity: 0.8,
    })
    ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Grid - increased resolution by 10x (40    // Grid Helper
    gridHelper = new THREE.GridHelper(2000, 200, 0x444444, 0x222222)
    gridHelper.visible = false // Default to hidden
    scene.add(gridHelper)

    // Handle window resize
    window.addEventListener("resize", onWindowResize)

    // Mouse events
    renderer.domElement.addEventListener("mousemove", onMouseMove)
    renderer.domElement.addEventListener("mousemove", onFPMouseMove)
    renderer.domElement.addEventListener("mousedown", onMouseDown)
    renderer.domElement.addEventListener("mouseup", onMouseUp)
    renderer.domElement.addEventListener("click", onMouseClick)
    renderer.domElement.addEventListener("contextmenu", onRightClick)
  }

  function createStarfield() {
    const starCount = 8500
    const starVertices: number[] = []
    for (let i = 0; i < starCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(1500)
      const y = THREE.MathUtils.randFloatSpread(1500)
      const z = THREE.MathUtils.randFloatSpread(1500)
      // Keep stars away from center to avoid clipping with ground
      if (new THREE.Vector3(x, y, z).length() < 100) continue
      starVertices.push(x, y, z)
    }

    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3),
    )

    // Bright, slightly larger stars for readability
    const primaryStars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xe8f3ff,
        size: 0.9,
        transparent: true,
        opacity: 0.9,
      }),
    )
    primaryStars.name = "starfield"
    scene.add(primaryStars)

    // Soft tinted layer for depth and extra sparkle
    const secondaryStars = new THREE.Points(
      starGeometry.clone(),
      new THREE.PointsMaterial({
        color: 0x9fc7ff,
        size: 0.6,
        transparent: true,
        opacity: 0.6,
      }),
    )
    secondaryStars.scale.setScalar(1.2)
    secondaryStars.name = "starfield"
    scene.add(secondaryStars)
  }

  function updateEnvironment() {
    if (!scene) return

    // Sky gradients for different times of day
    const skyGradients = {
      dawn: {
        colors: ["#001f3f", "#0074D9", "#FFDC00", "#FFD700"], // Deep blue to yellow/gold
        fogColor: 0xffdc00,
        ambientIntensity: 0.6,
        directionalIntensity: 0.8,
      },
      day: {
        colors: ["#39CCCC", "#7FDBFF", "#0074D9", "#001f3f"], // Inversed: Light/Medium to Deep blues
        fogColor: 0xb0e0e6,
        ambientIntensity: 0.8,
        directionalIntensity: 1.0,
      },
      sunset: {
        colors: ["#2c0b4a", "#85144b", "#FF4136", "#FFDC00"], // Purple/Red to Orange/Yellow
        fogColor: 0xff851b,
        ambientIntensity: 0.6,
        directionalIntensity: 0.8,
      },
      night: {
        colors: ["#151515", "#151515", "#151515", "#151515"], // Dark gray for better visibility
        fogColor: 0x151515,
        ambientIntensity: 0.9, // Even brighter for building visibility
        directionalIntensity: 1.0,
      },
    }

    const gradient = skyGradients[timeOfDay]

    // Create sky gradient or starscape
    // Remove existing background texture if any
    scene.background = null

    // Clear any existing stars
    const existingStars = scene.children.filter((c) => c.name === "starfield")
    existingStars.forEach((s) => scene.remove(s))

    // Helper to adjust color brightness
    const adjustBrightness = (hex: string, factor: number) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)

      const newR = Math.min(255, Math.max(0, Math.round(r * factor)))
      const newG = Math.min(255, Math.max(0, Math.round(g * factor)))
      const newB = Math.min(255, Math.max(0, Math.round(b * factor)))

      return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
    }

    // Determine brightness multiplier based on time of day
    let brightnessMultiplier = 1.0
    if (weather !== "clear") {
      if (timeOfDay === "dawn") brightnessMultiplier = 0.6
      else if (timeOfDay === "day") brightnessMultiplier = 1.0
      else if (timeOfDay === "sunset") brightnessMultiplier = 0.5
      else if (timeOfDay === "night") brightnessMultiplier = 0.2
    }

    // Handle weather overrides for sky
    if (weather === "fog") {
      const baseColor = "#ffffff"
      const color = adjustBrightness(baseColor, brightnessMultiplier)
      scene.background = new THREE.Color(color)
    } else if (weather === "rain") {
      // Dark gray gradient for rain
      const canvas = document.createElement("canvas")
      canvas.width = 512
      canvas.height = 512
      const context = canvas.getContext("2d")!

      const col1 = adjustBrightness("#1a1a1a", brightnessMultiplier)
      const col2 = adjustBrightness("#4a4a4a", brightnessMultiplier)

      const canvasGradient = context.createLinearGradient(
        0,
        0,
        0,
        canvas.height,
      )
      canvasGradient.addColorStop(0, col1) // Dark gray
      canvasGradient.addColorStop(1, col2) // Lighter gray
      context.fillStyle = canvasGradient
      context.fillRect(0, 0, canvas.width, canvas.height)

      const texture = new THREE.CanvasTexture(canvas)
      scene.background = texture
    } else if (weather === "snow") {
      // Dark gray gradient for snow (slightly lighter than rain)
      const canvas = document.createElement("canvas")
      canvas.width = 512
      canvas.height = 512
      const context = canvas.getContext("2d")!

      const col1 = adjustBrightness("#2a2a2a", brightnessMultiplier)
      const col2 = adjustBrightness("#5a5a5a", brightnessMultiplier)

      const canvasGradient = context.createLinearGradient(
        0,
        0,
        0,
        canvas.height,
      )
      canvasGradient.addColorStop(0, col1) // Slightly lighter dark gray
      canvasGradient.addColorStop(1, col2) // Slightly lighter gray
      context.fillStyle = canvasGradient
      context.fillRect(0, 0, canvas.width, canvas.height)

      const texture = new THREE.CanvasTexture(canvas)
      scene.background = texture
    } else if (timeOfDay === "night") {
      scene.background = new THREE.Color(0x151515) // Dark gray
      createStarfield()
    } else {
      const canvas = document.createElement("canvas")
      canvas.width = 512
      canvas.height = 512
      const context = canvas.getContext("2d")!

      const canvasGradient = context.createLinearGradient(
        0,
        0,
        0,
        canvas.height,
      )
      canvasGradient.addColorStop(0, gradient.colors[0])
      canvasGradient.addColorStop(0.4, gradient.colors[1])
      canvasGradient.addColorStop(0.7, gradient.colors[2])
      canvasGradient.addColorStop(1, gradient.colors[3])
      context.fillStyle = canvasGradient
      context.fillRect(0, 0, canvas.width, canvas.height)

      const texture = new THREE.CanvasTexture(canvas)
      scene.background = texture
    }

    // Update fog based on weather
    // Fog should be dense enough to limit visibility to half the grid (approx 100 units)
    let fogNear = 20
    let fogFar = 120 // Half grid size (200/2) + buffer

    if (weather === "fog") {
      fogNear = 10
      fogFar = 215 // Less dense fog (was 160)
    } else if (weather === "rain") {
      fogFar = 200
    } else if (weather === "snow") {
      fogFar = 200
    } else if (weather === "clear") {
      fogFar = 300 // See everything

      // Night mode should have very distant fog to avoid darkening objects too much
      if (timeOfDay === "night") {
        fogFar = 800
      }
    }

    // Use white fog for 'fog' weather, otherwise use sky color
    // For rain and snow, use a lighter, whiter fog
    let fogColorHex = 0x000000
    if (weather === "fog") {
      fogColorHex = 0xffffff
    } else if (weather === "rain") {
      fogColorHex = 0x888888 // Medium grey for rain
    } else if (weather === "snow") {
      fogColorHex = 0xaaaaaa // Light grey for snow
    } else {
      fogColorHex = gradient.fogColor
    }

    // Apply brightness multiplier to fog color if weather is active
    if (weather !== "clear") {
      const r = (fogColorHex >> 16) & 255
      const g = (fogColorHex >> 8) & 255
      const b = fogColorHex & 255

      const newR = Math.min(
        255,
        Math.max(0, Math.round(r * brightnessMultiplier)),
      )
      const newG = Math.min(
        255,
        Math.max(0, Math.round(g * brightnessMultiplier)),
      )
      const newB = Math.min(
        255,
        Math.max(0, Math.round(b * brightnessMultiplier)),
      )

      fogColorHex = (newR << 16) | (newG << 8) | newB
    }

    scene.fog = new THREE.Fog(fogColorHex, fogNear, fogFar)

    // Update weather particles
    updateWeatherParticles()

    // Update lighting
    const ambientLight = scene.getObjectByName(
      "ambientLight",
    ) as THREE.AmbientLight
    const directionalLight = scene.getObjectByName(
      "directionalLight",
    ) as THREE.DirectionalLight

    if (ambientLight) {
      // Keep ambient light relatively neutral to allow sky color to set the mood,
      // but ensure models are visible.
      let intensity = gradient.ambientIntensity

      // Weather overrides for brightness
      if (weather !== "clear") {
        if (timeOfDay === "dawn") intensity = 0.5
        else if (timeOfDay === "day") intensity = 0.7
        else if (timeOfDay === "sunset") intensity = 0.4
        else if (timeOfDay === "night") intensity = 0.2
      }

      ambientLight.intensity = intensity
    }
    if (directionalLight) {
      let intensity = gradient.directionalIntensity

      // Weather overrides for brightness
      if (weather !== "clear") {
        if (timeOfDay === "dawn") intensity = 0.6
        else if (timeOfDay === "day") intensity = 0.8
        else if (timeOfDay === "sunset") intensity = 0.5
        else if (timeOfDay === "night") intensity = 0.3
      }

      directionalLight.intensity = intensity
    }
  }

  function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  function onMouseMove(event: MouseEvent) {
    // Skip all build mode mouse interactions in POV mode
    if (isFirstPersonMode) return

    const rect = renderer.domElement.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    // Handle Box Selection
    if (isBoxSelecting) {
      boxSelectionEnd = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      return // Stop other interactions while box selecting
    }

    // Track if mouse has moved significantly (more than 5 pixels from down position)
    const dx = event.clientX - mouseDownPosition.x
    const dy = event.clientY - mouseDownPosition.y
    const distanceMoved = Math.sqrt(dx * dx + dy * dy)
    if (distanceMoved > 5) {
      hasMouseMoved = true
      // Hide preview when dragging starts (for any operation including panning/rotating)
      if (previewMesh && selectedPlacedObjects.length === 0) {
        previewMesh.visible = false
      }
    }

    // Start box selection if Shift is held, we have a start position, and mouse moves
    if (
      event.shiftKey &&
      boxSelectionStart &&
      !isBoxSelecting &&
      !isDraggingObject
    ) {
      isBoxSelecting = true
      controls.enabled = false
      const rect = renderer.domElement.getBoundingClientRect()
      boxSelectionEnd = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      return
    }

    // Show preview if it was hidden (e.g. newly selected model) and we are not dragging/box selecting
    if (
      previewMesh &&
      !previewMesh.visible &&
      !isBoxSelecting &&
      !isPanning &&
      !isRotatingCamera &&
      !isShiftKeyHeld &&
      selectedPlacedObjects.length === 0
    ) {
      previewMesh.visible = true
    }

    if (isDraggingObject && selectedPlacedObjects.length > 0) {
      // Drag selected objects
      if (isShiftKeyHeld) {
        // Vertical movement - sensitivity scales with distance from camera to target
        const distance = camera.position.distanceTo(controls.target)
        // Base sensitivity 0.001 per pixel, scaled by distance
        // At distance 50 (default), sensitivity is ~0.05
        const sensitivity = distance * 0.001
        const dy = -event.movementY * sensitivity

        selectedPlacedObjects.forEach((obj) => {
          obj.mesh.position.y += dy

          // Update offset so returning to horizontal drag preserves height
          const offset = dragObjectOffsets.get(obj.mesh)
          if (offset) {
            offset.y += dy
          }
        })
      } else {
        // Horizontal movement (Raycast to ground)
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObject(ground)

        if (intersects.length > 0) {
          const point = intersects[0].point

          // Snap to grid if enabled
          if (showGrid) {
            const gridSize = 0.5
            point.x = Math.round(point.x / gridSize) * gridSize
            point.z = Math.round(point.z / gridSize) * gridSize
          }

          // Move all selected objects maintaining their relative positions
          selectedPlacedObjects.forEach((obj) => {
            const offset = dragObjectOffsets.get(obj.mesh)
            if (offset) {
              obj.mesh.position.copy(point).add(offset)
            }
          })
        }
      }
    } else if (
      selectedModel &&
      previewMesh &&
      !isPanning &&
      !isRotatingCamera &&
      selectedPlacedObjects.length === 0
    ) {
      // Only update preview if no object is selected
      updatePreviewPosition()
    }

    // Check for hover on existing objects (works even when objects are selected)
    if (!isPanning && !isRotatingCamera && !isDraggingObject) {
      raycaster.setFromCamera(mouse, camera)
      const meshes = placedObjects.map((obj) => obj.mesh)
      const intersects = raycaster.intersectObjects(meshes, true)

      if (intersects.length > 0) {
        // Find the top-level placed object
        let hoveredMesh = intersects[0].object
        while (hoveredMesh.parent && hoveredMesh.parent !== scene) {
          hoveredMesh = hoveredMesh.parent
        }

        const obj = placedObjects.find((obj) => obj.mesh === hoveredMesh)
        if (obj) {
          hoveredObject = obj
          // Hide preview when hovering over existing object (only if in preview mode)
          if (previewMesh && selectedPlacedObjects.length === 0) {
            previewMesh.visible = false
          }
        }
      } else {
        hoveredObject = null
        // Show preview when not hovering over existing object (only if no object selected)
        if (previewMesh && selectedPlacedObjects.length === 0) {
          previewMesh.visible = true
        }
      }
    } else {
      hoveredObject = null
    }
  }

  function updatePreviewPosition() {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObject(ground)

    if (intersects.length > 0 && previewMesh) {
      const point = intersects[0].point

      // Snap to grid if enabled - finer 0.5 unit grid
      if (showGrid) {
        const gridSize = 0.5
        point.x = Math.round(point.x / gridSize) * gridSize
        point.z = Math.round(point.z / gridSize) * gridSize
      }

      previewMesh.position.set(point.x, 0, point.z)
      previewMesh.rotation.y = currentRotation
      previewMesh.scale.set(currentScale, currentScale, currentScale)

      // Mark that preview has been positioned
      previewHasBeenPositioned = true
    }
  }

  async function selectModel(model: ModelInfo) {
    selectedModel = model

    // Deselect any selected objects on the map
    selectedPlacedObjects = []

    // Add to recent models
    const existingIndex = recentModels.findIndex((m) => m.path === model.path)
    if (existingIndex > -1) {
      recentModels.splice(existingIndex, 1)
    }
    recentModels = [model, ...recentModels].slice(0, 6)

    // Reset preview positioning flag
    previewHasBeenPositioned = false

    // Remove old preview
    if (previewMesh) {
      scene.remove(previewMesh)
    }

    // Load and create preview
    const loader = new GLTFLoader()
    try {
      const gltf = await loader.loadAsync(model.path)
      previewMesh = gltf.scene
      previewMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = child.material.clone()
          child.material.transparent = true
          child.material.opacity = 0.6
        }
      })
      // Apply default scale from model catalog
      const defaultScale = model.scale || 1
      currentScale = defaultScale
      previewMesh.scale.set(defaultScale, defaultScale, defaultScale)

      // Check size and auto-scale if too small
      const box = new THREE.Box3().setFromObject(previewMesh)
      const size = new THREE.Vector3()
      box.getSize(size)
      const maxDim = Math.max(size.x, size.y, size.z)

      // Calculate minimum size based on 1/10th of viewport height at current camera distance
      // Use distance from camera to center (0,0,0) as a reference
      const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0))
      const vFOV = THREE.MathUtils.degToRad(camera.fov)
      const visibleHeight = 2 * Math.tan(vFOV / 2) * distance
      const minSize = visibleHeight / 10

      if (maxDim < minSize && maxDim > 0) {
        const scaleFactor = minSize / maxDim
        currentScale = defaultScale * scaleFactor
        previewMesh.scale.set(currentScale, currentScale, currentScale)
      }

      // Add to scene but keep invisible until mouse moves over map
      previewMesh.visible = false
      scene.add(previewMesh)
    } catch (error) {
      console.error("Failed to load model preview:", error)
    }
  }

  function onMouseDown(event: MouseEvent) {
    if (event.button !== 0) return // Only left click
    if (isFirstPersonMode) return // Disable all build mode interactions in POV mode

    // Record mouse position and reset movement tracking
    mouseDownPosition = { x: event.clientX, y: event.clientY }
    hasMouseMoved = false

    // Don't process clicks if any modifier key is held (except Shift for selection)
    if (isPanning || isRotatingCamera) return

    // Check for Box Selection Start (Shift held + Not clicking a selected object)
    if (event.shiftKey) {
      // Check if we are clicking on a selected object (to allow vertical drag)
      raycaster.setFromCamera(mouse, camera)
      const selectedMeshes = selectedPlacedObjects.map((obj) => obj.mesh)
      const intersects = raycaster.intersectObjects(selectedMeshes, true)

      if (intersects.length === 0) {
        // Not clicking a selected object -> Prepare for box selection
        // Don't start box selection yet - wait for mouse movement
        // This allows Shift+click to add objects to selection
        const rect = renderer.domElement.getBoundingClientRect()
        boxSelectionStart = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }
        // Don't return early - let normal click handling continue
      }
    }

    // Check if clicking on selected object to start dragging
    if (
      selectedPlacedObjects.length > 0 &&
      !isOptionKeyHeld &&
      !isCommandKeyHeld
    ) {
      raycaster.setFromCamera(mouse, camera)
      // Check intersection with any selected object
      const selectedMeshes = selectedPlacedObjects.map((obj) => obj.mesh)
      const intersects = raycaster.intersectObjects(selectedMeshes, true)

      if (intersects.length > 0) {
        isDraggingObject = true
        controls.enabled = false // Disable orbit controls while dragging
        event.stopPropagation() // Prevent event from bubbling to controls
        if (renderer?.domElement) {
          renderer.domElement.style.cursor = "move"
        }

        // Calculate offsets for all selected objects relative to the click point on ground
        const groundIntersects = raycaster.intersectObject(ground)
        if (groundIntersects.length > 0) {
          const clickPoint = groundIntersects[0].point
          // Snap click point to grid if enabled to avoid jumping
          if (showGrid) {
            const gridSize = 0.5
            clickPoint.x = Math.round(clickPoint.x / gridSize) * gridSize
            clickPoint.z = Math.round(clickPoint.z / gridSize) * gridSize
          }

          dragObjectOffsets.clear()
          selectedPlacedObjects.forEach((obj) => {
            const offset = obj.mesh.position.clone().sub(clickPoint)
            dragObjectOffsets.set(obj.mesh, offset)
          })
        }
      }
    }
  }

  function onMouseUp(event: MouseEvent) {
    // Reset camera rotation mode
    if (isRotatingCamera) {
      isRotatingCamera = false
      controls.enablePan = true
      controls.minPolarAngle = 0
      controls.maxPolarAngle = Math.PI / 2 - 0.1
      if (renderer?.domElement) {
        renderer.domElement.style.cursor = "default"
      }
    }

    if (isDraggingObject) {
      isDraggingObject = false
      controls.enabled = true
      if (renderer?.domElement) {
        renderer.domElement.style.cursor = "default"
      }
      saveHistory()
    }

    if (isBoxSelecting) {
      // Finalize box selection
      const rect = renderer.domElement.getBoundingClientRect()

      // Calculate selection bounds
      const minX = Math.min(boxSelectionStart.x, boxSelectionEnd.x)
      const maxX = Math.max(boxSelectionStart.x, boxSelectionEnd.x)
      const minY = Math.min(boxSelectionStart.y, boxSelectionEnd.y)
      const maxY = Math.max(boxSelectionStart.y, boxSelectionEnd.y)

      // Select objects within bounds
      const newSelection: typeof selectedPlacedObjects = []

      placedObjects.forEach((obj) => {
        // Get object's world position
        const worldPos = new THREE.Vector3()
        obj.mesh.getWorldPosition(worldPos)

        // Project to screen space
        const projected = worldPos.clone()
        projected.project(camera)

        // Skip objects behind the camera
        if (projected.z < -1 || projected.z > 1) return

        // Convert to screen coordinates (relative to container)
        const screenX = (projected.x * 0.5 + 0.5) * rect.width
        const screenY = (-(projected.y * 0.5) + 0.5) * rect.height

        // Check if position is inside selection box
        if (
          screenX >= minX &&
          screenX <= maxX &&
          screenY >= minY &&
          screenY <= maxY
        ) {
          newSelection.push(obj)
        }
      })

      // Add to existing selection if Shift is held (which it is for box select)
      // But since Shift is the trigger, maybe we should just add unique ones?
      // Let's merge with existing selection
      const uniqueSelection = new Set([
        ...selectedPlacedObjects,
        ...newSelection,
      ])
      selectedPlacedObjects = Array.from(uniqueSelection)

      isBoxSelecting = false
      controls.enabled = true
    }

    // Clear box selection start position if it was never used
    if (boxSelectionStart && !isBoxSelecting) {
      boxSelectionStart = null
    }

    // Show preview again after any drag operation (if not holding modifier keys)
    if (
      hasMouseMoved &&
      previewMesh &&
      selectedPlacedObjects.length === 0 &&
      !isPanning &&
      !isRotatingCamera
    ) {
      previewMesh.visible = true
    }
  }

  async function onMouseClick(event: MouseEvent) {
    if (event.button !== 0) return // Only left click
    if (isFirstPersonMode) return // Disable all build mode clicks in POV mode
    if (isPanning) return // Don't place objects while panning
    if (isDraggingObject) return // Don't process click if we just finished dragging
    if (isRotatingCamera) return // Don't place objects when rotating camera
    if (isOptionKeyHeld) return // Don't place objects while Option is held
    if (isCommandKeyHeld) return // Don't place objects while Command is held
    if (isCommandKeyHeld) return // Don't place objects while Command is held
    if (hasMouseMoved) return // Don't place objects if mouse was dragged

    // Check if clicking on an existing object to select it
    raycaster.setFromCamera(mouse, camera)
    const meshes = placedObjects.map((obj) => obj.mesh)
    const intersects = raycaster.intersectObjects(meshes, true)

    if (intersects.length > 0) {
      // Find the top-level placed object
      let clickedObject = intersects[0].object
      while (clickedObject.parent && clickedObject.parent !== scene) {
        clickedObject = clickedObject.parent
      }

      const obj = placedObjects.find((obj) => obj.mesh === clickedObject)
      if (obj) {
        if (event.shiftKey) {
          // Toggle selection
          const index = selectedPlacedObjects.indexOf(obj)
          if (index > -1) {
            selectedPlacedObjects.splice(index, 1)
            selectedPlacedObjects = [...selectedPlacedObjects] // Trigger reactivity
          } else {
            selectedPlacedObjects = [...selectedPlacedObjects, obj]
          }
        } else {
          // Single selection (replace)
          // Only replace if not already selected (to allow dragging without deselecting others)
          if (!selectedPlacedObjects.includes(obj)) {
            selectedPlacedObjects = [obj]
          }
        }
        return
      }
    } else {
      // Clicking empty space - deselect object
      // Don't deselect if Shift is held (box selection mode) or if mouse was dragged
      if (selectedPlacedObjects.length > 0 && !event.shiftKey) {
        selectedPlacedObjects = []
        // Preview will be shown by $effect
        return
      }
    }

    // Don't place objects if Shift is held (used for box selection)
    if (event.shiftKey) return

    // Place new object if a model is selected
    if (!selectedModel || !previewMesh) return

    // Don't place if preview hasn't been positioned yet
    if (!previewHasBeenPositioned) return

    const loader = new GLTFLoader()
    try {
      const gltf = await loader.loadAsync(selectedModel.path)
      const newObject = gltf.scene
      newObject.position.copy(previewMesh.position)
      newObject.rotation.copy(previewMesh.rotation)
      newObject.scale.set(currentScale, currentScale, currentScale)

      newObject.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      scene.add(newObject)
      placedObjects.push({ mesh: newObject, modelPath: selectedModel.path })

      // Check if this is an animated model (only play if animations enabled)
      if (gltf.animations && gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(newObject)
        gltf.animations.forEach((clip) => {
          const action = mixer.clipAction(clip)
          if (animationsEnabled) {
            action.play()
          }
        })
        animatedObjects.push({ mesh: newObject, mixer, clips: gltf.animations })
      }

      // Save history after placing object
      saveHistory()
    } catch (error) {
      console.error("Failed to place model:", error)
    }
  }

  function onRightClick(event: MouseEvent) {
    event.preventDefault()
    // Deletion via right-click/ctrl-click disabled per user request
    // Use Delete/Backspace key instead
  }

  function rotatePreview(direction: number = 1) {
    // 30 degree rotation increments (π/6)
    const rotationAmount = (Math.PI / 6) * direction

    // Only rotate if no object is selected (preview mode only)
    if (selectedPlacedObjects.length === 0) {
      currentRotation += rotationAmount
      if (previewMesh) {
        previewMesh.rotation.y = currentRotation
      }
    }

    // Rotate selected objects
    if (selectedPlacedObjects.length > 0) {
      selectedPlacedObjects.forEach((obj) => {
        obj.mesh.rotation.y += rotationAmount
      })
      saveHistory()
    }
  }

  function scaleUp() {
    // Only scale selected object, not preview
    if (selectedPlacedObjects.length > 0) {
      selectedPlacedObjects.forEach((obj) => {
        const newScale = obj.mesh.scale.x * 1.2
        obj.mesh.scale.set(newScale, newScale, newScale)
      })
      saveHistory()
    } else if (previewMesh) {
      // Only scale preview if no object is selected
      currentScale = currentScale * 1.2
      previewMesh.scale.set(currentScale, currentScale, currentScale)
    }
  }

  function scaleDown() {
    // Only scale selected object, not preview
    if (selectedPlacedObjects.length > 0) {
      selectedPlacedObjects.forEach((obj) => {
        const newScale = obj.mesh.scale.x * 0.8
        obj.mesh.scale.set(newScale, newScale, newScale)
      })
      saveHistory()
    } else if (previewMesh) {
      // Only scale preview if no object is selected
      currentScale = currentScale * 0.8
      previewMesh.scale.set(currentScale, currentScale, currentScale)
    }
  }

  function resetScale() {
    // Only reset selected object, not preview
    if (selectedPlacedObjects.length > 0) {
      selectedPlacedObjects.forEach((obj) => {
        obj.mesh.scale.set(1, 1, 1)
      })
      saveHistory()
    } else if (previewMesh) {
      // Only reset preview if no object is selected
      currentScale = 1.0
      previewMesh.scale.set(1, 1, 1)
    }
  }

  function toggleGrid() {
    showGrid = !showGrid
    gridHelper.visible = showGrid
    ground.visible = showGrid
  }

  function toggleAnimations() {
    animationsEnabled = !animationsEnabled
    // Update all existing animated objects
    animatedObjects.forEach(({ mixer, clips }) => {
      mixer.stopAllAction()
      if (animationsEnabled) {
        // Re-play all animations if enabled
        clips.forEach((clip) => {
          const action = mixer.clipAction(clip)
          action.play()
        })
      }
    })
  }

  function deleteSelected() {
    if (selectedPlacedObjects.length === 0) return

    selectedPlacedObjects.forEach((selectedObj) => {
      const index = placedObjects.findIndex((obj) => obj === selectedObj)
      if (index > -1) {
        const meshToDelete = selectedObj.mesh
        scene.remove(meshToDelete)

        // Remove from animated objects if it exists
        const animIndex = animatedObjects.findIndex(
          (obj) => obj.mesh === meshToDelete,
        )
        if (animIndex > -1) {
          animatedObjects.splice(animIndex, 1)
        }

        placedObjects.splice(index, 1)
      }
    })
    selectedPlacedObjects = []
    saveHistory()
  }

  function copySelected() {
    if (selectedPlacedObjects.length === 0) return

    clipboard = selectedPlacedObjects.map((obj) => ({
      modelPath: obj.modelPath,
      position: {
        x: obj.mesh.position.x,
        y: obj.mesh.position.y,
        z: obj.mesh.position.z,
      },
      rotation: {
        x: obj.mesh.rotation.x,
        y: obj.mesh.rotation.y,
        z: obj.mesh.rotation.z,
      },
      scale: { x: obj.mesh.scale.x, y: obj.mesh.scale.y, z: obj.mesh.scale.z },
    }))
  }

  async function pasteClipboard() {
    if (clipboard.length === 0) return

    // Calculate center of clipboard objects
    const center = new THREE.Vector3()
    clipboard.forEach((item) => {
      center.add(
        new THREE.Vector3(item.position.x, item.position.y, item.position.z),
      )
    })
    center.divideScalar(clipboard.length)

    // Offset for paste (2 units right and down)
    const pasteOffset = new THREE.Vector3(2, 0, 2)

    const newSelection: Array<{ mesh: THREE.Group; modelPath: string }> = []
    const loader = new GLTFLoader()

    for (const item of clipboard) {
      try {
        const gltf = await loader.loadAsync(item.modelPath)
        const newObject = gltf.scene

        // Calculate relative position from center and apply offset
        const originalPos = new THREE.Vector3(
          item.position.x,
          item.position.y,
          item.position.z,
        )
        const relativePos = originalPos.sub(center)
        const newPos = center.clone().add(pasteOffset).add(relativePos)

        newObject.position.copy(newPos)
        newObject.rotation.set(
          item.rotation.x,
          item.rotation.y,
          item.rotation.z,
        )
        newObject.scale.set(item.scale.x, item.scale.y, item.scale.z)

        // Force matrix update to ensure bounding boxes are correct immediately
        newObject.updateMatrixWorld(true)

        newObject.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        scene.add(newObject)
        const newObj = { mesh: newObject, modelPath: item.modelPath }
        placedObjects.push(newObj)
        newSelection.push(newObj)

        // Check if animated
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(newObject)
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip)
            if (animationsEnabled) {
              action.play()
            }
          })
          animatedObjects.push({
            mesh: newObject,
            mixer,
            clips: gltf.animations,
          })
        }
      } catch (error) {
        console.error("Failed to paste object:", error)
      }
    }

    // Select the newly pasted objects
    selectedPlacedObjects = newSelection
    saveHistory()
  }

  function clearScene() {
    if (confirm("Clear all objects from the scene?")) {
      placedObjects.forEach((obj) => scene.remove(obj.mesh))
      placedObjects = []
      animatedObjects = []
      currentMapId = null
      currentMapName = "Untitled Map"
      updatePolygonCount()
    }
  }

  function createNewMap() {
    if (placedObjects.length > 0) {
      if (!confirm("Start a new map? Current unsaved work will be lost.")) {
        return
      }
    }
    clearScene()
    activeTab = "models"
  }

  async function generateMapThumbnail(): Promise<string> {
    // Create a temporary camera view
    const thumbRenderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    })
    thumbRenderer.setSize(256, 256)
    thumbRenderer.shadowMap.enabled = true

    const thumbCamera = camera.clone()
    thumbRenderer.render(scene, thumbCamera)
    const thumbnail = thumbRenderer.domElement.toDataURL("image/png")
    thumbRenderer.dispose()

    return thumbnail
  }

  async function saveCurrentMap(mapName?: string, mapDescription?: string) {
    const name = mapName || currentMapName || "Untitled Map"
    const description = mapDescription || ""

    if (!name.trim()) {
      alert("Please enter a map name")
      return
    }

    const thumbnail = await generateMapThumbnail()
    const now = Date.now()

    const mapData: MapData = {
      id: currentMapId || `map_${now}`,
      name: name.trim(),
      games: selectedGame,
      description: description.trim(),
      created: currentMapId
        ? savedMaps.find((m) => m.id === currentMapId)?.created || now
        : now,
      modified: now,
      thumbnail,
      environment: {
        timeOfDay,
        weather,
        fogDensity: scene.fog instanceof THREE.Fog ? scene.fog.far : 200,
      },
      objects: placedObjects.map((obj) => ({
        modelPath: obj.modelPath,
        position: {
          x: obj.mesh.position.x,
          y: obj.mesh.position.y,
          z: obj.mesh.position.z,
        },
        rotation: {
          x: obj.mesh.rotation.x,
          y: obj.mesh.rotation.y,
          z: obj.mesh.rotation.z,
        },
        scale: {
          x: obj.mesh.scale.x,
          y: obj.mesh.scale.y,
          z: obj.mesh.scale.z,
        },
      })),
      stats: {
        objectCount: placedObjects.length,
        polygonCount,
      },
      planeVisible: showGrid,
    }

    // Update or add map
    const existingIndex = savedMaps.findIndex((m) => m.id === mapData.id)
    if (existingIndex >= 0) {
      savedMaps[existingIndex] = mapData
    } else {
      savedMaps = [...savedMaps, mapData]
    }

    currentMapId = mapData.id
    currentMapName = name
    saveMapsToStorage()

    alert(`Map "${name}" saved! (${placedObjects.length} objects)`)
  }

  async function saveAsNewMap() {
    const baseName = currentMapName || "Untitled Map"
    const newName = prompt(
      `Save as new map. Enter a name:`,
      `${baseName} (Copy)`,
    )

    if (!newName || !newName.trim()) {
      return
    }

    const thumbnail = await generateMapThumbnail()
    const now = Date.now()

    const mapData: MapData = {
      id: `map_${now}`,
      name: newName.trim(),
      description: "",
      created: now,
      modified: now,
      thumbnail,
      environment: {
        timeOfDay,
        weather,
        fogDensity: scene.fog instanceof THREE.Fog ? scene.fog.far : 200,
      },
      objects: placedObjects.map((obj) => ({
        modelPath: obj.modelPath,
        position: {
          x: obj.mesh.position.x,
          y: obj.mesh.position.y,
          z: obj.mesh.position.z,
        },
        rotation: {
          x: obj.mesh.rotation.x,
          y: obj.mesh.rotation.y,
          z: obj.mesh.rotation.z,
        },
        scale: {
          x: obj.mesh.scale.x,
          y: obj.mesh.scale.y,
          z: obj.mesh.scale.z,
        },
      })),
      stats: {
        objectCount: placedObjects.length,
        polygonCount,
      },
      planeVisible: showGrid,
      games: selectedGame, // Save current game visibility setting
    }

    savedMaps = [...savedMaps, mapData]
    currentMapId = mapData.id
    currentMapName = newName.trim()
    saveMapsToStorage()

    alert(`New map "${newName}" created! (${placedObjects.length} objects)`)
  }

  async function loadMap(mapId: string) {
    const map = savedMaps.find((m) => m.id === mapId)
    if (!map) {
      alert("Map not found!")
      return
    }

    // Clear current scene
    placedObjects.forEach((obj) => scene.remove(obj.mesh))
    placedObjects = []
    animatedObjects = []
    selectedPlacedObjects = []

    // Load environment settings
    timeOfDay = map.environment.timeOfDay
    weather = map.environment.weather
    updateEnvironment()

    // Load plane visibility
    if (map.planeVisible !== undefined) {
      showGrid = map.planeVisible
      if (gridHelper) gridHelper.visible = false // Always hide grid helper on load
      if (ground) ground.visible = showGrid
    }

    // Load game selection
    if (map.games) {
      // If multiple games, just pick the first one that isn't 'all' if possible, or default to 'all'
      const games = map.games
        .toLowerCase()
        .split(",")
        .map((g) => g.trim())
      if (games.includes("starship flyer")) selectedGame = "starship flyer"
      else if (games.includes("blocky shooter")) selectedGame = "blocky shooter"
      else selectedGame = "all"
    } else {
      selectedGame = "all"
    }

    // Load objects
    const loader = new GLTFLoader()
    for (const objData of map.objects) {
      try {
        const gltf = await loader.loadAsync(objData.modelPath)
        const newObject = gltf.scene
        newObject.position.set(
          objData.position.x,
          objData.position.y,
          objData.position.z,
        )
        newObject.rotation.set(
          objData.rotation.x,
          objData.rotation.y,
          objData.rotation.z,
        )
        newObject.scale.set(objData.scale.x, objData.scale.y, objData.scale.z)

        newObject.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        scene.add(newObject)
        placedObjects.push({ mesh: newObject, modelPath: objData.modelPath })

        // Check if animated
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(newObject)
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip)
            if (animationsEnabled) {
              action.play()
            }
          })
          animatedObjects.push({
            mesh: newObject,
            mixer,
            clips: gltf.animations,
          })
        }
      } catch (error) {
        console.error("Failed to load object:", error)
      }
    }

    currentMapId = map.id
    currentMapName = map.name
    updatePolygonCount()
    // activeTab = 'models' // Stay on maps tab

    alert(`Map "${map.name}" loaded! (${placedObjects.length} objects)`)
  }

  function deleteMap(mapId: string) {
    const map = savedMaps.find((m) => m.id === mapId)
    if (!map) return

    if (!confirm(`Delete map "${map.name}"? This cannot be undone.`)) {
      return
    }

    savedMaps = savedMaps.filter((m) => m.id !== mapId)
    saveMapsToStorage()

    if (currentMapId === mapId) {
      currentMapId = null
      currentMapName = "Untitled Map"
    }
  }

  function exportMap(mapId: string) {
    const map = savedMaps.find((m) => m.id === mapId)
    if (!map) return

    const dataStr = JSON.stringify(map, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${map.name.replace(/[^a-z0-9]/gi, "_")}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function importMap() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const mapData: MapData = JSON.parse(text)

        // Generate new ID to avoid conflicts
        mapData.id = `map_${Date.now()}`
        mapData.created = Date.now()
        mapData.modified = Date.now()

        savedMaps = [...savedMaps, mapData]
        saveMapsToStorage()

        alert(`Map "${mapData.name}" imported successfully!`)
      } catch (error) {
        alert("Failed to import map. Invalid file format.")
        console.error(error)
      }
    }

    input.click()
  }

  // Validate spawn position to ensure player is not stuck
  function validateSpawnPosition(position: THREE.Vector3): boolean {
    const raycaster = new THREE.Raycaster()
    const directions = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -1, 0),
    ]

    // Check for obstacles in all directions
    for (const direction of directions) {
      raycaster.set(position, direction)
      const intersects = raycaster.intersectObjects(
        placedObjects.map((obj) => obj.mesh),
        true,
      )

      // If obstacle is too close (within 3 units), position is invalid
      if (intersects.length > 0 && intersects[0].distance < 3) {
        return false
      }
    }

    return true
  }

  // Auto generate map with smart object placement
  async function autoGenerateMap(usePreset = false) {
    if (
      !confirm(
        "This will clear the current map and generate a new one. Continue?",
      )
    ) {
      return
    }

    if (modelCatalog.length === 0) {
      alert("No models available in the catalog!")
      return
    }

    // Apply preset counts if requested
    if (usePreset === true) {
      if (quickStartPreset === "town") {
        autoGenTrees = 16
        autoGenBuildings = 16
        autoGenVehicles = 8
        autoGenAnimals = 8
        autoGenRocks = 5
        autoGenCity = 0
        autoGenSpace = 0
        autoGenPlanets = 0
      } else if (quickStartPreset === "city") {
        autoGenTrees = 4
        autoGenBuildings = 0
        autoGenVehicles = 16
        autoGenAnimals = 0
        autoGenRocks = 0
        autoGenCity = 30
        autoGenSpace = 0
        autoGenPlanets = 0
      } else if (quickStartPreset === "nature") {
        autoGenTrees = 40
        autoGenBuildings = 0
        autoGenVehicles = 0
        autoGenAnimals = 20
        autoGenRocks = 15
        autoGenCity = 0
        autoGenSpace = 0
        autoGenPlanets = 0
      } else if (quickStartPreset === "space") {
        autoGenTrees = 0
        autoGenBuildings = 0
        autoGenVehicles = 0
        autoGenAnimals = 0
        autoGenRocks = 0
        autoGenCity = 0
        autoGenSpace = 20
        autoGenPlanets = 8
        // Automatically enable vertical distribution and night mode for space
        distributeVertically = true
        timeOfDay = "night"
        updateEnvironment()
      } else if (quickStartPreset === "random") {
        autoGenTrees = Math.floor(Math.random() * 20)
        autoGenBuildings = Math.floor(Math.random() * 10)
        autoGenVehicles = Math.floor(Math.random() * 10)
        autoGenAnimals = Math.floor(Math.random() * 10)
        autoGenRocks = Math.floor(Math.random() * 15)
        autoGenCity = Math.floor(Math.random() * 10)
        autoGenSpace = Math.floor(Math.random() * 10)
        autoGenPlanets = Math.floor(Math.random() * 5)
      }
    }

    // Clear existing objects
    placedObjects.forEach((obj) => {
      scene.remove(obj.mesh)
      if (obj.mixer) {
        const index = animatedObjects.findIndex((a) => a.mesh === obj.mesh)
        if (index !== -1) {
          animatedObjects.splice(index, 1)
        }
      }
    })
    placedObjects = []

    // Categorize models
    // Filter out models with "street" in the name
    const validModels = modelCatalog.filter(
      (m) => !m.name.toLowerCase().includes("street"),
    )

    // Trees & Plants - includes trees, bushes, plants, flowers, grass, etc.
    const trees = validModels.filter((m) => {
      const name = m.name.toLowerCase()
      return (
        name.includes("tree") ||
        name.includes("pine") ||
        name.includes("oak") ||
        name.includes("birch") ||
        name.includes("plant") ||
        name.includes("bush") ||
        name.includes("flower") ||
        name.includes("grass") ||
        name.includes("bamboo") ||
        name.includes("fern") ||
        name.includes("mushroom") ||
        name.includes("clover") ||
        name.includes("tall grass") ||
        (name.includes("planter") && name.includes("bushes"))
      )
    })

    const buildings = validModels.filter(
      (m) =>
        m.name.toLowerCase().includes("building") ||
        m.name.toLowerCase().includes("house") ||
        m.name.toLowerCase().includes("tower"),
    )

    const vehicles = validModels.filter(
      (m) =>
        m.name.toLowerCase().includes("car") ||
        m.name.toLowerCase().includes("truck") ||
        m.name.toLowerCase().includes("vehicle"),
    )

    // Animals - comprehensive list of all animal types
    const animals = validModels.filter((m) => {
      const name = m.name.toLowerCase()
      return (
        m.category === "Animals" ||
        name.includes("animal") ||
        name.includes("dog") ||
        name.includes("cat") ||
        name.includes("bird") ||
        name.includes("alpaca") ||
        name.includes("bull") ||
        name.includes("cow") ||
        name.includes("chicken") ||
        name.includes("chick") ||
        name.includes("deer") ||
        name.includes("donkey") ||
        name.includes("fox") ||
        name.includes("frog") ||
        name.includes("horse") ||
        name.includes("llama") ||
        name.includes("pig") ||
        name.includes("sheep") ||
        name.includes("snake") ||
        name.includes("wolf") ||
        name.includes("zebra")
      )
    })

    // Rocks - rock, pebble, boulder (exclude tools like pickaxe, shovel)
    const rocks = validModels.filter((m) => {
      const name = m.name.toLowerCase()
      return (
        (name.includes("rock") ||
          name.includes("pebble") ||
          name.includes("boulder")) &&
        !name.includes("pickaxe") &&
        !name.includes("shovel") &&
        !name.includes("sword") &&
        !name.includes("axe") &&
        !name.includes("poster") &&
        !name.includes("path")
      )
    })

    // Planets - planets, moons, asteroids
    const planets = validModels.filter((m) => {
      const name = m.name.toLowerCase()
      return (
        name.includes("planet") ||
        name.includes("moon") ||
        name.includes("asteroid") ||
        name.includes("meteor")
      )
    })

    const city = validModels.filter((m) => m.category === "City Scape")
    const space = validModels.filter((m) => m.category === "Space")
    const other = validModels.filter(
      (m) =>
        !trees.includes(m) &&
        !buildings.includes(m) &&
        !vehicles.includes(m) &&
        !animals.includes(m) &&
        !city.includes(m) &&
        !space.includes(m) &&
        !rocks.includes(m) &&
        !planets.includes(m),
    )

    const newObjects: Array<{
      mesh: THREE.Group
      modelPath: string
      rotation: number
      scale: number
      mixer: THREE.AnimationMixer | null
    }> = []
    const loader = new GLTFLoader()

    // Helper to place object
    const placeModel = async (
      model: any,
      position: THREE.Vector3,
      scale: number,
    ) => {
      try {
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            model.path,
            (gltf) => resolve(gltf),
            undefined,
            (error) => reject(error),
          )
        })

        const modelMesh = gltf.scene

        // Enable shadows
        modelMesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        // Calculate bounding box to center the model and place on ground
        const box = new THREE.Box3().setFromObject(modelMesh)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const min = box.min

        // Center the modelMesh relative to its parent
        modelMesh.position.x = -center.x
        modelMesh.position.z = -center.z
        modelMesh.position.y = -min.y // Align bottom to 0

        // Create a wrapper group for correct pivoting and scaling
        const wrapper = new THREE.Group()
        wrapper.add(modelMesh)

        // Apply transforms to wrapper
        wrapper.position.copy(position)
        wrapper.rotation.y = Math.random() * Math.PI * 2
        wrapper.scale.setScalar(scale)

        scene.add(wrapper)

        let mixer: THREE.AnimationMixer | null = null
        if (
          gltf.animations &&
          gltf.animations.length > 0 &&
          animationsEnabled
        ) {
          mixer = new THREE.AnimationMixer(modelMesh)
          const action = mixer.clipAction(gltf.animations[0])
          action.play()
          animatedObjects = [
            ...animatedObjects,
            { mesh: wrapper, mixer, clips: gltf.animations },
          ]
        }

        newObjects.push({
          mesh: wrapper,
          modelPath: model.path,
          rotation: wrapper.rotation.y,
          scale,
          mixer,
        })
        return wrapper
      } catch (error) {
        console.error("Failed to load model:", model.path, error)
        return undefined
      }
    }

    // Safe area within the 200x200 grid (leaving 30 units margin)
    const SAFE_SIZE = 140
    const HALF_SAFE = SAFE_SIZE / 2

    // Helper to check collisions
    const checkCollision = (
      wrapper: THREE.Group,
      others: Array<{ mesh: THREE.Group }>,
    ) => {
      const box1 = new THREE.Box3().setFromObject(wrapper)
      // Shrink box slightly to allow touching but not deep overlap
      box1.expandByScalar(-0.5)

      for (const other of others) {
        const box2 = new THREE.Box3().setFromObject(other.mesh)
        box2.expandByScalar(-0.5)
        if (box1.intersectsBox(box2)) return true
      }
      return false
    }

    // Helper to try placing with retries
    const tryPlace = async (
      model: any,
      safeSize: number,
      scale: number,
      allowVertical = false,
    ) => {
      // Initial placement
      let y = 0
      if (allowVertical) {
        // Distribute above and below ground (-50 to +50)
        y = (Math.random() - 0.5) * 100
      }
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * safeSize,
        y,
        (Math.random() - 0.5) * safeSize,
      )
      const wrapper = await placeModel(model, pos, scale)

      if (!wrapper) return

      // Check collision and retry position if needed
      let retries = 10
      let collided = checkCollision(
        wrapper,
        newObjects.filter((o) => o.mesh !== wrapper),
      )

      while (collided && retries > 0) {
        // Move to new random position
        const newY = allowVertical ? (Math.random() - 0.5) * 100 : 0
        const newPos = new THREE.Vector3(
          (Math.random() - 0.5) * safeSize,
          newY,
          (Math.random() - 0.5) * safeSize,
        )
        wrapper.position.copy(newPos)
        wrapper.updateMatrixWorld(true) // Update transforms for box calculation

        collided = checkCollision(
          wrapper,
          newObjects.filter((o) => o.mesh !== wrapper),
        )
        retries--
      }

      // If still colliding after retries, remove it
      if (collided) {
        scene.remove(wrapper)
        // Remove from newObjects
        const idx = newObjects.findIndex((o) => o.mesh === wrapper)
        if (idx !== -1) newObjects.splice(idx, 1)
        // Also remove from animatedObjects if present
        const animIdx = animatedObjects.findIndex((a) => a.mesh === wrapper)
        if (animIdx !== -1) animatedObjects.splice(animIdx, 1)
      }
    }

    // Place trees
    for (let i = 0; i < autoGenTrees && trees.length > 0; i++) {
      const model = trees[Math.floor(Math.random() * trees.length)]
      await tryPlace(
        model,
        SAFE_SIZE,
        2.0 + Math.random() * 2.0,
        distributeVertically,
      )
    }

    // Place buildings (larger, in a circle or scattered but within bounds)
    for (let i = 0; i < autoGenBuildings && buildings.length > 0; i++) {
      const model = buildings[Math.floor(Math.random() * buildings.length)]
      // Keep buildings slightly more central to avoid edge clipping
      const BUILDING_SAFE = 120
      await tryPlace(
        model,
        BUILDING_SAFE,
        3.0 + Math.random() * 2.0,
        distributeVertically,
      )
    }

    // Place vehicles
    for (let i = 0; i < autoGenVehicles && vehicles.length > 0; i++) {
      const model = vehicles[Math.floor(Math.random() * vehicles.length)]
      await tryPlace(
        model,
        SAFE_SIZE,
        1.5 + Math.random(),
        distributeVertically,
      )
    }

    // Place animals
    for (let i = 0; i < autoGenAnimals && animals.length > 0; i++) {
      const model = animals[Math.floor(Math.random() * animals.length)]
      await tryPlace(
        model,
        SAFE_SIZE,
        1.0 + Math.random() * 0.5,
        distributeVertically,
      )
    }

    // Place City Scape objects
    for (let i = 0; i < autoGenCity && city.length > 0; i++) {
      const model = city[Math.floor(Math.random() * city.length)]
      await tryPlace(
        model,
        SAFE_SIZE,
        2.0 + Math.random() * 2.0,
        distributeVertically,
      )
    }

    // Place Space objects
    for (let i = 0; i < autoGenSpace && space.length > 0; i++) {
      const model = space[Math.floor(Math.random() * space.length)]
      await tryPlace(
        model,
        SAFE_SIZE,
        2.0 + Math.random() * 2.0,
        distributeVertically,
      )
    }

    // Place Rocks
    for (let i = 0; i < autoGenRocks && rocks.length > 0; i++) {
      const model = rocks[Math.floor(Math.random() * rocks.length)]
      await tryPlace(
        model,
        SAFE_SIZE,
        0.5 + Math.random() * 1.5,
        distributeVertically,
      )
    }

    // Place Planets (for space scenes, larger scale)
    for (let i = 0; i < autoGenPlanets && planets.length > 0; i++) {
      const model = planets[Math.floor(Math.random() * planets.length)]
      await tryPlace(
        model,
        SAFE_SIZE,
        5.0 + Math.random() * 10.0,
        distributeVertically,
      )
    }

    // Update placedObjects all at once
    placedObjects = newObjects

    // Hide ground if distributing vertically (space mode)
    if (distributeVertically) {
      showGrid = false
      if (gridHelper) gridHelper.visible = false
      if (ground) ground.visible = false
    } else {
      showGrid = true
      if (gridHelper) gridHelper.visible = true
      if (ground) ground.visible = true
    }

    // Reset camera to good overview position
    camera.position.set(50, 50, 50)
    camera.lookAt(0, 0, 0)
    controls.target.set(0, 0, 0)
    controls.update()

    updatePolygonCount()
    console.log("Auto-generation complete!")
    alert(`Map generated successfully! Placed ${placedObjects.length} objects.`)
  }

  function updatePolygonCount() {
    let count = 0
    placedObjects.forEach((obj) => {
      obj.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const geometry = child.geometry
          if (geometry.index) {
            count += geometry.index.count / 3
          } else if (geometry.attributes.position) {
            count += geometry.attributes.position.count / 3
          }
        }
      })
    })
    polygonCount = Math.round(count)
  }

  // Weather creation functions now use shared module

  function updateWeatherParticles() {
    // Remove existing systems
    if (rainSystem) {
      scene.remove(rainSystem)
      rainSystem = null
    }
    if (snowSystem) {
      scene.remove(snowSystem)
      snowSystem = null
    }

    // Create new system based on weather using shared module
    if (weather === "rain") {
      rainSystem = createRain(scene)
    } else if (weather === "snow") {
      snowSystem = createSnow(scene)
    }
  }

  function animateWeather(delta: number) {
    // Use shared weather animation function
    const center = new THREE.Vector3(0, 0, 0) // World Builder uses fixed center
    animateWeatherShared(delta, rainSystem, snowSystem, center)
  }

  const clock = new THREE.Clock()

  function animate() {
    animationId = requestAnimationFrame(animate)

    const delta = clock.getDelta()

    // Update first-person mode
    updateFirstPersonMode(delta)

    // Animate weather
    animateWeather(delta)

    // Update animation mixers only if animations are enabled
    if (animationsEnabled) {
      animatedObjects.forEach(({ mixer }) => {
        mixer.update(delta)
      })
    }

    // Update selection helpers
    if (selectedPlacedObjects.length > 0 && selectionHelpers.length > 0) {
      selectionHelpers.forEach((helper) => helper.update())
    }

    // Update hover helper
    if (hoveredObject && hoverHelper) {
      hoverHelper.update()
    }

    if (!isFirstPersonMode) {
      controls.update()
    }
    renderer.render(scene, camera)
  }

  $effect(() => {
    if (gridHelper) {
      gridHelper.visible = showGrid
    }
  })

  // Don't use $effect for polygon count - it causes infinite loops
  // Instead, call updatePolygonCount() manually when objects are added/removed

  // Update environment when time of day or weather changes
  $effect(() => {
    // Reading these values establishes the dependency
    const currentTime = timeOfDay
    const currentWeather = weather
    // Now update
    if (scene) {
      updateEnvironment()
    }
  })

  $effect(() => {
    // Update selection outline when selection changes
    if (selectionHelpers.length > 0) {
      selectionHelpers.forEach((helper) => scene.remove(helper))
      selectionHelpers = []
    }

    if (selectedPlacedObjects.length > 0) {
      selectedPlacedObjects.forEach((obj) => {
        const helper = new THREE.BoxHelper(obj.mesh, 0x00ff00)
        scene.add(helper)
        selectionHelpers.push(helper)
      })

      // Hide preview when object is selected
      if (previewMesh) {
        previewMesh.visible = false
      }
    } else {
      // Show preview when no object is selected
      if (previewMesh) {
        previewMesh.visible = true
      }
    }
  })

  $effect(() => {
    // Update hover outline when hover changes
    if (hoverHelper) {
      scene.remove(hoverHelper)
      hoverHelper = null
    }

    if (hoveredObject) {
      hoverHelper = new THREE.BoxHelper(hoveredObject.mesh, 0xffff00) // Yellow for hover
      scene.add(hoverHelper)
    }
  })

  // POV Mode functions
  function enterPOVMode() {
    if (isFirstPersonMode) return

    // Save current camera state
    savedCameraPosition = camera.position.clone()
    savedCameraRotation = camera.rotation.clone()
    savedControlsTarget = controls.target.clone()

    // Use current camera position but set height to 10
    fpPosition.set(camera.position.x, 10, camera.position.z)

    // Calculate yaw from current camera rotation to maintain view direction
    // Extract yaw from the camera's current rotation
    fpYaw = camera.rotation.y
    fpPitch = 0 // Keep pitch at 0 (looking straight at horizon)

    // Start falling (gravity will pull down)
    fpVelocity.set(0, 0, 0)

    // Set camera rotation order before entering POV mode
    camera.rotation.order = "YXZ"

    // Set initial camera rotation to be perfectly level
    camera.rotation.set(0, fpYaw, 0, "YXZ")

    // Enter POV mode
    isFirstPersonMode = true
    isPOVPaused = false
    controls.enabled = false

    // Request pointer lock for mouse look
    if (renderer?.domElement) {
      renderer.domElement.requestPointerLock()
    }

    // Hide preview and deselect objects
    if (previewMesh) previewMesh.visible = false
    selectedPlacedObjects = []
  }

  function pausePOVMode() {
    isPOVPaused = true
    // Exit pointer lock when paused
    if (document.pointerLockElement) {
      document.exitPointerLock()
    }
  }

  function continuePOVMode() {
    isPOVPaused = false
    // Re-request pointer lock
    if (renderer?.domElement) {
      renderer.domElement.requestPointerLock()
    }
  }

  function exitFirstPersonMode() {
    if (!isFirstPersonMode) return

    isFirstPersonMode = false
    isPOVPaused = false
    controls.enabled = true

    // Restore camera
    if (savedCameraPosition && savedCameraRotation && savedControlsTarget) {
      camera.position.copy(savedCameraPosition)
      camera.rotation.copy(savedCameraRotation)
      controls.target.copy(savedControlsTarget)
    }

    // Exit pointer lock
    if (document.pointerLockElement) {
      document.exitPointerLock()
    }

    // Clear selected model and preview to go back to "build mode"
    selectedModel = null
    if (previewMesh) {
      scene.remove(previewMesh)
      previewMesh = null
    }
    currentRotation = 0
    currentScale = 1.0
  }

  function onFPMouseMove(event: MouseEvent) {
    if (
      !isFirstPersonMode ||
      isPOVPaused ||
      document.pointerLockElement !== renderer?.domElement
    )
      return

    const sensitivity = 0.002
    fpYaw -= event.movementX * sensitivity
    fpPitch -= event.movementY * sensitivity
    fpPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, fpPitch))
  }

  function checkAndFixStuckPlayerPOV(delta: number) {
    // Check if player is trying to move
    const isTryingToMove =
      fpKeysPressed.has("w") ||
      fpKeysPressed.has("a") ||
      fpKeysPressed.has("s") ||
      fpKeysPressed.has("d")

    if (!isTryingToMove) {
      stuckCounter = 0
      return
    }

    stuckCheckTimer += delta * 1000

    if (stuckCheckTimer >= STUCK_CHECK_INTERVAL) {
      const distance = fpPosition.distanceTo(lastPOVPosition)

      if (distance < STUCK_THRESHOLD && isTryingToMove) {
        stuckCounter++
        console.log(
          `Player may be stuck. Counter: ${stuckCounter}, Distance moved: ${distance.toFixed(3)}`,
        )

        if (stuckCounter >= STUCK_COUNT_LIMIT) {
          console.log("Player is stuck! Attempting to unstuck...")

          // Try shifting the player in different directions
          const shiftDistance = 2
          const testDirections = [
            new THREE.Vector3(shiftDistance, 0, 0),
            new THREE.Vector3(-shiftDistance, 0, 0),
            new THREE.Vector3(0, 0, shiftDistance),
            new THREE.Vector3(0, 0, -shiftDistance),
            new THREE.Vector3(shiftDistance, 0, shiftDistance),
            new THREE.Vector3(-shiftDistance, 0, -shiftDistance),
          ]

          let foundValidPosition = false
          for (const direction of testDirections) {
            const testPos = fpPosition.clone().add(direction)
            testPos.y = fpPosition.y // Keep same height

            if (validateSpawnPosition(testPos)) {
              fpPosition.copy(testPos)
              camera.position.copy(fpPosition)
              foundValidPosition = true
              console.log("Successfully unstuck player to:", testPos)
              break
            }
          }

          if (!foundValidPosition) {
            // Last resort: teleport to origin or a random safe position
            const safePos = new THREE.Vector3(0, GROUND_LEVEL, 0)
            if (validateSpawnPosition(safePos)) {
              fpPosition.copy(safePos)
              camera.position.copy(fpPosition)
              console.log("Teleported player to origin")
            } else {
              // Try random positions
              for (let i = 0; i < 10; i++) {
                const randomPos = new THREE.Vector3(
                  (Math.random() - 0.5) * 40,
                  GROUND_LEVEL,
                  (Math.random() - 0.5) * 40,
                )
                if (validateSpawnPosition(randomPos)) {
                  fpPosition.copy(randomPos)
                  camera.position.copy(fpPosition)
                  console.log(
                    "Teleported player to random safe position:",
                    randomPos,
                  )
                  break
                }
              }
            }
          }

          stuckCounter = 0
        }
      } else {
        // Player is moving fine, reset counter
        stuckCounter = 0
      }

      lastPOVPosition.copy(fpPosition)
      stuckCheckTimer = 0
    }
  }

  function updateFirstPersonMode(delta: number) {
    if (!isFirstPersonMode || isPOVPaused) return

    // Update camera orientation
    camera.rotation.order = "YXZ"
    camera.rotation.y = fpYaw
    camera.rotation.x = fpPitch
    camera.rotation.z = 0 // Ensure no roll

    // Horizontal movement
    const moveSpeed = 5.0 // units per second
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion,
    )
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion)
    right.y = 0
    right.normalize()

    const movement = new THREE.Vector3()

    if (fpKeysPressed.has("w")) movement.add(forward)
    if (fpKeysPressed.has("s")) movement.sub(forward)
    if (fpKeysPressed.has("d")) movement.add(right)
    if (fpKeysPressed.has("a")) movement.sub(right)

    if (movement.length() > 0) {
      movement.normalize().multiplyScalar(moveSpeed * delta)
      fpPosition.x += movement.x
      fpPosition.z += movement.z
    }

    // Gravity and jumping
    const onGround = fpPosition.y <= GROUND_LEVEL

    if (onGround) {
      fpVelocity.y = 0
      fpPosition.y = GROUND_LEVEL

      // Jump when space is pressed and on ground
      if (fpKeysPressed.has(" ")) {
        fpVelocity.y = JUMP_VELOCITY
      }
    } else {
      // Apply gravity when in air
      fpVelocity.y += GRAVITY * delta
    }

    // Update vertical position
    fpPosition.y += fpVelocity.y * delta

    // Ensure we don't go below ground
    if (fpPosition.y < GROUND_LEVEL) {
      fpPosition.y = GROUND_LEVEL
      fpVelocity.y = 0
    }

    // Check for stuck player and fix if needed
    checkAndFixStuckPlayerPOV(delta)

    // Update camera position
    camera.position.copy(fpPosition)
  }

  // Search
  let searchQuery = $state("")
  let fuse: Fuse<ModelInfo> | null = null

  $effect(() => {
    fuse = new Fuse(modelCatalog, {
      keys: ["name", "category"],
      threshold: 0.3,
      distance: 100,
    })
  })

  function getFilteredModels() {
    if (!searchQuery) {
      if (selectedCategory === "All") {
        return modelCatalog
      }
      return modelCatalog
        .filter((m) => m.category === selectedCategory)
        .sort((a, b) => a.name.localeCompare(b.name))
    }

    // Fuzzy search
    if (fuse) {
      const results = fuse.search(searchQuery)
      return results.map((r) => r.item)
    }

    // Fallback
    return modelCatalog.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  function clearSelection() {
    selectedModel = null
    if (previewMesh) {
      scene.remove(previewMesh)
      previewMesh = null
    }
    currentRotation = 0
    currentScale = 1.0
  }

  function saveHistory() {
    const state: HistoryState = {
      placedObjects: placedObjects.map((obj) => ({
        modelPath: obj.modelPath,
        position: {
          x: obj.mesh.position.x,
          y: obj.mesh.position.y,
          z: obj.mesh.position.z,
        },
        rotation: {
          x: obj.mesh.rotation.x,
          y: obj.mesh.rotation.y,
          z: obj.mesh.rotation.z,
        },
        scale: {
          x: obj.mesh.scale.x,
          y: obj.mesh.scale.y,
          z: obj.mesh.scale.z,
        },
      })),
    }

    // Remove any future states if we're not at the end
    history = history.slice(0, historyIndex + 1)
    history.push(state)
    historyIndex = history.length - 1

    // Limit history to 50 states
    if (history.length > 50) {
      history = history.slice(-50)
      historyIndex = history.length - 1
    }
  }

  async function undo() {
    if (historyIndex <= 0) return

    historyIndex--
    await restoreHistoryState(history[historyIndex])
  }

  async function redo() {
    if (historyIndex >= history.length - 1) return

    historyIndex++
    await restoreHistoryState(history[historyIndex])
  }

  async function restoreHistoryState(state: HistoryState) {
    // Clear current scene
    placedObjects.forEach((obj) => scene.remove(obj.mesh))
    placedObjects = []
    animatedObjects = []
    selectedPlacedObject = null

    const loader = new GLTFLoader()

    for (const objData of state.placedObjects) {
      try {
        const gltf = await loader.loadAsync(objData.modelPath)
        const newObject = gltf.scene
        newObject.position.set(
          objData.position.x,
          objData.position.y,
          objData.position.z,
        )
        newObject.rotation.set(
          objData.rotation.x,
          objData.rotation.y,
          objData.rotation.z,
        )
        newObject.scale.set(objData.scale.x, objData.scale.y, objData.scale.z)

        newObject.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        scene.add(newObject)
        placedObjects.push({ mesh: newObject, modelPath: objData.modelPath })

        // Check if animated (only play if animations enabled)
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(newObject)
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip)
            if (animationsEnabled) {
              action.play()
            }
          })
          animatedObjects.push({
            mesh: newObject,
            mixer,
            clips: gltf.animations,
          })
        }
      } catch (error) {
        console.error("Failed to restore object:", error)
      }
    }
  }

  // Generate 3D thumbnails for all models
  async function generateThumbnails() {
    // Check if we have cached thumbnails
    try {
      const cachedVersion = localStorage.getItem(THUMBNAIL_VERSION_KEY)
      const cachedData = localStorage.getItem(THUMBNAIL_CACHE_KEY)

      if (cachedVersion === CURRENT_THUMBNAIL_VERSION && cachedData) {
        const cached = JSON.parse(cachedData)
        thumbnails = new Map(Object.entries(cached))
        thumbnailsLoading = false
        console.log("Loaded thumbnails from cache")
        return
      } else {
        console.log("Cache invalid or not found, generating thumbnails...")
      }
    } catch (error) {
      console.error("Failed to load cached thumbnails:", error)
    }

    // Generate thumbnails
    const thumbScene = new THREE.Scene()
    thumbScene.background = new THREE.Color(0xe0e0e0) // Lighter background

    const thumbCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
    const thumbRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    thumbRenderer.setSize(128, 128)
    thumbRenderer.shadowMap.enabled = true

    // Brighter lighting for thumbnails
    const ambLight = new THREE.AmbientLight(0xffffff, 1.0)
    thumbScene.add(ambLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 5, 5)
    dirLight.castShadow = true
    thumbScene.add(dirLight)

    // Add fill light for better brightness
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6)
    fillLight.position.set(-5, 3, -5)
    thumbScene.add(fillLight)

    const loader = new GLTFLoader()
    const newThumbnails = new Map<string, string>()

    // Generate thumbnails in batches to avoid freezing
    const batchSize = 10
    for (let i = 0; i < modelCatalog.length; i += batchSize) {
      const batch = modelCatalog.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (model) => {
          try {
            const gltf = await loader.loadAsync(model.path)
            const obj = gltf.scene

            // Calculate bounding box and center the model
            const box = new THREE.Box3().setFromObject(obj)
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())

            obj.position.sub(center)
            thumbScene.add(obj)

            // Position camera closer to fill more of the frame (2x bigger preview)
            const maxDim = Math.max(size.x, size.y, size.z)
            const distance = maxDim * 0.9
            thumbCamera.position.set(distance, distance * 0.7, distance)
            thumbCamera.lookAt(0, 0, 0)

            // Render thumbnail
            thumbRenderer.render(thumbScene, thumbCamera)
            const dataUrl = thumbRenderer.domElement.toDataURL("image/png")
            newThumbnails.set(model.path, dataUrl)

            // Clean up
            thumbScene.remove(obj)
          } catch (error) {
            console.error(
              `Failed to generate thumbnail for ${model.name}:`,
              error,
            )
            // Use a placeholder for failed thumbnails
            newThumbnails.set(model.path, "")
          }
        }),
      )

      // Update state after each batch
      thumbnails = new Map(newThumbnails)
    }

    // Cache the thumbnails
    try {
      const cacheData = Object.fromEntries(newThumbnails)
      localStorage.setItem(THUMBNAIL_CACHE_KEY, JSON.stringify(cacheData))
      localStorage.setItem(THUMBNAIL_VERSION_KEY, CURRENT_THUMBNAIL_VERSION)
      console.log("Cached thumbnails to localStorage")
    } catch (error) {
      console.error("Failed to cache thumbnails:", error)
    }

    thumbnailsLoading = false
    thumbRenderer.dispose()
  }
</script>

<svelte:head>
  <title>World Builder | Dougie's Game Hub</title>
</svelte:head>

<svelte:window
  onkeydown={(e) => {
    // Don't capture keyboard events when typing in input fields
    const target = e.target as HTMLElement
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      // Only allow Escape to work in input fields
      if (e.key === "Escape") {
        target.blur() // Unfocus the input
      }
      return
    }

    // Handle Escape key (works in both modes)
    if (e.key === "Escape") {
      e.preventDefault()
      if (isFirstPersonMode && !isPOVPaused) {
        // Pause POV mode to show menu (only if not already paused)
        pausePOVMode()
      } else if (!isFirstPersonMode) {
        // Clear any selected placed object
        selectedPlacedObjects = []
        // Clear selected model from menu and remove preview
        selectedModel = null
        if (previewMesh) {
          scene.remove(previewMesh)
          previewMesh = null
        }
        currentRotation = 0
        currentScale = 1.0
      }
      return
    }

    // WASD and Space keys for first-person mode
    if (isFirstPersonMode) {
      const key = e.key.toLowerCase()
      if (["w", "a", "s", "d"].includes(key)) {
        fpKeysPressed.add(key)
      }
      if (e.key === " ") {
        e.preventDefault()
        fpKeysPressed.add(" ")
        return // Don't let space trigger panning in FP mode
      }
      return // Skip all other build mode keys in FP mode
    }

    // All build mode keyboard controls below (only active when NOT in FP mode)
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault()
      rotatePreview(e.key === "ArrowLeft" ? -1 : 1)
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      scaleUp()
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      scaleDown()
    }
    if (e.key === "g" || e.key === "G") {
      e.preventDefault()
      toggleGrid()
    }
    if (e.key === "=" || e.key === "+") {
      e.preventDefault()
      scaleUp()
    }
    if (e.key === "-" || e.key === "_") {
      e.preventDefault()
      scaleDown()
    }
    if (e.key === "0") {
      e.preventDefault()
      resetScale()
    }
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault()
      deleteSelected()
    }
    if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (e.shiftKey) {
        redo()
      } else {
        undo()
      }
    }
    if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      copySelected()
    }
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      pasteClipboard()
    }
    if (e.key === "y" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      redo()
    }
    if (e.key === " ") {
      e.preventDefault()
      isPanning = true
      controls.mouseButtons.LEFT = THREE.MOUSE.PAN
      if (renderer?.domElement) {
        renderer.domElement.style.cursor = "grab"
      }
      // Hide preview mesh while panning
      if (previewMesh && selectedPlacedObjects.length === 0) {
        previewMesh.visible = false
      }
    }
    // Track Option/Alt key press - enables level rotation (horizontal spin only)
    if (e.key === "Alt") {
      e.preventDefault()
      isOptionKeyHeld = true
      isRotatingCamera = true
      controls.enabled = true
      controls.enableRotate = true
      controls.enablePan = false
      // Lock polar angle to maintain level
      const currentPolarAngle = controls.getPolarAngle()
      controls.minPolarAngle = currentPolarAngle
      controls.maxPolarAngle = currentPolarAngle
      if (renderer?.domElement) {
        renderer.domElement.style.cursor = "grab"
      }
      // Hide preview mesh while rotating
      if (previewMesh && selectedPlacedObjects.length === 0) {
        previewMesh.visible = false
      }
    }
    // Track Command/Control key press - enables free rotation
    if (e.key === "Meta" || e.key === "Control") {
      e.preventDefault()
      isCommandKeyHeld = true
      isRotatingCamera = true
      controls.enabled = true
      controls.enableRotate = true
      controls.enablePan = false
      controls.minPolarAngle = 0
      controls.maxPolarAngle = Math.PI / 2 - 0.1
      if (renderer?.domElement) {
        renderer.domElement.style.cursor = "grab"
      }
      // Hide preview mesh while rotating
      if (previewMesh && selectedPlacedObjects.length === 0) {
        previewMesh.visible = false
      }
    }
    // Track Shift key press - enables box selection
    if (e.key === "Shift") {
      // Don't prevent default to allow standard shortcuts if needed, but here we use it for selection
      isShiftKeyHeld = true
      // Hide preview mesh when Shift is held (for box selection)
      if (previewMesh) {
        previewMesh.visible = false
      }
      controls.enablePan = false // Disable panning while moving vertically
    }
  }}
  onkeyup={(e) => {
    // Don't capture keyboard events when typing in input fields
    const target = e.target as HTMLElement
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      return
    }

    // WASD and Space keys for first-person mode
    if (isFirstPersonMode) {
      const key = e.key.toLowerCase()
      if (["w", "a", "s", "d"].includes(key)) {
        fpKeysPressed.delete(key)
      }
      if (e.key === " ") {
        e.preventDefault()
        fpKeysPressed.delete(" ")
        return // Don't trigger panning cleanup in FP mode
      }
    }
    if (e.key === " ") {
      e.preventDefault()
      isPanning = false
      controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE
      if (renderer?.domElement) {
        renderer.domElement.style.cursor = "default"
      }
      // Show preview mesh again when done panning
      if (previewMesh && selectedPlacedObjects.length === 0) {
        previewMesh.visible = true
      }
    }
    // Reset Option/Alt key state
    if (e.key === "Alt") {
      e.preventDefault()
      isOptionKeyHeld = false
      isRotatingCamera = false
      controls.enablePan = true
      controls.minPolarAngle = 0
      controls.maxPolarAngle = Math.PI / 2 - 0.1
      if (renderer?.domElement) {
        renderer.domElement.style.cursor = "default"
      }
      // Show preview mesh again when done rotating
      if (previewMesh && selectedPlacedObjects.length === 0) {
        previewMesh.visible = true
      }
    }
    // Reset Command/Control key state
    if (e.key === "Meta" || e.key === "Control") {
      e.preventDefault()
      isCommandKeyHeld = false
      isRotatingCamera = false
      controls.enablePan = true
      controls.minPolarAngle = 0
      controls.maxPolarAngle = Math.PI / 2 - 0.1
      if (renderer?.domElement) {
        renderer.domElement.style.cursor = "default"
      }
      // Show preview mesh again when done rotating
      if (previewMesh && selectedPlacedObjects.length === 0) {
        previewMesh.visible = true
      }
    }
    // Reset Shift key state
    if (e.key === "Shift") {
      isShiftKeyHeld = false
      // Show preview mesh again if we have one and aren't doing something else
      if (
        previewMesh &&
        selectedPlacedObjects.length === 0 &&
        !isPanning &&
        !isRotatingCamera
      ) {
        previewMesh.visible = true
      }
      controls.enablePan = true
    }
  }}
/>

<div class="flex flex-col md:flex-row h-screen overflow-hidden">
  <!-- Sidebar with Tabs -->
  <div
    class="w-full md:w-96 h-64 md:h-screen bg-base-200 overflow-hidden flex flex-col order-last md:order-first relative z-50"
  >
    <!-- Tab Headers -->
    <div class="tabs tabs-boxed m-2 relative">
      <button
        type="button"
        class="tab {activeTab === 'models' ? 'tab-active' : ''}"
        onclick={(e) => {
          e.preventDefault()
          requestAnimationFrame(() => {
            activeTab = "models"
          })
        }}
      >
        🎨 Models
      </button>
      <button
        type="button"
        class="tab {activeTab === 'maps' ? 'tab-active' : ''}"
        onclick={(e) => {
          e.preventDefault()
          requestAnimationFrame(() => {
            activeTab = "maps"
          })
        }}
      >
        🗺️ Maps
      </button>
      <button
        type="button"
        class="tab {activeTab === 'options' ? 'tab-active' : ''}"
        onclick={(e) => {
          e.preventDefault()
          requestAnimationFrame(() => {
            activeTab = "options"
          })
        }}
      >
        ⚙️ Options
      </button>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-y-auto p-4 pt-0" style="pointer-events: auto;">
      {#if activeTab === "models"}
        <!-- Models Tab -->
        <h2 class="text-2xl font-bold mb-4 text-primary">Object Palette</h2>

        <!-- Recent Models -->
        {#if recentModels.length > 0}
          <div class="mb-4">
            <h3 class="text-xs font-bold text-base-content/60 uppercase mb-2">
              Recent
            </h3>
            <div class="grid grid-cols-6 gap-1">
              {#each recentModels as model}
                <button
                  class="btn btn-ghost btn-xs p-0 h-auto aspect-square {selectedModel?.path ===
                  model.path
                    ? 'thumb-highlight'
                    : ''}"
                  onclick={() => selectModel(model)}
                  title={model.name}
                >
                  {#if thumbnails.has(model.path) && thumbnails.get(model.path)}
                    <img
                      src={thumbnails.get(model.path)}
                      alt={model.name}
                      class="w-full h-full object-cover rounded"
                    />
                  {:else}
                    <div
                      class="w-full h-full bg-base-300 rounded flex items-center justify-center text-xs"
                    >
                      {model.name.substring(0, 2)}
                    </div>
                  {/if}
                </button>
              {/each}
            </div>
            <div class="divider my-2"></div>
          </div>
        {/if}

        <!-- Search Bar -->
        <div class="form-control mb-2">
          <input
            type="text"
            placeholder="Search models..."
            class="input input-sm input-bordered w-full"
            bind:value={searchQuery}
          />
        </div>

        <!-- Category Dropdown -->
        <div class="form-control mb-4">
          <select
            class="select select-sm select-bordered w-full"
            bind:value={selectedCategory}
          >
            {#each categories as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
        </div>

        <!-- Model Count -->
        <div
          class="text-xs text-base-content/60 mb-3 flex justify-between items-center"
        >
          <span>{getFilteredModels().length} models</span>
          {#if thumbnailsLoading}
            <span class="loading loading-spinner loading-xs"></span>
          {/if}
        </div>

        <!-- Model Grid -->
        <div class="grid grid-cols-3 gap-2">
          {#each getFilteredModels() as model}
            <button
              class="btn btn-ghost p-0.5 h-auto flex-col gap-1 border-2 border-transparent hover:border-primary {selectedModel?.path ===
              model.path
                ? 'ring-2 ring-primary !border-primary'
                : ''}"
              onclick={() => selectModel(model)}
              title={model.name}
            >
              <div
                class="w-full aspect-square bg-base-300 rounded-md overflow-hidden flex items-center justify-center p-0.5"
              >
                {#if thumbnails.has(model.path) && thumbnails.get(model.path)}
                  <img
                    src={thumbnails.get(model.path)}
                    alt={model.name}
                    class="w-full h-full object-cover brightness-125"
                  />
                {:else if !thumbnailsLoading}
                  <span class="text-4xl opacity-100">
                    {model.category === "Animals"
                      ? "🐾"
                      : model.category === "Enemies"
                        ? "👾"
                        : model.category === "Nature"
                          ? "🌳"
                          : model.category === "Buildings"
                            ? "🏠"
                            : model.category === "Vehicles"
                              ? "🚗"
                              : model.category === "Props"
                                ? "📦"
                                : "⬜"}
                  </span>
                {:else}
                  <span class="loading loading-spinner loading-sm"></span>
                {/if}
              </div>
              <span class="text-xs truncate w-full">{model.name}</span>
            </button>
          {/each}
        </div>
      {:else if activeTab === "maps"}
        <!-- Maps Tab -->
        <h2 class="text-2xl font-bold mb-4 text-primary">Map Manager</h2>

        <!-- Auto Generate Section - Moved to Top -->
        <div class="card-standard p-3 mb-4">
          <h4 class="font-semibold mb-2">Auto Generate Settings</h4>

          <!-- Preset Radio Buttons -->
          <div class="mb-3">
            <label class="label label-text text-xs font-semibold"
              >Quick Presets:</label
            >
            <div class="flex flex-wrap gap-2 justify-start text-xs">
              <label class="cursor-pointer flex items-center gap-1">
                <input
                  type="radio"
                  name="preset"
                  class="radio radio-xs radio-custom"
                  value="town"
                  bind:group={quickStartPreset}
                  onchange={() => {
                    autoGenTrees = 15
                    autoGenBuildings = 8
                    autoGenVehicles = 3
                    autoGenAnimals = 5
                    autoGenRocks = 5
                    autoGenCity = 0
                    autoGenSpace = 0
                    autoGenPlanets = 0
                  }}
                />
                <span>Town</span>
              </label>
              <label class="cursor-pointer flex items-center gap-1">
                <input
                  type="radio"
                  name="preset"
                  class="radio radio-xs radio-custom"
                  value="city"
                  bind:group={quickStartPreset}
                  onchange={() => {
                    autoGenTrees = 5
                    autoGenBuildings = 15
                    autoGenVehicles = 8
                    autoGenAnimals = 2
                    autoGenRocks = 0
                    autoGenCity = 10
                    autoGenSpace = 0
                    autoGenPlanets = 0
                  }}
                />
                <span>City</span>
              </label>
              <label class="cursor-pointer flex items-center gap-1">
                <input
                  type="radio"
                  name="preset"
                  class="radio radio-xs radio-custom"
                  value="nature"
                  bind:group={quickStartPreset}
                  onchange={() => {
                    autoGenTrees = 30
                    autoGenBuildings = 2
                    autoGenVehicles = 1
                    autoGenAnimals = 15
                    autoGenRocks = 10
                    autoGenCity = 0
                    autoGenSpace = 0
                    autoGenPlanets = 0
                  }}
                />
                <span>Nature</span>
              </label>
              <label class="cursor-pointer flex items-center gap-1">
                <input
                  type="radio"
                  name="preset"
                  class="radio radio-xs radio-custom"
                  value="space"
                  bind:group={quickStartPreset}
                  onchange={() => {
                    autoGenTrees = 0
                    autoGenBuildings = 0
                    autoGenVehicles = 0
                    autoGenAnimals = 0
                    autoGenRocks = 0
                    autoGenCity = 0
                    autoGenSpace = 20
                    autoGenPlanets = 8
                    distributeVertically = true
                    timeOfDay = "night"
                    updateEnvironment()
                  }}
                />
                <span>Space</span>
              </label>
              <label class="cursor-pointer flex items-center gap-1">
                <input
                  type="radio"
                  name="preset"
                  class="radio radio-xs radio-custom"
                  value="random"
                  bind:group={quickStartPreset}
                  onchange={() => {
                    autoGenTrees = Math.floor(Math.random() * 30)
                    autoGenBuildings = Math.floor(Math.random() * 15)
                    autoGenVehicles = Math.floor(Math.random() * 10)
                    autoGenAnimals = Math.floor(Math.random() * 15)
                    autoGenRocks = Math.floor(Math.random() * 15)
                    autoGenCity = Math.floor(Math.random() * 10)
                    autoGenSpace = Math.floor(Math.random() * 15)
                    autoGenPlanets = Math.floor(Math.random() * 5)
                  }}
                />
                <span>Random</span>
              </label>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label class="label label-text text-xs">Trees & Plants</label>
              <input
                type="number"
                bind:value={autoGenTrees}
                min="0"
                max="50"
                class="input input-xs input-bordered w-full input-white"
              />
            </div>
            <div>
              <label class="label label-text text-xs">Buildings</label>
              <input
                type="number"
                bind:value={autoGenBuildings}
                min="0"
                max="20"
                class="input input-xs input-bordered w-full input-white"
              />
            </div>
            <div>
              <label class="label label-text text-xs">Vehicles</label>
              <input
                type="number"
                bind:value={autoGenVehicles}
                min="0"
                max="20"
                class="input input-xs input-bordered w-full input-white"
              />
            </div>
            <div>
              <label class="label label-text text-xs">Animals</label>
              <input
                type="number"
                bind:value={autoGenAnimals}
                min="0"
                max="20"
                class="input input-xs input-bordered w-full input-white"
              />
            </div>
            <div>
              <label class="label label-text text-xs">Rocks</label>
              <input
                type="number"
                bind:value={autoGenRocks}
                min="0"
                max="30"
                class="input input-xs input-bordered w-full input-white"
              />
            </div>
            <div>
              <label class="label label-text text-xs">City Scape</label>
              <input
                type="number"
                bind:value={autoGenCity}
                min="0"
                max="20"
                class="input input-xs input-bordered w-full input-white"
              />
            </div>
            <div>
              <label class="label label-text text-xs">Space</label>
              <input
                type="number"
                bind:value={autoGenSpace}
                min="0"
                max="20"
                class="input input-xs input-bordered w-full input-white"
              />
            </div>
            <div>
              <label class="label label-text text-xs">Planets</label>
              <input
                type="number"
                bind:value={autoGenPlanets}
                min="0"
                max="10"
                class="input input-xs input-bordered w-full input-white"
              />
            </div>
          </div>
          <div class="flex gap-2 mb-3">
            <button
              class="btn btn-xs btn-red-white flex-1"
              onclick={() => {
                autoGenTrees = 0
                autoGenBuildings = 0
                autoGenVehicles = 0
                autoGenAnimals = 0
                autoGenRocks = 0
                autoGenCity = 0
                autoGenSpace = 0
                autoGenPlanets = 0
              }}
            >
              🗑️ Clear All
            </button>
          </div>
          <div class="form-control mb-3">
            <label class="label cursor-pointer justify-start gap-2">
              <span class="label-text text-xs font-semibold"
                >Distribute Vertically:</span
              >
              <input
                type="radio"
                name="distribute"
                class="radio radio-xs"
                value={false}
                bind:group={distributeVertically}
              />
              <span class="label-text text-xs">Off</span>
              <input
                type="radio"
                name="distribute"
                class="radio radio-xs"
                value={true}
                bind:group={distributeVertically}
              />
              <span class="label-text text-xs">On</span>
            </label>
          </div>

          <!-- Time of Day Selection -->
          <div class="form-control mb-3">
            <label class="label label-text text-xs font-semibold"
              >Time of Day:</label
            >
            <select
              class="select select-xs select-bordered w-full select-white"
              bind:value={timeOfDay}
              onchange={updateEnvironment}
            >
              <option value="dawn">🌅 Dawn</option>
              <option value="day">☀️ Day</option>
              <option value="sunset">🌇 Sunset</option>
              <option value="night">🌙 Night</option>
            </select>
          </div>

          <!-- Weather Selection -->
          <div class="form-control mb-3">
            <label class="label label-text text-xs font-semibold"
              >Weather:</label
            >
            <select
              class="select select-xs select-bordered w-full select-white"
              bind:value={weather}
            >
              <option value="clear">☀️ Clear</option>
              <option value="fog">🌫️ Fog</option>
              <option value="rain">🌧️ Rain</option>
              <option value="snow">❄️ Snow</option>
            </select>
          </div>

          <button
            class="btn btn-sm btn-primary w-full"
            onclick={() => {
              hideInstructions = true
              autoGenerateMap(false)
            }}
          >
            🎲 Auto Generate Map
          </button>
          <p class="text-xs text-gray-500 mt-1 text-center">
            Automatically place objects for fun gameplay
          </p>
        </div>

        <!-- Divider -->
        <div class="divider my-4"></div>

        <!-- Current Map Info -->
        <div class="card-standard p-3 mb-4">
          <div class="text-sm font-semibold mb-1">Current Map:</div>
          <input
            type="text"
            class="input input-sm input-bordered w-full mb-2"
            bind:value={currentMapName}
            placeholder="Map name..."
          />

          <div class="text-sm font-semibold mb-1">Game Visibility:</div>
          <div class="flex flex-col gap-1 mb-2">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="game-select"
                class="radio radio-xs"
                value="all"
                bind:group={selectedGame}
              />
              <span class="text-xs">All Games</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="game-select"
                class="radio radio-xs"
                value="blocky shooter"
                bind:group={selectedGame}
              />
              <span class="text-xs">Ground Games</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="game-select"
                class="radio radio-xs"
                value="starship flyer"
                bind:group={selectedGame}
              />
              <span class="text-xs">Flight Games</span>
            </label>
          </div>
          {#if currentMapId}
            <!-- Editing existing map -->
            <div class="flex gap-2 mb-2">
              <button
                class="btn btn-sm btn-primary flex-1"
                onclick={() => saveCurrentMap(currentMapName)}
                title="Overwrite the existing map"
              >
                💾 Save (Overwrite)
              </button>
            </div>
            <div class="flex gap-2">
              <button
                class="btn btn-sm btn-secondary-custom flex-1"
                onclick={saveAsNewMap}
                title="Save as a new copy"
              >
                📄 Save As New
              </button>
              <button class="btn btn-sm btn-success" onclick={createNewMap}>
                ✨ New
              </button>
            </div>
          {:else}
            <!-- Creating new map -->
            <div class="flex gap-2">
              <button
                class="btn btn-sm btn-primary flex-1"
                onclick={() => saveCurrentMap(currentMapName)}
              >
                💾 Save Map
              </button>
              <button class="btn btn-sm btn-success" onclick={createNewMap}>
                ✨ New
              </button>
            </div>
          {/if}
        </div>

        <!-- Import/Export -->
        <div class="flex gap-2 mb-4">
          <button
            class="btn btn-sm btn-secondary-custom flex-1"
            onclick={importMap}
          >
            📥 Import
          </button>
        </div>

        <!-- Divider -->
        <div class="divider my-4"></div>

        <!-- Saved Maps List -->
        <h3 class="text-lg font-bold mb-2">
          Saved Maps ({savedMaps.filter((map) => {
            if (mapFilter === "all_levels") return true
            if (mapFilter === "all")
              return map.games && map.games.toLowerCase().includes("all")
            if (!map.games) return false
            const games = map.games
              .toLowerCase()
              .split(",")
              .map((g) => g.trim())
            return games.includes("all") || games.includes(mapFilter)
          }).length})
        </h3>

        <!-- Map Filter Tabs -->
        <div class="tabs tabs-boxed tabs-xs mb-4 bg-base-200">
          <button
            class="tab {mapFilter === 'all_levels' ? 'tab-active' : ''}"
            onclick={() => (mapFilter = "all_levels")}>All Levels</button
          >
          <button
            class="tab {mapFilter === 'all' ? 'tab-active' : ''}"
            onclick={() => (mapFilter = "all")}>All Games</button
          >
          <button
            class="tab {mapFilter === 'blocky shooter' ? 'tab-active' : ''}"
            onclick={() => (mapFilter = "blocky shooter")}>Ground Games</button
          >
          <button
            class="tab {mapFilter === 'starship flyer' ? 'tab-active' : ''}"
            onclick={() => (mapFilter = "starship flyer")}>Flight Games</button
          >
        </div>

        {#if savedMaps.length === 0}
          <div class="text-sm text-gray-500 text-center py-8">
            No saved maps yet.<br />Create and save your first map!
          </div>
        {:else}
          <div class="space-y-2">
            {#each [...savedMaps]
              .filter((map) => {
                if (mapFilter === "all_levels") return true
                if (mapFilter === "all") return map.games && map.games
                      .toLowerCase()
                      .includes("all")
                // Strict filtering: if map has no games property, only show in All Levels
                if (!map.games) return false
                const games = map.games
                  .toLowerCase()
                  .split(",")
                  .map((g) => g.trim())
                return games.includes("all") || games.includes(mapFilter)
              })
              .sort((a, b) => b.modified - a.modified) as map}
              <div class="card-standard">
                <div class="card-body p-3">
                  {#if map.thumbnail}
                    <img
                      src={map.thumbnail}
                      alt={map.name}
                      class="w-full h-24 object-cover rounded mb-2"
                    />
                  {/if}
                  <div class="font-semibold text-sm">{map.name}</div>
                  <div class="text-xs text-gray-500">
                    {map.stats.objectCount} objects • {map.stats.polygonCount.toLocaleString()}
                    polys
                    <br />
                    {map.environment.timeOfDay} • {map.environment.weather}
                  </div>
                  <div class="flex gap-1 mt-2">
                    <button
                      class="btn btn-xs btn-primary flex-1"
                      onclick={() => loadMap(map.id)}
                    >
                      Load
                    </button>
                    <button
                      class="btn btn-xs btn-outline"
                      onclick={() => exportMap(map.id)}
                      title="Export to file"
                    >
                      📤
                    </button>
                    <button
                      class="btn btn-xs btn-error"
                      onclick={() => deleteMap(map.id)}
                      title="Delete map"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      {:else if activeTab === "options"}
        <!-- Options Tab -->
        <h2 class="text-2xl font-bold mb-4">Controls</h2>
        <div class="card-standard p-4 mb-6 text-xs space-y-2">
          <p><strong>Select:</strong> Click object</p>
          <p><strong>Move:</strong> Drag object</p>
          <p>
            <strong>Vertical Move:</strong> Hold
            <kbd class="kbd-custom">Shift</kbd> + Drag
          </p>
          <p><strong>Rotate:</strong> Arrow keys</p>
          <p><strong>Scale:</strong> +/- keys</p>
          <p><strong>Delete:</strong> Delete/Backspace</p>
          <div class="divider my-2"></div>
          <p><strong>Camera Rotate:</strong> Drag background</p>
          <p>
            <strong>Camera Pan:</strong> Hold
            <kbd class="kbd-custom">Space</kbd> + Drag
          </p>
        </div>

        <h2 class="text-2xl font-bold mb-4">Environment</h2>

        <!-- Time of Day -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-semibold">Time of Day</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              class="btn btn-sm {timeOfDay === 'dawn'
                ? 'btn-primary'
                : 'btn-outline'}"
              onclick={() => (timeOfDay = "dawn")}
            >
              🌅 Dawn
            </button>
            <button
              class="btn btn-sm {timeOfDay === 'day'
                ? 'btn-primary'
                : 'btn-outline'}"
              onclick={() => (timeOfDay = "day")}
            >
              ☀️ Day
            </button>
            <button
              class="btn btn-sm {timeOfDay === 'sunset'
                ? 'btn-primary'
                : 'btn-outline'}"
              onclick={() => (timeOfDay = "sunset")}
            >
              🌇 Sunset
            </button>
            <button
              class="btn btn-sm {timeOfDay === 'night'
                ? 'btn-primary'
                : 'btn-outline'}"
              onclick={() => (timeOfDay = "night")}
            >
              🌙 Night
            </button>
          </div>
        </div>

        <!-- Weather -->
        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text font-semibold">Weather</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              class="btn btn-sm {weather === 'clear'
                ? 'btn-primary'
                : 'btn-outline'}"
              onclick={() => (weather = "clear")}
            >
              ☀️ Clear
            </button>
            <button
              class="btn btn-sm {weather === 'fog'
                ? 'btn-primary'
                : 'btn-outline'}"
              onclick={() => (weather = "fog")}
            >
              🌫️ Fog
            </button>
            <button
              class="btn btn-sm {weather === 'rain'
                ? 'btn-primary'
                : 'btn-outline'}"
              onclick={() => (weather = "rain")}
            >
              🌧️ Rain
            </button>
            <button
              class="btn btn-sm {weather === 'snow'
                ? 'btn-primary'
                : 'btn-outline'}"
              onclick={() => (weather = "snow")}
            >
              ❄️ Snow
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="divider"></div>
        <h3 class="text-lg font-bold mb-2 settings-title">Scene Stats</h3>
        <div class="card-standard p-3">
          <div class="mb-2">
            <div class="text-xs text-gray-500">Objects</div>
            <div class="text-2xl font-bold">{placedObjects.length}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Polygons</div>
            <div
              class="text-2xl font-bold {polygonCount > MAX_POLYGON_WARNING
                ? 'text-error'
                : ''}"
            >
              {(polygonCount / 1000).toFixed(1)}k
            </div>
            {#if polygonCount > MAX_POLYGON_WARNING}
              <div class="text-xs text-error">
                High poly count may affect performance
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- 3D Viewport -->
  <div class="flex-1 relative min-w-0">
    <div bind:this={container} class="w-full h-full bg-black relative">
      <!-- Selection Box -->
      {#if isBoxSelecting}
        <div
          class="absolute border-2 border-green-500 bg-green-500/20 pointer-events-none z-50"
          style="
            left: {Math.min(boxSelectionStart.x, boxSelectionEnd.x)}px;
            top: {Math.min(boxSelectionStart.y, boxSelectionEnd.y)}px;
            width: {Math.abs(boxSelectionEnd.x - boxSelectionStart.x)}px;
            height: {Math.abs(boxSelectionEnd.y - boxSelectionStart.y)}px;
          "
        ></div>
      {/if}
      <!-- Instructions overlay -->
      {#if placedObjects.length === 0 && !hideInstructions}
        <div
          class="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        >
          <div class="flex flex-col gap-4 items-center">
            <!-- Auto Generate Quick Start -->
            <div
              class="bg-base-200 p-4 rounded-lg text-base-content max-w-md pointer-events-auto shadow-lg border border-base-300"
            >
              <h4 class="font-bold mb-2 text-center text-primary">
                🚀 Quick Start
              </h4>
              <div class="flex flex-col gap-3 items-center justify-center">
                <button
                  class="btn btn-sm btn-accent w-full"
                  onclick={() => {
                    hideInstructions = true
                    activeTab = "maps"
                  }}
                  style="background-color: #660460; color: white; border: none;"
                >
                  Auto Generate 🎲
                </button>
                <button
                  class="btn btn-xs btn-link text-primary no-underline hover:underline mt-2"
                  onclick={() => {
                    // Hide the overlay and switch to models tab
                    hideInstructions = true
                    activeTab = "models"
                  }}
                >
                  ...Or Build From Scratch!
                </button>
              </div>
            </div>

            <div
              class="bg-base-200 p-8 rounded-lg text-base-content text-center max-w-md shadow-lg border border-base-300"
            >
              <h3 class="text-2xl font-bold mb-4 text-primary">
                🏗️ Building Instructions
              </h3>
              <p class="text-sm text-left">
                <strong>Placing Objects:</strong><br />
                1. Click to place object<br />
                2. Press <kbd class="kbd-custom">Arrow Keys</kbd> to rotate<br
                />
                3. Press <kbd class="kbd-custom">+</kbd>/<kbd class="kbd-custom"
                  >-</kbd
                >
                to scale<br />
                4. Click to confirm placement<br /><br />

                <strong>Editing Objects:</strong><br />
                5. Click to select an object<br />
                6. Use <kbd class="kbd-custom">Arrow Keys</kbd> to rotate
                selection<br />
                7. Use <kbd class="kbd-custom">+</kbd>/<kbd class="kbd-custom"
                  >-</kbd
                >
                to resize<br />
                8. Hold <kbd class="kbd-custom">Shift</kbd> + drag to move
                vertically<br />
                9. Press <kbd class="kbd-custom">Delete</kbd> to remove<br /><br
                />

                <strong>Camera Controls:</strong><br />
                10. Hold <kbd class="kbd-custom">Space</kbd> + drag to pan<br />
                11. Scroll to zoom in/out
              </p>
            </div>
          </div>
        </div>
      {/if}
    </div>

    <!-- Toolbar - centered bottom relative to viewport -->
    <div
      class="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
    >
      <!-- Selected Object Info -->
      {#if selectedPlacedObjects.length > 0}
        <div class="badge badge-lg badge-success shadow-lg mb-2">
          {#if selectedPlacedObjects.length === 1}
            {selectedPlacedObjects[0].modelPath
              .split("/")
              .pop()
              ?.replace(".glb", "")}
          {:else}
            {selectedPlacedObjects.length} items selected
          {/if}
        </div>
      {/if}

      <div
        class="bg-base-100/90 backdrop-blur-sm p-4 rounded-lg shadow-lg flex flex-nowrap gap-2 items-center whitespace-nowrap border border-base-300"
      >
        <button
          class="btn btn-sm btn-ghost"
          onclick={() => (activeTab = "maps")}
          title="Save Map"
        >
          💾
        </button>
        <div class="divider divider-horizontal m-0"></div>
        <button
          class="btn btn-sm btn-warning text-lg font-bold"
          onclick={undo}
          disabled={historyIndex <= 0}
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          class="btn btn-sm btn-warning text-lg font-bold"
          onclick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>
        <div class="divider divider-horizontal m-0"></div>
        <button class="btn btn-sm btn-secondary" onclick={clearScene}
          >🗑️ Clear</button
        >
        <button
          class="btn btn-sm {showGrid ? 'btn-success' : 'btn-ghost'}"
          onclick={toggleGrid}
        >
          📐 Plane: {showGrid ? "ON" : "OFF"}
        </button>
        <button
          class="btn btn-sm {isFirstPersonMode ? 'btn-error' : 'btn-accent'}"
          onclick={isFirstPersonMode ? exitFirstPersonMode : enterPOVMode}
          title={isFirstPersonMode
            ? "Exit POV mode and return to build mode (ESC)"
            : "Enter first-person POV mode - drop from the sky and explore your world!"}
          style={!isFirstPersonMode
            ? "background-color: #660460; color: white; border: none;"
            : ""}
        >
          {isFirstPersonMode ? "🚪 Build Mode" : "👁️ POV Mode"}
        </button>
        <div class="divider divider-horizontal m-0"></div>
        <div class="divider divider-horizontal m-0"></div>
        <div class="badge badge-info">{placedObjects.length} objects</div>
        <div class="badge badge-primary">
          {polygonCount.toLocaleString()} polys
        </div>
        {#if polygonCount > MAX_POLYGON_WARNING}
          <div class="badge badge-error">⚠️ High Poly Count!</div>
        {/if}
        {#if isFirstPersonMode}
          <div class="badge badge-error">
            POV Mode - WASD to move, Mouse to look, Space to jump, ESC to exit
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- POV Mode Pause Overlay -->
  {#if isPOVPaused}
    <div
      class="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div
        class="bg-white p-8 rounded-lg shadow-xl flex flex-col gap-4 max-w-md"
      >
        <h2 class="text-3xl font-bold text-center" style="color: #660460;">
          POV Mode Paused
        </h2>
        <div class="flex flex-col gap-3">
          <button class="btn btn-primary btn-lg" onclick={continuePOVMode}>
            Continue
          </button>
          <button class="btn btn-error btn-lg" onclick={exitFirstPersonMode}>
            Exit POV Mode
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Ensure canvas stays within its container */
  canvas {
    display: block;
    max-width: 100%;
    max-height: 100%;
  }
</style>
