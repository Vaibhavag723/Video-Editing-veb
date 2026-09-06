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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const platform_service_1 = require("./platform.service");
let PlatformController = class PlatformController {
    constructor(platform) {
        this.platform = platform;
    }
    pages(status) {
        return this.platform.pages(status);
    }
    blog(status) {
        return this.platform.blog(status);
    }
    updatePage(id, body) {
        return this.platform.updatePage(id, body);
    }
    updatePost(id, body) {
        return this.platform.updatePost(id, body);
    }
    question(body) {
        return this.platform.ask(body);
    }
};
exports.PlatformController = PlatformController;
__decorate([
    (0, common_1.Get)("pages"),
    __param(0, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformController.prototype, "pages", null);
__decorate([
    (0, common_1.Get)("blog"),
    __param(0, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformController.prototype, "blog", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Put)("pages/:id"),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.EDITOR),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PlatformController.prototype, "updatePage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Put)("blog/:id"),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN, client_1.Role.EDITOR),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PlatformController.prototype, "updatePost", null);
__decorate([
    (0, common_1.Post)("questions"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PlatformController.prototype, "question", null);
exports.PlatformController = PlatformController = __decorate([
    (0, common_1.Controller)("platform"),
    __metadata("design:paramtypes", [platform_service_1.PlatformService])
], PlatformController);
//# sourceMappingURL=platform.controller.js.map