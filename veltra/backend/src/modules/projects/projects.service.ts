import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { mediaAssets: true, exports: true } } },
    });
  }

  async create(userId: string, title = "Untitled project") {
    return this.prisma.project.create({
      data: { ownerId: userId, title, status: "EDITING" },
    });
  }

  private async owned(userId: string, id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { owner: { select: { id: true } } },
    });
    if (!project) throw new NotFoundException("Project not found.");
    if (project.ownerId !== userId) throw new ForbiddenException("Not your project.");
    return project;
  }

  async get(userId: string, id: string) {
    return this.owned(userId, id);
  }

  async update(userId: string, id: string, body: { title?: string; timeline?: unknown; status?: string }) {
    await this.owned(userId, id);
    return this.prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        timeline: body.timeline as never,
        status: body.status as never,
      },
    });
  }

  async requestExport(userId: string, id: string) {
    await this.owned(userId, id);
    const exportRow = await this.prisma.export.create({
      data: { projectId: id, userId, status: "QUEUED", resolution: "1080p", fps: 30, format: "mp4" },
    });
    // In production: enqueue a render job (BullMQ + ffmpeg workers) here.
    return exportRow;
  }

  async remove(userId: string, id: string) {
    await this.owned(userId, id);
    await this.prisma.project.delete({ where: { id } });
    return { ok: true };
  }
}