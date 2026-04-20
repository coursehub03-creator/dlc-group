"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import {
  newRequestSchema,
  profileUpdateSchema,
  securityUpdateSchema,
  settingsUpdateSchema,
  supportRequestSchema
} from "@/lib/validators/dashboard";

export type DashboardActionState = {
  success?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function isMissingTableOrColumnError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  );
}

async function safeCreateActivityLog(input: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  meta?: Prisma.InputJsonValue | null;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        meta: input.meta ?? undefined
      }
    });
  } catch (error) {
    console.error("[dashboard] activity log write skipped", error);
  }
}

async function safeCreateNotification(input: {
  userId: string;
  title: string;
  message: string;
}) {
  try {
    await prisma.notification.create({
      data: input
    });
  } catch (error) {
    console.error("[dashboard] notification write skipped", error);
  }
}

async function requireUser() {
  const session = await auth();
  const id = session?.user?.id;

  if (typeof id !== "string" || id.trim().length === 0) {
    redirect("/auth/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true }
  });

  if (!dbUser) {
    redirect("/auth/sign-in");
  }

  return {
    id: dbUser.id,
    email: dbUser.email ?? "",
    name: dbUser.name ?? "Client"
  };
}

async function getUserWithOptionalProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true }
  });

  if (!user) {
    return null;
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { phone: true, country: true }
    });

    return { ...user, profile };
  } catch (error) {
    if (!isMissingTableOrColumnError(error)) {
      throw error;
    }

    console.error("[dashboard] profile lookup skipped", error);
    return { ...user, profile: null };
  }
}

export async function createClientRequestAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch (error) {
    console.error("[dashboard] createClientRequestAction auth error", error);
    return { error: "Please sign in again to submit your request." };
  }

  const parsed = newRequestSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    message: formData.get("message"),
    country: formData.get("country") || undefined
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let dbUser: Awaited<ReturnType<typeof getUserWithOptionalProfile>>;
  try {
    dbUser = await getUserWithOptionalProfile(user.id);
  } catch (error) {
    console.error("[dashboard] createClientRequestAction user lookup failed", error);
    return { error: "Unable to find your account." };
  }

  if (!dbUser) {
    return { error: "Unable to find your account." };
  }

  let resolvedCategoryId: string | null = null;
  try {
    const category = await prisma.serviceCategory.findUnique({
      where: { id: parsed.data.categoryId },
      select: { id: true }
    });

    resolvedCategoryId = category?.id ?? null;

    if (!category) {
      const defaultCategory = await prisma.serviceCategory.upsert({
        where: { slug: "general-legal-consultation" },
        create: {
          slug: "general-legal-consultation",
          nameEn: "General legal consultation",
          nameAr: "استشارة قانونية عامة"
        },
        update: {},
        select: { id: true }
      });

      if (!defaultCategory?.id) {
        return { error: "Selected category is unavailable. Please refresh and try again." };
      }

      resolvedCategoryId = defaultCategory.id;
    }
  } catch (error) {
    console.error("[dashboard] createClientRequestAction category lookup failed", error);
    return { error: "Selected category is unavailable. Please refresh and try again." };
  }

  if (!resolvedCategoryId) {
    return { error: "Selected category is unavailable. Please refresh and try again." };
  }

  let created: { id: string; subject: string };
  try {
    created = await prisma.legalRequest.create({
      data: {
        userId: user.id,
        categoryId: resolvedCategoryId,
        subject: parsed.data.title,
        details: parsed.data.message,
        country: parsed.data.country || dbUser.profile?.country || null,
      },
      select: {
        id: true,
        subject: true,
      }
    });

    await Promise.all([
      safeCreateActivityLog({
        actorId: user.id,
        action: "REQUEST_CREATED",
        entityType: "LegalRequest",
        entityId: created.id,
        meta: {
          subject: created.subject
        }
      }),
      safeCreateNotification({
        userId: user.id,
        title: "Request submitted",
        message: `Your legal request \"${created.subject}\" has been received.`
      })
    ]);
  } catch (error) {
    console.error("[dashboard] createClientRequestAction failed", error);
    return { error: "We could not submit your request right now. Please try again." };
  }

  try {
    revalidatePath("/client/dashboard");
    revalidatePath("/client/dashboard/requests");
  } catch (error) {
    console.error("[dashboard] createClientRequestAction revalidate skipped", error);
  }

  redirect("/client/dashboard/requests?created=1");
}

