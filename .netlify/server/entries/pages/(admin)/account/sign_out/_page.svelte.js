import { e as escape_html } from "../../../../../chunks/escaping.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let { supabase } = data;
    let message = "Signing out....";
    $$renderer2.push(`<h1 class="text-2xl font-bold m-6 mx-auto my-auto">${escape_html(message)}</h1>`);
  });
}
export {
  _page as default
};
