import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { signUpSchema } from "@/lib/validators/auth";
import { hashPassword } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Please correct the highlighted fields.",
          fieldErrors: parsed.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });

    if (exists) {
      return NextResponse.json(
        { ok: false, message: "An account already exists with this email.", fieldErrors: { email: ["Email is already registered."] } },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await prisma.user.create({
      data: {
        name: parsed.data.fullName,
        email,
        passwordHash
      }
    });

    return NextResponse.json({ ok: true, message: "Your account has been created. You can now sign in." });
  } catch {
    return NextResponse.json({ ok: false, message: "Unable to create your account right now. Please try again." }, { status: 500 });
  }
}
