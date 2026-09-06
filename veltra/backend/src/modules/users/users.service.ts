import { Injectable, NotFoundException } from "@nestjs/common";
import { Role, UserStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.module";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async profile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { plan: true, subscription: true },
    });
    if (!user) throw new NotFoundException("User not found.");
    return user;
  }

  async list() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
        plan: { select: { name: true, slug: true } },
        _count: { select: { projects: true, mediaAssets: true, exports: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async setRole(id: string, role: Role) {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  async setStatus(id: string, status: string) {
    return this.prisma.user.update({ where: { id }, data: { status: status as UserStatus } });
  }

  async remove(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }
}