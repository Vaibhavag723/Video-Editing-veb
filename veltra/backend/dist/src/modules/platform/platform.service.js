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
exports.PlatformService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
let PlatformService = class PlatformService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async pages(status) {
        return this.prisma.page.findMany({
            where: status ? { status: status } : {},
            orderBy: { updatedAt: "desc" },
        });
    }
    async blog(status) {
        return this.prisma.blogPost.findMany({
            where: status ? { status: status } : {},
            orderBy: { updatedAt: "desc" },
        });
    }
    async updatePage(id, body) {
        return this.prisma.page.update({
            where: { id },
            data: { title: body.title, contentJson: body.contentJson, status: body.status },
        });
    }
    async updatePost(id, body) {
        return this.prisma.blogPost.update({
            where: { id },
            data: { title: body.title, bodyJson: body.bodyJson, status: body.status },
        });
    }
    async ask(body) {
        return this.prisma.question.create({ data: body });
    }
};
exports.PlatformService = PlatformService;
exports.PlatformService = PlatformService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], PlatformService);
//# sourceMappingURL=platform.service.js.map