import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { PlatformService } from "./platform.service";

@Controller("platform")
export class PlatformController {
  constructor(private readonly platform: PlatformService) {}

  @Get("pages")
  pages(@Query("status") status?: string) {
    return this.platform.pages(status);
  }

  @Get("blog")
  blog(@Query("status") status?: string) {
    return this.platform.blog(status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put("pages/:id")
  @Roles(Role.ADMIN, Role.EDITOR)
  updatePage(@Param("id") id: string, @Body() body: { title?: string; contentJson?: unknown; status?: string }) {
    return this.platform.updatePage(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put("blog/:id")
  @Roles(Role.ADMIN, Role.EDITOR)
  updatePost(@Param("id") id: string, @Body() body: { title?: string; bodyJson?: unknown; status?: string }) {
    return this.platform.updatePost(id, body);
  }

  @Post("questions")
  question(@Body() body: { email: string; subject: string; message: string; priority?: string }) {
    return this.platform.ask(body);
  }
}