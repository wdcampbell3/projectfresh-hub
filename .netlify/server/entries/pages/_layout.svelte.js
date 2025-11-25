import { V as store_get, W as unsubscribe_stores } from "../../chunks/index2.js";
/* empty css               */
import { n as navigating } from "../../chunks/stores.js";
import "clsx";
function MobileSplash($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function _layout($$renderer, $$props) {
  var $$store_subs;
  let { children } = $$props;
  MobileSplash($$renderer);
  $$renderer.push(`<!----> `);
  if (store_get($$store_subs ??= {}, "$navigating", navigating)) {
    $$renderer.push("<!--[-->");
    $$renderer.push(`<div class="fixed w-full top-0 right-0 left-0 h-1 z-50 bg-primary"></div>`);
  } else {
    $$renderer.push("<!--[!-->");
  }
  $$renderer.push(`<!--]--> `);
  children?.($$renderer);
  $$renderer.push(`<!---->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
}
export {
  _layout as default
};
