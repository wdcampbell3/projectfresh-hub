import { a5 as ssr_context, a1 as head, $ as ensure_array_like, X as attr_class, Z as stringify, a0 as attr } from "../../../../chunks/index2.js";
import * as THREE from "three";
import { h as hideSidebar } from "../../../../chunks/gameState.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    onDestroy(() => {
      hideSidebar.set(false);
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
        document.body.style.margin = "";
      }
    });
    let customMaps = [];
    let builtInMaps = [];
    let selectedMap = null;
    const spaceshipOptions = [
      {
        id: "default",
        name: "Scout Fighter",
        path: "/3d-models/Ultimate Space Kit-glb/Spaceship.glb"
      },
      {
        id: "variant1",
        name: "Heavy Cruiser",
        path: "/3d-models/Ultimate Space Kit-glb/Spaceship-Jqfed124pQ.glb"
      },
      {
        id: "variant2",
        name: "Stealth Bomber",
        path: "/3d-models/Ultimate Space Kit-glb/Spaceship-VSxUAFhzbA.glb"
      },
      {
        id: "variant3",
        name: "Battle Carrier",
        path: "/3d-models/Ultimate Space Kit-glb/Spaceship-u105mYHLHU.glb"
      }
    ];
    let selectedSpaceship = spaceshipOptions[0];
    let gameConfig = {
      startingHealth: 100,
      enemyCount: 5,
      playerDamage: 25,
      enemySpeed: 8,
      mouseSensitivity: 1
    };
    let hasStartedGame = false;
    new THREE.Vector3();
    new THREE.Vector3();
    hideSidebar.set(hasStartedGame);
    head("1mp0yfi", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Starship Flyer | Dougie's Game Hub</title>`);
      });
    });
    $$renderer2.push(`<div class="flex h-screen overflow-hidden svelte-1mp0yfi"><div class="relative flex-1 h-screen overflow-hidden svelte-1mp0yfi">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="absolute inset-0 z-30 bg-base-200 svelte-1mp0yfi"></div> <div class="absolute inset-0 z-30 p-4 flex flex-col svelte-1mp0yfi"><div class="flex justify-between items-center mb-4 svelte-1mp0yfi"><h1 class="text-4xl font-bold svelte-1mp0yfi" style="color: #660460;">🚀 Starship Flyer</h1> <button class="btn text-white border-0 hover:opacity-90 svelte-1mp0yfi" style="background-color: #660460;">Launch Mission</button></div> <div class="flex flex-col lg:flex-row gap-4 flex-1 min-h-0 svelte-1mp0yfi"><div class="flex-1 flex items-center justify-center overflow-y-auto svelte-1mp0yfi"><div class="max-w-4xl w-full pb-8 svelte-1mp0yfi"><div class="bg-white rounded-lg p-6 mb-6 border-2 border-gray-200 shadow-lg svelte-1mp0yfi"><h3 class="text-2xl font-bold text-gray-900 mb-4 svelte-1mp0yfi">Select Your Ship</h3> <div class="grid grid-cols-2 md:grid-cols-4 gap-4 svelte-1mp0yfi"><!--[-->`);
      const each_array = ensure_array_like(spaceshipOptions);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let ship = each_array[$$index];
        $$renderer2.push(`<button${attr_class(
          `card bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 cursor-pointer border-2 ${stringify(selectedSpaceship.id === ship.id ? "border-yellow-500 ring-2 ring-yellow-400" : "border-yellow-300 hover:border-yellow-500")} shadow-lg hover:shadow-xl`,
          "svelte-1mp0yfi"
        )}><div class="card-body p-3 svelte-1mp0yfi"><div class="w-full h-24 rounded mb-2 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-yellow-300 svelte-1mp0yfi"><canvas${attr_class(`ship-preview-${stringify(ship.id)} w-full h-full`, "svelte-1mp0yfi")}></canvas></div> <h4 class="font-bold text-sm text-gray-900 text-center svelte-1mp0yfi">${escape_html(ship.name)}</h4></div></button>`);
      }
      $$renderer2.push(`<!--]--></div></div> <div class="bg-white rounded-lg p-6 mb-6 border-2 border-gray-200 shadow-lg svelte-1mp0yfi"><div class="flex justify-between items-center mb-4 svelte-1mp0yfi"><h3 class="text-2xl font-bold text-gray-900 svelte-1mp0yfi">Select a Map</h3> <a class="text-blue-600 font-semibold underline text-sm svelte-1mp0yfi" href="/world-builder">Build a Map →</a></div> <div class="relative svelte-1mp0yfi"><button class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg -ml-2 transition-all svelte-1mp0yfi"><span class="text-xl font-bold svelte-1mp0yfi">‹</span></button> <div id="map-carousel" class="flex gap-4 overflow-x-auto scroll-smooth px-8 py-2 svelte-1mp0yfi" style="scrollbar-width: none; -ms-overflow-style: none;"><button${attr_class(
        `flex-shrink-0 w-52 card bg-green-50 hover:bg-green-100 transition-all duration-200 cursor-pointer border-2 ${stringify(
          "border-green-500 ring-2 ring-green-400"
        )} shadow-lg hover:shadow-xl`,
        "svelte-1mp0yfi"
      )}><div class="card-body p-3 svelte-1mp0yfi"><div class="w-full h-24 rounded mb-2 overflow-hidden bg-gradient-to-br from-green-700 to-blue-800 flex items-center justify-center border border-green-300 svelte-1mp0yfi">`);
      {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="text-3xl opacity-70 svelte-1mp0yfi">🌍</div>`);
      }
      $$renderer2.push(`<!--]--></div> <h4 class="font-bold text-sm text-gray-900 truncate svelte-1mp0yfi">Default Map</h4> <div class="text-xs text-gray-500 svelte-1mp0yfi">Procedural</div></div></button> <!--[-->`);
      const each_array_1 = ensure_array_like(customMaps);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let map = each_array_1[$$index_1];
        $$renderer2.push(`<button${attr_class(
          `flex-shrink-0 w-52 card bg-purple-50 hover:bg-purple-100 transition-all duration-200 cursor-pointer border-2 ${stringify(selectedMap?.id === map.id ? "border-purple-500 ring-2 ring-purple-400" : "border-purple-300 hover:border-purple-500")} shadow-lg hover:shadow-xl`,
          "svelte-1mp0yfi"
        )}><div class="card-body p-3 svelte-1mp0yfi"><div class="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded svelte-1mp0yfi">Custom</div> <div class="w-full h-24 rounded mb-2 overflow-hidden bg-purple-100 flex items-center justify-center border border-purple-300 svelte-1mp0yfi">`);
        if (map.thumbnail) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<img${attr("src", map.thumbnail)}${attr("alt", map.name)} class="w-full h-full object-cover svelte-1mp0yfi"/>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="text-3xl opacity-50 svelte-1mp0yfi">🗺️</div>`);
        }
        $$renderer2.push(`<!--]--></div> <h4 class="font-bold text-sm text-gray-900 truncate svelte-1mp0yfi">${escape_html(map.name)}</h4> <div class="text-xs text-gray-500 truncate svelte-1mp0yfi">${escape_html(map.stats.objectCount)} objects</div></div></button>`);
      }
      $$renderer2.push(`<!--]--> <!--[-->`);
      const each_array_2 = ensure_array_like(builtInMaps);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let map = each_array_2[$$index_2];
        $$renderer2.push(`<button${attr_class(
          `flex-shrink-0 w-52 card bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 cursor-pointer border-2 ${stringify(selectedMap?.id === map.id ? "border-yellow-500 ring-2 ring-yellow-400" : "border-yellow-300 hover:border-yellow-500")} shadow-lg hover:shadow-xl`,
          "svelte-1mp0yfi"
        )}><div class="card-body p-3 svelte-1mp0yfi"><div class="absolute top-2 right-2 bg-yellow-500 text-gray-900 text-xs px-2 py-0.5 rounded svelte-1mp0yfi">Built-in</div> <div class="w-full h-24 rounded mb-2 overflow-hidden bg-yellow-100 flex items-center justify-center border border-yellow-300 svelte-1mp0yfi">`);
        if (map.thumbnail) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<img${attr("src", map.thumbnail)}${attr("alt", map.name)} class="w-full h-full object-cover svelte-1mp0yfi"/>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="text-3xl opacity-50 svelte-1mp0yfi">🗺️</div>`);
        }
        $$renderer2.push(`<!--]--></div> <h4 class="font-bold text-sm text-gray-900 truncate svelte-1mp0yfi">${escape_html(map.name)}</h4> <div class="text-xs text-gray-500 truncate svelte-1mp0yfi">${escape_html(map.stats.objectCount)} objects</div></div></button>`);
      }
      $$renderer2.push(`<!--]--></div> <button class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg -mr-2 transition-all svelte-1mp0yfi"><span class="text-xl font-bold svelte-1mp0yfi">›</span></button></div></div> <div class="bg-white rounded-lg p-6 mb-6 border-2 border-gray-200 shadow-lg svelte-1mp0yfi"><h3 class="text-2xl font-bold text-gray-900 mb-4 svelte-1mp0yfi">Difficulty &amp; Settings</h3> <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 svelte-1mp0yfi"><button${attr_class(`btn ${stringify("btn-outline")}`, "svelte-1mp0yfi")}>Easy <div class="text-xs svelte-1mp0yfi">More health, slower enemies</div></button> <button${attr_class(`btn ${stringify("btn-primary")}`, "svelte-1mp0yfi")}>Normal <div class="text-xs svelte-1mp0yfi">Balanced gameplay</div></button> <button${attr_class(`btn ${stringify("btn-outline")}`, "svelte-1mp0yfi")}>Hard <div class="text-xs svelte-1mp0yfi">Faster enemies, less health</div></button></div> <div class="mb-4 svelte-1mp0yfi"><label class="label text-sm font-semibold svelte-1mp0yfi">Auto-Move Speed</label> <div class="grid grid-cols-4 gap-2 svelte-1mp0yfi"><button${attr_class(`btn btn-sm ${stringify("btn-outline")}`, "svelte-1mp0yfi")}>Off</button> <button${attr_class(`btn btn-sm ${stringify("btn-outline")}`, "svelte-1mp0yfi")}>Slow</button> <button${attr_class(`btn btn-sm ${stringify("btn-primary")}`, "svelte-1mp0yfi")}>Medium</button> <button${attr_class(`btn btn-sm ${stringify("btn-outline")}`, "svelte-1mp0yfi")}>Hyper</button></div></div> <div class="mb-4 svelte-1mp0yfi"><label class="label text-sm font-semibold svelte-1mp0yfi">Power-up Drops</label> <div class="grid grid-cols-3 gap-2 svelte-1mp0yfi"><button${attr_class(`btn btn-sm ${stringify("btn-outline")}`, "svelte-1mp0yfi")}>Sparse <div class="text-xs opacity-70 svelte-1mp0yfi">Every 3 kills</div></button> <button${attr_class(`btn btn-sm ${stringify("btn-primary")}`, "svelte-1mp0yfi")}>Normal <div class="text-xs opacity-70 svelte-1mp0yfi">Every 2 kills</div></button> <button${attr_class(`btn btn-sm ${stringify("btn-outline")}`, "svelte-1mp0yfi")}>Carnage <div class="text-xs opacity-70 svelte-1mp0yfi">Every kill</div></button></div></div> <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-left svelte-1mp0yfi"><div class="svelte-1mp0yfi"><label class="label text-xs svelte-1mp0yfi">Starting Health: ${escape_html(gameConfig.startingHealth)}</label> <input type="range" min="50" max="200"${attr("value", gameConfig.startingHealth)} class="range range-xs range-accent svelte-1mp0yfi"/></div> <div class="svelte-1mp0yfi"><label class="label text-xs svelte-1mp0yfi">Enemy Count: ${escape_html(gameConfig.enemyCount)}</label> <input type="range" min="1" max="15"${attr("value", gameConfig.enemyCount)} class="range range-xs range-secondary svelte-1mp0yfi"/></div> <div class="svelte-1mp0yfi"><label class="label text-xs svelte-1mp0yfi">Enemy Speed: ${escape_html(gameConfig.enemySpeed.toFixed(1))}</label> <input type="range" min="4" max="20" step="0.5"${attr("value", gameConfig.enemySpeed)} class="range range-xs range-primary svelte-1mp0yfi"/></div> <div class="svelte-1mp0yfi"><label class="label text-xs svelte-1mp0yfi">Player Damage: ${escape_html(gameConfig.playerDamage)}</label> <input type="range" min="10" max="50"${attr("value", gameConfig.playerDamage)} class="range range-xs range-info svelte-1mp0yfi"/></div> <div class="svelte-1mp0yfi"><label class="label text-xs svelte-1mp0yfi">Mouse Sensitivity: ${escape_html(gameConfig.mouseSensitivity.toFixed(1))}</label> <input type="range" min="0.5" max="2.0" step="0.1"${attr("value", gameConfig.mouseSensitivity)} class="range range-xs range-warning svelte-1mp0yfi"/></div></div></div></div></div> <div class="w-full lg:w-1/4 flex flex-col gap-4 lg:min-w-[280px] overflow-y-auto svelte-1mp0yfi"><div class="card bg-white shadow-xl svelte-1mp0yfi"><div class="card-body p-4 svelte-1mp0yfi"><h3 class="font-semibold mb-2 text-sm svelte-1mp0yfi">Controls:</h3> <ul class="space-y-1 text-xs svelte-1mp0yfi"><li class="svelte-1mp0yfi"><kbd class="kbd kbd-sm svelte-1mp0yfi">W/S</kbd> - Forward/Back</li> <li class="svelte-1mp0yfi"><kbd class="kbd kbd-sm svelte-1mp0yfi">A/D</kbd> - Strafe Left/Right</li> <li class="svelte-1mp0yfi"><kbd class="kbd kbd-sm svelte-1mp0yfi">Mouse</kbd> - Aim</li> <li class="svelte-1mp0yfi"><kbd class="kbd kbd-sm svelte-1mp0yfi">Shift/Click</kbd> - Fire</li> <li class="svelte-1mp0yfi"><kbd class="kbd kbd-sm svelte-1mp0yfi">Space</kbd> - Boost</li> <li class="svelte-1mp0yfi"><kbd class="kbd kbd-sm svelte-1mp0yfi">Q/E</kbd> - Barrel Roll</li> <li class="svelte-1mp0yfi"><kbd class="kbd kbd-sm svelte-1mp0yfi">↑/↓ or 1-5</kbd> - Switch Weapons</li> <li class="svelte-1mp0yfi"><kbd class="kbd kbd-sm svelte-1mp0yfi">ESC</kbd> - Pause</li></ul></div></div> <div class="card bg-white shadow-xl svelte-1mp0yfi"><div class="card-body p-4 svelte-1mp0yfi"><h3 class="font-semibold mb-2 text-sm svelte-1mp0yfi">Power-Ups:</h3> <ul class="space-y-1 text-xs svelte-1mp0yfi"><li class="svelte-1mp0yfi"><span class="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 svelte-1mp0yfi"></span> Health - Restore hull</li> <li class="svelte-1mp0yfi"><span class="inline-block w-3 h-3 rounded-full bg-green-500 mr-1 svelte-1mp0yfi"></span> Ammo - +20 rounds</li> <li class="svelte-1mp0yfi"><span class="inline-block w-3 h-3 rounded-full bg-cyan-500 mr-1 svelte-1mp0yfi"></span> Shield - Temporary protection</li> <li class="svelte-1mp0yfi"><span class="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1 svelte-1mp0yfi"></span> Missiles - +10 rockets</li></ul></div></div> <div class="card bg-white shadow-xl svelte-1mp0yfi"><div class="card-body p-4 svelte-1mp0yfi"><h3 class="font-semibold mb-2 text-sm svelte-1mp0yfi">Enemies:</h3> <ul class="space-y-1 text-xs svelte-1mp0yfi"><li class="svelte-1mp0yfi"><span class="text-red-500 svelte-1mp0yfi">Red</span> - Basic fighters</li> <li class="svelte-1mp0yfi"><span class="text-cyan-500 svelte-1mp0yfi">Cyan</span> - Fast interceptors</li> <li class="svelte-1mp0yfi"><span class="text-purple-500 svelte-1mp0yfi">Purple</span> - Boss ships</li></ul></div></div> <div class="card bg-white shadow-xl svelte-1mp0yfi"><div class="card-body p-4 svelte-1mp0yfi"><h3 class="font-semibold mb-2 text-sm svelte-1mp0yfi">Tips:</h3> <p class="text-xs svelte-1mp0yfi">Use barrel rolls to dodge enemy fire! Collect power-ups to stay alive.
                Every 5 levels features a boss battle. Watch your hull integrity!</p></div></div></div></div></div>`);
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
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
