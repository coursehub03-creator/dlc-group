"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "Client"
  };
}

export async function createClientRequestAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  const user = await requireUser();

  const parsed = newRequestSchema.safeParse({
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    message: formData.get("message"),
    country: formData.get("country") || undefined
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true }
  });

  if (!dbUser) {
    return { error: "Unable to find your account." };
  }

  const created = await prisma.serviceRequest.create({
    data: {
      userId: user.id,
      categoryId: parsed.data.categoryId,
      title: parsed.data.title,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.profile?.phone,
      country: parsed.data.country || dbUser.profile?.country,
      message: parsed.data.message,
      status: "NEW"
    }
  });

  await prisma.$transaction([
    prisma.activityLog.create({
      data: {
        actorId: user.id,
        action: "REQUEST_CREATED",
        entityType: "ServiceRequest",
        entityId: created.id,
        meta: {
          title: created.title,
          status: created.status
        }
      }
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        title: "Request submitted",
        message: `Your legal request \"${created.title ?? "Untitled"}\" has been received.`
      }
    })
  ]);

  revalidatePath("/client/dashboard");
  revalidatePath("/client/dashboard/requests");
  redirect("/client/dashboard/requests?created=1");
}

export async function updateProfileAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  const user = await requireUser();

  const parsed = profileUpdateSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    country: formData.get("country") || undefined,
    language: formData.get("language")
  });

  if (!parsed.success) {
    return { error: "Please review your profile details.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      profile: {
        upsert: {
          create: {
            phone: parsed.data.phone,
            country: parsed.data.country,
            language: parsed.data.language
          },
          update: {
            phone: parsed.data.phone,
            country: parsed.data.country,
            language: parsed.data.language
          }
        }
      }
    }
  });

  await prisma.activityLog.create({
    data: {
      actorId: user.id,
      action: "PROFILE_UPDATED",
      entityType: "User",
      entityId: user.id
    }
  });

  revalidatePath("/client/dashboard/profile");
  return { success: "Profile updated successfully." };
}

export async function updateSettingsAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  const user = await requireUser();

  const parsed = settingsUpdateSchema.safeParse({
    language: formData.get("language"),
    timezone: formData.get("timezone") || undefined,
    notificationsEnabled: formData.get("notificationsEnabled") === "on"
  });

  if (!parsed.success) {
    return { error: "Please fix your settings.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

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

  await prisma.activityLog.create({
    data: {
      actorId: user.id,
      action: "SETTINGS_UPDATED",
      entityType: "Profile",
      entityId: user.id
    }
  });

  revalidatePath("/client/dashboard/settings");
  return { success: "Settings saved." };
}

export async function updateSecurityAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  const user = await requireUser();

  const parsed = securityUpdateSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return { error: "Please review the password form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true }
  });

  if (!dbUser?.passwordHash) {
    return { error: "Password change is unavailable for this account." };
  }

  const validPassword = await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash);
  if (!validPassword) {
    return { error: "Current password is incorrect." };
  }

  const newHash = await hashPassword(parsed.data.newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash }
  });

  await prisma.activityLog.create({
    data: {
      actorId: user.id,
      action: "PASSWORD_CHANGED",
      entityType: "User",
      entityId: user.id
    }
  });

  return { success: "Password changed successfully." };
}

export async function createSupportRequestAction(_: DashboardActionState, formData: FormData): Promise<DashboardActionState> {
  const user = await requireUser();

  const parsed = supportRequestSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return { error: "Please complete the support form.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true }
  });

  if (!dbUser) {
    return { error: "Unable to find your account." };
  }

  await prisma.contactInquiry.create({
    data: {
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.profile?.phone,
      country: dbUser.profile?.country,
      serviceType: `Support: ${parsed.data.subject}`,
      message: parsed.data.message,
      consent: true
    }
  });

  await prisma.$transaction([
    prisma.activityLog.create({
      data: {
        actorId: user.id,
        action: "SUPPORT_REQUEST_CREATED",
        entityType: "ContactInquiry"
      }
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        title: "Support request sent",
        message: "Our legal support desk received your message and will reply soon."
      }
    })
  ]);

  revalidatePath("/client/dashboard/support");
  revalidatePath("/client/dashboard/notifications");

  return { success: "Support request submitted." };
}

export async function markNotificationAsReadAction(notificationId: string) {
  const user = await requireUser();

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
