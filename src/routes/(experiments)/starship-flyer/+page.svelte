<script lang="ts">
  import { onMount, onDestroy } from "svelte"
  import * as THREE from "three"
  import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
  import { hideSidebar } from "$lib/stores/gameState"
  import { createRain, createSnow, animateWeather as animateWeatherShared } from '$lib/weatherSystem'

  // Hide sidebar when actively playing, show on menu screens
  $: hideSidebar.set(hasStartedGame && !showMapSelector)

  onDestroy(() => {
    hideSidebar.set(false)
    // Reset body styles when leaving page
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
      document.body.style.margin = ''
    }
  })

  let container: HTMLDivElement
  let scene: THREE.Scene
  let camera: THREE.PerspectiveCamera
  let renderer: THREE.WebGLRenderer
  let animationId: number
  let clock: THREE.Clock

  // World Builder Map Integration
  interface MapData {
    id: string
    name: string
    games?: string
    description: string
    created: number
    modified: number
    thumbnail: string
    environment: {
      timeOfDay: 'dawn' | 'day' | 'sunset' | 'night'
      weather: 'clear' | 'rain' | 'snow' | 'fog'
      fogDensity: number
    }
    objects: Array<{
      modelPath: string
      position: { x: number, y: number, z: number }
      rotation: { x: number, y: number, z: number }
      scale: { x: number, y: number, z: number }
    }>
    stats: {
      objectCount: number
      polygonCount: number
    }
  }

  // Maps fetched from API
  let staticMapFiles: string[] = []


  let availableMaps: MapData[] = []
  let customMaps: MapData[] = []  // User-created maps from localStorage
  let builtInMaps: MapData[] = []  // Static maps from /3d-maps/
  let selectedMap: MapData | null = null
  let shuffledMapQueue: MapData[] = []  // Randomized queue of maps for current game
  let currentMapIndex = 0  // Current position in the shuffled queue
  let mapsLoading = true  // Track map loading state
  let showMapSelector = true
  let isLoadingMap = false
  let defaultMapThumbnail: string | null = null

  // Spaceship Selection
  interface SpaceshipOption {
    id: string
    name: string
    path: string
  }

  const spaceshipOptions: SpaceshipOption[] = [
    { id: 'default', name: 'Scout Fighter', path: '/3d-models/Ultimate Space Kit-glb/Spaceship.glb' },
    { id: 'variant1', name: 'Heavy Cruiser', path: '/3d-models/Ultimate Space Kit-glb/Spaceship-Jqfed124pQ.glb' },
    { id: 'variant2', name: 'Stealth Bomber', path: '/3d-models/Ultimate Space Kit-glb/Spaceship-VSxUAFhzbA.glb' },
    { id: 'variant3', name: 'Battle Carrier', path: '/3d-models/Ultimate Space Kit-glb/Spaceship-u105mYHLHU.glb' },
  ]
  let selectedSpaceship: SpaceshipOption = spaceshipOptions[0]

  // Model Catalog for auto-generation (same as FPS game)
  interface ModelCatalogItem {
    name: string
    path: string
    category: string
  }
  let modelCatalog: ModelCatalogItem[] = []

  // Game Configuration
  type AutoMoveSpeed = 'off' | 'slow' | 'medium' | 'hyper'
  type MouseInputType = 'auto' | 'trackpad' | 'external'
  type PowerUpFrequency = 'sparse' | 'normal' | 'carnage'
  interface GameConfig {
    difficulty: 'easy' | 'normal' | 'hard'
    startingHealth: number
    enemyCount: number
    enemyDamage: number
    playerDamage: number
    enemySpeed: number
    enemyFireRate: number
    mouseSensitivity: number
    autoMoveSpeed: AutoMoveSpeed
    mouseInput: 'auto' | 'external' | 'trackpad'
    powerUpFrequency: PowerUpFrequency
    initialPowerUps: number
    enemyLevelMultiplier: number
  }

  const autoMoveSpeeds: Record<AutoMoveSpeed, number> = {
    off: 0,
    slow: 8,
    medium: 15,
    hyper: 30
  }

  // Power-up drop rates: how many kills before guaranteed drop
  const powerUpDropRates: Record<PowerUpFrequency, number> = {
    sparse: 3,    // Every 3 kills
    normal: 2,    // Every 2 kills
    carnage: 1    // Every 1 kill
  }
  let killsSinceLastDrop = 0

  // Trackpad detection state
  let detectedInputType: 'unknown' | 'trackpad' | 'external' = 'unknown'
  let movementSamples: { delta: number; time: number }[] = []
  let lastMovementTime = 0

  // Continuous motion for trackpad - view keeps moving while finger is on pad
  let continuousMotion = { x: 0, y: 0 }
  let isFingerOnTrackpad = false  // Detect if finger is still touching
  const trackpadLiftThreshold = 80  // ms - if no movement for this long, finger lifted

  function getEffectiveInputType(): 'trackpad' | 'external' {
    if (gameConfig.mouseInput === 'auto') {
      return detectedInputType === 'unknown' ? 'external' : detectedInputType
    }
    return gameConfig.mouseInput
  }

  let gameConfig: GameConfig = {
    difficulty: 'normal',
    startingHealth: 100,
    enemyCount: 5,
    enemyDamage: 10,
    playerDamage: 25,
    enemySpeed: 8.0,
    enemyFireRate: 2000,
    mouseSensitivity: 1.0,  // Default to 1.0 (comfortable), range 0.5-2.0
    autoMoveSpeed: 'medium',  // Default to medium auto-move
    mouseInput: 'auto',  // Auto-detect trackpad vs external mouse
    powerUpFrequency: 'normal',  // Default to normal drops
    initialPowerUps: 4, // Default number of weapon drops at start/level up
    enemyLevelMultiplier: 1 // How many extra enemies per level
  }
  
  let initialGameConfigState: GameConfig | null = null

  let soundEnabled = true

  // Sound Manager
  class SoundManager {
    ctx: AudioContext | null = null
    enabled = true
    masterGain: GainNode | null = null

    constructor() {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        this.ctx = new AudioContext()
        this.masterGain = this.ctx.createGain()
        this.masterGain.connect(this.ctx.destination)
        this.masterGain.gain.value = 0.3 // Default volume
      } catch (e) {
        console.error('Web Audio API not supported')
      }
    }

    toggle(enabled: boolean) {
      this.enabled = enabled
      if (this.ctx && this.ctx.state === 'suspended' && enabled) {
        this.ctx.resume()
      }
    }

    playTone(freq: number, type: OscillatorType, duration: number, vol = 1, slideFreq?: number) {
      if (!this.enabled || !this.ctx || !this.masterGain) return
      
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      
      osc.type = type
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime)
      if (slideFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration)
      }
      
      gain.gain.setValueAtTime(vol, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration)
      
      osc.connect(gain)
      gain.connect(this.masterGain)
      
      osc.start()
      osc.stop(this.ctx.currentTime + duration)
    }

    playNoise(duration: number, vol = 1) {
      if (!this.enabled || !this.ctx || !this.masterGain) return
      
      const bufferSize = this.ctx.sampleRate * duration
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer
      
      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(vol, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration)
      
      noise.connect(gain)
      gain.connect(this.masterGain)
      
      noise.start()
    }

    // Game Sounds
    playLaser() { this.playTone(880, 'square', 0.1, 0.5, 220) }
    playMissile() { this.playNoise(0.5, 0.5); this.playTone(200, 'sawtooth', 0.5, 0.3, 50) }
    // Plasma: Lower, more powerful shooting sound
    playPlasma() { 
      this.playTone(150, 'sawtooth', 0.3, 0.7, 50)
      this.playNoise(0.2, 0.4)
    }
    // Chain: Static crackle - like electricity arcing
    playChain() { 
      // Create crackling static effect with filtered noise bursts
      if (!this.enabled || !this.ctx || !this.masterGain) return
      const duration = 0.3
      const bufferSize = this.ctx.sampleRate * duration
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      
      // Generate crackling noise pattern
      for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.sin((i / bufferSize) * Math.PI) // Fade in/out
        data[i] = (Math.random() * 2 - 1) * envelope
      }
      
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer
      
      // High-pass filter for crispy crackle
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'highpass'
      filter.frequency.setValueAtTime(2000, this.ctx.currentTime)
      filter.Q.setValueAtTime(5, this.ctx.currentTime) // Sharp filter for electric sound
      
      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.6, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration)
      
      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.masterGain)
      noise.start()
      
      // Add a quick high-frequency zap for extra crackle
      setTimeout(() => this.playTone(3000, 'square', 0.08, 0.15, 1500), 30)
    }
    // Drone: 3 super quick mini buzzes
    playDrone() { 
      for(let i=0; i<3; i++) {
        setTimeout(() => this.playTone(600, 'sawtooth', 0.05, 0.3, 400), i * 80)
      }
    }
    playScatter() { for(let i=0; i<3; i++) setTimeout(() => this.playTone(400 + Math.random()*200, 'square', 0.1, 0.3, 100), i*20) }
    
    playExplosion(size = 1) { 
      this.playNoise(0.3 * size, 0.8)
      this.playTone(100, 'sawtooth', 0.4 * size, 0.6, 10)
    }
    
    playPowerUp() { 
      this.playTone(440, 'sine', 0.1, 0.5)
      setTimeout(() => this.playTone(880, 'sine', 0.2, 0.5), 100)
    }
    
    playBoost() { 
      // Boost: Powerful "WOOOSH" with more volume and intensity
      // Filtered noise ramp up
      if (!this.enabled || !this.ctx || !this.masterGain) return
      const duration = 2.0 // Longer duration for more impact
      const bufferSize = this.ctx.sampleRate * duration
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
      
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(150, this.ctx.currentTime) // Lower start for more bass
      filter.frequency.exponentialRampToValueAtTime(4000, this.ctx.currentTime + duration) // Higher end for more power
      
      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(2.0, this.ctx.currentTime) // Even louder for better audibility
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration)
      
      noise.connect(filter)
      filter.connect(gain)
      gain.connect(this.masterGain)
      noise.start()
    }
    
    playHit() {
      this.playTone(150, 'sawtooth', 0.2, 0.8, 50)
      this.playNoise(0.1, 0.5)
    }
  }

  let soundManager: SoundManager


  const difficultyPresets: Record<GameConfig['difficulty'], Partial<GameConfig>> = {
    easy: { startingHealth: 150, enemyCount: 3, enemyDamage: 5, playerDamage: 35, enemySpeed: 6.0, enemyFireRate: 3000 },
    normal: { startingHealth: 100, enemyCount: 5, enemyDamage: 10, playerDamage: 25, enemySpeed: 8.0, enemyFireRate: 2000 },
    hard: { startingHealth: 75, enemyCount: 8, enemyDamage: 15, playerDamage: 20, enemySpeed: 12.0, enemyFireRate: 1500 }
  }

  function applyDifficultyPreset(difficulty: GameConfig['difficulty']) {
    gameConfig = { ...gameConfig, ...difficultyPresets[difficulty], difficulty }
  }

  // Game state
  let isPlaying = false
  let isGameOver = false
  let hasStartedGame = false
  let score = 0
  let level = 1
  let health = gameConfig.startingHealth
  let kills = 0
  let nextLevelScore = 1000
  let showLevelComplete = false
  let currentLevelName = ''
  let isLoadingLevel = false
  let isBossLevel = false
  let bossEnemy: Enemy | null = null
  let bossHealth = 0
  let bossMaxHealth = 0

  // Environment State
  let timeOfDay: 'dawn' | 'day' | 'sunset' | 'night' = 'night'
  let weather: 'clear' | 'rain' | 'snow' | 'fog' = 'clear'
  let rainSystem: THREE.Points | null = null
  let snowSystem: THREE.Points | null = null

  // Player ship
  let playerShip: THREE.Group | null = null
  const shipScale = 0.3  // Smaller ships

  let isSpawning = false  // Loading screen state
  
  // Loading state
  let isLoading = true
  let loadingProgress = 0
  let loadingStatus = "Initializing..."

  // Flight controls
  let velocity = new THREE.Vector3()
  let currentSpeed = 0
  const maxSpeed = 30
  const acceleration = 20
  const baseTurnSpeed = 2.0
  const rollSpeed = 3.0
  let barrelRollAngle = 0
  let rollAngularVelocity = 0
  let bankAngle = 0  // For A/D strafing visual bank
  let shipSwayTime = 0 // For ship sway animation
  let smoothedSway = 0  // Dampens quick roll jitter from mouse x movement
  let isFiring = false  // For continuous fire with shift key

  // Quaternion-based rotation tracking (avoids gimbal lock)
  let shipYaw = 0    // Horizontal rotation (left/right)
  let shipPitch = 0  // Vertical rotation (up/down)

  // Input
  let keys: { [key: string]: boolean } = {}
  let mouseMovement = { x: 0, y: 0 }
  let isPointerLocked = false
  let isMouseDown = false  // For continuous fire with mouse button

  // Enemies
  type EnemyType = 'basic' | 'fast' | 'tank' | 'boss'
  interface Enemy {
    mesh: THREE.Group
    health: number
    maxHealth: number
    lastShot: number
    velocity: THREE.Vector3
    type: EnemyType
    speed: number
    fireRate: number
    damage: number
    id: number // For stable noise/randomness
  }
  let nextEnemyId = 0
  let enemies: Enemy[] = []

  // Projectiles
  type WeaponType = 'laser' | 'missile' | 'plasma' | 'chain' | 'drone' | 'scatter'
  interface Projectile {
    mesh: THREE.Mesh | THREE.Group
    velocity: THREE.Vector3
    damage: number
    type: WeaponType
    lifetime: number
    isEnemy?: boolean
    target?: Enemy | null  // For heat-seeking missiles
    chainTargets?: Enemy[]  // For chain lightning - enemies already hit
    isDrone?: boolean  // For drone swarm
  }
  let projectiles: Projectile[] = []

  // Weapons
  interface Weapon { type: WeaponType; ammo: number; name: string }
  let weaponInventory: Weapon[] = [{ type: 'laser', ammo: -1, name: 'Laser Cannon' }]
  let currentWeaponIndex = 0
  let lastShot = 0

  // Power-ups
  type PowerUpType = 'health' | 'ammo' | 'boost' | 'weapon-missile' | 'weapon-plasma' | 'weapon-chain' | 'weapon-drone' | 'weapon-scatter'
  interface PowerUp { mesh: THREE.Group; type: PowerUpType }
  let powerUps: PowerUp[] = []
  const powerUpColors: Record<string, number> = {
    health: 0xff0000,
    ammo: 0x00ff00,
    boost: 0x00ffff,
    'weapon-missile': 0xffff00,
    'weapon-plasma': 0xff00ff,      // Magenta
    'weapon-chain': 0xffffff,       // White lightning
    'weapon-drone': 0x88ff00,       // Lime green
    'weapon-scatter': 0xff8800      // Orange
  }

  // Boost charges (activated by spacebar)
  let boostCharges = 0
  let lastDroppedPowerUps: PowerUpType[] = [] // Track last few power-ups for distribution
  let boostActive = false
  let boostEndTime = 0
  const boostDuration = 2000  // 2 seconds of boost per charge

  let powerUpAlert: { message: string; color: string; timestamp: number } | null = null
  
  // Low health warning
  let lowHealthOpacity = 0
  let lastHealth = 100
  let flashTimer = 0
  let hitFlashTimer = 0 // Timer for red flash when hit
  const powerUpNames: Record<string, { name: string; color: string }> = {
    health: { name: 'HEALTH', color: '#ff4444' },
    ammo: { name: 'AMMO', color: '#44ff44' },
    boost: { name: 'BOOST', color: '#44ffff' },
    'weapon-missile': { name: 'MISSILES', color: '#ffff44' },
    'weapon-plasma': { name: 'PLASMA', color: '#ff44ff' },
    'weapon-chain': { name: 'CHAIN LIGHTNING', color: '#44aaff' },
    'weapon-drone': { name: 'DRONE SWARM', color: '#88ff44' },
    'weapon-scatter': { name: 'SCATTER SHOT', color: '#ff8844' }
  }
  const weaponFlashColors: Record<Weapon['type'], string> = {
    laser: '#44ffff',
    missile: '#ffcc66',
    plasma: '#ff66ff',
    chain: '#66ccff',
    drone: '#a6ff5c',
    scatter: '#ff9944'
  }

  // Particles
  interface Particle { mesh: THREE.Mesh; velocity: THREE.Vector3; lifetime: number; maxLifetime: number; scaleGrowth?: number }
  let particles: Particle[] = []

  let solidObjects: THREE.Object3D[] = []

  function updateAvailableMaps() {
    // Merge custom and built-in maps, avoiding duplicates by ID and Name
    const existingIds = new Set(customMaps.map(m => m.id))
    const existingNames = new Set(customMaps.map(m => m.name))
    
    const uniqueBuiltIn = builtInMaps.filter(m => 
      !existingIds.has(m.id) && !existingNames.has(m.name)
    )
    
    availableMaps = [...customMaps, ...uniqueBuiltIn]
    console.log(`Updated availableMaps: ${availableMaps.length} total (${customMaps.length} custom + ${uniqueBuiltIn.length} built-in)`)
    if (availableMaps.length > 0) {
      console.log('Available maps:', availableMaps.map(m => `"${m.name}" (${m.objects?.length || 0} objects)`).join(', '))
    }
  }

  function loadAvailableMaps() {
    // Use same localStorage key as Blocky Shooter
    const stored = localStorage.getItem('worldBuilder_maps')
    if (stored) {
      try {
        const allCustomMaps: MapData[] = JSON.parse(stored)
        // Filter maps for this game
        customMaps = allCustomMaps.filter(map => {
          // Strict filtering: must have 'games' property and include 'starship flyer' or 'all'
          if (!map.games) return false
          const games = map.games.toLowerCase().split(',').map(g => g.trim())
          return games.includes('all') || games.includes('starship flyer')
        })
      } catch (e) {
        console.error('Failed to load maps:', e)
        customMaps = []
      }
    }
    updateAvailableMaps()
    mapsLoading = false
  }

  async function loadStaticMaps() {
    try {
      const response = await fetch('/api/maps')
      if (response.ok) {
        staticMapFiles = await response.json()
      }
    } catch (e) {
      console.error('Failed to fetch map list:', e)
    }

    const maps: MapData[] = []
    for (const file of staticMapFiles) {
      try {
        const response = await fetch(`/3d-maps/${file}`)
        if (!response.ok) continue
        const data: MapData = await response.json()
        maps.push({
          ...data,
          id: data.id ?? file,
          name: data.name ?? file.replace('.json', '')
        })
      } catch (e) {
        console.error('Failed to load static map:', file, e)
      }
    }
    
    // Deduplicate built-in maps by ID and Name
    const uniqueMaps: MapData[] = []
    const seenIds = new Set<string>()
    const seenNames = new Set<string>()
    
    for (const map of maps) {
      if (!seenIds.has(map.id) && !seenNames.has(map.name)) {
        uniqueMaps.push(map)
        seenIds.add(map.id)
        seenNames.add(map.name)
      }
    }
    
    // Filter maps for this game
    builtInMaps = uniqueMaps.filter(map => {
      // Filter out the default map to avoid duplication
      if (map.id === 'map_1764639382737') return false
      
      // Strict filtering: must have 'games' property and include 'starship flyer' or 'all'
      if (!map.games) return false 
      const games = map.games.toLowerCase().split(',').map(g => g.trim())
      return games.includes('all') || games.includes('starship flyer')
    })
    
    updateAvailableMaps()
    mapsLoading = false
  }

  // Load default map thumbnail for menu display
  async function loadDefaultMapThumbnail() {
    try {
      const response = await fetch('/3d-maps/Default_Space.json')
      const data: MapData = await response.json()
      defaultMapThumbnail = data.thumbnail
    } catch (e) {
      console.error('Failed to load default map thumbnail:', e)
    }
  }

  // Load model catalog for level auto-generation (same as FPS game)
  async function loadModelCatalog() {
    try {
      const response = await fetch('/modelCatalog.json')
      modelCatalog = await response.json()
    } catch (e) {
      console.error('Failed to load model catalog:', e)
    }
  }

  // Ship preview renderers
  let shipPreviews: Map<string, { renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, ship: THREE.Group | null, animId: number }> = new Map()

  function renderShipPreviews() {
    const loader = new GLTFLoader()

    spaceshipOptions.forEach(ship => {
      const canvas = document.querySelector(`.ship-preview-${ship.id}`) as HTMLCanvasElement
      if (!canvas) return

      const previewScene = new THREE.Scene()
      previewScene.background = new THREE.Color(0x1a1a2e)

      // Closer camera for 2x larger ships
      const previewCamera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
      previewCamera.position.set(1.2, 0.8, 1.8)
      previewCamera.lookAt(0, 0, 0)

      const previewRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      previewRenderer.setSize(canvas.clientWidth, canvas.clientHeight)
      previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      // Full brightness lighting
      const ambient = new THREE.AmbientLight(0xffffff, 1.5)
      previewScene.add(ambient)
      const directional = new THREE.DirectionalLight(0xffffff, 2.0)
      directional.position.set(5, 5, 5)
      previewScene.add(directional)
      const fill = new THREE.DirectionalLight(0xffffff, 1.5)
      fill.position.set(-3, 2, -3)
      previewScene.add(fill)
      const backLight = new THREE.DirectionalLight(0xffffff, 1.0)
      backLight.position.set(0, -3, -5)
      previewScene.add(backLight)

      let shipModel: THREE.Group | null = null

      loader.load(ship.path, (gltf) => {
        shipModel = gltf.scene
        // Center and scale the model - sized to fit frame nicely
        const box = new THREE.Box3().setFromObject(shipModel)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        // Battle Carrier (variant3) is larger, so use smaller scale (2/3 of others)
        const baseScale = ship.id === 'variant3' ? 1.33 : 2.0
        const scale = baseScale / maxDim
        shipModel.scale.setScalar(scale)
        shipModel.position.sub(center.multiplyScalar(scale))
        previewScene.add(shipModel)
      }, undefined, (error) => {
        // On error, add a placeholder cube
        const geo = new THREE.BoxGeometry(1, 0.5, 1.5)
        const mat = new THREE.MeshStandardMaterial({ color: 0x44aaff })
        const mesh = new THREE.Mesh(geo, mat)
        previewScene.add(mesh)
      })

      // Animate
      const animatePreview = () => {
        const animId = requestAnimationFrame(animatePreview)
        if (shipModel) shipModel.rotation.y += 0.01
        previewRenderer.render(previewScene, previewCamera)
        shipPreviews.set(ship.id, { renderer: previewRenderer, scene: previewScene, camera: previewCamera, ship: shipModel, animId })
      }
      animatePreview()
    })
  }

  function cleanupShipPreviews() {
    shipPreviews.forEach((preview) => {
      cancelAnimationFrame(preview.animId)
      preview.renderer.dispose()
    })
    shipPreviews.clear()
  }

  onMount(() => {
    // Set body styles for fullscreen game
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'

    loadAvailableMaps()
    loadStaticMaps()
    initThree()
    loadModelCatalog()
    loadDefaultMapThumbnail()

    // Init sound manager
    soundManager = new SoundManager()
    soundManager.toggle(soundEnabled)

    // Render ship previews after a short delay to ensure DOM is ready
    setTimeout(renderShipPreviews, 100)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('resize', handleResize)
    document.addEventListener('pointerlockchange', handlePointerLockChange)

    animate()
    
    // No preloading on mount - wait for game start
    isLoading = false

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.addEventListener('resize', handleResize)
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      cancelAnimationFrame(animationId)
      cleanupShipPreviews()
      renderer?.dispose()
    }
  })

  async function preloadModels(paths: string[]) {
    const loader = new GLTFLoader()
    const uniquePaths = Array.from(new Set(paths))
    const totalModels = uniquePaths.length
    
    if (totalModels === 0) {
      loadingStatus = "Ready!"
      loadingProgress = 100
      return
    }

    let loadedCount = 0
    loadingStatus = `Loading models (0/${totalModels})...`

    // Load models in batches
    const batchSize = 5
    for (let i = 0; i < totalModels; i += batchSize) {
      const batch = uniquePaths.slice(i, i + batchSize)
      await Promise.all(batch.map(async (path) => {
        try {
          await loader.loadAsync(path)
        } catch (e) {
          console.warn(`Failed to preload ${path}:`, e)
        } finally {
          loadedCount++
          loadingProgress = (loadedCount / totalModels) * 100
          loadingStatus = `Loading models (${loadedCount}/${totalModels})...`
        }
      }))
    }
    
    loadingStatus = "Ready!"
    loadingProgress = 100
  }

  function createStarfield() {
    const starCount = 8500
    const starVertices: number[] = []
    for (let i = 0; i < starCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(1500)
      const y = THREE.MathUtils.randFloatSpread(1500)
      const z = THREE.MathUtils.randFloatSpread(1500)
      if (new THREE.Vector3(x, y, z).length() < 100) continue
      starVertices.push(x, y, z)
    }

    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))

    // Bright, slightly larger stars for readability
    const primaryStars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xe8f3ff, size: 0.9, transparent: true, opacity: 0.9 })
    )
    primaryStars.name = 'starfield'
    scene.add(primaryStars)

    // Soft tinted layer for depth and extra sparkle
    const secondaryStars = new THREE.Points(
      starGeometry.clone(),
      new THREE.PointsMaterial({ color: 0x9fc7ff, size: 0.6, transparent: true, opacity: 0.6 })
    )
    secondaryStars.scale.setScalar(1.2)
    secondaryStars.name = 'starfield'
    scene.add(secondaryStars)
  }

  function initThree() {
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a1326)

    scene = new THREE.Scene()
    // Default to night/space if no map loaded yet
    scene.background = new THREE.Color(0x0a1326)
    createStarfield();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 2000)
    camera.position.set(0, 5, 10)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    clock = new THREE.Clock()

    // Lighting
    scene.add(new THREE.AmbientLight(0xcccccc, 0.8)) // Brighter ambient for space
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5) // Brighter sun
    dirLight.position.set(50, 100, 50)
    dirLight.castShadow = true
    scene.add(dirLight)
  }

  async function loadPlayerShip() {
    const loader = new GLTFLoader()
    try {
      const gltf = await loader.loadAsync(selectedSpaceship.path)
      playerShip = new THREE.Group()
      const model = gltf.scene
      model.scale.setScalar(shipScale)
      model.rotation.y = Math.PI  // Face forward (model faces +Z, we want -Z)
      model.traverse(child => { if (child instanceof THREE.Mesh) { child.castShadow = true } })
      playerShip.add(model)
      playerShip.add(new THREE.PointLight(0x00ffff, 2, 10))
      scene.add(playerShip)
      scene.add(playerShip)
      // Spawn high up and away from center, looking down
      playerShip.position.set(0, 100, 200)
      playerShip.lookAt(0, 0, 0)

      // Reset camera state for new game
      cameraInitialized = false
      smoothedCameraPos.set(0, 105, 210)  // Initial camera position behind ship
      camera.position.copy(smoothedCameraPos)
      camera.lookAt(playerShip.position)

      // Reset camera state for new game
      cameraInitialized = false
      smoothedCameraPos.set(0, 105, 210)  // Initial camera position behind ship
      camera.position.copy(smoothedCameraPos)
      camera.lookAt(playerShip.position)
    } catch (error) {
      console.error('Failed to load ship:', error)
      createFallbackShip()
    }
  }

  function createFallbackShip() {
    playerShip = new THREE.Group()
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 4), new THREE.MeshStandardMaterial({ color: 0x2266ff, metalness: 0.8, emissive: 0x1144aa, emissiveIntensity: 0.3 }))
    body.rotation.x = Math.PI / 2
    body.scale.setScalar(shipScale * 3)
    playerShip.add(body)
    scene.add(playerShip)
    playerShip.position.set(0, 100, 200)

    // Reset camera state for new game
    cameraInitialized = false
    smoothedCameraPos.set(0, 105, 210)
    camera.position.copy(smoothedCameraPos)
    camera.lookAt(playerShip.position)
  }

  async function loadMap(map: MapData) {
    isLoadingMap = true
    const loader = new GLTFLoader()
    solidObjects.forEach(obj => scene.remove(obj))
    solidObjects = []

    // Apply map environment settings
    if (map.environment) {
      timeOfDay = map.environment.timeOfDay
      weather = map.environment.weather // Explicitly set weather from map
      // weather = 'clear' // REMOVED: Allow map weather to persist
      applyEnvironment(map.environment)
      updateEnvironment()
    }

    // Also removing the ground plane.
    // const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ color: 0x2d5016, roughness: 0.8 }))
    // ground.rotation.x = -Math.PI / 2
    // ground.receiveShadow = true
    // scene.add(ground)

    for (const obj of map.objects) {
      try {
        const gltf = await loader.loadAsync(obj.modelPath)
        const mesh = gltf.scene
        mesh.position.set(obj.position.x, obj.position.y, obj.position.z)
        mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z)
        mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z)
        mesh.traverse(child => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true } })
        scene.add(mesh)
        solidObjects.push(mesh)
      } catch (e) { console.error('Failed to load:', obj.modelPath) }
    }
    isLoadingMap = false
  }

  function applyEnvironment(env: MapData['environment']) {
    const colors: Record<string, { sky: number; fog: number }> = {
      dawn: { sky: 0xffd4a0, fog: 0x111111 }, // dark fog
      day: { sky: 0x87ceeb, fog: 0x111111 }, // dark fog
      sunset: { sky: 0xff6b4a, fog: 0x111111 }, // dark fog
      night: { sky: 0x0a0a2e, fog: 0x000000 } // black fog
    }
    const c = colors[env.timeOfDay]
    // scene.background = new THREE.Color(c.sky) // REMOVED
    // Fog density from map can be 0-200+, need very small multiplier for FogExp2
    // A density of 0.002-0.005 gives visible fog, 200 * 0.00002 = 0.004
    scene.fog = env.fogDensity > 0 ? new THREE.FogExp2(c.fog, env.fogDensity * 0.00002) : null
  }

  async function getDefaultMapData(): Promise<MapData | null> {
    try {
      const response = await fetch('/3d-maps/Default_Space.json')
      return await response.json()
    } catch (error) {
      console.error('Failed to load default map data:', error)
      return null
    }
  }

  async function createDefaultMap(data?: MapData) {
    // If data is provided, use it directly. Otherwise try to fetch it.
    let defaultMapData = data
    if (!defaultMapData) {
      defaultMapData = await getDefaultMapData() || undefined
    }

    if (defaultMapData) {
      // We still want space background, so don't apply environment from map directly.
      // Instead, we just load the objects.
      isLoadingMap = true
      const loader = new GLTFLoader()
      solidObjects.forEach(obj => scene.remove(obj))
      solidObjects = []

      for (const obj of defaultMapData.objects) {
        try {
          const gltf = await loader.loadAsync(obj.modelPath)
          const mesh = gltf.scene
          mesh.position.set(obj.position.x, obj.position.y, obj.position.z)
          mesh.rotation.set(obj.rotation.x, obj.rotation.y, obj.rotation.z)
          mesh.scale.set(obj.scale.x, obj.scale.y, obj.scale.z)
          mesh.traverse(child => { if (child instanceof THREE.Mesh) { child.castShadow = true; child.receiveShadow = true } })
          scene.add(mesh)
          solidObjects.push(mesh)
        } catch (e) { console.error('Failed to load:', obj.modelPath) }
      }
      isLoadingMap = false
      return
    }
    
    // Fallback: create procedural asteroid field
    for (let i = 0; i < 50; i++) {
      const size = 2 + Math.random() * 8;
      const asteroid = new THREE.Mesh(
        new THREE.DodecahedronGeometry(size, 0),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(0, 0, 0.3 + Math.random() * 0.3),
          metalness: 0.6,
          roughness: 0.8
        })
      )
      asteroid.position.set(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 400
      )
      asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      asteroid.castShadow = true;
      asteroid.receiveShadow = true;
      scene.add(asteroid);
      solidObjects.push(asteroid);
    }
  }

  // Generate scenery for the level (same as FPS game - simplified version of World Builder auto-generate)
  async function generateInfiniteLevel(): Promise<MapData> {
    const newMap: MapData = {
      id: `infinite-${level}`,
      name: `Sector ${level}`,
      environment: {
        skyColor: 0x000000,
        fogColor: 0x000000,
        fogDensity: 0,
        timeOfDay: 'night'
      },
      objects: [],
      stats: { objectCount: 0, polygonCount: 0 },
      thumbnail: ''
    }

    if (modelCatalog.length === 0) return newMap

    // Helper to get random item from array
    const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
    
    // Filter models
    const planets = modelCatalog.filter(m => m.category === 'Space' && (m.name.includes('Planet') || m.name.includes('Moon')))
    const platforms = modelCatalog.filter(m => m.name.includes('Cyberpunk Platform'))
    const rocks = modelCatalog.filter(m => m.name.includes('Rock') || m.name.includes('Asteroid'))
    const misc = modelCatalog.filter(m => m.category === 'Space' && !m.name.includes('Planet') && !m.name.includes('Platform'))

    // Generate ~5 Planets
    for (let i = 0; i < 5; i++) {
      if (planets.length === 0) break
      const model = pick(planets)
      newMap.objects.push({
        id: crypto.randomUUID(),
        modelPath: model.path,
        position: { 
          x: (Math.random() - 0.5) * 4000, 
          y: (Math.random() - 0.5) * 4000, 
          z: (Math.random() - 0.5) * 4000 
        },
        rotation: { x: Math.random() * Math.PI, y: Math.random() * Math.PI, z: Math.random() * Math.PI },
        scale: { x: 50 + Math.random() * 100, y: 50 + Math.random() * 100, z: 50 + Math.random() * 100 }
      })
    }

    // Generate ~5 Cyberpunk Platforms
    for (let i = 0; i < 5; i++) {
      if (platforms.length === 0) break
      const model = pick(platforms)
      newMap.objects.push({
        id: crypto.randomUUID(),
        modelPath: model.path,
        position: { 
          x: (Math.random() - 0.5) * 2000, 
          y: (Math.random() - 0.5) * 2000, 
          z: (Math.random() - 0.5) * 2000 
        },
        rotation: { x: 0, y: Math.random() * Math.PI * 2, z: 0 },
        scale: { x: 5 + Math.random() * 10, y: 5 + Math.random() * 10, z: 5 + Math.random() * 10 }
      })
    }

    // Generate ~10 Rocks
    for (let i = 0; i < 10; i++) {
      if (rocks.length === 0) break
      const model = pick(rocks)
      newMap.objects.push({
        id: crypto.randomUUID(),
        modelPath: model.path,
        position: { 
          x: (Math.random() - 0.5) * 1000, 
          y: (Math.random() - 0.5) * 1000, 
          z: (Math.random() - 0.5) * 1000 
        },
        rotation: { x: Math.random() * Math.PI, y: Math.random() * Math.PI, z: Math.random() * Math.PI },
        scale: { x: 2 + Math.random() * 8, y: 2 + Math.random() * 8, z: 2 + Math.random() * 8 }
      })
    }

    // Generate ~20 Misc models
    for (let i = 0; i < 20; i++) {
      if (misc.length === 0) break
      const model = pick(misc)
      newMap.objects.push({
        id: crypto.randomUUID(),
        modelPath: model.path,
        position: { 
          x: (Math.random() - 0.5) * 1500, 
          y: (Math.random() - 0.5) * 1500, 
          z: (Math.random() - 0.5) * 1500 
        },
        rotation: { x: Math.random() * Math.PI, y: Math.random() * Math.PI, z: Math.random() * Math.PI },
        scale: { x: 1 + Math.random() * 5, y: 1 + Math.random() * 5, z: 1 + Math.random() * 5 }
      })
    }

    newMap.stats.objectCount = newMap.objects.length
    return newMap
  }

  async function generateLevelScenery() {
    if (modelCatalog.length === 0) return

    // Clear existing solid objects
    solidObjects.forEach(obj => scene.remove(obj))
    solidObjects = []

    // Categorize models (Space only for Starship Flyer)
    const space = modelCatalog.filter(m => m.category === 'Space')
    
    // Fallback if no space models found
    if (space.length === 0) return

    const loader = new GLTFLoader()

    // Helper to place model (same as FPS game)
    const placeModel = async (model: ModelCatalogItem, position: THREE.Vector3, baseScale: number) => {
      try {
        const gltf = await loader.loadAsync(model.path)
        const mesh = gltf.scene
        mesh.position.copy(position)
        mesh.rotation.y = Math.random() * Math.PI * 2

        // Calculate initial size
        const bbox = new THREE.Box3().setFromObject(mesh)
        const size = bbox.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)

        // Scale to reasonable size based on object type
        if (maxDim > 0) {
          const scaleFactor = baseScale / maxDim
          mesh.scale.setScalar(scaleFactor)
        } else {
          mesh.scale.setScalar(1)
        }

        mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
        })

        scene.add(mesh)
        solidObjects.push(mesh)
      } catch (error) {
        console.error('Failed to load scenery model:', model.path, error)
      }
    }

    // Place Space objects (20-30) - target size 5-15 units
    const spaceCount = 20 + Math.floor(Math.random() * 10)
    for (let i = 0; i < spaceCount && space.length > 0; i++) {
      const model = space[Math.floor(Math.random() * space.length)]
      // Place in 3D space (x, y, z)
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 200, 
        (Math.random() - 0.5) * 100, // Vertical range
        (Math.random() - 0.5) * 200
      )
      await placeModel(model, pos, 5.0 + Math.random() * 10.0)
    }
    console.log(`Level ${level} auto-generated: ${solidObjects.length} objects`)
  }

  // Cache for loaded enemy models
  const enemyModelCache: Record<EnemyType, THREE.Group | null> = {
    basic: null,
    fast: null,
    tank: null,
    boss: null
  }

  async function loadEnemyModel(type: EnemyType): Promise<THREE.Group> {
    // Return cached model if available
    if (enemyModelCache[type]) {
      return enemyModelCache[type]!.clone()
    }

    const modelPaths: Record<EnemyType, string> = {
      basic: '/3d-models/Enemy-Ships/Enemy-Spaceship-Basic-Red.glb',
      fast: '/3d-models/Enemy-Ships/Enemy-Spaceship-Fast-Blue.glb',
      tank: '/3d-models/Enemy-Ships/Enemy-Spaceship-Tank-Orange.glb',
      boss: '/3d-models/Enemy-Ships/Enemy-Spaceship-Boss.glb'
    }

    const loader = new GLTFLoader()
    try {
      const gltf = await loader.loadAsync(modelPaths[type])
      const model = gltf.scene
      
      // Enable shadows
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
        }
      })

      // Apply scaling based on type
      if (type === 'boss') {
        model.scale.setScalar(0.625) // Bosses are bigger (2.5 / 4)
      } else {
        model.scale.setScalar(0.375) // Standard size for other enemies (1.5 / 5)
      }

      // Cache the model
      enemyModelCache[type] = model

      return model.clone()
    } catch (error) {
      console.error(`Failed to load enemy model for ${type}:`, error)
      // Fallback to simple geometry if model fails to load
      return createFallbackEnemyModel(type)
    }
  }

  function createFallbackEnemyModel(type: EnemyType): THREE.Group {
    const g = new THREE.Group()
    const color = type === 'basic' ? 0xff0000 : type === 'fast' ? 0x00ffff : type === 'tank' ? 0xff8800 : 0xff00ff
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 })
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16), mat)
    mesh.castShadow = true
    g.add(mesh)
    g.scale.setScalar(type === 'boss' ? 3 : 1)
    return g
  }

  function createEnemyModel(type: EnemyType): THREE.Group {
    // Create a placeholder group that will be replaced when the model loads
    const g = new THREE.Group()
    
    // Add a temporary placeholder sphere
    const placeholderMat = new THREE.MeshStandardMaterial({ 
      color: type === 'basic' ? 0xff0000 : type === 'fast' ? 0x00ffff : type === 'tank' ? 0xff8800 : 0xff00ff,
      emissive: type === 'basic' ? 0xff0000 : type === 'fast' ? 0x00ffff : type === 'tank' ? 0xff8800 : 0xff00ff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.7
    })
    const placeholder = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), placeholderMat)
    g.add(placeholder)

    // Load the actual model asynchronously
    loadEnemyModel(type).then((model) => {
      // Remove placeholder
      g.remove(placeholder)
      // Add loaded model
      g.add(model)
    }).catch((error) => {
      console.error('Failed to load enemy model:', error)
    })

    // Scale appropriately - boss is already big, others need scaling
    if (type === 'boss') {
      g.scale.setScalar(0.4)
    } else {
      g.scale.setScalar(shipScale * 3)
    }
    return g
  }

  function getEnemyStats(type: EnemyType) {
    const base = { health: 50, speed: gameConfig.enemySpeed, fireRate: gameConfig.enemyFireRate, damage: gameConfig.enemyDamage }
    if (type === 'fast') return { ...base, health: 30, speed: base.speed * 2, damage: base.damage * 0.7 }
    if (type === 'tank') return { ...base, health: 100, speed: base.speed * 0.5, damage: base.damage * 1.5 }
    if (type === 'boss') return { health: 1000 + level * 200, speed: base.speed * 0.4, fireRate: base.fireRate * 0.25, damage: base.damage * 3 }
    return base
  }

  function spawnEnemy(type: EnemyType = 'basic') {
    const mesh = createEnemyModel(type), stats = getEnemyStats(type)
    const angle = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 50
    mesh.position.set(Math.cos(angle) * dist, 10 + Math.random() * 30, Math.sin(angle) * dist)
    scene.add(mesh)
    const enemy: Enemy = {
      mesh,
      health: stats.health,
      maxHealth: stats.health,
      lastShot: Date.now(),
      velocity: new THREE.Vector3(),
      type,
      speed: stats.speed,
      fireRate: stats.fireRate,
      damage: stats.damage,
      id: nextEnemyId++
    }
    
    enemies.push(enemy)
    if (type === 'boss') { bossEnemy = enemy; bossHealth = enemy.health; bossMaxHealth = enemy.maxHealth }
  }

  function spawnWave() {
    const types: EnemyType[] = ['basic', 'basic', 'fast']
    if (level >= 2) types.push('tank')
    if (level % 3 === 0) { 
      isBossLevel = true
      spawnEnemy('boss')
      // Spawn initial enemies
      for (let i = 0; i < 3; i++) spawnEnemy('basic')
      // Continue spawning enemies during boss fight for power-ups
      const bossWaveInterval = setInterval(() => {
        if (!isBossLevel || isGameOver) {
          clearInterval(bossWaveInterval)
          return
        }
        // Spawn 2 enemies every 8 seconds during boss fight
        spawnEnemy(types[Math.floor(Math.random() * types.length)])
        setTimeout(() => spawnEnemy(types[Math.floor(Math.random() * types.length)]), 1000)
      }, 8000)
    }
    else { 
      isBossLevel = false; 
      // Calculate target enemy count based on config and level multiplier
      const targetCount = Math.min(gameConfig.enemyCount + (level * gameConfig.enemyLevelMultiplier), 25)
      
      // Spawn cap check: don't spawn if we already have too many enemies
      if (enemies.length >= targetCount + 5) return

      // Spawn up to the target count
      const spawnCount = Math.max(0, targetCount - enemies.length)
      const batchSize = Math.min(spawnCount, 5) // Don't spawn too many at once

      for (let i = 0; i < batchSize; i++) setTimeout(() => spawnEnemy(types[Math.floor(Math.random() * types.length)]), i * 300) 
    }
  }

  // Check if we should drop a power-up based on frequency setting
  function trySpawnPowerUpOnKill(position: THREE.Vector3) {
    // Critical Health Override: If health < 15% and no health pack on field, force drop
    if (health < 15 && !powerUps.some(p => p.type === 'health')) {
      spawnPowerUpAt(position, 'health')
      killsSinceLastDrop = 0 // Reset counter
      return
    }

    // Boost Priority: If player has 2+ weapons with ammo and no boost on field, prioritize boost
    const weaponsWithAmmo = weaponInventory.filter(w => w.ammo !== 0 && w.type !== 'laser').length
    if (weaponsWithAmmo >= 2 && !powerUps.some(p => p.type === 'boost')) {
      spawnPowerUpAt(position, 'boost')
      killsSinceLastDrop = 0 // Reset counter
      return
    }

    killsSinceLastDrop++
    const dropRate = powerUpDropRates[gameConfig.powerUpFrequency]
    if (killsSinceLastDrop >= dropRate) {
      killsSinceLastDrop = 0
      spawnPowerUpAt(position)
    }
  }

  function spawnPowerUpAt(position: THREE.Vector3, specificType?: PowerUpType) {
    const types: PowerUpType[] = ['health', 'ammo', 'boost', 'weapon-missile', 'weapon-plasma', 'weapon-chain', 'weapon-drone', 'weapon-scatter']
    
    let type: PowerUpType
    if (specificType) {
      type = specificType
    } else {
      // Filter out recently dropped types for better distribution
      const availableTypes = types.filter(t => !lastDroppedPowerUps.includes(t))
      type = availableTypes.length > 0 
        ? availableTypes[Math.floor(Math.random() * availableTypes.length)]
        : types[Math.floor(Math.random() * types.length)]
      
      // Track last 3 dropped power-ups
      lastDroppedPowerUps.push(type)
      if (lastDroppedPowerUps.length > 3) lastDroppedPowerUps.shift()
    }
    
    const g = new THREE.Group()
    const color = powerUpColors[type]
    
    // Add random offset to position for variety
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 15
    )
    position.add(randomOffset)

    // Create type-specific power-up visuals
    if (type === 'health') {
      // Health - Red Cross/Plus Symbol
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.4 })
      const h = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.3), mat)
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), mat)
      g.add(h, v)
    } else if (type === 'ammo') {
      // Ammo - Green Box/Crate
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7, metalness: 0.5, roughness: 0.3 })
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), mat))
    } else if (type === 'boost') {
      // Boost - Cool triangles pointing up
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2, metalness: 0.9, roughness: 0.1 })
      // Create 3 triangles of different sizes
      for (let i = 0; i < 3; i++) {
        const size = 0.5 - i * 0.12
        const tri = new THREE.Mesh(new THREE.ConeGeometry(size, size * 1.5, 3), mat)
        tri.rotation.y = Math.PI / 6 // Rotate to make it look like triangle
        tri.position.y = i * 0.3 - 0.3
        g.add(tri)
      }
    } else if (type === 'weapon-missile') {
      // Missile - Yellow Cone/Rocket
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, metalness: 0.7, roughness: 0.2 })
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 8), mat)
      cone.rotation.x = Math.PI / 2
      g.add(cone)
    } else if (type === 'weapon-plasma') {
      // Plasma - Magenta glowing orb with energy rings
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2, metalness: 0.9, roughness: 0.1 })
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), mat)
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 8, 16), mat)
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 8, 16), mat)
      ring1.rotation.x = Math.PI / 2
      ring2.rotation.y = Math.PI / 2
      g.add(orb, ring1, ring2)
    } else if (type === 'weapon-chain') {
      // Chain Lightning - White zigzag lightning bolt
      const boltMat = new THREE.MeshStandardMaterial({ 
        color: 0xffffff, 
        emissive: 0xffffff, 
        emissiveIntensity: 2.0, 
        metalness: 1.0, 
        roughness: 0.0 
      })
      
      const points: THREE.Vector3[] = []
      const segments = 6
      for (let i = 0; i <= segments; i++) {
        const t = i / segments
        const y = (t - 0.5) * 1.2 // Vertical span
        // Zigzag pattern
        const x = (i % 2 === 0 ? 0.25 : -0.25) * (1 - Math.abs(t - 0.5)) // Tapered zigzag
        points.push(new THREE.Vector3(x, y, 0))
      }
      
      const curve = new THREE.CatmullRomCurve3(points)
      const tubeGeometry = new THREE.TubeGeometry(curve, 12, 0.08, 6, false)
      const bolt = new THREE.Mesh(tubeGeometry, boltMat)
      g.add(bolt)
    } else if (type === 'weapon-drone') {
      // Drone Swarm - Lime green small ship cluster
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, metalness: 0.7, roughness: 0.3 })
      for (let i = 0; i < 3; i++) {
        const drone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 4), mat)
        drone.rotation.x = Math.PI / 2
        drone.position.set(Math.cos(i * Math.PI * 2 / 3) * 0.4, Math.sin(i * Math.PI * 2 / 3) * 0.4, 0)
        g.add(drone)
      }
    } else if (type === 'weapon-scatter') {
      // Scatter Shot - Orange burst pattern
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, metalness: 0.6, roughness: 0.3 })
      const center = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), mat)
      g.add(center)
      for (let i = 0; i < 6; i++) {
        const pellet = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), mat)
        const angle = (i / 6) * Math.PI * 2
        pellet.position.set(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6, 0)
        g.add(pellet)
      }
    }

    // Add glow ring around all power-ups
    const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 })
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.1, 8, 32), ringMat)
    ring.rotation.x = Math.PI / 2
    g.add(ring)

    g.position.copy(position)
    scene.add(g)
    powerUps.push({ mesh: g, type })
  }

  function spawnInitialWeaponDrops(count: number) {
    const weaponTypes: PowerUpType[] = ['weapon-missile', 'weapon-plasma', 'weapon-chain', 'weapon-drone', 'weapon-scatter']
    
    // Shuffle types to ensure variety
    for (let i = weaponTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [weaponTypes[i], weaponTypes[j]] = [weaponTypes[j], weaponTypes[i]];
    }

    for (let i = 0; i < count; i++) {
      // Spawn in a circle around the center, slightly elevated
      const angle = (i / count) * Math.PI * 2
      const radius = 20 + Math.random() * 20
      const pos = new THREE.Vector3(
        Math.cos(angle) * radius,
        10 + Math.random() * 10,
        Math.sin(angle) * radius
      )
      // Cycle through shuffled types
      const type = weaponTypes[i % weaponTypes.length]
      spawnPowerUpAt(pos, type)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    keys[e.key.toLowerCase()] = true
    if (e.key === 'Shift') { e.preventDefault(); isFiring = true }  // Shift for firing
    // Spacebar activates boost if charges available
    if (e.key === ' ' && boostCharges > 0 && !boostActive) {
      e.preventDefault()
      boostCharges--
      boostActive = true
      boostEndTime = Date.now() + boostDuration
      powerUpAlert = { message: 'BOOST ACTIVATED!', color: '#44ffff', timestamp: Date.now() }
      soundManager.playBoost()
    }
    if (e.key >= '1' && e.key <= '5') { const i = parseInt(e.key) - 1; if (i < weaponInventory.length) currentWeaponIndex = i }
    // Arrow up/down to cycle weapons
    if (e.key === 'ArrowUp' && weaponInventory.length > 1) {
      e.preventDefault()
      currentWeaponIndex = (currentWeaponIndex - 1 + weaponInventory.length) % weaponInventory.length
      flashSelectedWeapon()
    }
    if (e.key === 'ArrowDown' && weaponInventory.length > 1) {
      e.preventDefault()
      currentWeaponIndex = (currentWeaponIndex + 1) % weaponInventory.length
      flashSelectedWeapon()
    }
    if (e.key === 'Escape' && isPlaying) { isPlaying = false; document.exitPointerLock() }
  }

  function handleKeyUp(e: KeyboardEvent) {
    keys[e.key.toLowerCase()] = false
    if (e.key === 'Shift') isFiring = false
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isPlaying || !isPointerLocked) return

    const now = Date.now()
    const delta = Math.sqrt(e.movementX ** 2 + e.movementY ** 2)

    // Track movement for input type detection (auto mode)
    if (gameConfig.mouseInput === 'auto' && delta > 0) {
      movementSamples.push({ delta, time: now })
      // Keep only last 30 samples from last 500ms
      movementSamples = movementSamples.filter(s => now - s.time < 500).slice(-30)

      if (movementSamples.length >= 10) {
        const avgDelta = movementSamples.reduce((a, b) => a + b.delta, 0) / movementSamples.length
        const hasSmallMovements = avgDelta < 8  // Trackpads have smaller, more frequent movements
        const hasFrequentUpdates = movementSamples.length > 15  // More events in 500ms

        if (hasSmallMovements && hasFrequentUpdates) {
          detectedInputType = 'trackpad'
        } else if (avgDelta > 15) {
          detectedInputType = 'external'
        }
      }
    }

    lastMovementTime = now
    isFingerOnTrackpad = true  // Receiving events means finger is on trackpad

    // For trackpad mode: store last movement direction (view continues while finger down)
    if (getEffectiveInputType() === 'trackpad' && delta > 0.5) {
      // Store the movement direction - will continue until finger lifts
      continuousMotion.x = e.movementX
      continuousMotion.y = e.movementY
    }

    // Store raw mouse delta - sensitivity applied in updatePlayer only
    mouseMovement.x = e.movementX
    mouseMovement.y = e.movementY
  }

  function handleMouseDown() { if (isPlaying && isPointerLocked) isMouseDown = true }
  function handleMouseUp() { isMouseDown = false }

  function handlePointerLockChange() {
    isPointerLocked = document.pointerLockElement === renderer.domElement
    if (!isPointerLocked && isPlaying && hasStartedGame) isPlaying = false
  }

  function handleResize() {
    if (!camera || !renderer) return
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  function shoot() {
    const now = Date.now(), weapon = weaponInventory[currentWeaponIndex]
    const rates: Record<string, number> = { laser: 100, missile: 500, plasma: 600, chain: 400, drone: 1500, scatter: 300 }
    if (now - lastShot < (rates[weapon.type] || 200) || weapon.ammo === 0) return
    if (weapon.ammo > 0) {
      weapon.ammo--
      weaponInventory = weaponInventory  // Trigger reactive HUD update
      // Auto-switch to laser cannon when current weapon runs out
      if (weapon.ammo === 0 && weapon.type !== 'laser') {
        currentWeaponIndex = 0  // Switch to laser cannon (always index 0)
        powerUpAlert = { message: 'OUT OF AMMO - LASER', color: '#ff4444', timestamp: Date.now() }
      }
    }
    lastShot = now
    if (!playerShip) return

    // Calculate aim direction: find where camera center ray hits a target plane, then aim from ship to that point
    // This corrects the parallax between camera position and ship position
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)

    // Find a point along the camera ray at a reasonable target distance
    const targetDistance = 100  // Distance ahead where crosshair actually points
    const targetPoint = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(targetDistance))

    // Calculate direction from ship to that target point
    const dir = targetPoint.clone().sub(playerShip.position).normalize()

    let mesh: THREE.Mesh | THREE.Group
    let vel: THREE.Vector3, dmg: number, lt: number

    if (weapon.type === 'laser') {
      // Laser - Sleek elongated beam with bright core and energy trail
      const beamGroup = new THREE.Group()

      // Core beam - bright white center
      const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const core = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), coreMaterial)
      core.rotation.x = Math.PI / 2

      // Inner glow - cyan
      const innerGlowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 })
      const innerGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8), innerGlowMat)
      innerGlow.rotation.x = Math.PI / 2

      // Outer glow - larger, more transparent
      const outerGlowMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3 })
      const outerGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.8, 8), outerGlowMat)
      outerGlow.rotation.x = Math.PI / 2

      // Tip point
      const tipMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 6), tipMat)
      tip.rotation.x = -Math.PI / 2
      tip.position.z = -0.7

      beamGroup.add(core, innerGlow, outerGlow, tip)
      beamGroup.lookAt(beamGroup.position.clone().add(dir))
      mesh = beamGroup as unknown as THREE.Mesh

      vel = dir.clone().multiplyScalar(150); dmg = gameConfig.playerDamage; lt = 1.5  // Much faster!
      mesh.position.copy(playerShip.position).add(dir.clone().multiplyScalar(1.5))
      scene.add(mesh)
      projectiles.push({ mesh, velocity: vel, damage: dmg, type: weapon.type, lifetime: lt })
      soundManager.playLaser()

    } else if (weapon.type === 'missile') {
      // Missile - Heat-seeking orange cone
      const missileMaterial = new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.8 })
      mesh = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6, 8), missileMaterial)
      mesh.rotation.x = -Math.PI / 2
      const trailMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.6 })
      const trail = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 6), trailMaterial)
      trail.position.z = 0.4; trail.rotation.x = Math.PI
      mesh.add(trail)
      vel = dir.clone().multiplyScalar(50); dmg = gameConfig.playerDamage * 2; lt = 4
      // Find closest enemy for heat-seeking
      let closestEnemy: Enemy | null = null, closestDist = Infinity
      for (const e of enemies) {
        const d = playerShip.position.distanceTo(e.mesh.position)
        if (d < 100 && d < closestDist) { closestDist = d; closestEnemy = e }
      }
      mesh.position.copy(playerShip.position).add(dir.clone().multiplyScalar(1.5))
      scene.add(mesh)
      projectiles.push({ mesh, velocity: vel, damage: dmg, type: weapon.type, lifetime: lt, target: closestEnemy })
      soundManager.playMissile()

    } else if (weapon.type === 'plasma') {
      // Plasma Cannon - Forward-only with short-range homing toward enemies near crosshair
      // Ensure we're shooting forward - check if aim direction is in front of ship
      const shipFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(playerShip.quaternion)
      const aimDot = dir.dot(shipFwd)
      if (aimDot < 0.3) {
        // Aiming too far backward - force forward direction
        dir.copy(shipFwd)
      }

      // Find closest enemy near the crosshair (short range, must be in front)
      let plasmaTarget: Enemy | null = null
      let closestAngle = Math.PI / 4  // Max 45 degrees from crosshair
      for (const e of enemies) {
        const toEnemy = e.mesh.position.clone().sub(playerShip.position)
        const dist = toEnemy.length()
        if (dist < 50) {  // Short range
          toEnemy.normalize()
          const angle = Math.acos(Math.max(-1, Math.min(1, toEnemy.dot(dir))))
          if (angle < closestAngle) {
            closestAngle = angle
            plasmaTarget = e
          }
        }
      }

      const plasmaMat = new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 1.5 })
      mesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), plasmaMat)
      // Add energy rings
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xff88ff, transparent: true, opacity: 0.5 })
      const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 16), ringMat)
      const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.05, 8, 16), ringMat)
      ring1.rotation.x = Math.PI / 2; ring2.rotation.y = Math.PI / 2
      mesh.add(ring1, ring2)
      vel = dir.clone().multiplyScalar(60); dmg = gameConfig.playerDamage * 3; lt = 3
      mesh.position.copy(playerShip.position).add(dir.clone().multiplyScalar(1.5))
      scene.add(mesh)
      projectiles.push({ mesh, velocity: vel, damage: dmg, type: weapon.type, lifetime: lt, target: plasmaTarget })
      soundManager.playPlasma()

    } else if (weapon.type === 'chain') {
      // Chain Lightning - Instant lightning bolt that hits closest enemy to crosshair and chains
      // Ensure forward-only firing
      const shipFwd = new THREE.Vector3(0, 0, -1).applyQuaternion(playerShip.quaternion)
      const aimDot = dir.dot(shipFwd)
      if (aimDot < 0.3) {
        dir.copy(shipFwd)  // Force forward if aiming backward
      }

      // Find the closest enemy near the crosshair (medium range)
      let primaryTarget: Enemy | null = null
      let closestAngle = Math.PI / 3  // Max 60 degrees from crosshair
      for (const e of enemies) {
        const toEnemy = e.mesh.position.clone().sub(playerShip.position)
        const dist = toEnemy.length()
        if (dist < 70) {  // Medium range
          toEnemy.normalize()
          const angle = Math.acos(Math.max(-1, Math.min(1, toEnemy.dot(dir))))
          if (angle < closestAngle) {
            closestAngle = angle
            primaryTarget = e
          }
        }
      }

      if (primaryTarget) {
        // Found a target - create instant lightning chain!
        const chainDamage = gameConfig.playerDamage * 1.5
        const hitEnemies: Enemy[] = [primaryTarget]

        // Create lightning from ship to first target
        createLightningArc(playerShip.position.clone().add(dir.clone().multiplyScalar(1.5)), primaryTarget.mesh.position)
        soundManager.playChain()


        // Damage first target
        primaryTarget.health -= chainDamage
        if (primaryTarget.type === 'boss') bossHealth = primaryTarget.health

        // Chain to up to 2 more enemies (3 total)
        let lastTarget = primaryTarget
        for (let chainCount = 0; chainCount < 2; chainCount++) {
          let nextTarget: Enemy | null = null
          let shortestDist = 20  // Short chain range

          for (const e of enemies) {
            if (!hitEnemies.includes(e)) {
              const d = lastTarget.mesh.position.distanceTo(e.mesh.position)
              if (d < shortestDist) {
                shortestDist = d
                nextTarget = e
              }
            }
          }

          if (nextTarget) {
            // Create lightning arc to next target
            createLightningArc(lastTarget.mesh.position, nextTarget.mesh.position)
            // Damage chained enemy (reduced damage)
            const chainedDamage = chainDamage * (0.8 - chainCount * 0.15)
            nextTarget.health -= chainedDamage
            if (nextTarget.type === 'boss') bossHealth = nextTarget.health
            hitEnemies.push(nextTarget)
            lastTarget = nextTarget
          } else {
            break  // No more targets to chain to
          }
        }

        // Check for kills on all hit enemies
        for (const e of hitEnemies) {
          if (e.health <= 0 && enemies.includes(e)) {
            handleEnemyDeath(e)
          }
        }
      } else {
        // No target found - fire a visual-only lightning bolt forward
        const endPoint = playerShip.position.clone().add(dir.clone().multiplyScalar(50))
        createLightningArc(playerShip.position.clone().add(dir.clone().multiplyScalar(1.5)), endPoint)
        soundManager.playChain()
      }
      // Chain lightning is instant - no projectile needed
      return

    } else if (weapon.type === 'drone') {
      // Drone Swarm - Releases 3 autonomous attack drones
      for (let i = 0; i < 3; i++) {
        const droneMat = new THREE.MeshStandardMaterial({ color: 0x88ff00, emissive: 0x88ff00, emissiveIntensity: 0.8 })
        const droneGroup = new THREE.Group()
        const body = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 4), droneMat)
        body.rotation.x = -Math.PI / 2
        droneGroup.add(body)
        // Offset each drone slightly
        const offset = new THREE.Vector3((i - 1) * 0.8, 0, 0).applyQuaternion(playerShip.quaternion)
        droneGroup.position.copy(playerShip.position).add(dir.clone().multiplyScalar(1.5)).add(offset)
        scene.add(droneGroup)
        // Find a target for this drone
        let target: Enemy | null = null, closestDist = Infinity
        for (const e of enemies) {
          const d = playerShip.position.distanceTo(e.mesh.position)
          if (d < 80 && d < closestDist) { closestDist = d; target = e }
        }
        vel = dir.clone().multiplyScalar(40)
        projectiles.push({ mesh: droneGroup, velocity: vel, damage: gameConfig.playerDamage * 1.5, type: 'drone', lifetime: 5, target, isDrone: true })
      }
      soundManager.playDrone()

    } else if (weapon.type === 'scatter') {
      // Scatter Shot - Fires a massive wall of high-velocity shards
      const numPellets = 15
      const spreadAngle = 0.18 // Wider spread for the "wall" effect
      for (let i = 0; i < numPellets; i++) {
        // Brighter, hotter material
        const scatterMat = new THREE.MeshStandardMaterial({ color: 0xffdd88, emissive: 0xff6600, emissiveIntensity: 2.0, metalness: 0.8, roughness: 0.2 })
        // Elongated "shard" shape
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), scatterMat)
        mesh.scale.set(0.6, 0.6, 3.0) // Stretch into a streak/shard
        
        // Calculate spread direction
        const angleOffset = (i - (numPellets - 1) / 2) * spreadAngle / (numPellets - 1) * 2
        const spreadDir = dir.clone()
        // Rotate around up vector for horizontal spread
        const upAxis = new THREE.Vector3(0, 1, 0)
        spreadDir.applyAxisAngle(upAxis, angleOffset)
        // Add random vertical spread
        const rightAxis = new THREE.Vector3().crossVectors(dir, upAxis).normalize()
        spreadDir.applyAxisAngle(rightAxis, (Math.random() - 0.5) * spreadAngle * 0.8)

        vel = spreadDir.multiplyScalar(95) // Faster velocity
        
        mesh.position.copy(playerShip.position).add(dir.clone().multiplyScalar(1.5))
        mesh.lookAt(mesh.position.clone().add(vel)) // Face velocity
        
        scene.add(mesh)
        // Increased damage (was 0.8)
        projectiles.push({ mesh, velocity: vel, damage: gameConfig.playerDamage * 1.0, type: 'scatter', lifetime: 1.5 })
      }
      soundManager.playScatter()
    }
  }

  function createExplosion(pos: THREE.Vector3, size = 1) {
    for (let i = 0; i < 15; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.1 * size, 4, 4), new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 1, 0.5), transparent: true }))
      p.position.copy(pos)
      scene.add(p)
      particles.push({ mesh: p, velocity: new THREE.Vector3((Math.random() - 0.5) * 10 * size, (Math.random() - 0.5) * 10 * size, (Math.random() - 0.5) * 10 * size), lifetime: 1, maxLifetime: 1 })
    }
  }

  function createPlasmaBlastVisual(pos: THREE.Vector3) {
    // Expanding pink sphere (starts a bit larger; scales to match damage radius)
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xff66ff, transparent: true, opacity: 0.8 })
    )
    core.position.copy(pos)
    scene.add(core)
    particles.push({ mesh: core, velocity: new THREE.Vector3(), lifetime: 0.4, maxLifetime: 0.4, scaleGrowth: 8 })

    // Shockwave ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.4, 0.16, 12, 24),
      new THREE.MeshBasicMaterial({ color: 0xff99ff, transparent: true, opacity: 0.7 })
    )
    ring.rotation.x = Math.PI / 2
    ring.position.copy(pos)
    scene.add(ring)
    particles.push({ mesh: ring, velocity: new THREE.Vector3(), lifetime: 0.6, maxLifetime: 0.6, scaleGrowth: 4.6 })
  }

  function handleEnemyDeath(enemy: Enemy) {
    const idx = enemies.indexOf(enemy)
    if (idx === -1) return

    createExplosion(enemy.mesh.position, enemy.type === 'boss' ? 3 : 1)
    soundManager.playExplosion(enemy.type === 'boss' ? 3 : 1)
    const deathPos = enemy.mesh.position.clone()
    scene.remove(enemy.mesh); enemies.splice(idx, 1)
    // Score logic:
    // 1. If boss is active, score is capped at current level threshold (unless we just killed the boss)
    // 2. If we kill the boss, we get a bonus to reach the next level threshold
    
    const points = enemy.type === 'boss' ? 500 : enemy.type === 'tank' ? 100 : enemy.type === 'fast' ? 50 : 25
    const levelTarget = level * 1000

    if (enemy.type === 'boss') {
      // Boss killed!
      bossEnemy = null; bossHealth = 0; isBossLevel = false
      
      // Award bonus to reach next level
      if (score < levelTarget) {
        const bonus = levelTarget - score
        score = levelTarget
        // Show bonus effect (optional, for now just the score jump)
      } else {
        score += points
      }
      
      // Trigger level up if we hit the target
      if (score >= nextLevelScore) levelUp()
      
    } else {
      // Normal enemy killed
      if (bossEnemy) {
        // Boss active: cap score at level target - 1 (so we don't level up on minions)
        // Or just don't add points if we are at/near target?
        // User said: "point scoring stops... unless they defeat the boss"
        if (score < levelTarget) {
          score = Math.min(score + points, levelTarget)
        }
      } else {
        // No boss: normal scoring
        score += points
        if (score >= nextLevelScore) levelUp()
      }
    }

    kills++
    trySpawnPowerUpOnKill(deathPos)
  }

  function applyPlasmaBlastDamage(center: THREE.Vector3, baseDamage: number, primary?: Enemy) {
    const blastRadius = 17
    const blastDelayMs = 120  // Fire the damage slightly after visuals start expanding
    createPlasmaBlastVisual(center)

    setTimeout(() => {
      enemies.slice().forEach(enemy => {
        if (enemy === primary) return
        const dist = enemy.mesh.position.distanceTo(center)
        if (dist <= blastRadius) {
          const falloff = 1 - dist / blastRadius
          const damage = enemy.type === 'boss'
            ? baseDamage * 2 * falloff
            : enemy.health  // One-shot normal ships in range
          enemy.health -= damage
          if (enemy.type === 'boss') bossHealth = enemy.health
          if (enemy.health <= 0) handleEnemyDeath(enemy)
        }
      })
    }, blastDelayMs)
  }

  // Boost trail particles - cyan/blue energy trail behind ship
  function spawnBoostParticles() {
    if (!playerShip) return
    // Get backward direction of ship for trail
    const back = new THREE.Vector3(0, 0, 1).applyQuaternion(playerShip.quaternion)
    const spawnPos = playerShip.position.clone().add(back.clone().multiplyScalar(1.5))

    for (let i = 0; i < 3; i++) {
      const hue = 0.5 + Math.random() * 0.1  // Cyan to blue
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 4, 4),
        new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(hue, 1, 0.6), transparent: true })
      )
      p.position.copy(spawnPos).add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      ))
      scene.add(p)
      // Particles trail behind
      const vel = back.clone().multiplyScalar(20 + Math.random() * 15)
      vel.add(new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5))
      particles.push({ mesh: p, velocity: vel, lifetime: 0.5, maxLifetime: 0.5 })
    }
  }

  // Camera follow state
  let smoothedCameraPos = new THREE.Vector3()
  let cameraInitialized = false

  function updatePlayer(delta: number) {
    if (!playerShip) return

    // Check if boost has expired
    if (boostActive && Date.now() > boostEndTime) {
      boostActive = false
    }

    // Update low health warning
    if (health <= 10) {
      // Critical: Fast flashing (0.05 to 1.0)
      flashTimer += delta * 10
      lowHealthOpacity = (Math.sin(flashTimer) + 1) * 0.475 + 0.05
    } else if (health <= 20) {
      // Severe: Pulsing (0.05 to 1.0)
      flashTimer += delta * 3
      lowHealthOpacity = (Math.sin(flashTimer) + 1) * 0.475 + 0.05
    } else if (health <= 30) {
      // Warning: Static border
      lowHealthOpacity = 1.0
      flashTimer = 0
    } else {
      lowHealthOpacity = 0
      flashTimer = 0
    }
    
    // Update hit flash timer
    if (hitFlashTimer > 0) {
      hitFlashTimer -= delta
    }
    
    lastHealth = health

    // Boost animation - spawn trail particles when boosting
    if (boostActive && Math.random() < 0.5) {
      spawnBoostParticles()
    }

    // Continuous fire when shift OR mouse button is held
    if (isFiring || isMouseDown) shoot()

    // Update sway time
    shipSwayTime += delta

    // Standard flight control approach:
    // - Sensitivity scales raw mouse input
    // - Base multiplier is very small (0.001) for fine control
    const baseSensitivity = 0.001
    const sensitivity = baseSensitivity * gameConfig.mouseSensitivity
    const isTrackpadMode = getEffectiveInputType() === 'trackpad'

    // Trackpad finger lift detection
    const now = Date.now()
    const timeSinceLastMove = now - lastMovementTime
    if (isTrackpadMode && timeSinceLastMove > trackpadLiftThreshold) {
      // No events for a while = finger lifted off trackpad
      isFingerOnTrackpad = false
      continuousMotion.x = 0
      continuousMotion.y = 0
    }

    // Update yaw and pitch from mouse input (tracking angles separately)
    if (isTrackpadMode) {
      // Trackpad mode: view keeps moving while finger is on pad
      if (isFingerOnTrackpad) {
        const trackpadSensitivity = sensitivity * 0.5  // Slightly slower for continuous
        shipYaw -= continuousMotion.x * trackpadSensitivity
        shipPitch -= continuousMotion.y * trackpadSensitivity
      }
      // When finger lifts, motion stops immediately (no drift)
    } else {
      // External mouse: direct 1:1 control
      shipYaw -= mouseMovement.x * sensitivity
      shipPitch -= mouseMovement.y * sensitivity
    }
    // Clamp pitch to prevent flipping
    shipPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, shipPitch))

    // Calculate ship sway based on mouse movement (smoothed to avoid jitter)
    const targetSway = mouseMovement.x * sensitivity * 10
    smoothedSway = THREE.MathUtils.lerp(smoothedSway, targetSway, Math.min(1, delta * 12))
    const idleSway = Math.sin(shipSwayTime * 2) * 0.02

    // Reset mouse delta after use
    mouseMovement.x = 0; mouseMovement.y = 0

    // A/D strafe left/right (FPS-style controls)
    let strafeVelocity = new THREE.Vector3()
    const strafeSpeed = 20
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(playerShip.quaternion)
    if (keys['a']) {
      strafeVelocity.add(right.clone().multiplyScalar(-strafeSpeed))
      bankAngle = Math.min(bankAngle + 2.0 * delta, 0.3)  // Slight visual bank
    } else if (keys['d']) {
      strafeVelocity.add(right.clone().multiplyScalar(strafeSpeed))
      bankAngle = Math.max(bankAngle - 2.0 * delta, -0.3)  // Slight visual bank
    } else {
      bankAngle *= 0.9
    }

    // Q/E barrel roll with lateral movement (strafe in roll direction)
    let barrelRollStrafe = new THREE.Vector3()
    if (keys['q']) {
      rollAngularVelocity = rollSpeed * 6  // Continuous roll left while held
      // Strafe relative to ground plane (using Yaw only), ignoring roll/pitch
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), shipYaw)
      barrelRollStrafe.add(right.clone().multiplyScalar(-60))  // Stronger strafe left while rolling left
    } else if (keys['e']) {
      rollAngularVelocity = -rollSpeed * 6  // Continuous roll right while held
      // Strafe relative to ground plane (using Yaw only), ignoring roll/pitch
      const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), shipYaw)
      barrelRollStrafe.add(right.clone().multiplyScalar(60))  // Stronger strafe right while rolling right
    } else {
      rollAngularVelocity = 0  // Stop adding spin when key released
    }
    // Integrate roll
    barrelRollAngle += rollAngularVelocity * delta
    // Level out smoothly when keys are released without overshooting
    if (!keys['q'] && !keys['e']) {
      barrelRollAngle = THREE.MathUtils.lerp(barrelRollAngle, 0, Math.min(1, delta * 4))
      if (Math.abs(barrelRollAngle) < 0.0005) barrelRollAngle = 0
    }

    // Build quaternion from yaw/pitch/roll (YXZ order avoids gimbal lock for flight)
    // This keeps pitch and yaw independent - mouse up always pitches up
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), shipYaw)
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), shipPitch)
    const rollAmount = barrelRollAngle + bankAngle + smoothedSway + idleSway
    const rollQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rollAmount)

    // Apply in order: yaw first, then pitch, then roll
    playerShip.quaternion.copy(yawQuat).multiply(pitchQuat).multiply(rollQuat)

    // Calculate movement direction from ship's orientation
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(playerShip.quaternion)
    const up = new THREE.Vector3(0, 1, 0)
    let target = new THREE.Vector3()

    // Auto-move forward based on setting
    const autoMoveForce = autoMoveSpeeds[gameConfig.autoMoveSpeed]
    let effectiveAutoMove = autoMoveForce
    
    // W key doubles the auto-move speed (or applies max speed if off)
    if (keys['w']) {
      if (gameConfig.autoMoveSpeed === 'off') {
        effectiveAutoMove = maxSpeed
      } else {
        effectiveAutoMove = autoMoveForce * 2
      }
    }
    
    if (effectiveAutoMove > 0) {
      target.add(fwd.clone().multiplyScalar(effectiveAutoMove))
    }

    // S reverses the ship (full reverse, overrides auto-move)
    if (keys['s']) {
      // Cancel auto-move and apply reverse thrust
      target.set(0, 0, 0)
      target.add(fwd.clone().multiplyScalar(-acceleration))
    }
    // Control for up/down
    if (keys['control']) target.add(up.clone().multiplyScalar(-acceleration * 0.5))

    // Add strafe velocity (A/D)
    target.add(strafeVelocity)
    // Add barrel roll lateral strafe (Q/E)
    target.add(barrelRollStrafe)

    velocity.lerp(target, delta * 3)
    
    // Calculate speed limit
    let limit = maxSpeed

    if (boostActive) {
      // Boost is 3x the current auto-speed setting
      const base = gameConfig.autoMoveSpeed === 'off' ? maxSpeed : autoMoveSpeeds[gameConfig.autoMoveSpeed]
      limit = base * 3
    } else {
      // Normal flight
      if (gameConfig.autoMoveSpeed === 'hyper' && keys['w']) {
        limit = maxSpeed * 2 // Hyper + W = 2x speed
      }
    }
    
    velocity.clampLength(0, limit)
    currentSpeed = velocity.length()
    playerShip.position.add(velocity.clone().multiplyScalar(delta))

    if (playerShip.position.length() > 250) playerShip.position.multiplyScalar(0.99)

    // Third-person camera: fixed position behind and above the ship
    // Camera follows yaw but NOT pitch - this keeps ship visible on screen
    const camDistance = 10
    const camHeight = 5

    // Camera only follows yaw (horizontal rotation)
    const camX = playerShip.position.x + Math.sin(shipYaw) * camDistance
    const camY = playerShip.position.y + camHeight
    const camZ = playerShip.position.z + Math.cos(shipYaw) * camDistance

    const targetCamPos = new THREE.Vector3(camX, camY, camZ)

    if (!cameraInitialized) {
      smoothedCameraPos.copy(targetCamPos)
      cameraInitialized = true
    }

    smoothedCameraPos.lerp(targetCamPos, delta * 5)
    camera.position.copy(smoothedCameraPos)

    // Look at a point ahead of the ship in the direction it's facing
    // This keeps the ship in the lower portion of screen and crosshair aligned with aim
    const lookAheadDist = 30
    const lookTarget = playerShip.position.clone().add(fwd.clone().multiplyScalar(lookAheadDist))
    camera.lookAt(lookTarget)
  }

  function updateEnemies(delta: number) {
    if (!playerShip) return
    
    const time = Date.now() * 0.001 // Time in seconds for wave functions

    enemies.forEach(enemy => {
      const toPlayer = playerShip!.position.clone().sub(enemy.mesh.position)
      const distToPlayer = toPlayer.length()
      const dirToPlayer = toPlayer.clone().normalize()

      // 1. Separation Force (Anti-clustering) - Boids-like separation
      const separation = new THREE.Vector3()
      let neighborCount = 0
      enemies.forEach(other => {
        if (other === enemy) return
        const toOther = enemy.mesh.position.clone().sub(other.mesh.position)
        const dist = toOther.length()
        const repulsionRadius = enemy.type === 'tank' ? 15 : 12 // Keep them apart
        
        if (dist < repulsionRadius) {
          // Stronger repulsion the closer they are
          const force = toOther.normalize().multiplyScalar((repulsionRadius - dist) / dist * 2.5)
          separation.add(force)
          neighborCount++
        }
      })

      // 2. Steering Behavior based on Type
      const desiredVelocity = new THREE.Vector3()

      if (enemy.type === 'fast') {
        // Fast enemies: Flanking / Swarming behavior
        // Avoid ramming: if too close, break off and circle
        if (distToPlayer < 25) {
          const tangent = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x).normalize()
          desiredVelocity.copy(tangent).multiplyScalar(enemy.speed * 1.5)
        } else {
          // Move towards player, but add a sine wave perpendicular to direction for "strafing" run
          const strafeAmount = Math.sin(time * 2 + enemy.id) * 20
          const strafeDir = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x).normalize() // Perpendicular
          desiredVelocity.copy(dirToPlayer).multiplyScalar(enemy.speed).add(strafeDir.multiplyScalar(0.5))
        }
        
      } else if (enemy.type === 'tank') {
        // Tank enemies: Maintain optimal firing range
        const idealDist = 40
        if (distToPlayer > idealDist + 5) {
          // Too far, approach
          desiredVelocity.copy(dirToPlayer).multiplyScalar(enemy.speed)
        } else if (distToPlayer < idealDist - 5) {
          // Too close, back up slowly
          desiredVelocity.copy(dirToPlayer).multiplyScalar(-enemy.speed * 0.5)
        } else {
          // In range, strafe slowly to be a moving target
          const strafeDir = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x).normalize()
          const strafeSpeed = Math.sin(time + enemy.id) * enemy.speed * 0.3
          desiredVelocity.copy(strafeDir).multiplyScalar(strafeSpeed)
        }

      } else if (enemy.type === 'boss') {
        // Boss: Circle player logic (kept similar but smoothed)
        const targetDist = 30
        if (distToPlayer > targetDist + 10) {
          desiredVelocity.copy(dirToPlayer).multiplyScalar(enemy.speed)
        } else if (distToPlayer < targetDist - 10) {
          desiredVelocity.copy(dirToPlayer).multiplyScalar(-enemy.speed * 0.5)
        } else {
          const tangent = new THREE.Vector3(-dirToPlayer.z, 0, dirToPlayer.x).normalize()
          desiredVelocity.copy(tangent).multiplyScalar(enemy.speed)
        }

      } else {
        // Basic enemies: Pursuit with noise
        // Add some Perlin-like noise to their path so they don't follow a straight line
        const noiseAngle = Math.sin(time * 0.5 + enemy.id) * 0.5 // +/- 0.5 radians
        const noisyDir = dirToPlayer.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), noiseAngle)
        desiredVelocity.copy(noisyDir).multiplyScalar(enemy.speed)
      }

      // 3. Combine Forces
      // Add separation force to desired velocity
      // Separation weight is high to prioritize not crashing into each other
      const finalForce = desiredVelocity.add(separation.multiplyScalar(4.0))
      
      // 4. Apply to Velocity (Smooth steering)
      // Lerp towards the desired velocity for momentum
      enemy.velocity.lerp(finalForce.normalize().multiplyScalar(enemy.speed), 0.08)

      // 5. Update Position & Rotation
      enemy.mesh.position.add(enemy.velocity.clone().multiplyScalar(delta))
      enemy.mesh.lookAt(playerShip!.position)
      
      // Floor constraint
      if (enemy.mesh.position.y < 3) { 
        enemy.mesh.position.y = 3
        enemy.velocity.y = Math.abs(enemy.velocity.y) 
      }

      // Firing Logic
      const now = Date.now()
      if (now - enemy.lastShot > enemy.fireRate && distToPlayer < 70) { // Increased range slightly
        shootEnemyProjectile(enemy)
        enemy.lastShot = now 
      }
    })
  }

  function shootEnemyProjectile(enemy: Enemy) {
    if (!playerShip) return

    // Type-specific bullet visuals (matching Blocky Shooter)
    let size: number, color: number, speed: number
    if (enemy.type === 'fast') {
      // Fast Enemy - Cyan bullets (smaller, faster)
      size = 0.1; color = 0x00ffff; speed = 55
    } else if (enemy.type === 'tank') {
      // Tank Enemy - Orange bullets (larger, slower)
      size = 0.25; color = 0xff8800; speed = 30
    } else if (enemy.type === 'boss') {
      // Boss - Red bullets (large)
      size = 0.2; color = 0xff0000; speed = 45
    } else {
      // Basic Enemy - Red bullets
      size = 0.15; color = 0xff0000; speed = 40
    }

    const bulletMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1 })
    const p = new THREE.Mesh(new THREE.SphereGeometry(size, 8, 8), bulletMat)
    p.position.copy(enemy.mesh.position)
    scene.add(p)
    projectiles.push({ mesh: p, velocity: new THREE.Vector3().subVectors(playerShip.position, enemy.mesh.position).normalize().multiplyScalar(speed), damage: enemy.damage, type: 'laser', lifetime: 3, isEnemy: true })
  }

  function updateProjectiles(delta: number) {
    projectiles = projectiles.filter(p => {
      p.lifetime -= delta
      if (p.lifetime <= 0) { scene.remove(p.mesh); return false }

      // Heat-seeking missiles and drones
      if ((p.type === 'missile' || p.type === 'drone') && !p.isEnemy) {
        // Find target if we don't have one or current target is dead
        if (!p.target || !enemies.includes(p.target)) {
          let closestEnemy: Enemy | null = null, closestDist = Infinity
          for (const e of enemies) {
            const d = p.mesh.position.distanceTo(e.mesh.position)
            if (d < 100 && d < closestDist) { closestDist = d; closestEnemy = e }
          }
          p.target = closestEnemy
        }
        // Track target with strong homing
        if (p.target) {
          const toTarget = new THREE.Vector3().subVectors(p.target.mesh.position, p.mesh.position).normalize()
          const currentDir = p.velocity.clone().normalize()
          // Much stronger turn rate - 8.0 for missiles, 12.0 for drones
          const turnRate = (p.type === 'drone' ? 12.0 : 8.0) * delta
          const newDir = currentDir.lerp(toTarget, Math.min(turnRate, 1))
          const speed = p.velocity.length()
          p.velocity.copy(newDir.normalize().multiplyScalar(speed))
          p.mesh.lookAt(p.mesh.position.clone().add(p.velocity))
          if (p.type === 'missile') p.mesh.rotateX(Math.PI / 2)
        }
      }

      // Plasma has short-range homing to hit enemies near crosshair
      if (p.type === 'plasma' && !p.isEnemy) {
        // Use the target we set when firing, or find nearest if target died
        if (!p.target || !enemies.includes(p.target)) {
          let closestEnemy: Enemy | null = null, closestDist = Infinity
          for (const e of enemies) {
            const d = p.mesh.position.distanceTo(e.mesh.position)
            if (d < 25 && d < closestDist) { closestDist = d; closestEnemy = e }  // Short range
          }
          p.target = closestEnemy
        }
        if (p.target) {
          const toTarget = new THREE.Vector3().subVectors(p.target.mesh.position, p.mesh.position).normalize()
          const currentDir = p.velocity.clone().normalize()
          const turnRate = 5.0 * delta  // Strong homing for accuracy
          const newDir = currentDir.lerp(toTarget, Math.min(turnRate, 1))
          const speed = p.velocity.length()
          p.velocity.copy(newDir.normalize().multiplyScalar(speed))
        }
      }

      p.mesh.position.add(p.velocity.clone().multiplyScalar(delta))

      // Enemy projectile hitting player
      if (p.isEnemy && playerShip && p.mesh.position.distanceTo(playerShip.position) < 1) {
        health -= p.damage; 
        hitFlashTimer = 0.2; // Quick single flash (was 0.5)
        soundManager.playHit()
        createExplosion(p.mesh.position, 0.5); scene.remove(p.mesh)
        if (health <= 0) gameOver()
        return false
      }

      // Player projectile hitting enemies
      if (!p.isEnemy) {
        for (let i = enemies.length - 1; i >= 0; i--) {
          const e = enemies[i], hr = e.type === 'boss' ? 3 : 1.5
          if (p.mesh.position.distanceTo(e.mesh.position) < hr) {
            e.health -= p.damage
            if (e.type === 'boss') bossHealth = e.health

            // Plasma Cannon - AoE damage on impact
            if (p.type === 'plasma') {
              applyPlasmaBlastDamage(p.mesh.position.clone(), p.damage, e)
            }

            // Note: Chain lightning is now instant and handled at fire time, not as a projectile

            if (e.health <= 0) {
              handleEnemyDeath(e)
            }
            scene.remove(p.mesh); return false
          }
        }
      }
      return true
    })
  }

  // Visual effect for chain lightning
  function createLightningArc(from: THREE.Vector3, to: THREE.Vector3) {
    const points: THREE.Vector3[] = []
    const segments = 12 // More segments for smoother look
    const mainColor = 0x00ffff
    const coreColor = 0xffffff

    // Create main bolt
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const point = from.clone().lerp(to, t)
      // Add random offset for zigzag effect (except endpoints)
      if (i > 0 && i < segments) {
        point.x += (Math.random() - 0.5) * 2.5
        point.y += (Math.random() - 0.5) * 2.5
        point.z += (Math.random() - 0.5) * 2.5
      }
      points.push(point)
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ color: mainColor, linewidth: 3 })
    const line = new THREE.Line(geometry, material)
    scene.add(line)

    // Create inner core (brighter, thinner)
    const coreMat = new THREE.LineBasicMaterial({ color: coreColor, linewidth: 1, opacity: 0.8, transparent: true })
    const coreLine = new THREE.Line(geometry.clone(), coreMat)
    scene.add(coreLine)

    // Remove after short time
    setTimeout(() => { 
      scene.remove(line); geometry.dispose(); material.dispose() 
      scene.remove(coreLine); coreMat.dispose()
    }, 150)
  }

  function updateParticles(delta: number) {
    particles = particles.filter(p => {
      p.lifetime -= delta
      if (p.lifetime <= 0) { scene.remove(p.mesh); return false }
      p.mesh.position.add(p.velocity.clone().multiplyScalar(delta))
      p.velocity.multiplyScalar(0.95)
      if (p.scaleGrowth) {
        const growth = 1 + p.scaleGrowth * delta
        p.mesh.scale.multiplyScalar(growth)
      }
      ;(p.mesh.material as THREE.MeshBasicMaterial).opacity = p.lifetime / p.maxLifetime
      return true
    })
  }

  function updatePowerUps(delta: number) {
    if (!playerShip) return

    // Clear expired alert (after 2 seconds)
    if (powerUpAlert && Date.now() - powerUpAlert.timestamp > 2000) {
      powerUpAlert = null
    }

    powerUps = powerUps.filter(p => {
      p.mesh.rotation.y += delta * 2; p.mesh.rotation.x += delta
      if (playerShip!.position.distanceTo(p.mesh.position) < 3) {  // 50% larger collision radius
        // Trigger flashing alert
        const alertInfo = powerUpNames[p.type]
        powerUpAlert = { message: alertInfo.name, color: alertInfo.color, timestamp: Date.now() }
        soundManager.playPowerUp()

        if (p.type === 'health') { health = Math.min(health + 50, 100); soundManager.playPowerUp() }
        else if (p.type === 'ammo') { 
          // Refill current weapon to max
          const currentWep = weaponInventory[currentWeaponIndex]
          if (currentWep.type !== 'laser') {
             const max = weaponMaxAmmo[currentWep.type]
             currentWep.ammo = max === -1 ? -1 : max
             weaponInventory = weaponInventory // Trigger reactivity
          }
          soundManager.playPowerUp() 
        }
        else if (p.type === 'weapon-missile') addWeaponAndSelect('missile', 5, 'Missiles')
        else if (p.type === 'weapon-plasma') addWeaponAndSelect('plasma', 5, 'Plasma Cannon')
        else if (p.type === 'weapon-chain') addWeaponAndSelect('chain', 8, 'Chain Lightning')
        else if (p.type === 'weapon-drone') addWeaponAndSelect('drone', 3, 'Drone Swarm')
        else if (p.type === 'weapon-scatter') addWeaponAndSelect('scatter', 15, 'Scatter Shot')
        else if (p.type === 'boost') { boostCharges++ }
        scene.remove(p.mesh); return false
      }
      return true
    })
  }

  function flashSelectedWeapon() {
    const weapon = weaponInventory[currentWeaponIndex]
    if (!weapon) return
    const color = weaponFlashColors[weapon.type] ?? '#ffffaa'
    const isOut = weapon.ammo === 0
    const message = isOut ? `${weapon.name.toUpperCase()} OUT OF AMMO` : `${weapon.name.toUpperCase()} READY`
    powerUpAlert = { message, color: isOut ? '#ff4444' : color, timestamp: Date.now() }
  }

  // Weapon inventory limits
  const weaponMaxAmmo: Record<Weapon['type'], number> = {
    laser: -1,      // Unlimited
    missile: 8,
    chain: 4,
    plasma: 4,
    drone: 3,
    scatter: 10
  }

  function refillCurrentWeapon(amount: number) {
    const weapon = weaponInventory[currentWeaponIndex]
    if (!weapon) return
    const maxAmmo = weaponMaxAmmo[weapon.type]
    if (maxAmmo === undefined || maxAmmo === -1) {
      // Unlimited or unknown weapons don't need refills
      weaponInventory = weaponInventory
      return
    }
    const updatedAmmo = Math.min(maxAmmo, weapon.ammo + amount)
    weaponInventory = weaponInventory.map((w, i) => i === currentWeaponIndex ? { ...w, ammo: updatedAmmo } : w)
  }

  function addWeapon(type: WeaponType, ammo: number, name: string) {
    const existing = weaponInventory.find(w => w.type === type)
    const maxAmmo = weaponMaxAmmo[type]
    
    if (existing) {
      if (existing.ammo !== -1) {
        // Cap at max ammo
        existing.ammo = Math.min(existing.ammo + ammo, maxAmmo)
      }
    } else {
      // New weapon - cap initial ammo at max
      const initialAmmo = maxAmmo === -1 ? -1 : Math.min(ammo, maxAmmo)
      weaponInventory.push({ type, ammo: initialAmmo, name })
    }
    weaponInventory = weaponInventory
    soundManager.playPowerUp()
  }
  
  // Add weapon and reorder inventory to select it next
  function addWeaponAndSelect(type: WeaponType, ammo: number, name: string) {
    const existingIndex = weaponInventory.findIndex(w => w.type === type)
    const maxAmmo = weaponMaxAmmo[type]

    if (existingIndex !== -1) {
      // Weapon exists: Max out ammo and move to next slot
      weaponInventory[existingIndex].ammo = maxAmmo === -1 ? -1 : maxAmmo
      
      // Move to position after current weapon
      const weapon = weaponInventory.splice(existingIndex, 1)[0]
      weaponInventory.splice(currentWeaponIndex + 1, 0, weapon)
    } else {
      // New weapon: Max out ammo and add after current weapon
      const initialAmmo = maxAmmo === -1 ? -1 : maxAmmo
      weaponInventory.splice(currentWeaponIndex + 1, 0, { type, ammo: initialAmmo, name })
    }
    weaponInventory = weaponInventory
    
    soundManager.playPowerUp()
  }


  async function levelUp() {
    if (isLoadingLevel || showLevelComplete) return
    isLoadingLevel = true
    showLevelComplete = true

    // Update nextLevelScore IMMEDIATELY to prevent re-triggering
    level++
    nextLevelScore = level * 1000
    
    // Set level name for flash display
    // If we have a map name, use it, otherwise generic
    const mapName = shuffledMapQueue.length > 0 ? shuffledMapQueue[currentMapIndex].name : `Sector ${level}`
    currentLevelName = mapName.toUpperCase()

    await new Promise(r => setTimeout(r, 2000))
    await new Promise(r => setTimeout(r, 2000))
    // showLevelComplete = false // REMOVED: Keep overlay up until map is loaded
    // Slower difficulty scaling: increase enemy count every 2 levels
    if (level % 2 === 0) {
      gameConfig.enemyCount = Math.min(gameConfig.enemyCount + 1, 15)
    }
    gameConfig.enemySpeed *= 1.05
    gameConfig.enemyFireRate = Math.max(gameConfig.enemyFireRate * 0.95, 800)
    gameConfig.enemyFireRate = Math.max(gameConfig.enemyFireRate * 0.95, 800)
    health = Math.min(health + 30, 100)

    // Reset player position logic moved to end of function to prevent visual glitch

    // Reset weapons each level (player starts fresh with just laser)
    weaponInventory = [{ type: 'laser', ammo: -1, name: 'Laser Cannon' }]
    currentWeaponIndex = 0
    
    // Give player one boost charge at start of each level
    boostCharges = 1

    // Clear existing solid objects before loading new level
    solidObjects.forEach(obj => scene.remove(obj))
    solidObjects = []
    
    // Clear existing power-ups to prevent compounding
    powerUps.forEach(p => scene.remove(p.mesh))
    powerUps = []

    // Determine next map data from shuffled queue
    let mapData: MapData | null = null
    
    console.log(`=== LEVEL ${level} MAP SELECTION ===`)
    console.log(`shuffledMapQueue.length: ${shuffledMapQueue.length}`)
    console.log(`currentMapIndex: ${currentMapIndex}`)
    
    if (shuffledMapQueue.length > 0) {
      // Use the next map in the shuffled queue
      mapData = shuffledMapQueue[currentMapIndex]
      console.log(`✓ Selected map: "${mapData.name}" with ${mapData.objects?.length || 0} objects`)
      currentMapIndex = (currentMapIndex + 1) % shuffledMapQueue.length
      console.log(`  Next index will be: ${currentMapIndex}/${shuffledMapQueue.length}`)
      
      // If we've cycled through all maps, reshuffle for variety
      if (currentMapIndex === 0) {
        console.log('🔄 Reshuffling map queue for next cycle')
        for (let i = shuffledMapQueue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledMapQueue[i], shuffledMapQueue[j]] = [shuffledMapQueue[j], shuffledMapQueue[i]]
        }
      }
    } else {
      // No saved maps, use procedural generation
      console.warn(`⚠ Level ${level}: No maps in queue, using procedural generation`)
      mapData = await generateInfiniteLevel()
    }

    // Identify required models for the new level
    const requiredModels = new Set<string>()
    // Always include player ship (it's already loaded, but good for completeness in cache)
    requiredModels.add(selectedSpaceship.path)
    
    if (mapData) {
      mapData.objects.forEach(obj => requiredModels.add(obj.modelPath))
    }

    // Preload only the required models for the NEW level
    loadingStatus = "Loading next sector..."
    await preloadModels(Array.from(requiredModels))

    // Load the map
    if (mapData) {
      // Load the map data into the scene
      await loadMap(mapData)
    } else {
      // Should not happen with new logic, but fallback
      await createDefaultMap()
    }

    // Reposition player to safe location
    const spawnPos = findSafeSpawnPosition()
    if (playerShip) {
      playerShip.position.copy(spawnPos)
      playerShip.rotation.set(0, 0, 0)
      playerShip.lookAt(0, 0, 0)
      velocity.set(0, 0, 0)
      shipYaw = 0
      shipPitch = 0
      smoothedSway = 0
      
      // Force camera snap HERE, after final position is set
      cameraInitialized = false
      const camDistance = 10
      const camHeight = 5
      const camX = playerShip.position.x + Math.sin(shipYaw) * camDistance
      const camY = playerShip.position.y + camHeight
      const camZ = playerShip.position.z + Math.cos(shipYaw) * camDistance
      smoothedCameraPos.set(camX, camY, camZ)
      camera.position.copy(smoothedCameraPos)
      camera.lookAt(playerShip.position)
    }

    spawnWave()
    
    // Spawn initial weapon power-ups based on settings
    spawnInitialWeaponDrops(gameConfig.initialPowerUps)

    showLevelComplete = false
    isLoadingLevel = false
  }

  // Find a safe spawn position away from objects
  function findSafeSpawnPosition(): THREE.Vector3 {
    const maxAttempts = 20
    const spawnHeight = 20
    const minDistFromObjects = 10

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const angle = Math.random() * Math.PI * 2
      const dist = 20 + Math.random() * 50
      const testPos = new THREE.Vector3(
        Math.cos(angle) * dist,
        spawnHeight,
        Math.sin(angle) * dist
      )

      // Check distance from all solid objects
      let isSafe = true
      for (const obj of solidObjects) {
        const objPos = new THREE.Vector3()
        obj.getWorldPosition(objPos)
        if (testPos.distanceTo(objPos) < minDistFromObjects) {
          isSafe = false
          break
        }
      }

      if (isSafe) return testPos
    }

    // Fallback to center if no safe spot found
    return new THREE.Vector3(0, spawnHeight, 0)
  }

  async function startGame() {
    // Save initial config state to restore on game over
    initialGameConfigState = { ...gameConfig }

    // Initialize audio context on user interaction
    if (soundManager && soundManager.ctx && soundManager.ctx.state === 'suspended' && soundEnabled) {
      soundManager.ctx.resume()
    }
    
    showMapSelector = false
    isSpawning = true  // Show loading screen
    hasStartedGame = true
    isGameOver = false
    score = 0; level = 1; health = gameConfig.startingHealth; kills = 0; nextLevelScore = 1000
    isBossLevel = false; bossEnemy = null; bossHealth = 0; bossMaxHealth = 0
    weaponInventory = [{ type: 'laser', ammo: -1, name: 'Laser Cannon' }]; currentWeaponIndex = 0
    boostCharges = 1; boostActive = false; boostEndTime = 0
    continuousMotion = { x: 0, y: 0 }; movementSamples = []; lastMovementTime = 0; isFingerOnTrackpad = false
    gameConfig.mouseInput = 'auto'; detectedInputType = 'unknown'
    killsSinceLastDrop = 0
    velocity.set(0, 0, 0)
    bankAngle = 0
    barrelRollAngle = 0
    shipYaw = 0
    shipPitch = -Math.PI / 4  // Face down towards center from (0,100,100)
    
    // Create shuffled map queue for this game session
    console.log('=== CREATING MAP QUEUE ===')
    console.log(`availableMaps.length: ${availableMaps.length}`)
    console.log(`customMaps.length: ${customMaps.length}`)
    console.log(`builtInMaps.length: ${builtInMaps.length}`)
    
    if (availableMaps.length > 0) {
      // Shuffle the available maps using Fisher-Yates algorithm
      shuffledMapQueue = [...availableMaps]
      for (let i = shuffledMapQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledMapQueue[i], shuffledMapQueue[j]] = [shuffledMapQueue[j], shuffledMapQueue[i]]
      }
      currentMapIndex = 0
      console.log(`✓ Created shuffled map queue with ${shuffledMapQueue.length} maps:`)
      shuffledMapQueue.forEach((m, i) => console.log(`  ${i + 1}. "${m.name}" - ${m.objects?.length || 0} objects`))
    } else {
      shuffledMapQueue = []
      currentMapIndex = 0
      console.warn('⚠ No maps available! Will use procedural generation')
      console.log('This might happen if:')
      console.log('  1. No maps are tagged for "starship flyer" or "all"')
      console.log('  2. Maps failed to load from localStorage or /3d-maps/')
    }
    
    // Low health warning state
    lowHealthOpacity = 0
    lastHealth = gameConfig.startingHealth
    flashTimer = 0
    hitFlashTimer = 0

    // Clean up old game objects
    enemies.forEach(e => scene.remove(e.mesh)); enemies = []
    projectiles.forEach(p => scene.remove(p.mesh)); projectiles = []
    powerUps.forEach(p => scene.remove(p.mesh)); powerUps = []
    particles.forEach(p => scene.remove(p.mesh)); particles = []
    if (playerShip) { scene.remove(playerShip); playerShip = null }
    solidObjects.forEach(o => scene.remove(o)); solidObjects = []

    // Load map data first to determine assets
    let mapData: MapData | null = null
    if (selectedMap) {
      mapData = selectedMap
    } else {
      mapData = await getDefaultMapData()
    }

    // Identify required models
    const requiredModels = new Set<string>()
    // Always include player ship
    requiredModels.add(selectedSpaceship.path)
    
    if (mapData) {
      mapData.objects.forEach(obj => requiredModels.add(obj.modelPath))
    }

    // Preload only the required models
    await preloadModels(Array.from(requiredModels))

    // Load the map into the scene
    if (mapData) {
      // If it's the default map, use createDefaultMap with the data
      // If it's a selected map, use loadMap
      if (selectedMap) await loadMap(mapData)
      else await createDefaultMap(mapData)
    } else {
      // Fallback if no map data found
      await createDefaultMap()
    }

    // Apply environment settings from map
    if (mapData && mapData.environment) {
      timeOfDay = mapData.environment.timeOfDay
      weather = mapData.environment.weather
      updateEnvironment()
    } else {
      // Default for fallback map
      timeOfDay = 'night'
      weather = 'clear'
      updateEnvironment()
    }

    // Find safe spawn position - Force specific start position: 1 grid away (Z=100), high up (Y=100), looking at center
    const spawnPos = new THREE.Vector3(0, 100, 100)

    // Load player ship at safe position
    await loadPlayerShipAtPosition(spawnPos)

    // Ensure everything is ready before hiding loading screen
    // Wait a frame to let renderer catch up
    await new Promise(r => requestAnimationFrame(r))
    
    // Short delay for loading screen to ensure smooth transition
    await new Promise(r => setTimeout(r, 500))

    // Hide loading screen BEFORE starting gameplay
    isSpawning = false
    
    // Now start the game
    isPlaying = true
    spawnWave()
    
    // Spawn initial weapon power-ups based on settings
    spawnInitialWeaponDrops(gameConfig.initialPowerUps)

    // Power-ups only drop from enemies
    renderer.domElement.requestPointerLock()
  }

  async function loadPlayerShipAtPosition(position: THREE.Vector3) {
    const loader = new GLTFLoader()
    try {
      const gltf = await loader.loadAsync(selectedSpaceship.path)
      playerShip = new THREE.Group()
      const model = gltf.scene
      model.scale.setScalar(shipScale)
      model.rotation.y = Math.PI
      model.traverse(child => { if (child instanceof THREE.Mesh) { child.castShadow = true } })
      playerShip.add(model)
      playerShip.add(new THREE.PointLight(0x00ffff, 2, 10))
      scene.add(playerShip)
      playerShip.position.copy(position)

      // Reset camera state
      cameraInitialized = false
      const camOffset = new THREE.Vector3(0, 5, 10)
      smoothedCameraPos.copy(position).add(camOffset)
      camera.position.copy(smoothedCameraPos)
      camera.lookAt(position)
    } catch (error) {
      console.error('Failed to load ship:', error)
      createFallbackShipAtPosition(position)
    }
  }

  function createFallbackShipAtPosition(position: THREE.Vector3) {
    playerShip = new THREE.Group()
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 4), new THREE.MeshStandardMaterial({ color: 0x2266ff, metalness: 0.8, emissive: 0x1144aa, emissiveIntensity: 0.3 }))
    body.rotation.x = Math.PI / 2
    body.scale.setScalar(shipScale * 3)
    playerShip.add(body)
    scene.add(playerShip)
    playerShip.position.copy(position)

    cameraInitialized = false
    const camOffset = new THREE.Vector3(0, 5, 10)
    smoothedCameraPos.copy(position).add(camOffset)
    camera.position.copy(smoothedCameraPos)
    camera.lookAt(position)
  }

  function gameOver() {
    isPlaying = false
    isGameOver = true
    document.exitPointerLock()
    
    // Restore initial config state
    if (initialGameConfigState) {
      gameConfig = { ...initialGameConfigState }
    }
  }

  // Restart game (resets map and spawns at new location)
  async function restartGame() {
    await startGame()
  }

  function animate() {
    animationId = requestAnimationFrame(animate)
    const delta = Math.min(clock.getDelta(), 0.1)
    if (isPlaying) {
      updatePlayer(delta); updateEnemies(delta); updateProjectiles(delta); updateParticles(delta); updatePowerUps(delta)
      animateWeather(delta)
      if (enemies.length === 0 && !isLoadingLevel && !showLevelComplete) { if (score >= nextLevelScore) levelUp(); else spawnWave() }
    }
    renderer?.render(scene, camera)
  }

  function updateEnvironment() {
    console.log('updateEnvironment called', { timeOfDay, weather })
    if (!scene) {
      console.log('Scene not ready')
      return
    }

    try {
      // Sky gradients for different times of day
      const skyGradients = {
        dawn: {
          colors: ['#001f3f', '#0074D9', '#FFDC00', '#FFD700'], // Deep blue to yellow/gold
          fogColor: 0xFFDC00,
          ambientIntensity: 0.6,
          directionalIntensity: 0.8
        },
        day: {
          colors: ['#39CCCC', '#7FDBFF', '#0074D9', '#001f3f'], // Inversed: Light/Medium to Deep blues
          fogColor: 0xB0E0E6,
          ambientIntensity: 0.8,
          directionalIntensity: 1.0
        },
        sunset: {
          colors: ['#2c0b4a', '#85144b', '#FF4136', '#FFDC00'], // Purple/Red to Orange/Yellow
          fogColor: 0xFF851B,
          ambientIntensity: 0.6,
          directionalIntensity: 0.8
        },
        night: {
          colors: ['#151515', '#151515', '#151515', '#151515'], // Dark gray for better visibility
          fogColor: 0x151515,
          ambientIntensity: 0.9, // Even brighter for building visibility
          directionalIntensity: 1.0
        }
      }

      const gradient = skyGradients[timeOfDay]
      if (!gradient) {
        console.error('Invalid timeOfDay:', timeOfDay)
        return
      }

      // Create sky gradient or starscape
      // Remove existing background texture if any
      scene.background = null
      
      // Clear any existing stars
      const existingStars = scene.children.filter(c => c.name === 'starfield')
      existingStars.forEach(s => scene.remove(s))

      // Helper to adjust color brightness
      const adjustBrightness = (hex: string, factor: number) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        
        const newR = Math.min(255, Math.max(0, Math.round(r * factor)))
        const newG = Math.min(255, Math.max(0, Math.round(g * factor)))
        const newB = Math.min(255, Math.max(0, Math.round(b * factor)))
        
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
      }

      // Determine brightness multiplier based on time of day
      let brightnessMultiplier = 1.0
      if (weather !== 'clear') {
        if (timeOfDay === 'dawn') brightnessMultiplier = 0.6
        else if (timeOfDay === 'day') brightnessMultiplier = 1.0
        else if (timeOfDay === 'sunset') brightnessMultiplier = 0.5
        else if (timeOfDay === 'night') brightnessMultiplier = 0.2
      }

      // Handle weather overrides for sky
      if (weather === 'fog') {
        const baseColor = '#ffffff'
        const color = adjustBrightness(baseColor, brightnessMultiplier)
        scene.background = new THREE.Color(color)
      } else if (weather === 'rain') {
        // Dark gray gradient for rain
        const canvas = document.createElement("canvas")
        canvas.width = 512
        canvas.height = 512
        const context = canvas.getContext("2d")!
        
        const col1 = adjustBrightness('#1a1a1a', brightnessMultiplier)
        const col2 = adjustBrightness('#4a4a4a', brightnessMultiplier)

        const canvasGradient = context.createLinearGradient(0, 0, 0, canvas.height)
        canvasGradient.addColorStop(0, col1) // Dark gray
        canvasGradient.addColorStop(1, col2) // Lighter gray
        context.fillStyle = canvasGradient
        context.fillRect(0, 0, canvas.width, canvas.height)
        
        const texture = new THREE.CanvasTexture(canvas)
        scene.background = texture
      } else if (weather === 'snow') {
        // Dark gray gradient for snow (slightly lighter than rain)
        const canvas = document.createElement("canvas")
        canvas.width = 512
        canvas.height = 512
        const context = canvas.getContext("2d")!
        
        const col1 = adjustBrightness('#2a2a2a', brightnessMultiplier)
        const col2 = adjustBrightness('#5a5a5a', brightnessMultiplier)

        const canvasGradient = context.createLinearGradient(0, 0, 0, canvas.height)
        canvasGradient.addColorStop(0, col1) // Slightly lighter dark gray
        canvasGradient.addColorStop(1, col2) // Slightly lighter gray
        context.fillStyle = canvasGradient
        context.fillRect(0, 0, canvas.width, canvas.height)
        
        const texture = new THREE.CanvasTexture(canvas)
        scene.background = texture
      } else if (timeOfDay === 'night') {
        scene.background = new THREE.Color(0x151515) // Dark gray
        console.log('Creating starfield...')
        createStarfield()
        console.log('Starfield created.')
      } else {
        const canvas = document.createElement("canvas")
        canvas.width = 512
        canvas.height = 512
        const context = canvas.getContext("2d")!
        
        const canvasGradient = context.createLinearGradient(0, 0, 0, canvas.height)
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
      
      if (weather === 'fog') {
        fogNear = 10
        fogFar = 215 // Less dense fog (was 160)
      } else if (weather === 'rain') {
        fogFar = 200
      } else if (weather === 'snow') {
        fogFar = 200
      } else if (weather === 'clear') {
        fogFar = 300 // See everything
        
        // Night mode should have very distant fog to avoid darkening objects too much
        if (timeOfDay === 'night') {
          fogFar = 800
        }
      }

      // Use white fog for 'fog' weather, otherwise use sky color
      // For rain and snow, use a lighter, whiter fog
      let fogColorHex = 0x000000
      if (weather === 'fog') {
        fogColorHex = 0xffffff
      } else if (weather === 'rain') {
        fogColorHex = 0x888888 // Medium grey for rain
      } else if (weather === 'snow') {
        fogColorHex = 0xaaaaaa // Light grey for snow
      } else {
        fogColorHex = gradient.fogColor
      }

      // Apply brightness multiplier to fog color if weather is active
      if (weather !== 'clear') {
        const r = (fogColorHex >> 16) & 255
        const g = (fogColorHex >> 8) & 255
        const b = fogColorHex & 255
        
        const newR = Math.min(255, Math.max(0, Math.round(r * brightnessMultiplier)))
        const newG = Math.min(255, Math.max(0, Math.round(g * brightnessMultiplier)))
        const newB = Math.min(255, Math.max(0, Math.round(b * brightnessMultiplier)))
        
        fogColorHex = (newR << 16) | (newG << 8) | newB
      }
      
      scene.fog = new THREE.Fog(fogColorHex, fogNear, fogFar)

      // Update weather particles
      updateWeatherParticles()

      // Update lighting
      const ambientLight = scene.children.find(c => c instanceof THREE.AmbientLight) as THREE.AmbientLight
      const directionalLight = scene.children.find(c => c instanceof THREE.DirectionalLight) as THREE.DirectionalLight

      if (ambientLight) {
        let intensity = gradient.ambientIntensity
        // Weather overrides for brightness
        if (weather !== 'clear') {
          if (timeOfDay === 'dawn') intensity = 0.5
          else if (timeOfDay === 'day') intensity = 0.7
          else if (timeOfDay === 'sunset') intensity = 0.4
          else if (timeOfDay === 'night') intensity = 0.2
        }
        ambientLight.intensity = intensity
      }
      if (directionalLight) {
        let intensity = gradient.directionalIntensity
        // Weather overrides for brightness
        if (weather !== 'clear') {
          if (timeOfDay === 'dawn') intensity = 0.6
          else if (timeOfDay === 'day') intensity = 0.8
          else if (timeOfDay === 'sunset') intensity = 0.5
          else if (timeOfDay === 'night') intensity = 0.3
        }
        directionalLight.intensity = intensity
      }
    } catch (e) {
      console.error('Error in updateEnvironment:', e)
    }
  }

  // Weather creation functions now use shared module

  function updateWeatherParticles() {
    if (rainSystem) { scene.remove(rainSystem); rainSystem = null }
    if (snowSystem) { scene.remove(snowSystem); snowSystem = null }

    if (weather === 'rain') rainSystem = createRain(scene)
    else if (weather === 'snow') snowSystem = createSnow(scene)
  }

  function animateWeather(delta: number) {
    // Use shared weather animation function
    const center = playerShip ? playerShip.position : new THREE.Vector3(0, 0, 0)
    animateWeatherShared(delta, rainSystem, snowSystem, center)
  }
