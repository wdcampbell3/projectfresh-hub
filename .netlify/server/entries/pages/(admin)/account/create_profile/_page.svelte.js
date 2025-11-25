import { a1 as head, X as attr_class, a0 as attr, Z as stringify } from "../../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
/* empty css                        */
import { e as escape_html } from "../../../../../chunks/escaping.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data, form } = $$props;
    let { user, profile } = data;
    let loading = false;
    let fullName = profile?.full_name ?? "";
    let companyName = profile?.company_name ?? "";
    let website = profile?.website ?? "";
    const fieldError = (liveForm, name) => {
      let errors = liveForm?.errorFields ?? [];
      return errors.includes(name);
    };
    head("jtffe2", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Create Profile</title>`);
      });
    });
    $$renderer2.push(`<div class="text-center content-center max-w-lg mx-auto min-h-[100vh] pb-12 flex items-center place-content-center"><div class="flex flex-col w-64 lg:w-80"><div><h1 class="text-2xl font-bold mb-6">Create Profile</h1> <form class="form-widget" method="POST" action="/account/api?/updateProfile"><div class="mt-4"><label for="fullName"><span class="text-l text-center">Your Name</span></label> <input id="fullName" name="fullName" type="text" placeholder="Your full name"${attr_class(`${stringify(fieldError(form, "fullName") ? "input-error" : "")} mt-1 input input-bordered w-full max-w-xs`)}${attr("value", form?.fullName ?? fullName)} maxlength="50"/></div> <div class="mt-4"><label for="companyName"><span class="text-l text-center">Company Name</span></label> <input id="companyName" name="companyName" type="text" placeholder="Company name"${attr_class(`${stringify(fieldError(form, "companyName") ? "input-error" : "")} mt-1 input input-bordered w-full max-w-xs`)}${attr("value", form?.companyName ?? companyName)} maxlength="50"/></div> <div class="mt-4"><label for="website"><span class="text-l text-center">Company Website</span></label> <input id="website" name="website" type="text" placeholder="Company website"${attr_class(`${stringify(fieldError(form, "website") ? "input-error" : "")} mt-1 input input-bordered w-full max-w-xs`)}${attr("value", form?.website ?? website)} maxlength="50"/></div> `);
    if (form?.errorMessage) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-red-700 text-sm font-bold text-center mt-3">${escape_html(form?.errorMessage)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="mt-4"><input type="submit" class="btn btn-primary mt-3 btn-wide"${attr("value", "Create Profile")}${attr("disabled", loading, true)}/></div></form> <div class="text-sm text-slate-800 mt-14">You are logged in as ${escape_html(user?.email)}. <br/> <a class="underline" href="/account/sign_out">Sign out</a></div></div></div></div>`);
  });
}
export {
  _page as default
};
