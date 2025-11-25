import { a2 as getContext, a1 as head } from "../../../../../../chunks/index2.js";
import { S as Settings_module } from "../../../../../../chunks/settings_module.js";
import { P as Pricing_module } from "../../../../../../chunks/pricing_module.js";
import { d as defaultPlanId, p as pricingPlans } from "../../../../../../chunks/pricing_plans.js";
import { e as escape_html } from "../../../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let adminSection = getContext("adminSection");
    adminSection.set("billing");
    let { data } = $$props;
    let currentPlanId = data.currentPlanId ?? defaultPlanId;
    let currentPlanName = pricingPlans.find((x) => x.id === data.currentPlanId)?.name;
    head("9asqzq", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Billing</title>`);
      });
    });
    $$renderer2.push(`<h1 class="text-2xl font-bold mb-2">${escape_html(data.isActiveCustomer ? "Billing" : "Select a Plan")}</h1> <div>View our <a href="/pricing" target="_blank" class="link">pricing page</a> for details.</div> `);
    if (!data.isActiveCustomer) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mt-8">`);
      Pricing_module($$renderer2, { currentPlanId, callToAction: "Select Plan", center: false });
      $$renderer2.push(`<!----></div> `);
      if (data.hasEverHadSubscription) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="mt-10"><a href="/account/billing/manage" class="link">View past invoices</a></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
      Settings_module($$renderer2, {
        title: "Subscription",
        editable: false,
        fields: [
          {
            id: "plan",
            label: "Current Plan",
            initialValue: currentPlanName || ""
          }
        ],
        editButtonTitle: "Manage Subscription",
        editLink: "/account/billing/manage"
      });
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
