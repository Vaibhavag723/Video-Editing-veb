import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";

@Injectable()
export class PlatformService {
  constructor(private readonly prisma: PrismaService) {}

  async pages(status?: string) {
    return this.prisma.page.findMany({
      where: status ? { status: status as never } : {},
      orderBy: { updatedAt: "desc" },
    });
  }

  async blog(status?: string) {
    return this.prisma.blogPost.findMany({
      where: status ? { status: status as never } : {},
      orderBy: { updatedAt: "desc" },
    });
  }

  async updatePage(id: string, body: { title?: string; contentJson?: unknown; status?: string }) {
    return this.prisma.page.update({
      where: { id },
      data: { title: body.title, contentJson: body.contentJson as never, status: body.status as never },
    });
  }

  async updatePost(id: string, body: { title?: string; bodyJson?: unknown; status?: string }) {
    return this.prisma.blogPost.update({
      where: { id },
      data: { title: body.title, bodyJson: body.bodyJson as never, status: body.status as never },
    });
  }

  async ask(body: { email: string; subject: string; message: string; priority?: string }) {
    return this.prisma.question.create({ data: body });
  }
}