</script>

<svelte:head>
  <title>Starship Flyer</title>
  <meta name="description" content="Fly a starship and shoot enemies" />
  <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"></script>
</svelte:head>

<div class="flex h-screen overflow-hidden">
<div bind:this={container} class="relative flex-1 h-screen overflow-hidden">
  {#if showMapSelector}
    <!-- Background -->
    <div class="absolute inset-0 z-30 bg-base-200"></div>
    <div class="absolute inset-0 z-30 p-4 flex flex-col">
      <!-- Header with title and start button -->
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-4xl font-bold" style="color: #660460;">🚀 Starship Flyer</h1>
        <button class="btn text-white border-0 hover:opacity-90" style="background-color: #660460;" on:click={startGame}>
          Launch Mission
        </button>
      </div>

      <!-- Main content area with center setup and right sidebar -->
      <div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        <!-- Center content - Game Setup -->
        <div class="flex-1 flex justify-center overflow-y-auto">
          <div class="max-w-4xl w-full pb-8 my-auto">
            <!-- Ship Selection -->
          <div class="bg-white rounded-lg p-6 mb-6 border-2 border-gray-200 shadow-lg">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Select Your Ship</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            {#each spaceshipOptions as ship}
              <button
                class="card bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 cursor-pointer border-2 {selectedSpaceship.id === ship.id ? 'border-yellow-500 ring-2 ring-yellow-400' : 'border-yellow-300 hover:border-yellow-500'} shadow-lg hover:shadow-xl"
                on:click={() => selectedSpaceship = ship}
              >
                <div class="card-body p-3">
                  <div class="w-full h-24 rounded mb-2 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-yellow-300">
                    <canvas class="ship-preview-{ship.id} w-full h-full"></canvas>
                  </div>
                  <h4 class="font-bold text-sm text-gray-900 text-center">{ship.name}</h4>
                </div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Select a Map -->
        <div class="bg-white rounded-lg p-6 mb-6 border-2 border-gray-200 shadow-lg">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-2xl font-bold text-gray-900">Select a Map</h3>
            <a class="text-blue-600 font-semibold underline text-sm" href="/world-builder">
              Build a Map →
            </a>
          </div>

          <!-- Horizontal scrolling map carousel -->
          <div class="relative">
            <!-- Left Arrow -->
            <button
              class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg -ml-2 transition-all"
              on:click={() => {
                const container = document.getElementById('map-carousel')
                if (container) container.scrollBy({ left: -220, behavior: 'smooth' })
              }}
            >
              <span class="text-xl font-bold">‹</span>
            </button>


            <!-- Map Cards Container -->
            <div
              id="map-carousel"
              class="flex gap-4 overflow-x-auto scroll-smooth px-8 py-2"
              style="scrollbar-width: none; -ms-overflow-style: none;"
            >
              {#if mapsLoading}
                <!-- Loading Placeholder Cards -->
                {#each [1, 2, 3] as i}
                  <div class="flex-shrink-0 w-52 card bg-gray-100 border-2 border-gray-300 shadow-lg">
                    <div class="card-body p-3">
                      <div class="w-full h-24 rounded mb-2 bg-gray-200 flex items-center justify-center animate-pulse">
                        <div class="loading loading-spinner loading-md text-gray-400"></div>
                      </div>
                      <div class="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div class="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                {/each}
              {:else}
                <!-- Default Map - Always First -->
                <button
                  class="flex-shrink-0 w-52 card bg-green-50 hover:bg-green-100 transition-all duration-200 cursor-pointer border-2 {selectedMap === null ? 'border-green-500 ring-2 ring-green-400' : 'border-green-300 hover:border-green-500'} shadow-lg hover:shadow-xl"
                  on:click={() => selectedMap = null}
                >
                  <div class="card-body p-3">
                    <div class="w-full h-24 rounded mb-2 overflow-hidden bg-gradient-to-br from-green-700 to-blue-800 flex items-center justify-center border border-green-300">
                      {#if defaultMapThumbnail}
                        <img src={defaultMapThumbnail} alt="Default Map" class="w-full h-full object-cover" />
                      {:else}
                        <div class="text-3xl opacity-70">🌍</div>
                      {/if}
                    </div>
                    <h4 class="font-bold text-sm text-gray-900 truncate">Default Map</h4>
                    <div class="text-xs text-gray-500">Procedural</div>
                  </div>
                </button>

              <!-- Custom Maps -->
              {#each customMaps as map}
                <button
                  class="flex-shrink-0 w-52 card bg-purple-50 hover:bg-purple-100 transition-all duration-200 cursor-pointer border-2 {selectedMap?.id === map.id ? 'border-purple-500 ring-2 ring-purple-400' : 'border-purple-300 hover:border-purple-500'} shadow-lg hover:shadow-xl"
                  on:click={() => selectedMap = map}
                >
                  <div class="card-body p-3">
                    <div class="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded">Custom</div>
                    <div class="w-full h-24 rounded mb-2 overflow-hidden bg-purple-100 flex items-center justify-center border border-purple-300">
                      {#if map.thumbnail}
                        <img src={map.thumbnail} alt={map.name} class="w-full h-full object-cover" />
                      {:else}
                        <div class="text-3xl opacity-50">🗺️</div>
                      {/if}
                    </div>
                    <h4 class="font-bold text-sm text-gray-900 truncate">{map.name}</h4>
                    <div class="text-xs text-gray-500 truncate">{map.stats.objectCount} objects</div>
                  </div>
                </button>
              {/each}

              <!-- Built-in Maps -->
              {#each builtInMaps as map}
                <button
                  class="flex-shrink-0 w-52 card bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 cursor-pointer border-2 {selectedMap?.id === map.id ? 'border-yellow-500 ring-2 ring-yellow-400' : 'border-yellow-300 hover:border-yellow-500'} shadow-lg hover:shadow-xl"
                  on:click={() => selectedMap = map}
                >
                  <div class="card-body p-3">
                    <div class="absolute top-2 right-2 bg-yellow-500 text-gray-900 text-xs px-2 py-0.5 rounded">Built-in</div>
                    <div class="w-full h-24 rounded mb-2 overflow-hidden bg-yellow-100 flex items-center justify-center border border-yellow-300">
                      {#if map.thumbnail}
                        <img src={map.thumbnail} alt={map.name} class="w-full h-full object-cover" />
                      {:else}
                        <div class="text-3xl opacity-50">🗺️</div>
                      {/if}
                    </div>
                    <h4 class="font-bold text-sm text-gray-900 truncate">{map.name}</h4>
                    <div class="text-xs text-gray-500 truncate">{map.stats.objectCount} objects</div>
                  </div>
                </button>
              {/each}
              {/if}
            </div>

            <!-- Right Arrow -->
            <button
              class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg -mr-2 transition-all"
              on:click={() => {
                const container = document.getElementById('map-carousel')
                if (container) container.scrollBy({ left: 220, behavior: 'smooth' })
              }}
            >
              <span class="text-xl font-bold">›</span>
            </button>
          </div>
        </div>

        <!-- Difficulty Settings (matching Blocky Shooter) -->
        <div class="bg-white rounded-lg p-6 mb-6 border-2 border-gray-200 shadow-lg">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Difficulty & Settings</h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              class="btn {gameConfig.difficulty === 'easy' ? 'btn-success' : 'btn-outline'}"
              on:click={() => applyDifficultyPreset('easy')}
            >
              Easy
              <div class="text-xs">More health, slower enemies</div>
            </button>
            <button
              class="btn {gameConfig.difficulty === 'normal' ? 'btn-warning' : 'btn-outline'}"
              on:click={() => applyDifficultyPreset('normal')}
            >
              Normal
              <div class="text-xs">Balanced gameplay</div>
            </button>
            <button
              class="btn {gameConfig.difficulty === 'hard' ? 'btn-error' : 'btn-outline'}"
              on:click={() => applyDifficultyPreset('hard')}
            >
              Hard
              <div class="text-xs">Faster enemies, less health</div>
            </button>
          </div>

          <!-- Sound Toggle -->
          <div class="form-control mb-6">
            <label class="label cursor-pointer justify-start gap-4">
              <span class="label-text text-lg font-bold text-gray-900">Sound Effects</span>
              <input type="checkbox" class="toggle toggle-primary" checked={soundEnabled} on:change={(e) => {
                soundEnabled = e.currentTarget.checked
                soundManager.toggle(soundEnabled)
              }} />
            </label>
          </div>

          <!-- Auto-Move Speed -->
          <div class="mb-4">
            <label class="label text-sm font-semibold">Auto-Move Speed</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                class="btn btn-sm {gameConfig.autoMoveSpeed === 'off' ? 'btn-neutral' : 'btn-outline'}"
                on:click={() => gameConfig.autoMoveSpeed = 'off'}
              >Off</button>
              <button
                class="btn btn-sm {gameConfig.autoMoveSpeed === 'slow' ? 'btn-info' : 'btn-outline'}"
                on:click={() => gameConfig.autoMoveSpeed = 'slow'}
              >Slow</button>
              <button
                class="btn btn-sm {gameConfig.autoMoveSpeed === 'medium' ? 'btn-primary' : 'btn-outline'}"
                on:click={() => gameConfig.autoMoveSpeed = 'medium'}
              >Medium</button>
              <button
                class="btn btn-sm {gameConfig.autoMoveSpeed === 'hyper' ? 'btn-error' : 'btn-outline'}"
                on:click={() => gameConfig.autoMoveSpeed = 'hyper'}
              >Hyper</button>
            </div>
          </div>

          <!-- Power-up Frequency -->
          <div class="mb-4">
            <label class="label text-sm font-semibold">Power-up Drops</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                class="btn btn-sm {gameConfig.powerUpFrequency === 'sparse' ? 'btn-warning' : 'btn-outline'}"
                on:click={() => gameConfig.powerUpFrequency = 'sparse'}
              >
                Sparse
                <div class="text-xs opacity-70">Every 3 kills</div>
              </button>
              <button
                class="btn btn-sm {gameConfig.powerUpFrequency === 'normal' ? 'btn-primary' : 'btn-outline'}"
                on:click={() => gameConfig.powerUpFrequency = 'normal'}
              >
                Normal
                <div class="text-xs opacity-70">Every 2 kills</div>
              </button>
              <button
                class="btn btn-sm {gameConfig.powerUpFrequency === 'carnage' ? 'btn-error' : 'btn-outline'}"
                on:click={() => gameConfig.powerUpFrequency = 'carnage'}
              >
                Carnage
                <div class="text-xs opacity-70">Every kill</div>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-left">
            <div>
              <label class="label text-xs">Starting Health: {gameConfig.startingHealth}</label>
              <input type="range" min="50" max="200" bind:value={gameConfig.startingHealth} class="range range-xs range-accent" />
            </div>
            <div>
              <label class="label text-xs">Enemy Count: {gameConfig.enemyCount}</label>
              <input type="range" min="1" max="15" bind:value={gameConfig.enemyCount} class="range range-xs range-secondary" />
            </div>
            <div>
              <label class="label text-xs">Enemy Speed: {gameConfig.enemySpeed.toFixed(1)}</label>
              <input type="range" min="4" max="20" step="0.5" bind:value={gameConfig.enemySpeed} class="range range-xs range-primary" />
            </div>
            <div>
              <label class="label text-xs">Player Damage: {gameConfig.playerDamage}</label>
              <input type="range" min="10" max="50" bind:value={gameConfig.playerDamage} class="range range-xs range-info" />
            </div>
            <div>
              <label class="label text-xs">Enemy Fire Rate: {gameConfig.enemyFireRate}ms</label>
              <input type="range" min="500" max="3000" step="250" bind:value={gameConfig.enemyFireRate} class="range range-xs range-error" />
            </div>
            <div>
              <label class="label text-xs">Enemy Level Multiplier: {gameConfig.enemyLevelMultiplier}x</label>
              <input type="range" min="0" max="5" step="1" bind:value={gameConfig.enemyLevelMultiplier} class="range range-xs range-warning" />
            </div>
            <div>
              <label class="label text-xs">Mouse Sensitivity: {gameConfig.mouseSensitivity.toFixed(1)}</label>
              <input type="range" min="0.5" max="2.0" step="0.1" bind:value={gameConfig.mouseSensitivity} class="range range-xs range-warning" />
            </div>
            <div>
              <label class="label text-xs">Initial Power Ups: {gameConfig.initialPowerUps}</label>
              <input type="range" min="0" max="10" step="1" bind:value={gameConfig.initialPowerUps} class="range range-xs range-accent" />
            </div>
          </div>
        </div>
          </div>
        </div>

        <!-- Right Sidebar - Controls & Info -->
        <div class="w-full lg:w-1/4 flex flex-col gap-4 lg:min-w-[280px] overflow-y-auto">
          <!-- Controls Card -->
          <div class="card bg-white shadow-xl">
            <div class="card-body p-4">
              <h3 class="font-semibold mb-2 text-sm">Controls:</h3>
              <ul class="space-y-1 text-xs">
                <li><kbd class="kbd kbd-sm">W/S</kbd> - Forward/Back</li>
                <li><kbd class="kbd kbd-sm">A/D</kbd> - Strafe Left/Right</li>
                <li><kbd class="kbd kbd-sm">Mouse</kbd> - Aim</li>
                <li><kbd class="kbd kbd-sm">Shift/Click</kbd> - Fire</li>
                <li><kbd class="kbd kbd-sm">Space</kbd> - Boost</li>
                <li><kbd class="kbd kbd-sm">Q/E</kbd> - Barrel Roll / Dodge</li>
                <li><kbd class="kbd kbd-sm">↑/↓ or 1-5</kbd> - Switch Weapons</li>
                <li><kbd class="kbd kbd-sm">ESC</kbd> - Pause</li>
              </ul>
            </div>
          </div>

          <!-- Power-Ups Card -->
          <div class="card bg-white shadow-xl">
            <div class="card-body p-4">
              <h3 class="font-semibold mb-2 text-sm">Power-Ups:</h3>
              <ul class="space-y-3 text-xs">
                <li class="flex items-center"><div class="w-6 h-6 flex items-center justify-center mr-3"><svg viewBox="0 0 24 24" class="w-5 h-5 text-red-500 fill-current shadow-[0_0_10px_rgba(239,68,68,0.4)]"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg></div> Health - Restore hull</li>
                <li class="flex items-center"><div class="w-6 h-6 flex items-center justify-center mr-3"><span class="inline-block w-4 h-4 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span></div> Ammo - Add ammo to selected weapon</li>
                <li class="flex items-center">
                  <div class="w-6 h-6 flex items-center justify-center mr-3">
                    <div class="flex flex-col items-center scale-75">
                      <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] border-b-cyan-400 mb-[1px]"></div>
                      <div class="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[10px] border-b-cyan-400 mb-[1px]"></div>
                      <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-cyan-400"></div>
                    </div>
                  </div>
                  Boost - Speed burst
                </li>
                <li class="flex items-center"><div class="w-6 h-6 flex items-center justify-center mr-3"><span class="inline-block w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px] border-b-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]"></span></div> Missiles - Homing rockets</li>
                <li class="flex items-center">
                  <div class="w-6 h-6 flex items-center justify-center mr-3">
                    <div class="flex gap-[2px]">
                      <div class="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.6)]"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.6)]"></div>
                      <div class="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.6)]"></div>
                    </div>
                  </div>
                  Scatter - High-velocity shards
                </li>
                <li class="flex items-center">
                  <div class="w-6 h-6 flex items-center justify-center mr-3">
                    <div class="flex gap-[2px]">
                      <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-lime-500 shadow-[0_0_5px_rgba(132,204,22,0.6)]"></div>
                      <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-lime-500 shadow-[0_0_5px_rgba(132,204,22,0.6)]"></div>
                      <div class="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-lime-500 shadow-[0_0_5px_rgba(132,204,22,0.6)]"></div>
                    </div>
                  </div>
                  Drone - Autonomous ally
                </li>
                <li class="flex items-center"><div class="w-6 h-6 flex items-center justify-center mr-3"><svg viewBox="0 0 24 24" class="w-5 h-5 text-gray-400 fill-current"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div> Chain - Arcing lightning</li>
                <li class="flex items-center"><div class="w-6 h-6 flex items-center justify-center mr-3"><span class="inline-block w-4 h-4 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.6)]"></span></div> Plasma - Explosive bolts</li>
              </ul>
            </div>
          </div>

          <!-- Enemies Card -->
          <div class="card bg-white shadow-xl">
            <div class="card-body p-2">
              <h3 class="font-semibold mb-1 text-sm">Enemies:</h3>
              <ul class="grid grid-cols-2 gap-1 text-xs">
                <li class="flex flex-col items-center text-center">
                  <model-viewer src="/3d-models/Enemy-Ships/Enemy-Spaceship-Basic-Red.glb" auto-rotate rotation-per-second="60deg" disable-zoom disable-pan interaction-prompt="none" shadow-intensity="1" environment-image="neutral" style="width: 160px; height: 160px; background-color: transparent;"></model-viewer>
                  <div class="font-bold mt-1">Basic Fighter</div>
                </li>
                <li class="flex flex-col items-center text-center">
                  <model-viewer src="/3d-models/Enemy-Ships/Enemy-Spaceship-Fast-Blue.glb" auto-rotate rotation-per-second="60deg" disable-zoom disable-pan interaction-prompt="none" shadow-intensity="1" environment-image="neutral" style="width: 160px; height: 160px; background-color: transparent;"></model-viewer>
                  <div class="font-bold mt-1">Interceptor</div>
                </li>
                <li class="flex flex-col items-center text-center">
                  <model-viewer src="/3d-models/Enemy-Ships/Enemy-Spaceship-Tank-Orange.glb" auto-rotate rotation-per-second="60deg" disable-zoom disable-pan interaction-prompt="none" shadow-intensity="1" environment-image="neutral" style="width: 160px; height: 160px; background-color: transparent;"></model-viewer>
                  <div class="font-bold mt-1">Tank</div>
                </li>
                <li class="flex flex-col items-center text-center">
                  <model-viewer src="/3d-models/Enemy-Ships/Enemy-Spaceship-Boss.glb" auto-rotate rotation-per-second="60deg" disable-zoom disable-pan interaction-prompt="none" shadow-intensity="1" environment-image="neutral" style="width: 160px; height: 160px; background-color: transparent;"></model-viewer>
                  <div class="font-bold mt-1">Boss</div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Tips Card -->
          <div class="card bg-white shadow-xl">
            <div class="card-body p-4">
              <h3 class="font-semibold mb-2 text-sm">Tips:</h3>
              <p class="text-xs">
                Use barrel rolls to dodge enemy fire! Collect power-ups to stay alive.
                Adjust "Initial Power Ups" to start with a full arsenal.
                Every 5 levels features a boss battle. Watch your hull integrity!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if isGameOver}
    <div class="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
      <div class="text-center text-white space-y-6">
        <h1 class="text-8xl font-bold text-red-500">MISSION FAILED</h1>
        <div class="text-4xl">Score: <span class="text-yellow-400">{score}</span></div>
        <div class="text-3xl">Level: <span class="text-cyan-400">{level}</span></div>
        <div class="text-2xl">Kills: <span class="text-orange-400">{kills}</span></div>
        <div class="flex gap-4 justify-center mt-8">
          <button class="btn btn-error btn-lg text-xl px-8" on:click={startGame}>RETRY</button>
          <button class="btn btn-ghost btn-lg text-xl px-8" on:click={() => { showMapSelector = true; isGameOver = false }}>MENU</button>
        </div>
      </div>
    </div>
  {/if}

  {#if showLevelComplete}
    <div class="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
      <div class="text-center text-white animate-bounce">
        <div class="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">LEVEL {level - 1}</div>
        <div class="text-6xl font-bold text-green-400 mt-4">COMPLETE!</div>
        {#if currentLevelName}
          <div class="text-4xl font-bold text-blue-300 mt-6 animate-pulse tracking-widest">NEXT UP: {currentLevelName}</div>
        {/if}
        <div class="text-3xl mt-4">Score: {score}</div>
      </div>
    </div>
  {/if}

  {#if isSpawning}
    <div class="absolute inset-0 z-30 flex items-center justify-center bg-black/90">
      <div class="text-center text-white space-y-4">
        <div class="text-4xl font-bold animate-pulse">LAUNCHING...</div>
        <div class="w-64 h-4 bg-gray-800 rounded-full overflow-hidden mb-2">
          <div class="h-full bg-cyan-400 transition-all duration-200" style="width: {loadingProgress}%"></div>
        </div>
        <div class="text-xl text-cyan-400">{loadingStatus}</div>
      </div>
    </div>
  {/if}

  {#if isPlaying && !isGameOver && !showLevelComplete && !isSpawning}
    <div 
      class="absolute top-4 left-4 text-white font-bold z-10 bg-black/70 p-4 rounded-lg space-y-2 border-2 transition-colors duration-100"
      class:border-cyan-500={health >= 20}
      class:border-red-500={health < 20}
      style="
        {health < 10 ? `background-color: rgba(${100 + lowHealthOpacity * 100}, 0, 0, 0.7);` : ''}
        {health < 20 ? `box-shadow: 0 0 ${10 + lowHealthOpacity * 20}px rgba(255, 0, 0, 0.5);` : ''}
      "
    >
      <div class="text-2xl text-yellow-400">Score: {score}</div>
      <div class="text-xl">Level: {level} {#if isBossLevel}<span class="text-red-400 animate-pulse">⚡ BOSS ⚡</span>{/if}</div>
      <div class="text-xl">Kills: {kills}</div>
      <div class="mt-2"><div class="text-sm text-red-400">HULL: {Math.floor(health)}%</div><div class="w-48 bg-gray-700 h-3 rounded-full overflow-hidden"><div class="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all" style="width: {Math.max(0, health)}%"></div></div></div>
      {#if isBossLevel && bossEnemy && bossMaxHealth > 0}
        <div class="mt-2 pt-2 border-t border-red-500"><div class="text-sm text-purple-400">BOSS</div><div class="w-48 bg-gray-700 h-3 rounded-full overflow-hidden"><div class="bg-gradient-to-r from-purple-600 to-pink-500 h-full transition-all" style="width: {Math.max(0, (bossHealth / bossMaxHealth) * 100)}%"></div></div></div>
      {/if}
      <div class="mt-2 pt-2 border-t border-cyan-500"><div class="text-sm opacity-80">WEAPONS</div>{#each weaponInventory as w, i}<div class="text-sm {i === currentWeaponIndex ? 'text-yellow-400 font-bold' : 'opacity-60'}">{i + 1}. {w.name} {w.ammo === -1 ? '∞' : `(${w.ammo})`}</div>{/each}</div>
    </div>
    <!-- Fixed centered crosshair -->
    <div class="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
      <div class="relative w-8 h-8">
        <div class="absolute w-full h-0.5 bg-cyan-400 top-1/2 -translate-y-1/2 shadow-lg shadow-cyan-400/50"></div>
        <div class="absolute h-full w-0.5 bg-cyan-400 left-1/2 -translate-x-1/2 shadow-lg shadow-cyan-400/50"></div>
        <div class="absolute w-2 h-2 border-2 border-cyan-400 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
    <!-- Flashing power-up alert -->
    {#if powerUpAlert}
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-20">
        <div class="text-4xl font-bold power-up-flash px-8 py-4 rounded-lg"
             style="color: {powerUpAlert.color}; text-shadow: 0 0 20px {powerUpAlert.color}, 0 0 40px {powerUpAlert.color}; background: rgba(0,0,0,0.7);">
          {powerUpAlert.message}
        </div>
      </div>
    {/if}
    <div class="absolute top-4 right-4 text-white font-bold z-10 bg-black/70 p-4 rounded-lg border-2 border-red-500"><div class="text-xl text-red-400">HOSTILES</div><div class="text-4xl text-center">{enemies.length}</div></div>
    <div class="absolute bottom-4 left-4 text-white font-bold z-10 bg-black/70 p-4 rounded-lg border-2 border-cyan-500">
      <div class="text-sm">SPEED</div>
      <div class="w-32 bg-gray-700 h-3 rounded-full overflow-hidden">
        <div class="h-full transition-all {boostActive ? 'bg-gradient-to-r from-yellow-400 to-red-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}" 
             style="width: {Math.min(100, (currentSpeed / maxSpeed) * 100)}%">
        </div>
      </div>
    </div>
    
    <!-- Boost Indicator - Bottom Center -->
    {#if boostCharges > 0 && !boostActive}
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-bold z-10 bg-black/70 p-3 rounded-lg border-2 border-cyan-500 animate-pulse">
        <div class="text-lg text-cyan-400 text-center">BOOST READY</div>
      </div>
    {:else if boostActive}
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-bold z-10 bg-black/70 p-3 rounded-lg border-2 border-yellow-400">
        <div class="text-lg text-yellow-400 text-center animate-pulse">BOOST ACTIVE!</div>
      </div>
    {/if}
    <!-- Power-up/Weapon Status -->
    <div class="absolute bottom-4 right-4 text-white font-bold z-10 bg-black/70 p-4 rounded-lg border-2 border-yellow-500">
      <div class="text-sm text-yellow-400 mb-2">POWER-UPS</div>
      <div class="flex gap-3">
        {#each weaponInventory as w, i}
          <div class="text-center {i === currentWeaponIndex ? 'ring-2 ring-yellow-400 rounded p-1' : 'p-1 opacity-70'}">
            {#if w.type === 'laser'}
              <div class="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold">L</div>
            {:else if w.type === 'missile'}
              <div class="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-xs text-black font-bold">M</div>
            {:else if w.type === 'plasma'}
              <div class="w-8 h-8 rounded-full bg-fuchsia-500 flex items-center justify-center text-xs font-bold">P</div>
            {:else if w.type === 'chain'}
              <div class="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">
                <!-- Chain Link Icon -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white">
                  <path fill-rule="evenodd" d="M19.902 4.098a3.75 3.75 0 00-5.304 0l-4.5 4.5a3.75 3.75 0 001.035 6.037.75.75 0 01-.646 1.353 5.25 5.25 0 01-1.449-8.45l4.5-4.5a5.25 5.25 0 117.424 7.424l-1.757 1.757a.75.75 0 11-1.06-1.06l1.757-1.757a3.75 3.75 0 000-5.304zm-7.389 4.267a.75.75 0 011-.353 5.25 5.25 0 011.449 8.45l-4.5 4.5a5.25 5.25 0 11-7.424-7.424l1.757-1.757a.75.75 0 111.06 1.06l-1.757 1.757a3.75 3.75 0 105.304 5.304l4.5-4.5a3.75 3.75 0 00-1.035-6.037.75.75 0 01-.354-1z" clip-rule="evenodd" />
                </svg>
              </div>
            {:else if w.type === 'drone'}
              <div class="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center text-xs text-black font-bold">D</div>
            {:else if w.type === 'scatter'}
              <div class="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">S</div>
            {/if}
            <div class="text-xs mt-1">{w.ammo === -1 ? '∞' : w.ammo}</div>
          </div>
        {/each}
        <!-- Boost Charges -->
        <div class="text-center p-1 {boostActive ? 'ring-2 ring-cyan-400 rounded animate-pulse' : ''}">
          <div class="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold">
            <!-- Thunderbolt Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-white">
              <path fill-rule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="text-xs mt-1">{boostCharges}</div>
        </div>
      </div>
      <div class="text-xs text-gray-400 mt-2">↑↓ weapons | Space boost</div>
    </div>
  {/if}

  {#if !isPlaying && hasStartedGame && !isGameOver && !showMapSelector}
    <div class="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
      <div class="text-center text-white space-y-6">
        <h1 class="text-6xl font-bold">PAUSED</h1>
        <button class="btn btn-primary btn-lg text-xl px-8" on:click={() => { isPlaying = true; renderer.domElement.requestPointerLock() }}>RESUME</button>
        <button class="btn btn-warning btn-lg text-xl px-8 block mx-auto" on:click={startGame}>RESTART</button>
        <button class="btn btn-ghost btn-lg text-xl px-8 block mx-auto" on:click={() => showMapSelector = true}>MENU</button>
      </div>
    </div>
  {/if}
</div>

  <!-- Loading Overlay -->
  {#if isLoading}
    <div class="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
      <div class="mb-4 text-2xl font-bold text-primary">Starship Flyer</div>
      <div class="w-64 h-4 bg-gray-800 rounded-full overflow-hidden mb-2">
        <div class="h-full bg-accent transition-all duration-200" style="width: {loadingProgress}%"></div>
      </div>
      <div class="text-sm text-gray-400">{loadingStatus}</div>
    </div>
  {/if}


  <!-- Full Screen Low Health Warning Overlay -->
  {#if isPlaying && !isGameOver && (health <= 30 || hitFlashTimer > 0)}
    <div 
      class="fixed inset-0 z-[100] pointer-events-none transition-colors duration-100"
      style="
        {(health <= 10 || hitFlashTimer > 0) ? `background-color: rgba(255, 0, 0, ${Math.min((hitFlashTimer > 0 ? 0.4 : lowHealthOpacity * 0.3), 0.5)});` : ''}
        box-shadow: inset 0 0 {100 + (hitFlashTimer > 0 ? 1 : lowHealthOpacity) * 50}px rgba(255, 0, 0, {0.5 + Math.min((hitFlashTimer > 0 ? 1 : lowHealthOpacity) * 0.5, 0.5)});
        border: {16 * ((health <= 10 || hitFlashTimer > 0) ? 1 : Math.min(lowHealthOpacity, 1))}px solid rgba(220, 38, 38, {(health <= 10 || hitFlashTimer > 0) ? 1 : Math.min(lowHealthOpacity, 1)});
      "
    ></div>
  {/if}
</div>

<style>
  .power-up-flash {
    animation: flashPulse 0.3s ease-in-out infinite alternate;
  }

  @keyframes flashPulse {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.1); opacity: 0.8; }
  }
</style>
