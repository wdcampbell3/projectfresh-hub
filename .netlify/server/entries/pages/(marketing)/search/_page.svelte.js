import { V as store_get, a1 as head, a0 as attr, $ as ensure_array_like, W as unsubscribe_stores, Z as stringify } from "../../../../chunks/index2.js";
import { p as page } from "../../../../chunks/stores.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let results = [];
    let searchQuery = decodeURIComponent(store_get($$store_subs ??= {}, "$page", page).url.hash.slice(1) ?? "");
    head("1ou5319", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Search</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Search our website."/>`);
    });
    $$renderer2.push(`<div class="py-8 lg:py-12 px-6 max-w-lg mx-auto"><div class="text-3xl lg:text-5xl font-medium text-primary flex gap-3 items-baseline text-center place-content-center"><div class="text-center leading-relaxed font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">Search</div></div> <label class="input input-bordered flex items-center gap-2 mt-10 mb-5 w-full"><input id="search-input" type="text" class="grow w-full" placeholder="Search"${attr("value", searchQuery)} aria-label="Search input"/></label> `);
    if (searchQuery.length > 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-center mt-10 text-accent text-xl">Loading...</div>`);
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
    $$renderer2.push(`<!--]--> <div><!--[-->`);
    const each_array = ensure_array_like(results);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let result = each_array[i];
      $$renderer2.push(`<a${attr("href", result.item.path || "/")}${attr("id", `search-result-${stringify(i + 1)}`)} class="card my-6 bg-white shadow-xl flex-row overflow-hidden focus:mx-[-10px] focus:my-[-5px] focus:border-4 focus:border-secondary"><div class="flex-none w-6 md:w-32 bg-secondary"></div> <div class="py-6 px-6"><div class="text-xl">${escape_html(result.item.title)}</div> <div class="text-sm text-accent">${escape_html(result.item.path)}</div> <div class="text-slate-500">${escape_html(result.item.description)}</div></div></a>`);
    }
    $$renderer2.push(`<!--]--></div> <div></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
