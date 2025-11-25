import { b as private_env } from "./shared-server.js";
import Stripe from "stripe";
import { p as pricingPlans } from "./pricing_plans.js";
const stripe = new Stripe(private_env.PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" });
const getOrCreateCustomerId = async ({
  supabaseServiceRole,
  user
}) => {
  const { data: dbCustomer, error } = await supabaseServiceRole.from("stripe_customers").select("stripe_customer_id").eq("user_id", user.id).single();
  if (error && error.code != "PGRST116") {
    return { error };
  }
  if (dbCustomer?.stripe_customer_id) {
    return { customerId: dbCustomer.stripe_customer_id };
  }
  const { data: profile, error: profileError } = await supabaseServiceRole.from("profiles").select(`full_name, website, company_name`).eq("id", user.id).single();
  if (profileError) {
    return { error: profileError };
  }
  let customer;
  try {
    customer = await stripe.customers.create({
      email: user.email,
      name: profile.full_name ?? "",
      metadata: {
        user_id: user.id,
        company_name: profile.company_name ?? "",
        website: profile.website ?? ""
      }
    });
  } catch (e) {
    return { error: e };
  }
  if (!customer.id) {
    return { error: "Unknown stripe user creation error" };
  }
  const { error: insertError } = await supabaseServiceRole.from("stripe_customers").insert({
    user_id: user.id,
    stripe_customer_id: customer.id,
    updated_at: /* @__PURE__ */ new Date()
  });
  if (insertError) {
    return { error: insertError };
  }
  return { customerId: customer.id };
};
const fetchSubscription = async ({
  customerId
}) => {
  let stripeSubscriptions;
  try {
    stripeSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 100,
      status: "all"
    });
  } catch (e) {
    return { error: e };
  }
  const primaryStripeSubscription = stripeSubscriptions.data.find((x) => {
    return x.status === "active" || x.status === "trialing" || x.status === "past_due";
  });
  let appSubscription = null;
  if (primaryStripeSubscription) {
    const productId = primaryStripeSubscription?.items?.data?.[0]?.price.product ?? "";
    appSubscription = pricingPlans.find((x) => {
      return x.stripe_product_id === productId;
    });
    if (!appSubscription) {
      return {
        error: "Stripe subscription does not have matching app subscription in pricing_plans.ts (via product id match)"
      };
    }
  }
  let primarySubscription = null;
  if (primaryStripeSubscription && appSubscription) {
    primarySubscription = {
      stripeSubscription: primaryStripeSubscription,
      appSubscription
    };
  }
  const hasEverHadSubscription = stripeSubscriptions.data.length > 0;
  return {
    primarySubscription,
    hasEverHadSubscription
  };
};
export {
  fetchSubscription as f,
  getOrCreateCustomerId as g
};
