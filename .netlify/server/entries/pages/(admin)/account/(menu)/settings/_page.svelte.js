import { a2 as getContext, a1 as head } from "../../../../../../chunks/index2.js";
import { S as Settings_module } from "../../../../../../chunks/settings_module.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let adminSection = getContext("adminSection");
    adminSection.set("settings");
    let { data } = $$props;
    let { profile, user } = data;
    head("1v5ld9s", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Settings</title>`);
      });
    });
    $$renderer2.push(`<h1 class="text-2xl font-bold mb-6">Settings</h1> `);
    Settings_module($$renderer2, {
      title: "Profile",
      editable: false,
      fields: [
        {
          id: "fullName",
          label: "Name",
          initialValue: profile?.full_name ?? ""
        },
        {
          id: "companyName",
          label: "Company Name",
          initialValue: profile?.company_name ?? ""
        },
        {
          id: "website",
          label: "Company Website",
          initialValue: profile?.website ?? ""
        }
      ],
      editButtonTitle: "Edit Profile",
      editLink: "/account/settings/edit_profile"
    });
    $$renderer2.push(`<!----> `);
    Settings_module($$renderer2, {
      title: "Email",
      editable: false,
      fields: [{ id: "email", initialValue: user?.email || "" }],
      editButtonTitle: "Change Email",
      editLink: "/account/settings/change_email"
    });
    $$renderer2.push(`<!----> `);
    Settings_module($$renderer2, {
      title: "Password",
      editable: false,
      fields: [{ id: "password", initialValue: "••••••••••••••••" }],
      editButtonTitle: "Change Password",
      editLink: "/account/settings/change_password"
    });
    $$renderer2.push(`<!----> `);
    Settings_module($$renderer2, {
      title: "Email Subscription",
      editable: false,
      fields: [
        {
          id: "subscriptionStatus",
          initialValue: profile?.unsubscribed ? "Unsubscribed" : "Subscribed"
        }
      ],
      editButtonTitle: "Change Subscription",
      editLink: "/account/settings/change_email_subscription"
    });
    $$renderer2.push(`<!----> `);
    Settings_module($$renderer2, {
      title: "Danger Zone",
      editable: false,
      dangerous: true,
      fields: [],
      editButtonTitle: "Delete Account",
      editLink: "/account/settings/delete_account"
    });
    $$renderer2.push(`<!---->`);
  });
}
export {
  _page as default
};
