"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma = new client_1.PrismaClient();
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
            role: client_1.Role.ADMIN,
            status: "ACTIVE",
            passwordHash: await argon2.hash(process.env.ADMIN_PASSWORD ?? "Admin1234!", { type: argon2.argon2id }),
        },
    });
    await prisma.subscription.upsert({
        where: { userId: admin.id },
        update: {},
        create: {
            userId: admin.id,
            planId: (await prisma.plan.findUnique({ where: { slug: "agency" } })).id,
            status: client_1.SubscriptionStatus.ACTIVE,
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
//# sourceMappingURL=seed.js.map