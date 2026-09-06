"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const node_crypto_1 = require("node:crypto");
const argon2 = __importStar(require("argon2"));
const prisma_module_1 = require("../../prisma/prisma.module");
let AuthService = class AuthService {
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    hashToken(token) {
        return (0, node_crypto_1.createHash)("sha256").update(token).digest("hex");
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException("An account with this email already exists.");
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
    async login(dto, ip, ua) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        const ok = user?.passwordHash != null &&
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
        if (!ok || !user)
            throw new common_1.UnauthorizedException("Invalid email or password.");
        if (user.status === "SUSPENDED")
            throw new common_1.UnauthorizedException("Account suspended.");
        return this.buildSession(user);
    }
    async google(dto, ip, ua) {
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
    async refresh(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        const session = await this.prisma.session.findFirst({
            where: { refreshHash: tokenHash, expiresAt: { gt: new Date() } },
            include: { user: true },
        });
        if (!session)
            throw new common_1.UnauthorizedException("Invalid or expired refresh token.");
        return this.buildSession(session.user, session);
    }
    async logout(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        await this.prisma.session.deleteMany({ where: { refreshHash: tokenHash } });
        return { ok: true };
    }
    async buildSession(user, keep) {
        const accessToken = await this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role }, { secret: process.env.JWT_ACCESS_SECRET ?? "dev-secret", expiresIn: "15m" });
        const refreshToken = (0, node_crypto_1.randomBytes)(40).toString("hex");
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
        }
        else {
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
            user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map