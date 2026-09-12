import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { randomBytes, createHash } from "node:crypto";
import * as argon2 from "argon2";
import { PrismaService } from "../../prisma/prisma.module";
import type { User, Role } from "@prisma/client";
import type { LoginDto, RegisterDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("An account with this email already exists.");

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        status: "ACTIVE",
      },
    });

    await this.prisma.activity.create({
      data: { userId: user.id, type: "SIGNUP", message: `${user.fullName} signed up` },
    });

    return this.buildSession(user);
  }

  async login(dto: LoginDto, ip?: string, ua?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const ok =
      user?.passwordHash != null &&
      (await argon2.verify(user.passwordHash, dto.password).catch(() => false));

    await this.prisma.loginEvent.create({
      data: {
        userId: user?.id ?? null,
        email: dto.email,
        provider: "EMAIL",
        success: ok,
        ipAddress: ip,
        userAgent: ua,
      },
    });

    if (!ok || !user) throw new UnauthorizedException("Invalid email or password.");
    if (user.status === "SUSPENDED") throw new UnauthorizedException("Account suspended.");

    return this.buildSession(user);
  }

  async google(dto: { email: string; name: string; googleId: string }, ip?: string, ua?: string) {
    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { email: dto.email, fullName: dto.name, status: "ACTIVE" },
      });
    }
    await this.prisma.loginEvent.create({
      data: { userId: user.id, email: user.email, provider: "GOOGLE", success: true, ipAddress: ip, userAgent: ua },
    });
    return this.buildSession(user);
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.prisma.session.findFirst({
      where: { refreshHash: tokenHash, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
    if (!session) throw new UnauthorizedException("Invalid or expired refresh token.");
    return this.buildSession(session.user, session);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.session.deleteMany({ where: { refreshHash: tokenHash } });
    return { ok: true };
  }

  private async buildSession(user: User, keep?: { id: string }) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      { secret: process.env.JWT_ACCESS_SECRET ?? "dev-secret", expiresIn: "15m" }
    );
    const refreshToken = randomBytes(40).toString("hex");
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (keep) {
      await this.prisma.session.update({
        where: { id: keep.id },
        data: {
          tokenHash: this.hashToken(accessToken),
          refreshHash: this.hashToken(refreshToken),
          expiresAt: expires,
        },
      });
    } else {
      await this.prisma.session.create({
        data: {
          userId: user.id,
          tokenHash: this.hashToken(accessToken),
          refreshHash: this.hashToken(refreshToken),
          expiresAt: expires,
        },
      });
    }

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role as Role },
    };
  }
}