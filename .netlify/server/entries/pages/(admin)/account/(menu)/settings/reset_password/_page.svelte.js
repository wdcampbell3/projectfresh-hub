import { a2 as getContext, a1 as head } from "../../../../../../../chunks/index2.js";
import { S as Settings_module } from "../../../../../../../chunks/settings_module.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let adminSection = getContext("adminSection");
    adminSection.set("settings");
    head("12mkm6q", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Reset Password</title>`);
      });
    });
    $$renderer2.push(`<h1 class="text-2xl font-bold mb-6">Settings</h1> `);
    Settings_module($$renderer2, {
      title: "Reset Password",
      editable: true,
      saveButtonTitle: "Reset Password",
      successTitle: "Password Changed",
      successBody: "On next sign in, use your new password.",
      formTarget: "/account/api?/updatePassword",
      fields: [
        {
          id: "newPassword1",
          label: "New Password",
          initialValue: "",
          inputType: "password"
        },
        {
          id: "newPassword2",
          label: "Confirm New Password",
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
