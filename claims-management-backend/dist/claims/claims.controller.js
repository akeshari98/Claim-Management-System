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
exports.ClaimsController = void 0;
const common_1 = require("@nestjs/common");
const claims_service_1 = require("./claims.service");
const fs = require("fs");
const path = require("path");
const path_1 = require("path");
const util_1 = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const jwt_1 = require("@nestjs/jwt");
const writeFile = (0, util_1.promisify)(fs.writeFile);
const extractUserFromToken = (req) => {
    try {
        console.log('Authorization header:', req.headers.authorization);
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.error('No token found in Authorization header');
            return null;
        }
        console.log('Token found:', token.substring(0, 20) + '...');
        const decoded = jwt.verify(token, 'your-secret-key');
        console.log('Decoded token:', decoded);
        return decoded;
    }
    catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
};
let ClaimsController = class ClaimsController {
    claimsService;
    jwtService;
    constructor(claimsService, jwtService) {
        this.claimsService = claimsService;
        this.jwtService = jwtService;
    }
    async submitClaim(req, claimData) {
        console.log('Received claim submission request');
        console.log('Request headers:', req.headers);
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        const user = extractUserFromToken(req);
        if (!user) {
            console.error('Authentication failed - no valid token found');
            throw new common_1.BadRequestException('Authentication required');
        }
        console.log('Authenticated user:', user);
        if (!req.files) {
            console.error('No files object in request');
            throw new common_1.BadRequestException('No files were uploaded');
        }
        if (!req.files.file) {
            console.error('No file field in request.files');
            throw new common_1.BadRequestException('File is required');
        }
        const file = req.files.file;
        console.log('Received file details:', {
            name: file.name,
            size: file.size,
            mimetype: file.mimetype,
            md5: file.md5
        });
        const formData = {
            name: req.body.name,
            email: req.body.email,
            claimAmount: parseFloat(req.body.claimAmount),
            description: req.body.description
        };
        if (!formData.name || !formData.email || !formData.claimAmount || !formData.description) {
            console.error('Missing required fields:', {
                name: !formData.name,
                email: !formData.email,
                claimAmount: !formData.claimAmount,
                description: !formData.description
            });
            throw new common_1.BadRequestException('Missing required fields');
        }
        const fileExt = path.extname(file.name);
        const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;
        const filePath = (0, path_1.join)('uploads', fileName);
        const fullPath = (0, path_1.join)(process.cwd(), filePath);
        console.log('File paths:', {
            fileName,
            filePath,
            fullPath
        });
        try {
            const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
                console.log('Created uploads directory');
            }
            console.log('Attempting to save file...');
            await file.mv(fullPath);
            console.log('File saved successfully at:', fullPath);
            console.log('Creating claim record...');
            const claim = await this.claimsService.submitClaim({
                ...formData,
                userId: user.userId,
                filePath: filePath,
                originalFileName: file.name,
                fileSize: file.size,
                fileMimeType: file.mimetype
            });
            console.log('Claim saved successfully:', claim);
            return claim;
        }
        catch (error) {
            console.error('Error in submitClaim:', error);
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    console.log('Cleaned up file after error:', fullPath);
                }
                catch (e) {
                    console.error('Failed to clean up file after error:', e);
                }
            }
            if (error instanceof Error) {
                throw new common_1.BadRequestException(`Failed to submit claim: ${error.message}`);
            }
            throw new common_1.BadRequestException('Failed to submit claim');
        }
    }
    async getClaims(req) {
        const user = extractUserFromToken(req);
        if (!user) {
            throw new common_1.BadRequestException('Authentication required');
        }
        const claims = await this.claimsService.getClaims(user.role === 'patient' ? user.userId : undefined);
        console.log('Retrieved claims for user:', user.userId);
        return claims;
    }
    async getClaimFile(claimId, token, res) {
        console.log('Received file request for claim:', claimId);
        console.log('Token from query:', token ? token.substring(0, 20) + '...' : 'no token');
        try {
            if (!token) {
                console.log('No token provided in query parameters');
                throw new common_1.UnauthorizedException('Authentication required');
            }
            let decodedToken;
            try {
                decodedToken = this.jwtService.verify(token);
                console.log('Token verified successfully:', {
                    role: decodedToken.role,
                    userId: decodedToken.userId
                });
            }
            catch (error) {
                console.error('Token verification failed:', error);
                throw new common_1.UnauthorizedException('Invalid token');
            }
            console.log('Fetching file info for claim:', claimId);
            const fileInfo = await this.claimsService.getClaimFileInfo(claimId);
            console.log('File info retrieved:', {
                path: fileInfo.path,
                exists: fileInfo.exists,
                mimeType: fileInfo.mimeType
            });
            console.log('Fetching claim details for access verification');
            const claim = await this.claimsService.findOne(claimId);
            console.log('Claim found:', {
                id: claimId,
                userId: claim.userId,
                status: claim.status
            });
            if (decodedToken.role !== 'insurer' && claim.userId !== decodedToken.userId) {
                console.log('Access denied:', {
                    userRole: decodedToken.role,
                    userId: decodedToken.userId,
                    claimUserId: claim.userId
                });
                throw new common_1.UnauthorizedException('You do not have access to this file');
            }
            const headers = {
                'Content-Type': fileInfo.mimeType,
                'Content-Disposition': `inline; filename="${fileInfo.originalName}"`,
            };
            console.log('Setting response headers:', headers);
            res.set(headers);
            console.log('Attempting to send file:', fileInfo.path);
            return res.sendFile(fileInfo.path, { root: './' });
        }
        catch (error) {
            console.error('Error in getClaimFile:', error);
            if (error instanceof common_1.UnauthorizedException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new Error('Error sending file: ' + error.message);
        }
    }
    async getClaimFileInfo(req, id) {
        const user = extractUserFromToken(req);
        if (!user) {
            throw new common_1.BadRequestException('Authentication required');
        }
        console.log('Getting file info for claim:', id);
        try {
            const claim = await this.claimsService.getClaimById(id);
            if (!claim || !claim.filePath) {
                console.log('No file info found for claim:', id);
                throw new common_1.NotFoundException('File not found');
            }
            if (user.role === 'patient' && claim.userId !== user.userId) {
                throw new common_1.BadRequestException('Access denied');
            }
            console.log('Claim data:', claim);
            const filePath = (0, path_1.join)(process.cwd(), claim.filePath);
            console.log('Absolute file path:', filePath);
            if (!fs.existsSync(filePath)) {
                console.log('File does not exist at path:', filePath);
                throw new common_1.NotFoundException('File does not exist');
            }
            const stats = fs.statSync(filePath);
            const fileInfo = {
                originalName: claim.originalFileName || path.basename(filePath),
                size: claim.fileSize || stats.size,
                mimeType: claim.fileMimeType || 'application/octet-stream',
                createdAt: stats.birthtime,
                exists: true
            };
            console.log('File info:', fileInfo);
            return fileInfo;
        }
        catch (error) {
            console.error('Error in getClaimFileInfo:', error);
            throw error;
        }
    }
    async updateClaimStatus(req, id, updateData) {
        const user = extractUserFromToken(req);
        if (!user || user.role !== 'insurer') {
            throw new common_1.BadRequestException('Only insurers can update claim status');
        }
        const updatedClaim = await this.claimsService.updateClaimStatus(id, updateData.status, updateData.approvedAmount, updateData.insurerComments);
        if (!updatedClaim) {
            throw new common_1.NotFoundException(`Claim with ID ${id} not found.`);
        }
        return updatedClaim;
    }
};
exports.ClaimsController = ClaimsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ClaimsController.prototype, "submitClaim", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClaimsController.prototype, "getClaims", null);
__decorate([
    (0, common_1.Get)('file/:claimId'),
    __param(0, (0, common_1.Param)('claimId')),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ClaimsController.prototype, "getClaimFile", null);
__decorate([
    (0, common_1.Get)(':id/file-info'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClaimsController.prototype, "getClaimFileInfo", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ClaimsController.prototype, "updateClaimStatus", null);
exports.ClaimsController = ClaimsController = __decorate([
    (0, common_1.Controller)('claims'),
    __metadata("design:paramtypes", [claims_service_1.ClaimsService,
        jwt_1.JwtService])
], ClaimsController);
//# sourceMappingURL=claims.controller.js.map