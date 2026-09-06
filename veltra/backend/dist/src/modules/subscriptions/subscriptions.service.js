"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
let SubscriptionsService = class SubscriptionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async plans() {
        return this.prisma.plan.findMany({ where: { active: true }, orderBy: { priceCents: "asc" } });
    }
    async mine(userId) {
        return this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
    }
    async checkout(userId, planId) {
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new common_1.BadRequestException("Invalid plan.");
        return {
            checkoutUrl: `https://pay.example/checkout?plan=${plan.slug}&user=${userId}`,
            plan,
        };
    }
    async handleStripeWebhook(body) {
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
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map