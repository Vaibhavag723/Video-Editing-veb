import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ProjectsService } from "./projects.service";

@UseGuards(JwtAuthGuard)
@Controller("projects")
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.projects.listForUser(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body("title") title?: string) {
    return this.projects.create(user.id, title);
  }

  @Get(":id")
  get(@Param("id") id: string, @CurrentUser() user: { id: string }) {
    return this.projects.get(user.id, id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser() user: { id: string },
    @Body() body: { title?: string; timeline?: unknown; status?: string }
  ) {
    return this.projects.update(user.id, id, body);
  }

  @Post(":id/export")
  export(@Param("id") id: string, @CurrentUser() user: { id: string }) {
    return this.projects.requestExport(user.id, id);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: { id: string }) {
    return this.projects.remove(user.id, id);
  }
}