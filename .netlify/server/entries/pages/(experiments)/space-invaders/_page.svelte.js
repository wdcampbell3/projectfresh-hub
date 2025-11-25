import { a1 as head, a0 as attr, X as attr_class, Z as stringify } from "../../../../chunks/index2.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let gameOver = false;
    let score = 0;
    let highScore = 0;
    let lives = 3;
    let level = 1;
    let soundEnabled = true;
    let powerUpCount = 12;
    let startingLives = 5;
    let powerUpDuration = 5;
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;
    let queuePowerUps = false;
    head("5q5ito", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>👾 Space Invaders | Dougie's Game Hub</title>`);
      });
    });
    $$renderer2.push(`<div class="h-[calc(100vh-2rem)] p-4 flex flex-col"><div class="flex justify-between items-center mb-4"><h1 class="text-4xl font-bold" style="color: #660460;">👾 Space Invaders</h1> <div class="flex gap-2">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="btn text-white border-0 hover:opacity-90" style="background-color: #660460;">Start Game</button>`);
    }
    $$renderer2.push(`<!--]--> <button class="btn btn-outline">Reset</button></div></div> <div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0"><div class="flex-1 flex items-center justify-center min-w-0"><div class="card bg-white shadow-xl"><div class="card-body p-4"><canvas${attr("width", CANVAS_WIDTH)}${attr("height", CANVAS_HEIGHT)} class="rounded-lg max-w-full max-h-full svelte-5q5ito"></canvas></div></div></div> <div class="w-full lg:w-1/4 flex flex-col gap-4 lg:min-w-[280px]"><div class="card bg-white shadow-xl"><div class="card-body p-4"><div class="stats stats-vertical lg:stats-horizontal shadow w-full overflow-visible flex-wrap"><div class="stat py-2 px-2 min-w-0"><div class="stat-title text-xs">Score</div> <div class="stat-value text-lg lg:text-xl text-primary">${escape_html(score)}</div></div> <div class="stat py-2 px-2 min-w-0"><div class="stat-title text-xs">High Score</div> <div class="stat-value text-lg lg:text-xl text-secondary">${escape_html(highScore)}</div></div> <div class="stat py-2 px-2 min-w-0"><div class="stat-title text-xs">Lives</div> <div class="stat-value text-lg lg:text-xl text-error">${escape_html(lives)}</div></div> <div class="stat py-2 px-2 min-w-0"><div class="stat-title text-xs">Level</div> <div class="stat-value text-lg lg:text-xl text-accent">${escape_html(level)}</div></div></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="card bg-white shadow-xl flex-1 lg:overflow-y-auto lg:max-h-full"><div class="card-body"><h2 class="card-title" style="color: #660460;">Settings</h2> <div class="space-y-4"><div class="form-control"><div class="label"><span class="label-text font-semibold">Difficulty</span></div> <div class="flex gap-2"><button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameOver, true)}>Easy</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-warning")}`)}${attr("disabled", gameOver, true)}>Normal</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameOver, true)}>Hard</button></div></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Sound Effects</span> <input type="checkbox" class="checkbox"${attr("checked", soundEnabled, true)}/></label></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Queue Power-ups</span> <input type="checkbox" class="checkbox"${attr("checked", queuePowerUps, true)}/></label></div> <div class="form-control"><div class="label"><span class="label-text font-semibold">Power-ups per Level: ${escape_html(powerUpCount)}</span></div> <input type="range" min="0" max="30"${attr("value", powerUpCount)} class="range range-xs"${attr("disabled", gameOver, true)}/> <div class="w-full flex justify-between text-xs px-2"><span>0</span> <span>15</span> <span>30</span></div></div> <div class="form-control"><div class="label"><span class="label-text font-semibold">Starting Lives: ${escape_html(startingLives)}</span></div> <input type="range" min="1" max="10"${attr("value", startingLives)} class="range range-xs"${attr("disabled", gameOver, true)}/> <div class="w-full flex justify-between text-xs px-2"><span>1</span> <span>5</span> <span>10</span></div></div> <div class="form-control"><div class="label"><span class="label-text font-semibold">Power-up Duration: ${escape_html(powerUpDuration)}s</span></div> <input type="range" min="1" max="20"${attr("value", powerUpDuration)} class="range range-xs"${attr("disabled", gameOver, true)}/> <div class="w-full flex justify-between text-xs px-2"><span>1s</span> <span>10s</span> <span>20s</span></div></div> <div class="divider"></div> <div><h3 class="font-semibold mb-2">How to Play:</h3> <ul class="list-disc list-inside space-y-1 text-sm"><li>Use <kbd class="kbd kbd-sm">←</kbd> and <kbd class="kbd kbd-sm">→</kbd> to move</li> <li>Press <kbd class="kbd kbd-sm">SPACE</kbd> to shoot</li> <li>Press <kbd class="kbd kbd-sm">↑</kbd> to fire missile</li> <li>Press <kbd class="kbd kbd-sm">↓</kbd> to deploy next queued power-up</li> <li>Destroy all aliens to advance levels</li> <li>Avoid alien bullets and use shields</li> <li>Collect power-ups for special abilities</li> <li>Shoot the UFO for bonus points</li> <li>Build combos for extra points</li> <li>Boss wave every 5th level!</li></ul></div> <div class="divider"></div> <div><h3 class="font-semibold mb-2">Power-Ups:</h3> <ul class="list-disc list-inside space-y-1 text-sm"><li>⚡ Rapid Fire - Shoot 3x faster</li> <li>🛡️ Deflection Shield - Reflect bullets back</li> <li>💥 Spread Shot - Fire 3 bullets at once</li> <li>🔫 Laser - Continuous beam (Press SPACE to fire)</li> <li>⭐ Star - Invincible + 3x fire rate</li> <li>🚀 Missile - Area damage explosion (max 3, Press ↑)</li></ul></div> <div class="divider"></div> <div><h3 class="font-semibold mb-2">Alien Types:</h3> <ul class="list-disc list-inside space-y-1 text-sm"><li style="color: #00ff00">Grunt - 10 pts (1 hit)</li> <li style="color: #00ffff">Soldier - 20 pts (1 hit)</li> <li style="color: #ff00ff">Elite - 30 pts (2 hits)</li> <li style="color: #ff0000">Boss - 500 pts (many hits!)</li></ul></div></div></div></div></div></div></div>`);
  });
}
export {
  _page as default
};
