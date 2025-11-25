import { redirect, fail } from "@sveltejs/kit";
import { s as sendAdminEmail, a as sendUserEmail } from "../../../../../chunks/mailer.js";
import { W as WebsiteBaseUrl } from "../../../../../chunks/config.js";
const actions = {
  toggleEmailSubscription: async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) {
      redirect(303, "/login");
    }
    const { data: currentProfile } = await supabase.from("profiles").select("unsubscribed").eq("id", session.user.id).single();
    const newUnsubscribedStatus = !currentProfile?.unsubscribed;
    const { error } = await supabase.from("profiles").update({ unsubscribed: newUnsubscribedStatus }).eq("id", session.user.id);
    if (error) {
      console.error("Error updating subscription status", error);
      return fail(500, { message: "Failed to update subscription status" });
    }
    return {
      unsubscribed: newUnsubscribedStatus
    };
  },
  updateEmail: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (!session) {
      redirect(303, "/login");
    }
    const formData = await request.formData();
    const email = formData.get("email");
    let validationError;
    if (!email || email === "") {
      validationError = "An email address is required";
    } else if (!email.includes("@")) {
      validationError = "A valid email address is required";
    }
    if (validationError) {
      return fail(400, {
        errorMessage: validationError,
        errorFields: ["email"],
        email
      });
    }
    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      console.error("Error updating email", error);
      return fail(500, {
        errorMessage: "Unknown error. If this persists please contact us.",
        email
      });
    }
    return {
      email
    };
  },
  updatePassword: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session, user, amr } = await safeGetSession();
    if (!session) {
      redirect(303, "/login");
    }
    const formData = await request.formData();
    const newPassword1 = formData.get("newPassword1");
    const newPassword2 = formData.get("newPassword2");
    const currentPassword = formData.get("currentPassword");
    const recoveryAmr = amr?.find((x) => x.method === "recovery");
    const isRecoverySession = recoveryAmr && !currentPassword;
    if (isRecoverySession) {
      const timeSinceLogin = Date.now() - recoveryAmr.timestamp * 1e3;
      if (timeSinceLogin > 1e3 * 60 * 15) {
        return fail(400, {
          errorMessage: 'Recovery code expired. Please log out, then use "Forgot Password" on the sign in page to reset your password. Codes are valid for 15 minutes.',
          errorFields: [],
          newPassword1,
          newPassword2,
          currentPassword: ""
        });
      }
    }
    let validationError;
    const errorFields = [];
    if (!newPassword1) {
      validationError = "You must type a new password";
      errorFields.push("newPassword1");
    }
    if (!newPassword2) {
      validationError = "You must type the new password twice";
      errorFields.push("newPassword2");
    }
    if (newPassword1.length < 6) {
      validationError = "The new password must be at least 6 charaters long";
      errorFields.push("newPassword1");
    }
    if (newPassword1.length > 72) {
      validationError = "The new password can be at most 72 charaters long";
      errorFields.push("newPassword1");
    }
    if (newPassword1 != newPassword2) {
      validationError = "The passwords don't match";
      errorFields.push("newPassword1");
      errorFields.push("newPassword2");
    }
    if (!currentPassword && !isRecoverySession) {
      validationError = "You must include your current password. If you forgot it, sign out then use 'forgot password' on the sign in page.";
      errorFields.push("currentPassword");
    }
    if (validationError) {
      return fail(400, {
        errorMessage: validationError,
        errorFields: [...new Set(errorFields)],
        // unique values
        newPassword1,
        newPassword2,
        currentPassword
      });
    }
    if (!isRecoverySession) {
      const { error: error2 } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword
      });
      if (error2) {
        redirect(303, "/login/current_password_error");
      }
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword1
    });
    if (error) {
      console.error("Error updating password", error);
      return fail(500, {
        errorMessage: "Unknown error. If this persists please contact us.",
        newPassword1,
        newPassword2,
        currentPassword
      });
    }
    return {
      newPassword1,
      newPassword2,
      currentPassword
    };
  },
  deleteAccount: async ({
    request,
    locals: { supabase, supabaseServiceRole, safeGetSession }
  }) => {
    const { session, user } = await safeGetSession();
    if (!session || !user?.id) {
      redirect(303, "/login");
    }
    const formData = await request.formData();
    const currentPassword = formData.get("currentPassword");
    if (!currentPassword) {
      return fail(400, {
        errorMessage: "You must provide your current password to delete your account. If you forgot it, sign out then use 'forgot password' on the sign in page.",
        errorFields: ["currentPassword"],
        currentPassword
      });
    }
    const { error: pwError } = await supabase.auth.signInWithPassword({
      email: user?.email || "",
      password: currentPassword
    });
    if (pwError) {
      redirect(303, "/login/current_password_error");
    }
    const { error } = await supabaseServiceRole.auth.admin.deleteUser(
      user.id,
      true
    );
    if (error) {
      console.error("Error deleting user", error);
      return fail(500, {
        errorMessage: "Unknown error. If this persists please contact us.",
        currentPassword
      });
    }
    await supabase.auth.signOut();
    redirect(303, "/");
  },
  updateProfile: async ({ request, locals: { supabase, safeGetSession } }) => {
    const { session, user } = await safeGetSession();
    if (!session || !user?.id) {
      redirect(303, "/login");
    }
    const formData = await request.formData();
    const fullName = formData.get("fullName");
    const companyName = formData.get("companyName");
    const website = formData.get("website");
    let validationError;
    const fieldMaxTextLength = 50;
    const errorFields = [];
    if (!fullName) {
      validationError = "Name is required";
      errorFields.push("fullName");
    } else if (fullName.length > fieldMaxTextLength) {
      validationError = `Name must be less than ${fieldMaxTextLength} characters`;
      errorFields.push("fullName");
    }
    if (!companyName) {
      validationError = "Company name is required. If this is a hobby project or personal app, please put your name.";
      errorFields.push("companyName");
    } else if (companyName.length > fieldMaxTextLength) {
      validationError = `Company name must be less than ${fieldMaxTextLength} characters`;
      errorFields.push("companyName");
    }
    if (!website) {
      validationError = "Company website is required. An app store URL is a good alternative if you don't have a website.";
      errorFields.push("website");
    } else if (website.length > fieldMaxTextLength) {
      validationError = `Company website must be less than ${fieldMaxTextLength} characters`;
      errorFields.push("website");
    }
    if (validationError) {
      return fail(400, {
        errorMessage: validationError,
        errorFields,
        fullName,
        companyName,
        website
      });
    }
    const { data: priorProfile, error: priorProfileError } = await supabase.from("profiles").select(`*`).eq("id", session?.user.id).single();
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      company_name: companyName,
      website,
      updated_at: /* @__PURE__ */ new Date(),
      unsubscribed: priorProfile?.unsubscribed ?? false
    }).select();
    if (error) {
      console.error("Error updating profile", error);
      return fail(500, {
        errorMessage: "Unknown error. If this persists please contact us.",
        fullName,
        companyName,
        website
      });
    }
    const newProfile = priorProfile?.updated_at === null && priorProfileError === null;
    if (newProfile) {
      await sendAdminEmail({
        subject: "Profile Created",
        body: `Profile created by ${session.user.email}
Full name: ${fullName}
Company name: ${companyName}
Website: ${website}`
      });
      await sendUserEmail({
        user: session.user,
        subject: "Welcome!",
        from_email: "no-reply@saasstarter.work",
        template_name: "welcome_email",
        template_properties: {
          companyName: "SaaS Starter",
          WebsiteBaseUrl
        }
      });
    }
    return {
      fullName,
      companyName,
      website
    };
  },
  signout: async ({ locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    if (session) {
      await supabase.auth.signOut();
      redirect(303, "/");
    } else {
      redirect(303, "/");
    }
  }
};
export {
  actions
};
