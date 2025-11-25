import { a1 as head, a4 as attr_style, $ as ensure_array_like, X as attr_class, a0 as attr, Z as stringify } from "../../../../chunks/index2.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const DIFFICULTIES = {
      easy: { rows: 15, cols: 15, mines: 25 },
      medium: { rows: 20, cols: 20, mines: 50 },
      hard: { rows: 25, cols: 25, mines: 100 }
    };
    const BOARD_SIZE = 700;
    let difficulty = "easy";
    let grid = [];
    let gameStatus = "playing";
    let minesRemaining = 0;
    let timer = 0;
    let xrayActive = false;
    let laserActive = false;
    let laserChargedCell = null;
    let laserChargedTimeLeft = 0;
    let activeXrayCell = null;
    let hoveringCell = null;
    let powerUpsEnabled = { xray: true, detector: true, laser: true, bomb: true };
    let trapsEnabled = { subterfuge: true, sabotage: true };
    let spawnedPowerUps = /* @__PURE__ */ new Set();
    let spawnedTraps = /* @__PURE__ */ new Set();
    let blinkingCells = /* @__PURE__ */ new Set();
    function initGame() {
      const config = DIFFICULTIES[difficulty];
      grid = Array(config.rows).fill(null).map(() => Array(config.cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
        powerUp: null,
        trap: null,
        isSabotaged: false
      })));
      gameStatus = "playing";
      minesRemaining = config.mines;
      timer = 0;
      spawnedPowerUps = /* @__PURE__ */ new Set();
      spawnedTraps = /* @__PURE__ */ new Set();
      xrayActive = false;
      laserActive = false;
      laserChargedCell = null;
      activeXrayCell = null;
    }
    function getCellClass(cell, row, col) {
      if (cell.isSabotaged) return "bg-gray-800 cursor-not-allowed";
      if (cell.isFlagged) return "bg-yellow-500 hover:bg-yellow-600";
      if (!cell.isRevealed) return "bg-base-300 hover:bg-base-content/10 cursor-pointer";
      if (cell.isMine) return "bg-red-600";
      const cellKey = `${row},${col}`;
      if (cell.isRevealed && (cell.powerUp && !spawnedPowerUps.has(cellKey) || cell.trap && !spawnedTraps.has(cellKey))) {
        return "bg-base-100 cursor-pointer hover:bg-base-content/10";
      }
      return "bg-base-100";
    }
    function getCellContent(cell, row, col) {
      if (cell.isSabotaged) return "❌";
      if (cell.isFlagged) return "🚩";
      if (!cell.isRevealed) {
        if (xrayActive && activeXrayCell) {
          const rowDiff = Math.abs(row - activeXrayCell.row);
          const colDiff = Math.abs(col - activeXrayCell.col);
          if (rowDiff <= 1 && colDiff <= 1) {
            if (cell.isMine) return "💣";
            return "⬜";
          }
        }
        return "";
      }
      if (cell.isMine) return "💣";
      const cellKey = `${row},${col}`;
      if (cell.powerUp && !spawnedPowerUps.has(cellKey)) {
        if (cell.powerUp === "xray") return "🔍";
        if (cell.powerUp === "detector") return "📡";
        if (cell.powerUp === "laser") return "🔫";
        if (cell.powerUp === "bomb") return "💥";
      }
      if (cell.trap && !spawnedTraps.has(cellKey)) {
        if (cell.trap === "subterfuge") return "🎭";
        if (cell.trap === "sabotage") return "💀";
      }
      if (cell.neighborMines === 0) return "";
      return cell.neighborMines.toString();
    }
    function getNumberColor(num) {
      const colors = {
        1: "text-blue-600",
        2: "text-green-600",
        3: "text-red-600",
        4: "text-purple-700",
        5: "text-orange-700",
        6: "text-cyan-600",
        7: "text-gray-900",
        8: "text-gray-500"
      };
      return colors[num] || "";
    }
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    head("kzvf6x", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>💣 Mine Buster | Dougie's Game Hub</title>`);
      });
    });
    $$renderer2.push(`<div class="h-[calc(100vh-2rem)] p-4 flex flex-col svelte-kzvf6x"><div class="flex justify-between items-center mb-4 svelte-kzvf6x"><h1 class="text-4xl font-bold svelte-kzvf6x" style="color: #660460;">💣 Mine Buster</h1> <div class="flex gap-2 svelte-kzvf6x"><button class="btn text-white border-0 hover:opacity-90 svelte-kzvf6x" style="background-color: #660460;">New Game</button></div></div> <div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 svelte-kzvf6x"><div class="flex-1 flex items-center justify-center min-w-0 svelte-kzvf6x"><div class="card bg-white shadow-xl svelte-kzvf6x"><div class="card-body p-4 svelte-kzvf6x"><div class="rounded-lg p-2 relative aspect-square svelte-kzvf6x"${attr_style(`width: min(${stringify(BOARD_SIZE)}px, 70vh);`)}><div class="grid gap-0.5 svelte-kzvf6x"${attr_style(`grid-template-columns: repeat(${stringify(DIFFICULTIES[difficulty].cols)}, minmax(0, 1fr)); height: 100%;`)}><!--[-->`);
    const each_array = ensure_array_like(grid);
    for (let rowIndex = 0, $$length = each_array.length; rowIndex < $$length; rowIndex++) {
      let row = each_array[rowIndex];
      $$renderer2.push(`<!--[-->`);
      const each_array_1 = ensure_array_like(row);
      for (let colIndex = 0, $$length2 = each_array_1.length; colIndex < $$length2; colIndex++) {
        let cell = each_array_1[colIndex];
        $$renderer2.push(`<button${attr_class(`border border-base-content/20 rounded font-bold flex items-center justify-center transition-colors relative aspect-square text-[clamp(0.5rem,1.5vw,1.2rem)] ${stringify(getCellClass(cell, rowIndex, colIndex))} ${stringify(cell.isRevealed && cell.neighborMines > 0 ? getNumberColor(cell.neighborMines) : "")} ${stringify(blinkingCells.has(`${rowIndex},${colIndex}`) ? "animate-blink" : "")}`, "svelte-kzvf6x")}${attr("disabled", gameStatus !== "playing", true)}>${escape_html(getCellContent(cell, rowIndex, colIndex))} `);
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
        $$renderer2.push(`<!--]--> `);
        if (laserChargedCell && laserChargedCell.row === rowIndex && laserChargedCell.col === colIndex) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<svg class="absolute inset-0 svelte-kzvf6x" viewBox="0 0 100 100" style="transform: rotate(-90deg)"><circle cx="50" cy="50" r="45" fill="none" stroke="#fbbf24" stroke-width="10" opacity="0.3" class="svelte-kzvf6x"></circle><circle cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" stroke-width="10" stroke-dasharray="282.74"${attr("stroke-dashoffset", 282.74 * (1 - laserChargedTimeLeft / 2))} stroke-linecap="round" class="svelte-kzvf6x"></circle></svg>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (laserChargedCell) {
          $$renderer2.push("<!--[-->");
          if (laserChargedCell.row === rowIndex + 1 && laserChargedCell.col === colIndex) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="absolute inset-0 flex items-center justify-center text-yellow-500 text-2xl font-bold cursor-pointer hover:scale-125 transition-transform svelte-kzvf6x" role="button" tabindex="0">⬆</div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (laserChargedCell.row === rowIndex - 1 && laserChargedCell.col === colIndex) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="absolute inset-0 flex items-center justify-center text-yellow-500 text-2xl font-bold cursor-pointer hover:scale-125 transition-transform svelte-kzvf6x" role="button" tabindex="0">⬇</div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (laserChargedCell.row === rowIndex && laserChargedCell.col === colIndex + 1) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="absolute inset-0 flex items-center justify-center text-yellow-500 text-2xl font-bold cursor-pointer hover:scale-125 transition-transform svelte-kzvf6x" role="button" tabindex="0">⬅</div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (laserChargedCell.row === rowIndex && laserChargedCell.col === colIndex - 1) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="absolute inset-0 flex items-center justify-center text-yellow-500 text-2xl font-bold cursor-pointer hover:scale-125 transition-transform svelte-kzvf6x" role="button" tabindex="0">➡</div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (laserActive && hoveringCell && hoveringCell.row === rowIndex && hoveringCell.col === colIndex && !cell.isRevealed && !cell.isFlagged) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="absolute inset-0 flex items-center justify-center text-3xl font-bold pointer-events-none svelte-kzvf6x" style="opacity: 0.8;">🎯</div>`);
        } else {
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
        $$renderer2.push(`<!--]--></button>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div></div> <div class="w-full lg:w-1/4 flex flex-col gap-4 lg:min-w-[280px] svelte-kzvf6x"><div class="card bg-white shadow-xl svelte-kzvf6x"><div class="card-body p-4 svelte-kzvf6x"><div class="stats stats-vertical lg:stats-horizontal shadow w-full overflow-visible flex-wrap svelte-kzvf6x"><div class="stat py-2 px-2 min-w-0 svelte-kzvf6x"><div class="stat-title text-xs svelte-kzvf6x">Mines</div> <div class="stat-value text-lg lg:text-xl text-error svelte-kzvf6x">${escape_html(minesRemaining)}</div></div> <div class="stat py-2 px-2 min-w-0 svelte-kzvf6x"><div class="stat-title text-xs svelte-kzvf6x">Time</div> <div class="stat-value text-lg lg:text-xl text-info svelte-kzvf6x">${escape_html(formatTime(timer))}</div></div></div> `);
    if (gameStatus === "won") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="alert alert-success mt-2 svelte-kzvf6x"><svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6 svelte-kzvf6x" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" class="svelte-kzvf6x"></path></svg> <span class="svelte-kzvf6x">You Won! Time: ${escape_html(formatTime(timer))}</span></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (gameStatus === "lost") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="alert alert-error mt-2 svelte-kzvf6x"><svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6 svelte-kzvf6x" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" class="svelte-kzvf6x"></path></svg> <span class="svelte-kzvf6x">Game Over! You hit a mine.</span></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="card bg-white shadow-xl flex-1 lg:overflow-y-auto lg:max-h-full svelte-kzvf6x"><div class="card-body svelte-kzvf6x"><h2 class="card-title svelte-kzvf6x" style="color: #660460;">Settings</h2> <div class="space-y-4 svelte-kzvf6x"><div class="form-control svelte-kzvf6x"><label class="label svelte-kzvf6x"><span class="label-text font-semibold svelte-kzvf6x">Difficulty</span></label> `);
    $$renderer2.select(
      {
        class: "select select-bordered",
        value: difficulty,
        onchange: initGame
      },
      ($$renderer3) => {
        $$renderer3.option(
          { value: "easy", class: "" },
          ($$renderer4) => {
            $$renderer4.push(`Easy (15×15, 25 mines)`);
          },
          "svelte-kzvf6x"
        );
        $$renderer3.option(
          { value: "medium", class: "" },
          ($$renderer4) => {
            $$renderer4.push(`Medium (20×20, 50 mines)`);
          },
          "svelte-kzvf6x"
        );
        $$renderer3.option(
          { value: "hard", class: "" },
          ($$renderer4) => {
            $$renderer4.push(`Hard (25×25, 100 mines)`);
          },
          "svelte-kzvf6x"
        );
      },
      "svelte-kzvf6x"
    );
    $$renderer2.push(`</div> <div class="divider my-2 svelte-kzvf6x"></div> <div class="mb-2 svelte-kzvf6x"><span class="label-text font-semibold svelte-kzvf6x">Power-Ups</span></div> <div class="form-control svelte-kzvf6x"><label class="label cursor-pointer svelte-kzvf6x"><span class="label-text svelte-kzvf6x">🔍 X-Ray (2.5s reveal 3x3 on hover)</span> <input type="checkbox" class="checkbox checkbox-sm svelte-kzvf6x"${attr("checked", powerUpsEnabled.xray, true)}${attr("disabled", gameStatus === "playing", true)}/></label></div> <div class="form-control svelte-kzvf6x"><label class="label cursor-pointer svelte-kzvf6x"><span class="label-text svelte-kzvf6x">📡 Detector (auto-flag one mine)</span> <input type="checkbox" class="checkbox checkbox-sm svelte-kzvf6x"${attr("checked", powerUpsEnabled.detector, true)}${attr("disabled", gameStatus === "playing", true)}/></label></div> <div class="form-control svelte-kzvf6x"><label class="label cursor-pointer svelte-kzvf6x"><span class="label-text svelte-kzvf6x">🔫 Laser (2.5s to pick, 2s to shoot)</span> <input type="checkbox" class="checkbox checkbox-sm svelte-kzvf6x"${attr("checked", powerUpsEnabled.laser, true)}${attr("disabled", gameStatus === "playing", true)}/></label></div> <div class="form-control svelte-kzvf6x"><label class="label cursor-pointer svelte-kzvf6x"><span class="label-text svelte-kzvf6x">💥 Bomb (reveals 3x3, auto-flags mines)</span> <input type="checkbox" class="checkbox checkbox-sm svelte-kzvf6x"${attr("checked", powerUpsEnabled.bomb, true)}${attr("disabled", gameStatus === "playing", true)}/></label></div> <div class="divider my-2 svelte-kzvf6x"></div> <div class="mb-2 svelte-kzvf6x"><span class="label-text font-semibold svelte-kzvf6x">Traps</span></div> <div class="form-control svelte-kzvf6x"><label class="label cursor-pointer svelte-kzvf6x"><span class="label-text svelte-kzvf6x">🎭 Subterfuge (adds hidden mine)</span> <input type="checkbox" class="checkbox checkbox-sm svelte-kzvf6x"${attr("checked", trapsEnabled.subterfuge, true)}${attr("disabled", gameStatus === "playing", true)}/></label></div> <div class="form-control svelte-kzvf6x"><label class="label cursor-pointer svelte-kzvf6x"><span class="label-text svelte-kzvf6x">💀 Sabotage (re-covers largest area + mine)</span> <input type="checkbox" class="checkbox checkbox-sm svelte-kzvf6x"${attr("checked", trapsEnabled.sabotage, true)}${attr("disabled", gameStatus === "playing", true)}/></label></div> <div class="divider svelte-kzvf6x"></div> <div class="svelte-kzvf6x"><h3 class="font-semibold mb-2 svelte-kzvf6x">How to Play:</h3> <ul class="list-disc list-inside space-y-1 text-sm svelte-kzvf6x"><li class="svelte-kzvf6x">Single click to flag/unflag</li> <li class="svelte-kzvf6x">Double click to reveal a cell</li> <li class="svelte-kzvf6x">Numbers show adjacent mines</li> <li class="svelte-kzvf6x">First click is always safe</li> <li class="svelte-kzvf6x">Power-ups appear on blank squares</li> <li class="svelte-kzvf6x">Watch out for traps!</li></ul></div></div></div></div></div></div></div>`);
  });
}
export {
  _page as default
};
