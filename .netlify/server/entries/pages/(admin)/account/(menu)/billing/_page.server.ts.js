import { redirect, error } from "@sveltejs/kit";
import { g as getOrCreateCustomerId, f as fetchSubscription } from "../../../../../../chunks/subscription_helpers.server.js";
const load = async ({
  locals: { safeGetSession, supabaseServiceRole }
}) => {
  const { session, user } = await safeGetSession();
  if (!session || !user?.id) {
    redirect(303, "/login");
  }
  const { error: idError, customerId } = await getOrCreateCustomerId({
    supabaseServiceRole,
    user
  });
  if (idError || !customerId) {
    console.error("Error creating customer id", idError);
    error(500, {
      message: "Unknown error. If issue persists, please contact us."
    });
  }
  const {
    primarySubscription,
    hasEverHadSubscription,
    error: fetchErr
  } = await fetchSubscription({
    customerId
  });
  if (fetchErr) {
    console.error("Error fetching subscription", fetchErr);
    error(500, {
      message: "Unknown error. If issue persists, please contact us."
    });
  }
  return {
    isActiveCustomer: !!primarySubscription,
    hasEverHadSubscription,
    currentPlanId: primarySubscription?.appSubscription?.id
  };
};
export {
  load
};
