import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
      revenueMRR: activeSubs * 20 * 100, // demo MRR in cents
    };
  }

  async activity(limit: number) {
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

  async logins(limit: number) {
    return this.prisma.loginEvent.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  async questions() {
    return this.prisma.question.findMany({ orderBy: { createdAt: "desc" } });
  }

  async health() {
    const [ok] = await this.prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
    return { database: ok.ok === 1 ? "operational" : "degraded", region: process.env.AWS_REGION ?? "eu-central-1" };
  }
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}