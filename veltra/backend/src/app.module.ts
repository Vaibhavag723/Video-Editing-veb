import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { MediaModule } from "./modules/media/media.module";
import { ExportsModule } from "./modules/exports/exports.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { PlatformModule } from "./modules/platform/platform.module";
import { AdminModule } from "./modules/admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: "auth", ttl: 60_000, limit: 10 },
      { name: "default", ttl: 60_000, limit: 120 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    MediaModule,
    ExportsModule,
    SubscriptionsModule,
    PlatformModule,
    AdminModule,
  ],
})
export class AppModule {}