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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
let ProjectsService = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listForUser(userId) {
        return this.prisma.project.findMany({
            where: { ownerId: userId },
            orderBy: { updatedAt: "desc" },
            include: { _count: { select: { mediaAssets: true, exports: true } } },
        });
    }
    async create(userId, title = "Untitled project") {
        return this.prisma.project.create({
            data: { ownerId: userId, title, status: "EDITING" },
        });
    }
    async owned(userId, id) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: { owner: { select: { id: true } } },
        });
        if (!project)
            throw new common_1.NotFoundException("Project not found.");
        if (project.ownerId !== userId)
            throw new common_1.ForbiddenException("Not your project.");
        return project;
    }
    async get(userId, id) {
        return this.owned(userId, id);
    }
    async update(userId, id, body) {
        await this.owned(userId, id);
        return this.prisma.project.update({
            where: { id },
            data: {
                title: body.title,
                timeline: body.timeline,
                status: body.status,
            },
        });
    }
    async requestExport(userId, id) {
        await this.owned(userId, id);
        const exportRow = await this.prisma.export.create({
            data: { projectId: id, userId, status: "QUEUED", resolution: "1080p", fps: 30, format: "mp4" },
        });
        return exportRow;
    }
    async remove(userId, id) {
        await this.owned(userId, id);
        await this.prisma.project.delete({ where: { id } });
        return { ok: true };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map