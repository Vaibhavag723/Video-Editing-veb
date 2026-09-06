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
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const prisma_module_1 = require("../../prisma/prisma.module");
let MediaService = class MediaService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(userId) {
        return this.prisma.mediaAsset.findMany({
            where: { ownerId: userId },
            orderBy: { createdAt: "desc" },
        });
    }
    async presign(userId, body) {
        const storageKey = `${userId}/${(0, node_crypto_1.randomUUID)()}-${body.fileName.replace(/[^\w.-]+/g, "-")}`;
        return {
            uploadUrl: `https://storage.example/put/${storageKey}`,
            storageKey,
            method: "PUT",
            headers: { "Content-Type": body.mimeType, "x-ms-blob-type": "BlockBlob" },
            expiresIn: 900,
        };
    }
    async confirm(userId, body) {
        const kind = body.mimeType.startsWith("video/")
            ? "VIDEO"
            : body.mimeType.startsWith("audio/")
                ? "AUDIO"
                : body.mimeType.startsWith("image/")
                    ? "IMAGE"
                    : "FONT";
        return this.prisma.mediaAsset.create({
            data: {
                ownerId: userId,
                kind,
                fileName: body.fileName,
                mimeType: body.mimeType,
                sizeBytes: body.sizeBytes,
                storageKey: body.storageKey,
            },
        });
    }
    async remove(userId, id) {
        const asset = await this.prisma.mediaAsset.findFirst({ where: { id, ownerId: userId } });
        if (!asset)
            throw new common_1.NotFoundException("Asset not found.");
        await this.prisma.mediaAsset.delete({ where: { id } });
        return { ok: true };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map