import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { AdminService } from "./admin.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("stats")
  stats() {
    return this.admin.stats();
  }

  @Get("activity")
  activity(@Query("limit") limit = "12") {
    return this.admin.activity(Number(limit));
  }

  @Get("users")
  users() {
    return this.admin.users();
  }

  @Get("pages")
  pages() {
    return this.admin.pages();
  }

  @Get("blog")
  blog() {
    return this.admin.blog();
  }

  @Get("logins")
  logins(@Query("limit") limit = "50") {
    return this.admin.logins(Number(limit));
  }

  @Get("questions")
  questions() {
    return this.admin.questions();
  }

  @Get("health")
  health() {
    return this.admin.health();
  }
}