import { a1 as head, X as attr_class, a0 as attr, Z as stringify } from "../../../../chunks/index2.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let speedIncrease = true;
    let englishSpin = false;
    let powerUpsEnabled = true;
    let powerUpMode = "bySide";
    let enabledPowerUps = { freeze: true, lightning: true, shrinker: true };
    let soundEnabled = true;
    let gameRunning = false;
    head("2hkm7", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>🏓 Cosmic Pong | Dougie's Game Hub</title>`);
      });
    });
    $$renderer2.push(`<div class="h-[calc(100vh-2rem)] p-4 flex flex-col"><div class="flex justify-between items-center mb-4"><h1 class="text-4xl font-bold" style="color: #660460;">🏓 Cosmic Pong</h1> <div class="flex gap-2">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="btn text-white border-0 hover:opacity-90" style="background-color: #660460;">${escape_html("Start Game")}</button>`);
    }
    $$renderer2.push(`<!--]--> <button class="btn btn-outline">Reset</button></div></div> <div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0"><div class="flex-1 flex items-center justify-center min-w-0"><div class="card bg-white shadow-xl"><div class="card-body p-4"><canvas width="800" height="600" class="rounded-lg touch-none cursor-pointer max-w-full max-h-full svelte-2hkm7" style="aspect-ratio: 4/3;"></canvas></div></div></div> <div class="w-full lg:w-1/4 flex flex-col gap-4 lg:min-w-[280px]"><div class="card bg-white shadow-xl flex-1 lg:overflow-y-auto lg:max-h-full"><div class="card-body"><h2 class="card-title" style="color: #660460;">Settings</h2> <div class="space-y-4"><div class="form-control"><label class="label"><span class="label-text font-semibold">Game Mode</span></label> <div class="flex gap-2"><button${attr_class(`btn btn-sm flex-1 ${stringify("btn-primary")}`)}${attr("disabled", gameRunning, true)}>vs Computer</button> <button${attr_class(`btn btn-sm flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameRunning, true)}>vs Human</button></div></div> <div class="form-control"><label class="label"><span class="label-text font-semibold">Difficulty</span></label> <div class="flex gap-2"><button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameRunning, true)}>Easy</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-warning")}`)}${attr("disabled", gameRunning, true)}>Medium</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", gameRunning, true)}>Hard</button></div></div> <div class="divider my-2"></div> <div class="mb-2"><span class="label-text font-semibold">Options</span></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Speed Increase (5% per hit)</span> <input type="checkbox" class="checkbox"${attr("checked", speedIncrease, true)}${attr("disabled", gameRunning, true)}/></label></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">English Spin</span> <input type="checkbox" class="checkbox"${attr("checked", englishSpin, true)}${attr("disabled", gameRunning, true)}/></label></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Power-Ups</span> <input type="checkbox" class="checkbox"${attr("checked", powerUpsEnabled, true)}${attr("disabled", gameRunning, true)}/></label></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="form-control ml-6"><label class="label"><span class="label-text text-sm">Power-Up Mode</span></label> <div class="flex flex-col gap-2"><label class="label cursor-pointer justify-start gap-2"><input type="radio" name="powerUpMode" class="radio radio-sm" value="bySide"${attr("checked", powerUpMode === "bySide", true)}${attr("disabled", gameRunning, true)}/> <span class="label-text text-sm">By Side (helps loser)</span></label> <label class="label cursor-pointer justify-start gap-2"><input type="radio" name="powerUpMode" class="radio radio-sm" value="byHit"${attr("checked", powerUpMode === "byHit", true)}${attr("disabled", gameRunning, true)}/> <span class="label-text text-sm">By Hit (skill-based)</span></label></div></div> <div class="divider my-2"></div> <div class="form-control ml-6"><label class="label"><span class="label-text text-sm font-semibold">Enabled Power-Ups</span></label> <div class="flex flex-col gap-2"><label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.freeze, true)}${attr("disabled", gameRunning, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">❄️ Freeze</span> <span class="label-text text-xs opacity-70">Slows opponent's paddle</span></div></label> <label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.lightning, true)}${attr("disabled", gameRunning, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">⚡ Lightning</span> <span class="label-text text-xs opacity-70">Splits ball into two</span></div></label> <label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.shrinker, true)}${attr("disabled", gameRunning, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">🔻 Shrinker</span> <span class="label-text text-xs opacity-70">Shrinks opponent's paddle</span></div></label></div></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Sound Effects</span> <input type="checkbox" class="checkbox"${attr("checked", soundEnabled, true)}/></label></div> <div class="divider"></div> <div><h3 class="font-semibold mb-2">How to Play:</h3> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<ul class="list-disc list-inside space-y-1 text-sm"><li>Use <kbd class="kbd kbd-sm">↑</kbd> <kbd class="kbd kbd-sm">↓</kbd> arrow keys</li> <li>Press <kbd class="kbd kbd-sm">Space</kbd> or click canvas to pause</li> <li>First to 10 points wins!</li> <li>Collect power-ups: ❄️ Freeze, ⚡ Split, 🔻 Shrink</li></ul>`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div></div></div></div>`);
  });
}
export {
  _page as default
};
