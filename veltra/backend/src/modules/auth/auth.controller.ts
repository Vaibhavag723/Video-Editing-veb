import { Body, Controller, Get, Headers, Ip, Post, Req, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import type { Request } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { GoogleLoginDto, LoginDto, RefreshDto, RegisterDto } from "./dto/auth.dto";

@Controller("auth")
@Throttle({ auth: { ttl: 60_000, limit: 10 } })
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  login(@Body() dto: LoginDto, @Ip() ip: string, @Headers("user-agent") ua: string) {
    return this.auth.login(dto, ip, ua);
  }

  @Post("google")
  google(@Body() dto: GoogleLoginDto, @Ip() ip: string, @Headers("user-agent") ua: string) {
    // In production, verify the Google id_token with google-auth-library before calling.
    return this.auth.google(
      { email: "demo.user@veltra.app", name: dto.fullName ?? "Veltra User", googleId: "oauth-demo" },
      ip,
      ua
    );
  }

  @Post("refresh")
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post("logout")
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: Request) {
    return (req as unknown as { user: unknown }).user;
  }
}