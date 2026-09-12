import { Injectable, NotFoundException } from "@nestjs/common";
import { ExportStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.module";

@Injectable()
export class ExportsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.export.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { project: { select: { id: true, title: true } } },
    });
  }

  async get(userId: string, id: string) {
    const row = await this.prisma.export.findFirst({ where: { id, userId } });
    if (!row) throw new NotFoundException("Export not found.");
    return row;
  }

  async handleRenderWebhook(body: { exportId: string; status: string; outputUrl?: string; error?: string }) {
    const status = body.status.toUpperCase() as ExportStatus;
    return this.prisma.export.update({
      where: { id: body.exportId },
      data: {
        status,
        outputUrl: body.outputUrl,
        errorMessage: body.error,
        finishedAt: status === "COMPLETE" || status === "FAILED" ? new Date() : null,
      },
    });
  }
}