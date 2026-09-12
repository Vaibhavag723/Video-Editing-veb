import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { MediaService } from "./media.service";

@UseGuards(JwtAuthGuard)
@Controller("media")
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.media.list(user.id);
  }

  @Post("presign")
  presign(@CurrentUser() user: { id: string }, @Body() body: { fileName: string; mimeType: string; sizeBytes: number }) {
    return this.media.presign(user.id, body);
  }

  @Post("confirm")
  confirm(@CurrentUser() user: { id: string }, @Body() body: { storageKey: string; fileName: string; mimeType: string; sizeBytes: number }) {
    return this.media.confirm(user.id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: { id: string }) {
    return this.media.remove(user.id, id);
  }
}