import { X as attr_class, a0 as attr, $ as ensure_array_like, Z as stringify, V as store_get, W as unsubscribe_stores } from "./index2.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils.js";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
import { p as page } from "./stores.js";
import { e as escape_html } from "./escaping.js";
function Settings_module($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const fieldError = (liveForm, name) => {
      let errors = liveForm?.errorFields ?? [];
      return errors.includes(name);
    };
    let loading = false;
    let {
      editable = false,
      dangerous = false,
      title = "",
      message = "",
      fields,
      formTarget = "",
      successTitle = "Success",
      successBody = "",
      editButtonTitle = null,
      editLink = null,
      saveButtonTitle = "Save"
    } = $$props;
    $$renderer2.push(`<div class="card p-6 pb-7 mt-8 max-w-xl flex flex-col md:flex-row shadow-sm">`);
    if (title) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="text-xl font-bold mb-3 w-48 md:pr-8 flex-none">${escape_html(title)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="w-full min-w-48">`);
    {
      $$renderer2.push("<!--[-->");
      if (message) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr_class(`mb-6 ${stringify(dangerous ? "alert alert-warning" : "")}`)}>`);
        if (dangerous) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> <span>${escape_html(message)}</span></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <form class="form-widget flex flex-col" method="POST"${attr("action", formTarget)}><!--[-->`);
      const each_array = ensure_array_like(fields);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let field = each_array[$$index];
        if (field.label) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<label${attr("for", field.id)}><span class="text-sm text-gray-500">${escape_html(field.label)}</span></label>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (editable) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<input${attr("id", field.id)}${attr("name", field.id)}${attr("type", field.inputType ?? "text")}${attr("disabled", !editable, true)}${attr("placeholder", field.placeholder ?? field.label ?? "")}${attr_class(`${stringify(fieldError(store_get($$store_subs ??= {}, "$page", page)?.form, field.id) ? "input-error" : "")} input-sm mt-1 input input-bordered w-full max-w-xs mb-3 text-base py-4`)}${attr("value", store_get($$store_subs ??= {}, "$page", page).form ? store_get($$store_subs ??= {}, "$page", page).form[field.id] : field.initialValue)}${attr("maxlength", field.maxlength ? field.maxlength : null)}/>`);
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<div class="text-lg mb-3">${escape_html(field.initialValue)}</div>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--> `);
      if (store_get($$store_subs ??= {}, "$page", page)?.form?.errorMessage) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<p class="text-red-700 text-sm font-bold mt-1">${escape_html(store_get($$store_subs ??= {}, "$page", page)?.form?.errorMessage)}</p>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (editable) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div><button type="submit"${attr_class(`ml-auto btn btn-sm mt-3 min-w-[145px] ${stringify(dangerous ? "btn-error" : "btn-primary btn-outline")}`)}${attr("disabled", loading, true)}>`);
        {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`${escape_html(saveButtonTitle)}`);
        }
        $$renderer2.push(`<!--]--></button></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (editButtonTitle && editLink) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<a${attr("href", editLink)} class="mt-1"><button${attr_class(`btn btn-outline btn-sm ${stringify(dangerous ? "btn-error" : "")} min-w-[145px]`)}>${escape_html(editButtonTitle)}</button></a>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></form>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  Settings_module as S
};
