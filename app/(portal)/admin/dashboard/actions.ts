"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RoleType, RequestStatus } from "@prisma/client";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { signOut } from "@/lib/auth/auth";
import { createActivityLog } from "@/lib/admin/activity";
import { requireAdminUser } from "@/lib/admin/guard";
import { prisma } from "@/lib/db/prisma";

const updateUserSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2),
  role: z.nativeEnum(RoleType),
  isActive: z.coerce.boolean()
});

export async function adminSignOutAction() {
  await signOut({ redirectTo: "/auth/sign-in" });
}

export async function updateUserAction(formData: FormData) {
  const admin = await requireAdminUser();
  const parsed = updateUserSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) return;

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { name: parsed.data.name, role: parsed.data.role, isActive: parsed.data.isActive }
  });

  await createActivityLog({
    actorId: admin.id,
    action: "ADMIN_USER_UPDATED",
    entityType: "User",
    entityId: parsed.data.userId,
    meta: { role: parsed.data.role, isActive: parsed.data.isActive }
  });

  revalidatePath("/admin/dashboard/users");
}

export async function updateLegalRequestAction(formData: FormData) {
  const admin = await requireAdminUser();
  const requestId = String(formData.get("requestId") ?? "");
  const status = formData.get("status") as RequestStatus;
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!requestId || !Object.values(RequestStatus).includes(status)) return;

  await prisma.legalRequest.update({
    where: { id: requestId },
    data: { status, adminNote: adminNote || null }
  });

  await createActivityLog({
    actorId: admin.id,
    action: "ADMIN_REQUEST_UPDATED",
    entityType: "LegalRequest",
    entityId: requestId,
    meta: { status }
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/dashboard/requests");
  revalidatePath(`/admin/dashboard/requests/${requestId}`);
}

export async function markSupportHandledAction(formData: FormData) {
  const admin = await requireAdminUser();
  const id = String(formData.get("inquiryId") ?? "");
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  if (!id) return;

  await prisma.contactInquiry.update({
    where: { id },
    data: { reviewedAt: new Date(), adminNote: adminNote || null }
  });

  await createActivityLog({
    actorId: admin.id,
    action: "ADMIN_SUPPORT_REVIEWED",
    entityType: "ContactInquiry",
    entityId: id
  });

  revalidatePath("/admin/dashboard/support");
  revalidatePath("/admin/dashboard/contact");
}

export async function sendNotificationAction(formData: FormData) {
  const admin = await requireAdminUser();
  const userId = String(formData.get("userId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!userId || !title || !message) return;

  await prisma.notification.create({
    data: { userId, senderId: admin.id, title, message, audience: "USER" }
  });

  await createActivityLog({
    actorId: admin.id,
    action: "ADMIN_NOTIFICATION_SENT",
    entityType: "Notification",
    meta: { userId }
  });

  revalidatePath("/admin/dashboard/notifications");
}

export async function broadcastNotificationAction(formData: FormData) {
  const admin = await requireAdminUser();
  const audience = String(formData.get("audience") ?? "ALL_USERS");
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!title || !message) return;

  const where = audience === "CLIENTS" ? { role: RoleType.CLIENT, isActive: true } : { isActive: true };
  const users = await prisma.user.findMany({ where, select: { id: true } });
  if (!users.length) return;

  await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      senderId: admin.id,
      title,
      message,
      audience
    }))
  });

  await createActivityLog({
    actorId: admin.id,
    action: "ADMIN_NOTIFICATION_BROADCAST",
    entityType: "Notification",
    meta: { audience, recipients: users.length }
  });

  revalidatePath("/admin/dashboard/notifications");
}

export async function markNotificationReadAction(formData: FormData) {
  await requireAdminUser();
  const id = String(formData.get("notificationId") ?? "");
  if (!id) return;
  await prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  revalidatePath("/admin/dashboard/notifications");
}

export async function markNotificationUnreadAction(formData: FormData) {
  await requireAdminUser();
  const id = String(formData.get("notificationId") ?? "");
  if (!id) return;
  await prisma.notification.update({ where: { id }, data: { readAt: null } });
  revalidatePath("/admin/dashboard/notifications");
}

export async function deleteNotificationAction(formData: FormData) {
  await requireAdminUser();
  const id = String(formData.get("notificationId") ?? "");
  if (!id) return;
  await prisma.notification.delete({ where: { id } });
  revalidatePath("/admin/dashboard/notifications");
}

