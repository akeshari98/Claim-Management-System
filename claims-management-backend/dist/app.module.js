"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const claims_module_1 = require("./claims/claims.module");
const users_module_1 = require("./users/users.module");
const jwt_1 = require("@nestjs/jwt");
const path_1 = require("path");
const fs = require("fs");
const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot('mongodb+srv://Ayush:akeshari986@cluster0.aiubw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'),
            jwt_1.JwtModule.register({
                global: true,
                secret: 'your-secret-key',
                signOptions: { expiresIn: '1d' },
            }),
            claims_module_1.ClaimsModule,
            users_module_1.UsersModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map