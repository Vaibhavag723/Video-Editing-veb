import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.module";

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async plans() {
    return this.prisma.plan.findMany({ where: { active: true }, orderBy: { priceCents: "asc" } });
  }

  async mine(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
  }

  async checkout(userId: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new BadRequestException("Invalid plan.");
    // In production: create a Stripe Checkout Session and return its URL.
    return {
      checkoutUrl: `https://pay.example/checkout?plan=${plan.slug}&user=${userId}`,
      plan,
    };
  }

  async handleStripeWebhook(body: { type: string; data: { object: Record<string, unknown> } }) {
    const object = body.data.object;
    switch (body.type) {
      case "checkout.session.completed": {
        const customerId = String(object.customer ?? "");
        const sub = await this.prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } });
        if (sub) {
          await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: "ACTIVE", stripeSubscriptionId: String(object.subscription ?? "") },
          });
        }
        break;
      }
      case "invoice.payment_failed": {
        const customerId = String(object.customer ?? "");
        await this.prisma.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: { status: "PAST_DUE" },
        });
        break;
      }
    }
    return { received: true };
  }
}