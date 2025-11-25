import { a1 as head, X as attr_class, a0 as attr, $ as ensure_array_like, Z as stringify } from "../../../../chunks/index2.js";
import * as THREE from "three";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let customMaps = [];
    let builtInMaps = [];
    let selectedMap = null;
    let gameConfig = {
      startingAmmo: 30,
      startingHealth: 100,
      enemyCount: 5,
      targetCount: 10
    };
    let isPlaying = false;
    new THREE.Vector3();
    new THREE.Vector3();
    new THREE.Vector3();
    new THREE.Raycaster();
    new THREE.Clock();
    head("28wd9x", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Blocky Shooter | Dougie's Game Hub</title>`);
      });
    });
    $$renderer2.push(`<div${attr_class("h-screen overflow-hidden svelte-28wd9x", void 0, {
      "flex": !isPlaying,
      "flex-col": !isPlaying,
      "md:flex-row": !isPlaying,
      "fixed": isPlaying,
      "inset-0": isPlaying,
      "z-[9999]": isPlaying
    })}><div${attr_class("relative svelte-28wd9x", void 0, {
      "min-w-0": !isPlaying,
      "flex-1": !isPlaying,
      "w-full": isPlaying,
      "h-full": isPlaying
    })}><div${attr_class("w-full h-full bg-black svelte-28wd9x", void 0, {
      "md:border-r-4": !isPlaying,
      "border-base-300": !isPlaying
    })}>`);
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="absolute inset-0 z-30 bg-base-200 svelte-28wd9x"></div> <div class="absolute inset-0 z-30 p-4 flex flex-col svelte-28wd9x"><div class="flex justify-between items-center mb-4 svelte-28wd9x"><h1 class="text-4xl font-bold svelte-28wd9x" style="color: #660460;">🎯 Blocky Shooter</h1> <button class="btn text-white border-0 hover:opacity-90 svelte-28wd9x" style="background-color: #660460;">Start Game</button></div> <div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 svelte-28wd9x"><div class="flex-1 flex items-center justify-center overflow-y-auto svelte-28wd9x"><div class="max-w-4xl w-full pb-8 svelte-28wd9x"><div class="bg-white rounded-lg p-6 mb-6 border-2 border-gray-200 shadow-lg svelte-28wd9x"><h3 class="text-2xl font-bold text-gray-900 mb-4 svelte-28wd9x">Difficulty &amp; Settings</h3> <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 svelte-28wd9x"><button${attr_class(`btn ${stringify("btn-outline")}`, "svelte-28wd9x")}>Easy <div class="text-xs svelte-28wd9x">More ammo, less enemies</div></button> <button${attr_class(`btn ${stringify("btn-primary")}`, "svelte-28wd9x")}>Normal <div class="text-xs svelte-28wd9x">Balanced gameplay</div></button> <button${attr_class(`btn ${stringify("btn-outline")}`, "svelte-28wd9x")}>Hard <div class="text-xs svelte-28wd9x">More enemies, less health</div></button></div> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-left svelte-28wd9x"><div class="svelte-28wd9x"><label class="label text-xs svelte-28wd9x">Starting Ammo: ${escape_html(gameConfig.startingAmmo)}</label> <input type="range" min="10" max="100"${attr("value", gameConfig.startingAmmo)} class="range range-xs range-primary svelte-28wd9x"/></div> <div class="svelte-28wd9x"><label class="label text-xs svelte-28wd9x">Starting Health: ${escape_html(gameConfig.startingHealth)}</label> <input type="range" min="25" max="200"${attr("value", gameConfig.startingHealth)} class="range range-xs range-accent svelte-28wd9x"/></div> <div class="svelte-28wd9x"><label class="label text-xs svelte-28wd9x">Enemy Count: ${escape_html(gameConfig.enemyCount)}</label> <input type="range" min="1" max="15"${attr("value", gameConfig.enemyCount)} class="range range-xs range-secondary svelte-28wd9x"/></div> <div class="svelte-28wd9x"><label class="label text-xs svelte-28wd9x">Target Count: ${escape_html(gameConfig.targetCount)}</label> <input type="range" min="5" max="20"${attr("value", gameConfig.targetCount)} class="range range-xs range-info svelte-28wd9x"/></div></div></div> <div class="bg-white rounded-lg p-6 mb-6 border-2 border-gray-200 shadow-lg svelte-28wd9x"><div class="flex justify-between items-center mb-4 svelte-28wd9x"><h3 class="text-2xl font-bold text-gray-900 svelte-28wd9x">Select a Map</h3> <a class="text-blue-600 font-semibold underline text-sm svelte-28wd9x" href="/world-builder">Build a Map →</a></div> <div class="relative svelte-28wd9x"><button class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg -ml-2 transition-all svelte-28wd9x"><span class="text-xl font-bold svelte-28wd9x">‹</span></button> <div id="fps-map-carousel" class="flex gap-4 overflow-x-auto scroll-smooth px-8 py-2 svelte-28wd9x" style="scrollbar-width: none; -ms-overflow-style: none;"><button${attr_class(
          `flex-shrink-0 w-52 card bg-green-50 hover:bg-green-100 transition-all duration-200 cursor-pointer border-2 ${stringify(
            "border-green-500 ring-2 ring-green-400"
          )} shadow-lg hover:shadow-xl`,
          "svelte-28wd9x"
        )}><div class="card-body p-3 svelte-28wd9x"><div class="w-full h-24 rounded mb-2 overflow-hidden bg-gradient-to-br from-green-700 to-blue-800 flex items-center justify-center border border-green-300 svelte-28wd9x">`);
        {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="text-3xl opacity-70 svelte-28wd9x">🌍</div>`);
        }
        $$renderer2.push(`<!--]--></div> <h4 class="font-bold text-sm text-gray-900 truncate svelte-28wd9x">Default Map</h4> <div class="text-xs text-gray-500 svelte-28wd9x">Procedural</div></div></button> <!--[-->`);
        const each_array = ensure_array_like(customMaps);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let map = each_array[$$index];
          $$renderer2.push(`<button${attr_class(
            `flex-shrink-0 w-52 card bg-purple-50 hover:bg-purple-100 transition-all duration-200 cursor-pointer border-2 ${stringify(selectedMap?.id === map.id ? "border-purple-500 ring-2 ring-purple-400" : "border-purple-300 hover:border-purple-500")} shadow-lg hover:shadow-xl`,
            "svelte-28wd9x"
          )}><div class="card-body p-3 svelte-28wd9x"><div class="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded svelte-28wd9x">Custom</div> <div class="w-full h-24 rounded mb-2 overflow-hidden bg-purple-100 flex items-center justify-center border border-purple-300 svelte-28wd9x">`);
          if (map.thumbnail) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<img${attr("src", map.thumbnail)}${attr("alt", map.name)} class="w-full h-full object-cover svelte-28wd9x"/>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<div class="text-3xl opacity-50 svelte-28wd9x">🗺️</div>`);
          }
          $$renderer2.push(`<!--]--></div> <h4 class="font-bold text-sm text-gray-900 truncate svelte-28wd9x">${escape_html(map.name)}</h4> <div class="text-xs text-gray-500 truncate svelte-28wd9x">${escape_html(map.stats.objectCount)} objects</div></div></button>`);
        }
        $$renderer2.push(`<!--]--> <!--[-->`);
        const each_array_1 = ensure_array_like(builtInMaps);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let map = each_array_1[$$index_1];
          $$renderer2.push(`<button${attr_class(
            `flex-shrink-0 w-52 card bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 cursor-pointer border-2 ${stringify(selectedMap?.id === map.id ? "border-yellow-500 ring-2 ring-yellow-400" : "border-yellow-300 hover:border-yellow-500")} shadow-lg hover:shadow-xl`,
            "svelte-28wd9x"
          )}><div class="card-body p-3 svelte-28wd9x"><div class="absolute top-2 right-2 bg-yellow-500 text-gray-900 text-xs px-2 py-0.5 rounded svelte-28wd9x">Built-in</div> <div class="w-full h-24 rounded mb-2 overflow-hidden bg-yellow-100 flex items-center justify-center border border-yellow-300 svelte-28wd9x">`);
          if (map.thumbnail) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<img${attr("src", map.thumbnail)}${attr("alt", map.name)} class="w-full h-full object-cover svelte-28wd9x"/>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<div class="text-3xl opacity-50 svelte-28wd9x">🗺️</div>`);
          }
          $$renderer2.push(`<!--]--></div> <h4 class="font-bold text-sm text-gray-900 truncate svelte-28wd9x">${escape_html(map.name)}</h4> <div class="text-xs text-gray-500 truncate svelte-28wd9x">${escape_html(map.stats.objectCount)} objects</div></div></button>`);
        }
        $$renderer2.push(`<!--]--></div> <button class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg -mr-2 transition-all svelte-28wd9x"><span class="text-xl font-bold svelte-28wd9x">›</span></button></div></div></div></div> <div class="w-full lg:w-1/4 flex flex-col gap-4 lg:min-w-[280px] overflow-y-auto svelte-28wd9x"><div class="card bg-white shadow-xl svelte-28wd9x"><div class="card-body p-4 svelte-28wd9x"><h3 class="font-semibold mb-2 text-sm svelte-28wd9x">Controls:</h3> <ul class="space-y-1 text-xs svelte-28wd9x"><li class="svelte-28wd9x"><kbd class="kbd kbd-sm svelte-28wd9x">W/A/S/D</kbd> - Move</li> <li class="svelte-28wd9x"><kbd class="kbd kbd-sm svelte-28wd9x">Mouse</kbd> - Look around</li> <li class="svelte-28wd9x"><kbd class="kbd kbd-sm svelte-28wd9x">Click</kbd> - Shoot</li> <li class="svelte-28wd9x"><kbd class="kbd kbd-sm svelte-28wd9x">←/→ or ↑/↓</kbd> - Switch weapons</li> <li class="svelte-28wd9x"><kbd class="kbd kbd-sm svelte-28wd9x">1-5</kbd> - Select weapon</li> <li class="svelte-28wd9x"><kbd class="kbd kbd-sm svelte-28wd9x">Space</kbd> - Jump</li> <li class="svelte-28wd9x"><kbd class="kbd kbd-sm svelte-28wd9x">ESC</kbd> - Pause</li></ul></div></div> <div class="card bg-white shadow-xl svelte-28wd9x"><div class="card-body p-4 svelte-28wd9x"><h3 class="font-semibold mb-2 text-sm svelte-28wd9x">Power-Ups (auto-apply):</h3> <ul class="space-y-1 text-xs svelte-28wd9x"><li class="svelte-28wd9x"><span class="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 svelte-28wd9x"></span> Health - +30 HP</li> <li class="svelte-28wd9x"><span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-1 svelte-28wd9x"></span> Ammo - +20 rounds to weapon</li> <li class="svelte-28wd9x"><span class="inline-block w-3 h-3 rounded-full bg-cyan-500 mr-1 svelte-28wd9x"></span> Jetpack - Fly for 60s</li> <li class="svelte-28wd9x"><span class="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1 svelte-28wd9x"></span> Missiles - +10 heat-seeking rockets</li> <li class="svelte-28wd9x"><span class="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1 svelte-28wd9x"></span> Grenades - +5 area damage</li></ul></div></div> <div class="card bg-white shadow-xl svelte-28wd9x"><div class="card-body p-4 svelte-28wd9x"><h3 class="font-semibold mb-2 text-sm svelte-28wd9x">Enemies:</h3> <ul class="space-y-1 text-xs svelte-28wd9x"><li class="svelte-28wd9x"><span class="text-red-500 svelte-28wd9x">Red</span> - Basic (50 HP)</li> <li class="svelte-28wd9x"><span class="text-cyan-500 svelte-28wd9x">Cyan</span> - Fast (30 HP, circles you)</li> <li class="svelte-28wd9x"><span class="text-orange-600 svelte-28wd9x">Brown</span> - Tank (100 HP, heavy damage)</li></ul></div></div> <div class="card bg-white shadow-xl svelte-28wd9x"><div class="card-body p-4 svelte-28wd9x"><h3 class="font-semibold mb-2 text-sm svelte-28wd9x">Tips:</h3> <p class="text-xs svelte-28wd9x">Collect power-ups to gain advantages! Level up every 500 points.
                    Different weapons have different ammo. Navigate through obstacles
                    to find the best vantage points.</p></div></div></div></div></div>`);
      }
      $$renderer2.push(`<!--]-->`);
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
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
export {
  _page as default
};
