import { prisma } from "@/lib/db/prisma";

const fallbackTargets = ["kaleadsalous30@gmail.com", "lawdesk03@gmail.com"];

async function promoteUserToAdmin(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, role: true }
  });

  if (!user) {
    console.warn(`[promote-admin] User not found: ${normalizedEmail}`);
    return;
  }

  if (user.role === "ADMIN") {
    console.info(`[promote-admin] User already ADMIN: ${normalizedEmail}`);
    return;
  }

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: { role: "ADMIN" }
  });

  console.info(`[promote-admin] Promoted to ADMIN: ${normalizedEmail}`);
}

async function main() {
  const cliTargets = process.argv.slice(2).map((value) => value.trim()).filter(Boolean);
  const targets = cliTargets.length ? cliTargets : fallbackTargets;

  for (const email of targets) {
    await promoteUserToAdmin(email);
  }
}

main()
  .catch((error) => {
    console.error("[promote-admin] Unexpected error", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
