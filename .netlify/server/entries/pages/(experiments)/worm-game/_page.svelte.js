import { a1 as head, a4 as attr_style, $ as ensure_array_like, X as attr_class, a0 as attr, Z as stringify } from "../../../../chunks/index2.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let wallMode = "solid";
    let gridSize = "small";
    let backgroundTheme = "trippy";
    let showGridDots = false;
    let soundEnabled = true;
    let powerUpsEnabled = true;
    let enabledPowerUps = { invincible: true, diet: true, binge: true, turtle: true };
    let enabledObstacles = { ruler: true, lightning: true, cow: true };
    let gameStarted = false;
    let score = 0;
    let highScore = 0;
    let worm = [{ x: 10, y: 10 }];
    let food = [{ x: 15, y: 10 }];
    let powerUps = [];
    let invincibleUntil = 0;
    let rainbowZoom = 0;
    const BOARD_WIDTH = 800;
    const BOARD_HEIGHT = 608;
    function getGridWidth() {
      switch (gridSize) {
        case "small":
          return 25;
        case // Fewer cells (larger cells: 32px)
        "medium":
          return 40;
        case // Medium cells (20px)
        "large":
          return 50;
      }
    }
    function getGridHeight() {
      switch (gridSize) {
        case "small":
          return 19;
        case // Fewer cells (larger cells: 32px)
        "medium":
          return 30;
        case // Medium cells (~20px)
        "large":
          return 38;
      }
    }
    function getCellSize() {
      switch (gridSize) {
        case "small":
          return 32;
        case // Larger cells, fewer of them
        "medium":
          return 20;
        case // Medium cells
        "large":
          return 16;
      }
    }
    const ROYGBIV = [
      "#FF0000",
      // Red
      "#FF7F00",
      // Orange
      "#FFFF00",
      // Yellow
      "#00FF00",
      // Green
      "#0000FF",
      // Blue
      "#4B0082",
      // Indigo
      "#9400D3"
      // Violet
    ];
    function getRainbowColor(segmentIndex, wormLength) {
      if (wormLength < 7) {
        return ROYGBIV[segmentIndex] || ROYGBIV[0];
      } else {
        if (segmentIndex === 0) return ROYGBIV[0];
        if (segmentIndex === wormLength - 1) return ROYGBIV[6];
        const position = segmentIndex / (wormLength - 1);
        const colorIndex = position * 6;
        return ROYGBIV[Math.round(colorIndex)];
      }
    }
    function getSegmentColor(segmentIndex, wormLength) {
      const now = Date.now();
      const isInvincible = invincibleUntil > now;
      if (isInvincible) {
        {
          const alpha = 0.3 - segmentIndex / wormLength * 0.1;
          return `rgba(255, 255, 255, ${alpha})`;
        }
      }
      return getRainbowColor(segmentIndex, wormLength);
    }
    function getFoodColor() {
      return "transparent";
    }
    function getBackgroundStyle() {
      switch (backgroundTheme) {
        case "trippy":
          const centerHue = rainbowZoom * 2.7 % 360;
          const stops = [];
          for (let i = 0; i <= 6; i++) {
            const position = i * (100 / 6);
            const hue = (centerHue + i * 270 / 6) % 360;
            stops.push(`hsl(${hue}, 85%, 45%) ${position}%`);
          }
          return `radial-gradient(circle at center, ${stops.join(", ")})`;
        case "radial":
          const radialMorph = Math.sin(rainbowZoom * Math.PI / 50) * 0.5 + 0.5;
          const centerBrightness = Math.floor(5 + radialMorph * 55);
          const edgeBrightness = Math.floor(30 + radialMorph * 70);
          return `radial-gradient(ellipse ${Math.floor(100 + Math.sin(rainbowZoom * Math.PI / 33) * 40)}% ${Math.floor(100 + Math.cos(rainbowZoom * Math.PI / 33) * 40)}% at ${50 + Math.sin(rainbowZoom * Math.PI / 40) * 20}% ${50 + Math.cos(rainbowZoom * Math.PI / 40) * 20}%, rgb(${centerBrightness}, ${centerBrightness}, ${centerBrightness}) 0%, rgb(${edgeBrightness}, ${edgeBrightness}, ${edgeBrightness}) 100%)`;
        case "deepspace":
          const spaceMorph = Math.sin(rainbowZoom * Math.PI / 50) * 0.5 + 0.5;
          const angle = rainbowZoom * 1.8 % 360;
          const blue1 = Math.floor(0 + spaceMorph * 20);
          const blue2 = Math.floor(51 + spaceMorph * 30);
          const midBlue = Math.floor(26 + spaceMorph * 51);
          return `linear-gradient(${angle}deg, rgb(0, 0, ${blue1}) 0%, rgb(0, ${midBlue}, ${blue2}) 50%, rgb(0, 0, ${blue1}) 100%)`;
      }
    }
    function getCellBackground(isWorm, isFood) {
      if (isWorm || isFood) return "transparent";
      return "transparent";
    }
    const animalEmojis = [
      "🐭",
      "🐹",
      "🐰",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐸",
      "🐵",
      "🐔",
      "🐧",
      "🐦",
      "🐤"
    ];
    function getRandomAnimal() {
      return animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
    }
    head("uzhc4r", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>🐍 Snake-adelic | Dougie's Game Hub</title>`);
      });
    });
    $$renderer2.push(`<div class="h-[calc(100vh-2rem)] p-4 flex flex-col"><div class="flex justify-between items-center mb-4"><h1 class="text-4xl font-bold" style="color: #660460;">🐍 Snake-adelic</h1> <div class="flex gap-2">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="btn text-white border-0 hover:opacity-90" style="background-color: #660460;">${escape_html("Start Game")}</button>`);
    }
    $$renderer2.push(`<!--]--> <button class="btn btn-outline">Reset</button></div></div> <div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0"><div class="flex-1 flex items-center justify-center min-w-0"><div class="card bg-white shadow-xl relative"><div class="card-body p-4"><div class="game-board svelte-uzhc4r"${attr_style(` width: ${stringify(BOARD_WIDTH)}px; height: ${stringify(BOARD_HEIGHT)}px; display: grid; grid-template-columns: repeat(${stringify(getGridWidth())}, ${stringify(getCellSize())}px); grid-template-rows: repeat(${stringify(getGridHeight())}, ${stringify(getCellSize())}px); gap: 0px; background: ${stringify(getBackgroundStyle())}; border: 3px solid #374151; border-radius: 8px; `)}><!--[-->`);
    const each_array = ensure_array_like(Array(getGridWidth() * getGridHeight()).fill(0).map((_, i) => i));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let i = each_array[$$index];
      const x = i % getGridWidth();
      const y = Math.floor(i / getGridWidth());
      const wormSegmentIndex = worm.findIndex((segment) => segment.x === x && segment.y === y);
      const isWorm = wormSegmentIndex >= 0;
      const foodIndex = food.findIndex((f) => f.x === x && f.y === y);
      const isFood = foodIndex >= 0;
      const powerUp = powerUps.find((pu) => pu.x === x && pu.y === y);
      $$renderer2.push(`<div class="cell svelte-uzhc4r"${attr_style(` background: ${stringify(isWorm ? getSegmentColor(wormSegmentIndex, worm.length) : isFood ? getFoodColor() : getCellBackground(isWorm, isFood))}; border-radius: ${stringify("2px")}; display: flex; align-items: center; justify-content: center; font-size: ${stringify(getCellSize() * 0.75)}px; `)}>`);
      if (isFood) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`${escape_html(getRandomAnimal())}`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (powerUp) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`${escape_html(powerUp.emoji)}`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="w-full lg:w-1/4 flex flex-col gap-4 lg:min-w-[280px]"><div class="card bg-white shadow-xl"><div class="card-body p-4"><div class="stats stats-vertical lg:stats-horizontal shadow w-full overflow-visible flex-wrap"><div class="stat py-2 px-2 min-w-0"><div class="stat-title text-xs">Score</div> <div class="stat-value text-lg lg:text-xl text-primary">${escape_html(score)}</div></div> <div class="stat py-2 px-2 min-w-0"><div class="stat-title text-xs">High Score</div> <div class="stat-value text-lg lg:text-xl text-secondary">${escape_html(highScore)}</div></div></div></div></div> <div class="card bg-white shadow-xl flex-1 lg:overflow-y-auto lg:max-h-full"><div class="card-body"><h2 class="card-title" style="color: #660460;">Settings</h2> <div class="space-y-4"><div class="form-control"><label class="label"><span class="label-text font-semibold">Speed</span></label> <div class="flex gap-2"><button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameStarted, true)}>Slow</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-warning")}`)}${attr("disabled", gameStarted, true)}>Normal</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameStarted, true)}>Fast</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameStarted, true)}>Insane</button></div></div> <div class="form-control"><label class="label"><span class="label-text font-semibold">Grid Size</span></label> <div class="flex gap-2"><button${attr_class(`btn btn-xs flex-1 ${stringify("btn-success")}`)}${attr("disabled", gameStarted, true)}>Small</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameStarted, true)}>Medium</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameStarted, true)}>Large</button></div></div> <div class="divider my-2"></div> <div class="mb-2"><span class="label-text font-semibold">Options</span></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Wraparound Walls</span> <input type="checkbox" class="checkbox"${attr("checked", wallMode === "wraparound", true)}${attr("disabled", gameStarted, true)}/></label></div> <div class="form-control"><label class="label"><span class="label-text">Background</span></label> `);
    $$renderer2.select(
      {
        class: "select select-bordered select-sm",
        value: backgroundTheme
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "trippy" }, ($$renderer4) => {
          $$renderer4.push(`Trippy (Rainbow Shift)`);
        });
        $$renderer3.option({ value: "radial" }, ($$renderer4) => {
          $$renderer4.push(`Radial (Gray Gradient)`);
        });
        $$renderer3.option({ value: "deepspace" }, ($$renderer4) => {
          $$renderer4.push(`Deep Space (Blue)`);
        });
      }
    );
    $$renderer2.push(`</div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Show Grid Dots</span> <input type="checkbox" class="checkbox"${attr("checked", showGridDots, true)}/></label></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Sound Effects</span> <input type="checkbox" class="checkbox"${attr("checked", soundEnabled, true)}/></label></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text font-semibold">Power-Ups</span> <input type="checkbox" class="checkbox checkbox-primary"${attr("checked", powerUpsEnabled, true)}${attr("disabled", gameStarted, true)}/></label></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="divider my-2"></div> <div class="form-control ml-6"><label class="label"><span class="label-text text-sm font-semibold">Enabled Power-Ups</span></label> <div class="flex flex-col gap-2"><label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.invincible, true)}${attr("disabled", gameStarted, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">⭐ Invincible</span> <span class="label-text text-xs opacity-70">No self-collision for 5s</span></div></label> <label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.diet, true)}${attr("disabled", gameStarted, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">💊 Diet</span> <span class="label-text text-xs opacity-70">Cut length in half</span></div></label> <label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.binge, true)}${attr("disabled", gameStarted, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">🍪 Binge</span> <span class="label-text text-xs opacity-70">Add 5 extra food items</span></div></label> <label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.turtle, true)}${attr("disabled", gameStarted, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">🐢 Turtle</span> <span class="label-text text-xs opacity-70">Slow down by 20% for 5s</span></div></label></div></div> <div class="divider my-2"></div> <div class="form-control ml-6"><label class="label"><span class="label-text text-sm font-semibold">Obstacles</span></label> <div class="flex flex-col gap-2"><label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledObstacles.ruler, true)}${attr("disabled", gameStarted, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">📏 Ruler</span> <span class="label-text text-xs opacity-70">Grow by 1/3 length</span></div></label> <label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledObstacles.lightning, true)}${attr("disabled", gameStarted, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">⚡ Lightning</span> <span class="label-text text-xs opacity-70">Speed up by 20% for 5s</span></div></label> <label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledObstacles.cow, true)}${attr("disabled", gameStarted, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">🐮 Cow</span> <span class="label-text text-xs opacity-70">Grow by exactly 5 squares</span></div></label></div></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="divider"></div> <div><h3 class="font-semibold mb-2">How to Play:</h3> <ul class="list-disc list-inside space-y-1 text-sm"><li>Use <kbd class="kbd kbd-sm">↑</kbd> <kbd class="kbd kbd-sm">↓</kbd> <kbd class="kbd kbd-sm">←</kbd> <kbd class="kbd kbd-sm">→</kbd> or <kbd class="kbd kbd-sm">WASD</kbd></li> <li>Eat the animal emoji to grow and score points</li> <li>Collect power-ups for special effects!</li> <li>Don't run into yourself!</li> <li>Speed increases as you grow</li></ul></div></div></div></div></div></div></div>`);
  });
}
export {
  _page as default
};
