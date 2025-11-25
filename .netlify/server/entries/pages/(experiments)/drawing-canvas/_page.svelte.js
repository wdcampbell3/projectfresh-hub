import { a1 as head, X as attr_class, $ as ensure_array_like, a4 as attr_style, a0 as attr, Z as stringify } from "../../../../chunks/index2.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let brushColor = "#000000";
    let brushSize = 5;
    let tool = "brush";
    const colors = [
      "#000000",
      "#ffffff",
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#ff8800",
      "#8800ff"
    ];
    head("o9iay2", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Drawing Canvas</title>`);
      });
    });
    $$renderer2.push(`<div class="container mx-auto max-w-6xl"><h1 class="mb-6 text-3xl font-bold" style="color: #660460;">🎨 Drawing Canvas</h1> <div class="flex flex-col lg:flex-row gap-6"><div class="card bg-base-100 shadow-xl lg:w-64"><div class="card-body"><h2 class="card-title mb-4" style="color: #660460;">Tools</h2> <div class="form-control mb-4"><span class="label-text font-semibold mb-2 block">Tool</span> <div class="btn-group w-full"><button${attr_class("btn btn-sm flex-1", void 0, { "btn-active": tool === "brush" })}>🖌️ Brush</button> <button${attr_class("btn btn-sm flex-1", void 0, { "btn-active": tool === "eraser" })}>🧹 Eraser</button></div></div> <div class="form-control mb-4"><span class="label-text font-semibold mb-2 block">Color</span> <div class="grid grid-cols-5 gap-2 mb-2"><!--[-->`);
    const each_array = ensure_array_like(colors);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let color = each_array[$$index];
      $$renderer2.push(`<button${attr_class("btn btn-square btn-sm", void 0, {
        "ring-2": brushColor === color,
        "ring-primary": brushColor === color
      })}${attr_style(`background-color: ${stringify(color)}; border-color: ${stringify(color === "#ffffff" ? "#e5e7eb" : color)}`)}${attr("aria-label", `Select color ${stringify(color)}`)}></button>`);
    }
    $$renderer2.push(`<!--]--></div> <input type="color" class="w-full h-10 rounded-btn cursor-pointer"${attr("value", brushColor)}/></div> <div class="form-control mb-4"><span class="label-text font-semibold mb-2 block">Brush Size: ${escape_html(brushSize)}px</span> <input type="range" min="1" max="50"${attr("value", brushSize)} class="range range-primary"/></div> <div class="divider"></div> <button class="btn btn-warning btn-block mb-2">🗑️ Clear Canvas</button> <button class="btn btn-primary btn-block">💾 Download Image</button></div></div> <div class="flex-1"><div class="card bg-base-100 shadow-xl"><div class="card-body p-4"><div class="relative inline-block"><canvas width="800" height="600" class="border-2 border-base-300 rounded-lg cursor-none touch-none svelte-o9iay2" style="max-width: 100%; height: auto; display: block;"></canvas> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></div></div></div></div>`);
  });
}
export {
  _page as default
};
