import { Resend } from "resend";
import { b as private_env } from "./shared-server.js";
import { P as PUBLIC_SUPABASE_URL } from "./public.js";
import { createClient } from "@supabase/supabase-js";
import handlebars from "handlebars";
const __variableDynamicImportRuntimeHelper = (glob, path, segs) => {
  const v = glob[path];
  if (v) {
    return typeof v === "function" ? v() : Promise.resolve(v);
  }
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(
      reject.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + path + (path.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
const sendAdminEmail = async ({
  subject,
  body
}) => {
  if (!private_env.PRIVATE_ADMIN_EMAIL) {
    return;
  }
  try {
    const resend = new Resend(private_env.PRIVATE_RESEND_API_KEY);
    const resp = await resend.emails.send({
      from: private_env.PRIVATE_FROM_ADMIN_EMAIL || private_env.PRIVATE_ADMIN_EMAIL,
      to: [private_env.PRIVATE_ADMIN_EMAIL],
      subject: "ADMIN_MAIL: " + subject,
      text: body
    });
    if (resp.error) {
      console.log("Failed to send admin email, error:", resp.error);
    }
  } catch (e) {
    console.log("Failed to send admin email, error:", e);
  }
};
const sendUserEmail = async ({
  user,
  subject,
  from_email,
  template_name,
  template_properties
}) => {
  const email = user.email;
  if (!email) {
    console.log("No email for user. Aborting email. ", user.id);
    return;
  }
  const serverSupabase = createClient(
    PUBLIC_SUPABASE_URL,
    private_env.PRIVATE_SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } }
  );
  const { data: serviceUserData } = await serverSupabase.auth.admin.getUserById(
    user.id
  );
  const emailVerified = serviceUserData.user?.email_confirmed_at || serviceUserData.user?.user_metadata?.email_verified;
  if (!emailVerified) {
    console.log("User email not verified. Aborting email. ", user.id, email);
    return;
  }
  const { data: profile, error: profileError } = await serverSupabase.from("profiles").select("unsubscribed").eq("id", user.id).single();
  if (profileError) {
    console.log("Error fetching user profile. Aborting email. ", user.id, email);
    return;
  }
  if (profile?.unsubscribed) {
    console.log("User unsubscribed. Aborting email. ", user.id, email);
    return;
  }
  await sendTemplatedEmail({
    subject,
    to_emails: [email],
    from_email,
    template_name,
    template_properties
  });
};
const sendTemplatedEmail = async ({
  subject,
  to_emails,
  from_email,
  template_name,
  template_properties
}) => {
  if (!private_env.PRIVATE_RESEND_API_KEY) {
    return;
  }
  let plaintextBody = void 0;
  try {
    const textTemplate = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "./emails/welcome_email_text.hbs": () => import("./welcome_email_text.js") }), `./emails/${template_name}_text.hbs`, 3).then((mod) => mod.default);
    const template = handlebars.compile(textTemplate);
    plaintextBody = template(template_properties);
  } catch (e) {
    plaintextBody = void 0;
  }
  let htmlBody = void 0;
  try {
    const htmlTemplate = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "./emails/welcome_email_html.hbs": () => import("./welcome_email_html.js") }), `./emails/${template_name}_html.hbs`, 3).then((mod) => mod.default);
    const template = handlebars.compile(htmlTemplate);
    htmlBody = template(template_properties);
  } catch (e) {
    htmlBody = void 0;
  }
  if (!plaintextBody && !htmlBody) {
    console.log(
      "No email body: requires plaintextBody or htmlBody. Template: ",
      template_name
    );
    return;
  }
  try {
    const email = {
      from: from_email,
      to: to_emails,
      subject
    };
    if (plaintextBody) {
      email.text = plaintextBody;
    }
    if (htmlBody) {
      email.html = htmlBody;
    }
    const resend = new Resend(private_env.PRIVATE_RESEND_API_KEY);
    const resp = await resend.emails.send(email);
    if (resp.error) {
      console.log("Failed to send email, error:", resp.error);
    }
  } catch (e) {
    console.log("Failed to send email, error:", e);
  }
};
export {
  sendUserEmail as a,
  sendAdminEmail as s
};
