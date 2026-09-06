// Veltra API — seed data (idempotent)
import { PrismaClient, Role, SubscriptionStatus } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  const plans = [
    { slug: "free", name: "Starter — Free", priceCents: 0, interval: "month", features: { exports: "720p", storageGB: 2, aiCaptions: false } },
    { slug: "pro", name: "Studio — Pro", priceCents: 1999, interval: "month", features: { exports: "4K", storageGB: 50, aiCaptions: true } },
    { slug: "agency", name: "Agency", priceCents: 4999, interval: "month", features: { exports: "4K 60fps", storageGB: 200, aiCaptions: true, seats: 10 } },
  ];
  for (const p of plans) {
    await prisma.plan.upsert({ where: { slug: p.slug }, update: p, create: p });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@veltra.app";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: "Veltra Admin",
      role: Role.ADMIN,
      status: "ACTIVE",
      passwordHash: await argon2.hash(process.env.ADMIN_PASSWORD ?? "Admin1234!", { type: argon2.argon2id }),
    },
  });
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      planId: (await prisma.plan.findUnique({ where: { slug: "agency" } }))!.id,
      status: SubscriptionStatus.ACTIVE,
    },
  });

  const pages = [
    { slug: "/", title: "Home" },
    { slug: "/pricing", title: "Pricing" },
    { slug: "/templates", title: "Templates" },
    { slug: "/about", title: "About" },
  ];
  for (const p of pages) {
    await prisma.page.upsert({ where: { slug: p.slug }, update: {}, create: { ...p, status: "PUBLISHED" } });
  }

  await prisma.activity.create({
    data: { userId: admin.id, type: "SIGNUP", message: "Seed complete — welcome to Veltra" },
  });

  console.log("✅ Veltra seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());