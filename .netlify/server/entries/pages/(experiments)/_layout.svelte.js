import { X as attr_class, Z as stringify, V as store_get, _ as slot, $ as ensure_array_like, a0 as attr, W as unsubscribe_stores } from "../../../chunks/index2.js";
import { p as page } from "../../../chunks/stores.js";
import { h as hideSidebar } from "../../../chunks/gameState.js";
import { e as escape_html } from "../../../chunks/escaping.js";
function ExperimentsSidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const experiments2D = [
      { name: "Space Invaders", path: "/space-invaders", icon: "👾" },
      { name: "Light Particles", path: "/light-cycles", icon: "💡" },
      { name: "Cosmic Pong", path: "/pong", icon: "🏓" },
      { name: "Tower Assault", path: "/tower-defense", icon: "🗼" },
      { name: "Mine Buster", path: "/minesweeper", icon: "💣" },
      { name: "Snake-adelic", path: "/worm-game", icon: "🐍" }
    ];
    const experiments3D = [
      { name: "World Builder", path: "/world-builder", icon: "🏗️" },
      { name: "Blocky Shooter", path: "/fps-game", icon: "🎯" },
      { name: "Starship Flyer", path: "/starship-flyer", icon: "🚀" }
    ];
    $$renderer2.push(`<div${attr_class(`drawer ${stringify(store_get($$store_subs ??= {}, "$hideSidebar", hideSidebar) ? "" : "lg:drawer-open")}`)}><input id="experiments-drawer" type="checkbox" class="drawer-toggle"/> <div class="drawer-content flex flex-col"><div${attr_class(`navbar bg-base-200 ${stringify(store_get($$store_subs ??= {}, "$hideSidebar", hideSidebar) ? "hidden" : "lg:hidden")}`)}><div class="flex-none"><label for="experiments-drawer" class="btn btn-square btn-ghost"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-5 w-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></label></div> <div class="flex-1"><span class="text-xl font-bold">Experiments</span></div></div> <div${attr_class(store_get($$store_subs ??= {}, "$hideSidebar", hideSidebar) ? "" : "p-4")}><!--[-->`);
    slot($$renderer2, $$props, "default", {});
    $$renderer2.push(`<!--]--></div></div> <div class="drawer-side"><label for="experiments-drawer" aria-label="close sidebar" class="drawer-overlay"></label> <aside class="min-h-screen w-64 bg-base-200 text-base-content border-r-2" style="border-color: rgba(102, 4, 96, 0.33);"><div class="p-4"><h2 class="text-2xl font-bold mb-6">🧪 Experiments</h2> <a href="/" class="btn btn-block mb-4 text-white border-0 hover:opacity-90" style="background-color: #660460;">← Back to Home</a> <div class="mb-6"><h3 class="text-sm font-semibold text-base-content/60 mb-2 px-4">3D Games</h3> <ul class="menu gap-2"><!--[-->`);
    const each_array = ensure_array_like(experiments3D);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let experiment = each_array[$$index];
      $$renderer2.push(`<li><a${attr("href", experiment.path)}${attr_class("flex items-center gap-3", void 0, {
        "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === experiment.path
      })}><span class="text-2xl">${escape_html(experiment.icon)}</span> <span>${escape_html(experiment.name)}</span></a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div> <div><h3 class="text-sm font-semibold text-base-content/60 mb-2 px-4">2D Games</h3> <ul class="menu gap-2"><!--[-->`);
    const each_array_1 = ensure_array_like(experiments2D);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let experiment = each_array_1[$$index_1];
      $$renderer2.push(`<li><a${attr("href", experiment.path)}${attr_class("flex items-center gap-3", void 0, {
        "active": store_get($$store_subs ??= {}, "$page", page).url.pathname === experiment.path
      })}><span class="text-2xl">${escape_html(experiment.icon)}</span> <span>${escape_html(experiment.name)}</span></a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div></div></aside></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  ExperimentsSidebar($$renderer, {
    children: ($$renderer2) => {
      $$renderer2.push(`<!--[-->`);
      slot($$renderer2, $$props, "default", {});
      $$renderer2.push(`<!--]-->`);
    },
    $$slots: { default: true }
  });
}
export {
  _layout as default
};
