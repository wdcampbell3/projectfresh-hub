import { a1 as head } from "../../../../../chunks/index2.js";
import { A as Auth, s as sharedAppearance, o as oauthProviders } from "../../../../../chunks/login_config.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    head("1q99pjc", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Forgot Password</title>`);
      });
    });
    $$renderer2.push(`<h1 class="text-2xl font-bold mb-6">Forgot Password</h1> `);
    Auth($$renderer2, {
      supabaseClient: data.supabase,
      view: "forgotten_password",
      redirectTo: `${data.url}/auth/callback?next=%2Faccount%2Fsettings%2Freset_password`,
      providers: oauthProviders,
      socialLayout: "horizontal",
      showLinks: false,
      appearance: sharedAppearance,
      additionalData: void 0
    });
    $$renderer2.push(`<!----> <div class="text-l text-slate-800 mt-4">Remember your password? <a class="underline" href="/login/sign_in">Sign in</a>.</div>`);
  });
}
export {
  _page as default
};
