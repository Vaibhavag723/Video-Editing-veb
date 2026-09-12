import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { MediaKind } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.module";

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.mediaAsset.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async presign(
    userId: string,
    body: { fileName: string; mimeType: string; sizeBytes: number }
  ) {
    const storageKey = `${userId}/${randomUUID()}-${body.fileName.replace(/[^\w.-]+/g, "-")}`;
    // In production, call your object-storage SDK to mint a PUT URL here.
    return {
      uploadUrl: `https://storage.example/put/${storageKey}`,
      storageKey,
      method: "PUT",
      headers: { "Content-Type": body.mimeType, "x-ms-blob-type": "BlockBlob" },
      expiresIn: 900,
    };
  }

  async confirm(
    userId: string,
    body: { storageKey: string; fileName: string; mimeType: string; sizeBytes: number }
  ) {
    const kind: MediaKind = body.mimeType.startsWith("video/")
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

  async remove(userId: string, id: string) {
    const asset = await this.prisma.mediaAsset.findFirst({ where: { id, ownerId: userId } });
    if (!asset) throw new NotFoundException("Asset not found.");
    await this.prisma.mediaAsset.delete({ where: { id } });
    return { ok: true };
  }
}