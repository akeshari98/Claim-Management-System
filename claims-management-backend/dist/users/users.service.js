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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./user.schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
let UsersService = class UsersService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
        this.createDefaultInsurer();
    }
    async createDefaultInsurer() {
        try {
            const existingInsurer = await this.userModel.findOne({ email: 'akeshari986@gmail.com' });
            if (!existingInsurer) {
                const hashedPassword = await bcrypt.hash('ayush_123', 10);
                await this.userModel.create({
                    name: 'Ayush Keshari',
                    email: 'akeshari986@gmail.com',
                    password: hashedPassword,
                    role: 'insurer'
                });
                console.log('Default insurer created');
            }
        }
        catch (error) {
            console.error('Error creating default insurer:', error);
        }
    }
    async signup(userData) {
        const existingUser = await this.userModel.findOne({ email: userData.email });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await this.userModel.create({
            ...userData,
            password: hashedPassword,
            role: 'patient'
        });
        return { message: 'User created successfully' };
    }
    async login(email, password) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, 'your-secret-key', { expiresIn: '24h' });
        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }
    async getUserById(id) {
        return this.userModel.findById(id).select('-password');
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map