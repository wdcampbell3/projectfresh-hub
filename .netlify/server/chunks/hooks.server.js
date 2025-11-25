import { b as private_env } from "./shared-server.js";
import { P as PUBLIC_SUPABASE_URL, a as PUBLIC_SUPABASE_ANON_KEY } from "./public.js";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { sequence } from "@sveltejs/kit/hooks";
const supabase = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => event.cookies.getAll(),
        /**
         * SvelteKit's cookies API requires `path` to be explicitly set in
         * the cookie options. Setting `path` to `/` replicates previous/
         * standard behavior.
         */
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: "/" });
          });
        }
      }
    }
  );
  event.locals.supabaseServiceRole = createClient(
    PUBLIC_SUPABASE_URL,
    private_env.PRIVATE_SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } }
  );
  if ("suppressGetSessionWarning" in event.locals.supabase.auth) {
    event.locals.supabase.auth.suppressGetSessionWarning = true;
  } else {
    console.warn(
      "SupabaseAuthClient#suppressGetSessionWarning was removed. See https://github.com/supabase/auth-js/issues/888."
    );
  }
  event.locals.safeGetSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();
    if (!session) {
      return { session: null, user: null, amr: null };
    }
    const {
      data: { user },
      error: userError
    } = await event.locals.supabase.auth.getUser();
    if (userError) {
      return { session: null, user: null, amr: null };
    }
    const { data: aal, error: amrError } = await event.locals.supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (amrError) {
      return { session, user, amr: null };
    }
    return { session, user, amr: aal.currentAuthenticationMethods };
  };
  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range" || name === "x-supabase-api-version";
    }
  });
};
const authGuard = async ({ event, resolve }) => {
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;
  return resolve(event);
};
const handle = sequence(supabase, authGuard);
export {
  handle,
  supabase
};