export async function updateProfileAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch (error) {
    console.error("[dashboard] updateProfileAction auth error", error);
    return { error: "Please sign in again to update your profile." };
  }

  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    country: formData.get("country") || undefined,
    language: formData.get("language")
  });

  if (!parsed.success) {
    return { error: "Please review your profile details.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name }
    });

    try {
      await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          phone: parsed.data.phone?.trim() ? parsed.data.phone : null,
          country: parsed.data.country?.trim() ? parsed.data.country : null,
          language: parsed.data.language
        },
        update: {
          phone: parsed.data.phone?.trim() ? parsed.data.phone : null,
          country: parsed.data.country?.trim() ? parsed.data.country : null,
          language: parsed.data.language
        }
      });
    } catch (error) {
      if (isMissingTableOrColumnError(error)) {
        console.error("[dashboard] profile upsert unavailable", error);
        return { error: "Your name was updated, but phone/country storage is unavailable. Please contact support." };
      }

      throw error;
    }

    await safeCreateActivityLog({
      actorId: user.id,
      action: "PROFILE_UPDATED",
      entityType: "User",
      entityId: user.id
    });
  } catch (error) {
    console.error("[dashboard] updateProfileAction failed", error);
    return { error: "Unable to save profile changes right now. Please try again." };
  }

  revalidatePath("/client/dashboard/profile");
  return { success: "Profile updated successfully." };
}

export async function updateSettingsAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch (error) {
    console.error("[dashboard] updateSettingsAction auth error", error);
    return { error: "Please sign in again to update your settings." };
  }

  const parsed = settingsUpdateSchema.safeParse({
    language: formData.get("language"),
    timezone: formData.get("timezone") || undefined,
    notificationsEnabled: formData.get("notificationsEnabled") === "on"
  });

  if (!parsed.success) {
    return { error: "Please fix your settings.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        language: parsed.data.language,
        timezone: parsed.data.timezone,
        notificationsEnabled: parsed.data.notificationsEnabled
      },
      update: {
        language: parsed.data.language,
        timezone: parsed.data.timezone,
        notificationsEnabled: parsed.data.notificationsEnabled
      }
    });

    await safeCreateActivityLog({
      actorId: user.id,
      action: "SETTINGS_UPDATED",
      entityType: "Profile",
      entityId: user.id
    });
  } catch (error) {
    console.error("[dashboard] updateSettingsAction failed", error);
    return { error: "Unable to save settings right now. Please try again." };
  }

  revalidatePath("/client/dashboard/settings");
  return { success: "Settings saved." };
}

export async function updateSecurityAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch (error) {
    console.error("[dashboard] updateSecurityAction auth error", error);
    return { error: "Please sign in again to update your password." };
  }

  const parsed = securityUpdateSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return { error: "Please review the password form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let dbUser: { passwordHash: string | null } | null = null;
  try {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true }
    });
  } catch (error) {
    console.error("[dashboard] updateSecurityAction user lookup failed", error);
    return { error: "Unable to update password right now. Please try again." };
  }

  if (!dbUser?.passwordHash) {
    return { error: "Password change is unavailable for this account." };
  }

  const validPassword = await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash);
  if (!validPassword) {
    return { error: "Current password is incorrect." };
  }

  const newHash = await hashPassword(parsed.data.newPassword);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    });

    await safeCreateActivityLog({
      actorId: user.id,
      action: "PASSWORD_CHANGED",
      entityType: "User",
      entityId: user.id
    });
  } catch (error) {
    console.error("[dashboard] updateSecurityAction failed", error);
    return { error: "Unable to update password right now. Please try again." };
  }

  return { success: "Password changed successfully." };
}

export async function createSupportRequestAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  let user: Awaited<ReturnType<typeof requireUser>>;
  try {
    user = await requireUser();
  } catch (error) {
    console.error("[dashboard] createSupportRequestAction auth error", error);
    return { error: "Please sign in again to send a support request." };
  }

  const parsed = supportRequestSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return { error: "Please complete the support form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let dbUser: Awaited<ReturnType<typeof getUserWithOptionalProfile>>;
  try {
    dbUser = await getUserWithOptionalProfile(user.id);
  } catch (error) {
    console.error("[dashboard] createSupportRequestAction user lookup failed", error);
    return { error: "Unable to find your account." };
  }

  if (!dbUser) {
    return { error: "Unable to find your account." };
  }

  try {
    await prisma.contactInquiry.create({
      data: {
        name: dbUser.name ?? "Client",
        email: dbUser.email,
        phone: dbUser.profile?.phone || null,
        country: dbUser.profile?.country || null,
        serviceType: `Support: ${parsed.data.subject}`,
        message: parsed.data.message,
        consent: true
      }
    });

    await Promise.all([
      safeCreateActivityLog({
        actorId: user.id,
        action: "SUPPORT_REQUEST_CREATED",
        entityType: "ContactInquiry"
      }),
      safeCreateNotification({
        userId: user.id,
        title: "Support request sent",
        message: "Our legal support desk received your message and will reply soon."
      })
    ]);
  } catch (error) {
    console.error("[dashboard] createSupportRequestAction failed", error);
    return { error: "Unable to submit your support request right now. Please try again." };
  }

  revalidatePath("/client/dashboard/support");
  revalidatePath("/client/dashboard/notifications");

  return { success: "Support request submitted." };
}

export async function markNotificationAsReadAction(notificationId: string) {
  const user = await requireUser();
  if (typeof notificationId !== "string" || notificationId.trim().length === 0) {
    return;
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: user.id,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });

  revalidatePath("/client/dashboard/notifications");
}
