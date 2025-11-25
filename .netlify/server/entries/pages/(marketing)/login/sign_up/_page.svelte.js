import { a1 as head } from "../../../../../chunks/index2.js";
import { A as Auth, o as oauthProviders, s as sharedAppearance } from "../../../../../chunks/login_config.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("hlagbe", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Sign up</title>`);
      });
    });
    $$renderer2.push(`<h1 class="text-2xl font-bold mb-6">Sign Up</h1> `);
    Auth($$renderer2, {
      supabaseClient: data.supabase,
      view: "sign_up",
      redirectTo: `${data.url}/auth/callback`,
      showLinks: false,
      providers: oauthProviders,
      socialLayout: "horizontal",
      appearance: sharedAppearance,
      additionalData: void 0
    });
    $$renderer2.push(`<!----> <div class="text-l text-slate-800 mt-4 mb-2">Have an account? <a class="underline" href="/login/sign_in">Sign in</a>.</div>`);
  });
}
export {
  _page as default
};
