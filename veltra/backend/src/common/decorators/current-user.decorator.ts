import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { User } from "@prisma/client";

export interface AuthUser extends Pick<User, "id" | "email" | "fullName" | "role"> {}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as unknown as { user: AuthUser }).user;
  }
);