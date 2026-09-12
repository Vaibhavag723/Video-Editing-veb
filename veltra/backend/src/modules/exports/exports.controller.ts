import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ExportsService } from "./exports.service";

@UseGuards(JwtAuthGuard)
@Controller("exports")
export class ExportsController {
  constructor(private readonly exports: ExportsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.exports.list(user.id);
  }

  @Post("webhook/render")
  webhook(@Body() body: { exportId: string; status: string; outputUrl?: string; error?: string }) {
    return this.exports.handleRenderWebhook(body);
  }

  @Get(":id")
  get(@Param("id") id: string, @CurrentUser() user: { id: string }) {
    return this.exports.get(user.id, id);
  }
}