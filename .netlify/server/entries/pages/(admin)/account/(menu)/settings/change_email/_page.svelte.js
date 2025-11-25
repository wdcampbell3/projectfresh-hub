import { a2 as getContext, a1 as head } from "../../../../../../../chunks/index2.js";
import { S as Settings_module } from "../../../../../../../chunks/settings_module.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let adminSection = getContext("adminSection");
    adminSection.set("settings");
    let { data } = $$props;
    let { user } = data;
    head("c58dwk", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Change Email</title>`);
      });
    });
    $$renderer2.push(`<h1 class="text-2xl font-bold mb-6">Settings</h1> `);
    Settings_module($$renderer2, {
      title: "Change Email",
      editable: true,
      successTitle: "Email change initiated",
      successBody: "You should receive emails at both the old and new address to confirm the change. Please click the link in both emails to finalized the change. Until finalized, you must sign in with your current email.",
      formTarget: "/account/api?/updateEmail",
      fields: [
        {
          id: "email",
          label: "Email",
          initialValue: user?.email ?? "",
          placeholder: "Email address"
        }
      ]
    });
    $$renderer2.push(`<!---->`);
  });
}
export {
  _page as default
};
