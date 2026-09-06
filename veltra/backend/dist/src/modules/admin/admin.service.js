"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async stats() {
        const [totalUsers, admins, projects, pages, today, media] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: "ADMIN" } }),
            this.prisma.project.count(),
            this.prisma.page.count(),
            this.prisma.loginEvent.count({ where: { success: true, createdAt: { gte: startOfToday() } } }),
            this.prisma.mediaAsset.count(),
        ]);
        const activeSubs = await this.prisma.subscription.count({ where: { status: "ACTIVE" } });
        return {
            totalUsers,
            admins,
            projects,
            pages,
            loginsToday: today,
            activeSubscriptions: activeSubs,
            mediaFiles: media,
            revenueMRR: activeSubs * 20 * 100,
        };
    }
    async activity(limit) {
        return this.prisma.activity.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { fullName: true, avatarUrl: true } } },
        });
    }
    async users() {
        return this.prisma.user.findMany({
            select: {
                id: true, email: true, fullName: true, role: true, status: true, createdAt: true,
                plan: { select: { name: true, slug: true } },
                _count: { select: { projects: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 200,
        });
    }
    async pages() {
        return this.prisma.page.findMany({ orderBy: { updatedAt: "desc" } });
    }
    async blog() {
        return this.prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
    }
    async logins(limit) {
        return this.prisma.loginEvent.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
        });
    }
    async questions() {
        return this.prisma.question.findMany({ orderBy: { createdAt: "desc" } });
    }
    async health() {
        const [ok] = await this.prisma.$queryRaw `SELECT 1 as ok`;
        return { database: ok.ok === 1 ? "operational" : "degraded", region: process.env.AWS_REGION ?? "eu-central-1" };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], AdminService);
function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}
//# sourceMappingURL=admin.service.js.map