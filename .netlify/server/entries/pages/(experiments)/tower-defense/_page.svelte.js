import { a1 as head, a0 as attr, X as attr_class, $ as ensure_array_like, a4 as attr_style, Z as stringify } from "../../../../chunks/index2.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const GRID_SIZE = 40;
    const GRID_WIDTH = 20;
    const GRID_HEIGHT = 15;
    const CANVAS_WIDTH = GRID_WIDTH * GRID_SIZE;
    const CANVAS_HEIGHT = GRID_HEIGHT * GRID_SIZE;
    const DEFAULT_CONFIG = {
      // 💰 Economy Settings
      startingMoney: 200,
      startingHealth: 20,
      levelCompletionBonus: 100,
      // Extra money for beating a level
      keepMoneyBetweenLevels: false,
      // Set to true to not reset money
      // 🌊 Wave & Level Progression
      wavesPerLevel: 5,
      baseEnemyCount: 5,
      // Starting count for wave 1
      enemyCountPerWave: 3,
      // Add this many enemies per wave (5 + wave * 3)
      // ⏱️ Spawn Timing
      baseSpawnInterval: 1500,
      // ms between enemy spawns on wave 1
      spawnIntervalDecrease: 100,
      // Decrease by this much per wave
      minSpawnInterval: 1e3,
      // Never spawn faster than this
      // 👾 Enemy Difficulty Scaling
      enemyHealthPerWave: 0.2,
      // Multiply by (1 + (wave-1) * THIS) - 0.2 = 20% per wave
      enemySpeedPerLevel: 0.15,
      // Multiply by THIS per level - use 0.10 for additive, 1.15 for multiplicative
      enemySpeedScalingType: "multiplicative",
      // "additive" or "multiplicative"
      // 👾 Enemy Base Speeds
      baseEnemySpeed: 2.2,
      // Basic enemy speed
      fastEnemySpeed: 4.4,
      // Fast enemy speed
      tankEnemySpeed: 1.1,
      // Tank enemy speed
      // 🎲 Enemy Spawn Probabilities (must add up to 1.0)
      enemySpawnWeights: {
        basic: 0.6,
        // 60% chance
        fast: 0.3,
        // 30% chance
        tank: 0.1
        // 10% chance
      },
      // 🏰 Tower Quantities Per Level
      towerQuantities: {
        basic: 5,
        sniper: 2,
        blast: 4,
        laser: 2,
        freeze: 3,
        missile: 1
      },
      // 🗼 Tower Persistence
      clearTowersBetweenLevels: true,
      // Set to false to keep towers between levels
      // 🗼 Tower Power Multipliers
      towerDamageMultiplier: 1,
      // Multiply all tower damage by this
      towerRangeMultiplier: 1,
      // Multiply all tower range by this
      // ⚡ Special Mechanics
      warpSpeedMultiplier: 10,
      // Fast-forward speed when no action needed
      freezeSlowPercent: 0.5,
      // 0.5 = 50% slow
      freezeDuration: 5e3,
      // ms
      // 💣 Splash Damage Radii
      blastRadius: 60,
      missileRadius: 120,
      // ✈️ Air Attack Settings
      airAttackWave: 5,
      // Which wave number triggers air attack (every 5 waves)
      airAttackRefundPercent: 0.5
      // 50% refund on destroyed tower
    };
    function loadConfig() {
      if (typeof localStorage !== "undefined") {
        const saved = localStorage.getItem("towerDefenseConfig");
        if (saved) {
          try {
            return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
          } catch (e) {
            return { ...DEFAULT_CONFIG };
          }
        }
      }
      return { ...DEFAULT_CONFIG };
    }
    let GAME_CONFIG = loadConfig();
    let gameRunning = false;
    let health = GAME_CONFIG.startingHealth;
    let money = GAME_CONFIG.startingMoney;
    let wave = 0;
    let score = 0;
    let selectedTowerType = null;
    let randomizePath = true;
    let secondEntrance = false;
    let soundEnabled = true;
    let airAttackEnabled = true;
    let level = 1;
    let towerQuantities = { ...GAME_CONFIG.towerQuantities };
    const pathPatterns = [
      // Pattern 1 (Original)
      [
        { x: 0, y: 7 },
        { x: 5, y: 7 },
        { x: 5, y: 3 },
        { x: 10, y: 3 },
        { x: 10, y: 11 },
        { x: 15, y: 11 },
        { x: 15, y: 7 },
        { x: 20, y: 7 }
      ],
      // Pattern 2 (Zigzag)
      [
        { x: 0, y: 4 },
        { x: 7, y: 4 },
        { x: 7, y: 10 },
        { x: 13, y: 10 },
        { x: 13, y: 4 },
        { x: 20, y: 4 }
      ],
      // Pattern 3 (S-curve)
      [
        { x: 0, y: 10 },
        { x: 5, y: 10 },
        { x: 5, y: 5 },
        { x: 10, y: 5 },
        { x: 10, y: 10 },
        { x: 15, y: 10 },
        { x: 15, y: 5 },
        { x: 20, y: 5 }
      ],
      // Pattern 4 (U-shape)
      [
        { x: 0, y: 3 },
        { x: 10, y: 3 },
        { x: 10, y: 12 },
        { x: 20, y: 12 }
      ],
      // Pattern 5 (Spiral-like)
      [
        { x: 0, y: 7 },
        { x: 8, y: 7 },
        { x: 8, y: 3 },
        { x: 12, y: 3 },
        { x: 12, y: 11 },
        { x: 20, y: 11 }
      ]
    ];
    const getSecondaryPathForPrimary = (primaryPath) => {
      const mergeIndex = Math.floor(primaryPath.length / 2);
      const mergePoint = primaryPath[mergeIndex];
      return [
        // Pattern 1 (From top, merges with main path)
        [
          { x: mergePoint.x - 3, y: 0 },
          { x: mergePoint.x - 3, y: mergePoint.y },
          mergePoint
        ],
        // Pattern 2 (From bottom, merges with main path)
        [
          { x: mergePoint.x + 3, y: 15 },
          { x: mergePoint.x + 3, y: mergePoint.y },
          mergePoint
        ],
        // Pattern 3 (From top right, merges with main path)
        [
          { x: mergePoint.x + 5, y: 0 },
          { x: mergePoint.x + 5, y: mergePoint.y - 2 },
          { x: mergePoint.x, y: mergePoint.y - 2 },
          mergePoint
        ]
      ];
    };
    getSecondaryPathForPrimary(pathPatterns[0]);
    const towerTypes = {
      basic: {
        name: "Basic Tower",
        emoji: "🔵",
        cost: 50,
        damage: 10,
        range: 120,
        fireRate: 800,
        color: "#3b82f6",
        // Blue
        description: "Balanced tower"
      },
      sniper: {
        name: "Sniper Tower",
        emoji: "🎯",
        cost: 120,
        damage: 30,
        range: 200,
        fireRate: 1500,
        color: "#a855f7",
        // Purple (changed for distinction)
        description: "Long range, slow fire"
      },
      blast: {
        name: "Blast Tower",
        emoji: "💥",
        cost: 75,
        damage: 25,
        range: 100,
        fireRate: 1250,
        color: "#f59e0b",
        // Orange
        description: "Area damage"
      },
      laser: {
        name: "Laser Tower",
        emoji: "⚡",
        cost: 150,
        damage: 3,
        range: 150,
        fireRate: 100,
        color: "#10b981",
        // Green (changed from cyan for distinction)
        description: "15 burst shots, 2s reload"
      },
      freeze: {
        name: "Freeze Tower",
        emoji: "❄️",
        cost: 90,
        damage: 0,
        range: 160,
        fireRate: 2500,
        color: "#06b6d4",
        // Cyan
        description: "Slows 50%, 5s duration"
      },
      missile: {
        name: "Missile Tower",
        emoji: "🚀",
        cost: 200,
        damage: 40,
        range: 250,
        fireRate: 1500,
        color: "#dc2626",
        // Red
        description: "Massive damage (70%)"
      }
    };
    head("r02n2f", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>🗼 Tower Assault | Dougie's Game Hub</title>`);
      });
    });
    $$renderer2.push(`<div class="h-[calc(100vh-2rem)] p-4 flex flex-col"><div class="flex justify-between items-center mb-4"><h1 class="text-4xl font-bold" style="color: #660460;">🗼 Tower Assault</h1> <div class="flex gap-2">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="btn text-white border-0 hover:opacity-90" style="background-color: #660460;">Start Game</button>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0"><div class="flex-1 flex items-center justify-center min-w-0"><div class="card bg-white shadow-xl"><div class="card-body p-4"><div class="relative"><canvas${attr("width", CANVAS_WIDTH)}${attr("height", CANVAS_HEIGHT)} class="rounded-lg max-w-full max-h-full svelte-r02n2f"></canvas> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div></div> <div class="w-full lg:w-1/4 flex flex-col gap-4 lg:min-w-[280px] lg:overflow-y-auto lg:max-h-full"><div class="card bg-white shadow-xl"><div class="card-body p-4"><div class="stats stats-vertical lg:stats-horizontal shadow w-full overflow-visible flex-wrap"><div class="stat py-2 px-2 min-w-0"><div class="stat-title text-xs">Health</div> <div class="stat-value text-lg lg:text-xl text-error">${escape_html(health)}</div></div> <div class="stat py-2 px-2 min-w-0"><div class="stat-title text-xs">Money</div> <div class="stat-value text-lg lg:text-xl text-success">$${escape_html(money)}</div></div> <div class="stat py-2 px-2 min-w-0"><div class="stat-title text-xs">Wave</div> <div class="stat-value text-lg lg:text-xl text-info">${escape_html(wave)}</div></div> <div class="stat py-2 px-2 min-w-0"><div class="stat-title text-xs">Level</div> <div class="stat-value text-lg lg:text-xl text-warning">${escape_html(level)}</div></div> <div class="stat py-2 px-2 min-w-0"><div class="stat-title text-xs">Score</div> <div class="stat-value text-lg lg:text-xl">${escape_html(score)}</div></div></div></div></div> <div class="card bg-white shadow-xl"><div class="card-body"><h2 class="card-title" style="color: #660460;">Settings</h2> <div class="space-y-4"><div class="mb-2"><span class="label-text font-semibold">Options</span></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Sound Effects</span> <input type="checkbox" class="checkbox"${attr("checked", soundEnabled, true)}/></label></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Randomize Road Pattern</span> <input type="checkbox" class="checkbox"${attr("checked", randomizePath, true)}${attr("disabled", gameRunning, true)}/></label></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Second Enemy Entrance</span> <input type="checkbox" class="checkbox"${attr("checked", secondEntrance, true)}${attr("disabled", gameRunning, true)}/></label></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Air Attack</span> <input type="checkbox" class="checkbox"${attr("checked", airAttackEnabled, true)}${attr("disabled", gameRunning, true)}/></label></div> <div class="divider my-2"></div> <div class="form-control"><label class="label"><span class="label-text font-semibold">Enemy Speed</span></label> <div class="flex gap-2"><button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameRunning, true)}>Slow (0.5x)</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-warning")}`)}${attr("disabled", gameRunning, true)}>Normal (1x)</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameRunning, true)}>Fast (1.5x)</button></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="divider">Select Tower to Place</div> <div class="grid grid-cols-1 gap-2"><!--[-->`);
    const each_array = ensure_array_like(Object.entries(towerTypes).sort(([, a], [, b]) => a.cost - b.cost));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [key, tower] = each_array[$$index];
      const quantity = towerQuantities[key];
      const isSelected = selectedTowerType === key;
      $$renderer2.push(`<button${attr_class(`btn btn-block justify-start text-left ${stringify(isSelected ? "btn-success" : "")}`)}${attr_style(isSelected ? "background-color: #15803d; border-color: #15803d; color: white;" : `background-color: ${tower.color}; border-color: ${tower.color}; color: white;`)}${attr("disabled", !gameRunning, true)}><div class="flex justify-between items-center w-full gap-2 p-2"><div class="flex items-center gap-2"><span class="font-bold">${escape_html(tower.emoji)} ${escape_html(tower.name)}</span> <span class="text-xs opacity-90">- ${escape_html(tower.description)}</span></div> <div class="flex gap-2 items-center flex-shrink-0"><span>$${escape_html(tower.cost)}</span> `);
      if (quantity > 0) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<span class="badge badge-sm">${escape_html(quantity)} left</span>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div></div></button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="divider"></div> <div><h3 class="font-semibold mb-2">How to Play:</h3> <ul class="list-disc list-inside space-y-1 text-sm"><li>Start the game and then start each wave</li> <li>Select a tower type and click to place it</li> <li>Towers automatically shoot enemies in range</li> <li>Don't let enemies reach the end of the path</li> <li>Earn money by defeating enemies</li> <li>Complete ${escape_html(GAME_CONFIG.wavesPerLevel)} waves to advance a level</li> <li>Enemy speed increases ${escape_html(GAME_CONFIG.enemySpeedScalingType === "multiplicative" ? (GAME_CONFIG.enemySpeedPerLevel * 100).toFixed(0) + "%" : GAME_CONFIG.enemySpeedPerLevel + "x")} each level</li></ul></div></div></div></div> <div class="card bg-white shadow-xl"><div class="card-body"><button class="flex justify-between items-center w-full text-left hover:bg-base-300 -m-2 p-2 rounded-lg transition-colors"${attr("disabled", gameRunning, true)}><h2 class="card-title" style="color: #660460;">⚙️ Game Configuration</h2> <span class="text-sm">${escape_html("▶ Show")}</span></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div></div></div>`);
  });
}
export {
  _page as default
};
