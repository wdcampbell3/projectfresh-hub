import { b as private_env } from "../../../../../../../chunks/shared-server.js";
import { redirect, error } from "@sveltejs/kit";
import Stripe from "stripe";
import { g as getOrCreateCustomerId } from "../../../../../../../chunks/subscription_helpers.server.js";
const stripe = new Stripe(private_env.PRIVATE_STRIPE_API_KEY, { apiVersion: "2023-08-16" });
const load = async ({
  url,
  locals: { safeGetSession, supabaseServiceRole }
}) => {
  const { session, user } = await safeGetSession();
  if (!session || !user) {
    redirect(303, "/login");
  }
  const { error: idError, customerId } = await getOrCreateCustomerId({
    supabaseServiceRole,
    user
  });
  if (idError || !customerId) {
    console.error("Error creating customer id", idError);
    error(500, {
      message: "Unknown error (PCID). If issue persists, please contact us."
    });
  }
  let portalLink;
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${url.origin}/account/billing`
    });
    portalLink = portalSession?.url;
  } catch (e) {
    console.error("Error creating billing portal session", e);
    error(500, "Unknown error (PSE). If issue persists, please contact us.");
  }
  redirect(303, portalLink ?? "/account/billing");
};
export {
  load
};
