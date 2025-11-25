import { a1 as head, a0 as attr, X as attr_class, Z as stringify } from "../../../../chunks/index2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let soundEnabled = true;
    let powerUpsEnabled = true;
    let enabledPowerUps = {
      dasher: true,
      shield: true,
      timewarp: true,
      teleport: true,
      flash: true
    };
    let roundOver = false;
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;
    head("q0hh", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>💡 Light Particles | Dougie's Game Hub</title>`);
      });
    });
    $$renderer2.push(`<div class="h-[calc(100vh-2rem)] p-4 flex flex-col"><div class="flex justify-between items-center mb-4"><h1 class="text-4xl font-bold" style="color: #660460;">💡 Light Particles</h1> <div class="flex gap-2">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="btn text-white border-0 hover:opacity-90" style="background-color: #660460;">Start Game</button>`);
    }
    $$renderer2.push(`<!--]--> <button class="btn btn-outline">Reset</button></div></div> <div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0"><div class="flex-1 flex items-center justify-center min-w-0"><div class="card bg-white shadow-xl"><div class="card-body p-4"><canvas${attr("width", CANVAS_WIDTH)}${attr("height", CANVAS_HEIGHT)} class="rounded-lg max-w-full max-h-full svelte-q0hh"></canvas></div></div></div> <div class="w-full lg:w-1/4 flex flex-col gap-4 lg:min-w-[280px]"><div class="card bg-white shadow-xl flex-1 lg:overflow-y-auto lg:max-h-full"><div class="card-body"><h2 class="card-title" style="color: #660460;">Settings</h2> <div class="space-y-4"><div class="form-control"><label class="label"><span class="label-text font-semibold">Game Mode</span></label> <div class="flex gap-2"><button${attr_class(`btn btn-sm flex-1 ${stringify("btn-primary")}`)}${attr("disabled", roundOver, true)}>vs Computer</button> <button${attr_class(`btn btn-sm flex-1 ${stringify("btn-outline")}`)}${attr("disabled", roundOver, true)}>vs Human</button></div></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="form-control"><label class="label"><span class="label-text font-semibold">Computer Skill</span></label> <div class="flex gap-2"><button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", roundOver, true)}>Amateur</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-warning")}`)}${attr("disabled", roundOver, true)}>Normal</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", roundOver, true)}>Expert</button></div></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="form-control"><label class="label"><span class="label-text font-semibold">Speed</span></label> <div class="flex gap-2"><button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", roundOver, true)}>Practice</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-outline")}`)}${attr("disabled", roundOver, true)}>Cruising</button> <button${attr_class(`btn btn-xs flex-1 ${stringify("btn-error")}`)}${attr("disabled", roundOver, true)}>Hyper</button></div></div> <div class="divider my-2"></div> <div class="mb-2"><span class="label-text font-semibold">Options</span></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text">Sound Effects</span> <input type="checkbox" class="checkbox"${attr("checked", soundEnabled, true)}/></label></div> <div class="form-control"><label class="label cursor-pointer"><span class="label-text font-semibold">Power-Ups</span> <input type="checkbox" class="checkbox checkbox-primary"${attr("checked", powerUpsEnabled, true)}${attr("disabled", roundOver, true)}/></label></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="divider my-2"></div> <div class="form-control ml-6"><label class="label"><span class="label-text text-sm font-semibold">Enabled Power-Ups</span></label> <div class="flex flex-col gap-2"><label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.dasher, true)}${attr("disabled", roundOver, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">🌀 Trail Dasher</span> <span class="label-text text-xs opacity-70">Turn all trails to dashes for 5s</span></div></label> <label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.shield, true)}${attr("disabled", roundOver, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">🛡️ Shield</span> <span class="label-text text-xs opacity-70">Invincibility for 5s</span></div></label> <label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.timewarp, true)}${attr("disabled", roundOver, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">⏱️ Time Warp</span> <span class="label-text text-xs opacity-70">Slow yourself, speed opponent</span></div></label> <label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.teleport, true)}${attr("disabled", roundOver, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">🌟 Teleport</span> <span class="label-text text-xs opacity-70">Jump to safest location</span></div></label> <label class="label cursor-pointer justify-start gap-2 py-1"><input type="checkbox" class="checkbox checkbox-xs"${attr("checked", enabledPowerUps.flash, true)}${attr("disabled", roundOver, true)}/> <div class="flex flex-col"><span class="label-text text-sm font-medium">💫 Flash</span> <span class="label-text text-xs opacity-70">Hide trails 3x for 0.5s each</span></div></label></div></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="divider"></div> <div><h3 class="font-semibold mb-2">How to Play:</h3> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<ul class="list-disc list-inside space-y-1 text-sm"><li>Player 1: Use <kbd class="kbd kbd-sm">↑</kbd> <kbd class="kbd kbd-sm">↓</kbd> <kbd class="kbd kbd-sm">←</kbd> <kbd class="kbd kbd-sm">→</kbd> arrow keys</li> <li>Leave a light trail behind you</li> <li>Don't hit any trail (yours or opponent's)</li> <li>Wrap around edges to escape</li> <li>First to 5 rounds wins!</li></ul>`);
    }
    $$renderer2.push(`<!--]--></div></div></div></div></div></div></div>`);
  });
}
export {
  _page as default
};
