import { a2 as getContext, a1 as head, Z as stringify } from "../../../../../../../chunks/index2.js";
import { S as Settings_module } from "../../../../../../../chunks/settings_module.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let adminSection = getContext("adminSection");
    adminSection.set("settings");
    let { data } = $$props;
    let { session } = data;
    head("1yv08kg", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Delete Account</title>`);
      });
    });
    $$renderer2.push(`<h1 class="text-2xl font-bold mb-6">Settings</h1> `);
    Settings_module($$renderer2, {
      title: "Delete Account",
      editable: true,
      dangerous: true,
      message: `Deleting your account can not be undone. You are currently logged in as '${stringify(session?.user?.email)}'`,
      saveButtonTitle: "Delete Account",
      successTitle: "Account queued for deletion",
      successBody: "Your account will be deleted shortly.",
      formTarget: "/account/api?/deleteAccount",
      fields: [
        {
          id: "currentPassword",
          label: "Current Password",
          initialValue: "",
          inputType: "password"
        }
      ]
    });
    $$renderer2.push(`<!---->`);
  });
}
export {
  _page as default
};
