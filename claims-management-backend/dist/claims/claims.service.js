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
exports.ClaimsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const claim_schema_1 = require("./claim.schema");
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
const stat = (0, util_1.promisify)(fs.stat);
const exists = (0, util_1.promisify)(fs.access);
let ClaimsService = class ClaimsService {
    claimModel;
    constructor(claimModel) {
        this.claimModel = claimModel;
    }
    async getClaims(userId) {
        console.log('Getting claims with userId filter:', userId);
        const filter = userId ? { userId } : {};
        console.log('Using filter:', filter);
        try {
            const claims = await this.claimModel.find(filter).exec();
            console.log(`Found ${claims.length} claims for filter:`, filter);
            claims.forEach(claim => {
                console.log('Claim:', {
                    id: claim._id,
                    userId: claim.userId,
                    status: claim.status
                });
            });
            return claims;
        }
        catch (error) {
            console.error('Error fetching claims:', error);
            throw error;
        }
    }
    async getClaimById(id) {
        console.log('Getting claim by id:', id);
        const claim = await this.claimModel.findById(id).exec();
        console.log('Found claim:', claim);
        return claim;
    }
    async submitClaim(claimData) {
        console.log('Submitting new claim with data:', {
            ...claimData,
            file: claimData.filePath ? 'File included' : 'No file'
        });
        const claim = new this.claimModel(claimData);
        const savedClaim = await claim.save();
        console.log('Saved claim:', savedClaim);
        return savedClaim;
    }
    async updateClaimStatus(id, status, approvedAmount, insurerComments) {
        console.log('Updating claim status:', {
            id,
            status,
            approvedAmount,
            insurerComments
        });
        const updateData = { status };
        if (approvedAmount !== undefined) {
            updateData.approvedAmount = approvedAmount;
        }
        if (insurerComments !== undefined) {
            updateData.insurerComments = insurerComments;
        }
        const updatedClaim = await this.claimModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
        console.log('Updated claim:', updatedClaim);
        return updatedClaim;
    }
    async findOne(id) {
        const claim = await this.claimModel.findById(id).exec();
        if (!claim) {
            throw new common_1.NotFoundException(`Claim with ID ${id} not found`);
        }
        return claim;
    }
    async getClaimFileInfo(claimId) {
        const claim = await this.findOne(claimId);
        if (!claim.filePath) {
            throw new common_1.NotFoundException('No file associated with this claim');
        }
        const filePath = path.join(process.cwd(), claim.filePath);
        let fileExists = false;
        try {
            await exists(filePath);
            fileExists = true;
        }
        catch {
            fileExists = false;
        }
        if (!fileExists) {
            throw new common_1.NotFoundException('File not found on disk');
        }
        const stats = await stat(filePath);
        return {
            path: claim.filePath,
            originalName: claim.originalFileName || path.basename(filePath),
            mimeType: claim.fileMimeType || 'application/octet-stream',
            size: stats.size,
            createdAt: stats.birthtime,
            exists: true
        };
    }
};
exports.ClaimsService = ClaimsService;
exports.ClaimsService = ClaimsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(claim_schema_1.Claim.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ClaimsService);
//# sourceMappingURL=claims.service.js.map