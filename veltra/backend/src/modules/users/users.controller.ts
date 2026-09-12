import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { Role } from "@prisma/client";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { UsersService } from "./users.service";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: { id: string }) {
    return this.users.profile(user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  list(@CurrentUser() user: { id: string }) {
    return this.users.list();
  }

  @Patch(":id/role")
  @Roles(Role.ADMIN)
  setRole(@Param("id") id: string, @Body("role") role: Role) {
    return this.users.setRole(id, role);
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN)
  setStatus(@Param("id") id: string, @Body("status") status: string) {
    return this.users.setStatus(id, status);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  remove(@Param("id") id: string) {
    return this.users.remove(id);
  }
}