import { a2 as getContext, a1 as head, X as attr_class, a0 as attr, Z as stringify } from "../../../../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../../../../chunks/exports.js";
import "../../../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../../chunks/state.svelte.js";
import { S as Settings_module } from "../../../../../../../chunks/settings_module.js";
import { e as escape_html } from "../../../../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let adminSection = getContext("adminSection");
    adminSection.set("settings");
    let { data } = $$props;
    let { user, supabase } = data;
    let hasPassword = user?.amr?.find((x) => x.method === "password") ? true : false;
    let usingOAuth = user?.amr?.find((x) => x.method === "oauth") ? true : false;
    let sendBtnDisabled = false;
    let sendBtnText = "Send Set Password Email";
    head("b0aed7", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Change Password</title>`);
      });
    });
    $$renderer2.push(`<h1 class="text-2xl font-bold mb-6">Change Password</h1> `);
    if (hasPassword) {
      $$renderer2.push("<!--[-->");
      Settings_module($$renderer2, {
        title: "Change Password",
        editable: true,
        saveButtonTitle: "Change Password",
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
          },
          {
            id: "currentPassword",
            label: "Current Password",
            initialValue: "",
            inputType: "password"
          }
        ]
      });
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow-sm max-w-md"><div class="flex flex-col gap-y-4">`);
      if (usingOAuth) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="font-bold">Set Password By Email</div> <div>You use oAuth to sign in ("Sign in with Github" or similar). You can
          continue to access your account using only oAuth if you like!</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="font-bold">Change Password By Email</div>`);
      }
      $$renderer2.push(`<!--]--> <div>The button below will send you an email at ${escape_html(user?.email)} which will allow
        you to set your password.</div> <button${attr_class(`btn btn-outline btn-wide ${stringify("")}`)}${attr("disabled", sendBtnDisabled, true)}>${escape_html(sendBtnText)}</button> <div${attr_class(`success alert alert-success ${stringify("hidden")}`)}>Sent email! Please check your inbox and use the link to set your
        password.</div></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
