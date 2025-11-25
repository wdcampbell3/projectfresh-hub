import { P as PUBLIC_SUPABASE_URL, a as PUBLIC_SUPABASE_ANON_KEY } from "../../../../chunks/public.js";
import { isBrowser, createBrowserClient, createServerClient } from "@supabase/ssr";
import { redirect } from "@sveltejs/kit";
import { l as load_helper } from "../../../../chunks/load_helpers.js";
const load = async ({ fetch, data, depends }) => {
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
  if (session && user) {
    redirect(303, "/account");
  }
  const url = data.url;
  return { supabase, url };
};
export {
  load
};
