"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix("api");
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
        credentials: true,
    });
    app.use((0, helmet_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    const port = Number(process.env.PORT ?? 4000);
    await app.listen(port);
    common_1.Logger.log(`Veltra API listening on http://localhost:${port}/api`, "Bootstrap");
}
bootstrap();
//# sourceMappingURL=main.js.map