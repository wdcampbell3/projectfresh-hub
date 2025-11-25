import { a2 as getContext, a1 as head } from "../../../../../../../chunks/index2.js";
import { S as Settings_module } from "../../../../../../../chunks/settings_module.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let adminSection = getContext("adminSection");
    adminSection.set("settings");
    let { data } = $$props;
    let { profile } = data;
    head("zrdtor", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Edit Profile</title>`);
      });
    });
    $$renderer2.push(`<h1 class="text-2xl font-bold mb-6">Settings</h1> `);
    Settings_module($$renderer2, {
      editable: true,
      title: "Edit Profile",
      successTitle: "Saved Profile",
      formTarget: "/account/api?/updateProfile",
      fields: [
        {
          id: "fullName",
          label: "Name",
          initialValue: profile?.full_name ?? "",
          placeholder: "Your full name",
          maxlength: 50
        },
        {
          id: "companyName",
          label: "Company Name",
          initialValue: profile?.company_name ?? "",
          maxlength: 50
        },
        {
          id: "website",
          label: "Company Website",
          initialValue: profile?.website ?? "",
          maxlength: 50
        }
      ]
    });
    $$renderer2.push(`<!---->`);
  });
}
export {
  _page as default
};
