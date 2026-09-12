import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { SubscriptionsService } from "./subscriptions.service";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subs: SubscriptionsService) {}

  @Get("plans")
  plans() {
    return this.subs.plans();
  }

  @UseGuards(JwtAuthGuard)
  @Get("mine")
  mine(@CurrentUser() user: { id: string }) {
    return this.subs.mine(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("checkout")
  checkout(@CurrentUser() user: { id: string }, @Body() body: { planId: string }) {
    return this.subs.checkout(user.id, body.planId);
  }

  @Post("webhook/stripe")
  stripe(@Body() body: { type: string; data: { object: Record<string, unknown> } }) {
    return this.subs.handleStripeWebhook(body);
  }
}