import { _hasFullProfile } from "../_layout.ts.js";
import { redirect } from "@sveltejs/kit";
async function load({ parent }) {
  const data = await parent();
  if (_hasFullProfile(data?.profile)) {
    redirect(303, "/account/select_plan");
  }
  return data;
}
export {
  load
};
