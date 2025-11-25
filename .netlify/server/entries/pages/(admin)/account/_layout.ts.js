import { P as PUBLIC_SUPABASE_URL, a as PUBLIC_SUPABASE_ANON_KEY } from "../../../../chunks/public.js";
import { isBrowser, createBrowserClient, createServerClient } from "@supabase/ssr";
import { redirect } from "@sveltejs/kit";
import { C as CreateProfileStep } from "../../../../chunks/config.js";
import { l as load_helper } from "../../../../chunks/load_helpers.js";
const load = async ({ fetch, data, depends, url }) => {
  depends("supabase:auth");
  const supabase = isBrowser() ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      fetch
    }
  }) : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      fetch
    },
    cookies: {
      getAll() {
        return data.cookies;
      }
    }
  });
  const { session, user } = await load_helper(data.session, supabase);
  if (!session || !user) {
    redirect(303, "/login");
  }
  const { data: profile } = await supabase.from("profiles").select(`*`).eq("id", user.id).single();
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const createProfilePath = "/account/create_profile";
  const signOutPath = "/account/sign_out";
  if (profile && !_hasFullProfile(profile) && url.pathname !== createProfilePath && url.pathname !== signOutPath && CreateProfileStep) {
    redirect(303, createProfilePath);
  }
  return {
    supabase,
    session,
    profile,
    user,
    amr: aal?.currentAuthenticationMethods
  };
};
const _hasFullProfile = (profile) => {
  if (!profile) {
    return false;
  }
  if (!profile.full_name) {
    return false;
  }
  if (!profile.company_name) {
    return false;
  }
  if (!profile.website) {
    return false;
  }
  return true;
};
export {
  _hasFullProfile,
  load
};
