import { a1 as head, V as store_get, W as unsubscribe_stores } from "../../../../../chunks/index2.js";
import { A as Auth, o as oauthProviders, s as sharedAppearance } from "../../../../../chunks/login_config.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import { p as page } from "../../../../../chunks/stores.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let { data } = $$props;
    let { supabase } = data;
    head("434x9k", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Sign in</title>`);
      });
    });
    if (store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("verified") == "true") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div role="alert" class="alert alert-success mb-5"><svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>Email verified! Please sign in.</span></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <h1 class="text-2xl font-bold mb-6">Sign In</h1> `);
    Auth($$renderer2, {
      supabaseClient: data.supabase,
      view: "sign_in",
      redirectTo: `${data.url}/auth/callback`,
      providers: oauthProviders,
      socialLayout: "horizontal",
      showLinks: false,
      appearance: sharedAppearance,
      additionalData: void 0
    });
    $$renderer2.push(`<!----> <div class="text-l text-slate-800 mt-4"><a class="underline" href="/login/forgot_password">Forgot password?</a></div> <div class="text-l text-slate-800 mt-3">Don't have an account? <a class="underline" href="/login/sign_up">Sign up</a>.</div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
