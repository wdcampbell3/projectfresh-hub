import { redirect } from "@sveltejs/kit";
import { isAuthApiError } from "@supabase/supabase-js";
const GET = async ({ url, locals: { supabase } }) => {
  const code = url.searchParams.get("code");
  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      if (isAuthApiError(error)) {
        redirect(303, "/login/sign_in?verified=true");
      } else {
        throw error;
      }
    }
  }
  const next = url.searchParams.get("next");
  if (next) {
    redirect(303, next);
  }
  redirect(303, "/account");
};
export {
  GET
};
