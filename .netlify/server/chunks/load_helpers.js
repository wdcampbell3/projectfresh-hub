import { isBrowser } from "@supabase/ssr";
const load_helper = async (server_session, supabase) => {
  let session = server_session;
  if (isBrowser()) {
    const getSessionResponse = await supabase.auth.getSession();
    session = getSessionResponse.data.session;
  }
  if (!session) {
    return {
      session: null,
      user: null
    };
  }
  if ("suppressGetSessionWarning" in supabase.auth) {
    supabase.auth.suppressGetSessionWarning = true;
  } else {
    console.warn(
      "SupabaseAuthClient#suppressGetSessionWarning was removed. See https://github.com/supabase/auth-js/issues/888."
    );
  }
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return {
      session: null,
      user: null
    };
  }
  return {
    session,
    user
  };
};
export {
  load_helper as l
};
