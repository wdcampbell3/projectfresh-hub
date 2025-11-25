import "clsx";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data, children } = $$props;
    let tmp = data;
    tmp.supabase;
    tmp.session;
    children?.($$renderer2);
    $$renderer2.push(`<!---->`);
  });
}
export {
  _layout as default
};