export async function upsertCategoryAction(formData: FormData) {
  const admin = await requireAdminUser();
  const id = String(formData.get("id") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const nameEn = String(formData.get("nameEn") ?? "").trim();
  const nameAr = String(formData.get("nameAr") ?? "").trim();
  if (!slug || !nameEn || !nameAr) return;

  if (id) {
    await prisma.serviceCategory.update({ where: { id }, data: { slug, nameEn, nameAr } });
  } else {
    await prisma.serviceCategory.create({ data: { slug, nameEn, nameAr } });
  }

  await createActivityLog({
    actorId: admin.id,
    action: id ? "ADMIN_CATEGORY_UPDATED" : "ADMIN_CATEGORY_CREATED",
    entityType: "ServiceCategory",
    entityId: id || slug
  });

  revalidatePath("/admin/dashboard/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  const admin = await requireAdminUser();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const usage = await prisma.legalRequest.count({ where: { categoryId: id } });
  const usage2 = await prisma.serviceRequest.count({ where: { categoryId: id } });
  if (usage + usage2 > 0) return;

  await prisma.serviceCategory.delete({ where: { id } });

  await createActivityLog({
    actorId: admin.id,
    action: "ADMIN_CATEGORY_DELETED",
    entityType: "ServiceCategory",
    entityId: id
  });

  revalidatePath("/admin/dashboard/categories");
}

export async function upsertSiteContentAction(formData: FormData) {
  const admin = await requireAdminUser();
  const key = String(formData.get("key") ?? "").trim();
  const titleEn = String(formData.get("titleEn") ?? "").trim();
  const titleAr = String(formData.get("titleAr") ?? "").trim();
  const bodyEn = String(formData.get("bodyEn") ?? "").trim();
  const bodyAr = String(formData.get("bodyAr") ?? "").trim();

  if (!key || !titleEn || !titleAr) return;

  await prisma.siteContent.upsert({
    where: { key },
    update: { titleEn, titleAr, bodyEn: bodyEn || null, bodyAr: bodyAr || null },
    create: { key, titleEn, titleAr, bodyEn: bodyEn || null, bodyAr: bodyAr || null }
  });

  await createActivityLog({
    actorId: admin.id,
    action: "ADMIN_CONTENT_UPDATED",
    entityType: "SiteContent",
    entityId: key
  });

  revalidatePath("/admin/dashboard/content");
}

export async function updateFaqAction(formData: FormData) {
  const admin = await requireAdminUser();
  const id = String(formData.get("id") ?? "");
  const questionEn = String(formData.get("questionEn") ?? "").trim();
  const answerEn = String(formData.get("answerEn") ?? "").trim();
  const questionAr = String(formData.get("questionAr") ?? "").trim();
  const answerAr = String(formData.get("answerAr") ?? "").trim();
  if (!questionEn || !answerEn || !questionAr || !answerAr) return;

  if (id) {
    await prisma.fAQ.update({ where: { id }, data: { questionEn, answerEn, questionAr, answerAr } });
  } else {
    await prisma.fAQ.create({ data: { questionEn, answerEn, questionAr, answerAr } });
  }

  await createActivityLog({ actorId: admin.id, action: "ADMIN_FAQ_UPDATED", entityType: "FAQ", entityId: id || null });
  revalidatePath("/admin/dashboard/content");
}

export async function updateAdminProfileAction(formData: FormData) {
  const admin = await requireAdminUser();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const language = String(formData.get("language") ?? "ar");

  if (!name) return;

  await prisma.user.update({ where: { id: admin.id }, data: { name } });
  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: { phone: phone || null, country: country || null, language },
    create: { userId: admin.id, phone: phone || null, country: country || null, language }
  });

  revalidatePath("/admin/dashboard/settings");
}

export async function changeAdminPasswordAction(formData: FormData) {
  const admin = await requireAdminUser();
  const newPassword = String(formData.get("newPassword") ?? "");
  if (newPassword.length < 8) return;

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: admin.id }, data: { passwordHash } });
  await createActivityLog({ actorId: admin.id, action: "ADMIN_PASSWORD_CHANGED", entityType: "User", entityId: admin.id });

  revalidatePath("/admin/dashboard/security");
  redirect("/admin/dashboard/security?updated=1");
}
