import { a1 as head } from "../../../../../../../chunks/index2.js";
import { S as Settings_module } from "../../../../../../../chunks/settings_module.js";
function _page($$renderer, $$props) {
  let { data } = $$props;
  let { profile } = data;
  let unsubscribed = profile?.unsubscribed;
  head("1uxys4i", $$renderer, ($$renderer2) => {
    $$renderer2.title(($$renderer3) => {
      $$renderer3.push(`<title>Change Email Subscription</title>`);
    });
  });
  $$renderer.push(`<h1 class="text-2xl font-bold mb-6">Email Subscription</h1> `);
  Settings_module($$renderer, {
    editable: true,
    title: "Subscription",
    message: unsubscribed ? "You are currently unsubscribed from emails" : "You are currently subscribed to emails",
    saveButtonTitle: unsubscribed ? "Re-subscribe" : "Unsubscribe",
    successBody: unsubscribed ? "You have been re-subscribed to emails" : "You have been unsubscribed from emails",
    formTarget: "/account/api?/toggleEmailSubscription",
    fields: []
  });
  $$renderer.push(`<!---->`);
}
export {
  _page as default
};
