import { redirect } from "@sveltejs/kit";
const actions = {
  signout: async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (session) {
      await supabase.auth.signOut();
      redirect(303, "/");
    }
  }
};
export {
  actions
};
