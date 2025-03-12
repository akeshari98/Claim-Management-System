import { Controller, Get, Post, Body, Patch, Param, NotFoundException, Req, Res, BadRequestException, UseGuards, Query, UnauthorizedException } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { Claim } from './claim.schema';
import { Response, Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';
import { promisify } from 'util';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';

const writeFile = promisify(fs.writeFile);

// Auth middleware
const extractUserFromToken = (req: Request) => {
  try {
    console.log('Authorization header:', req.headers.authorization);
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.error('No token found in Authorization header');
      return null;
    }
    console.log('Token found:', token.substring(0, 20) + '...');  // Log first 20 chars for debugging
    
    const decoded = jwt.verify(token, 'your-secret-key') as { userId: string; email: string; role: string };
    console.log('Decoded token:', decoded);
    
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

@Controller('claims')
export class ClaimsController {
    constructor(
        private readonly claimsService: ClaimsService,
        private readonly jwtService: JwtService,
    ) { }

    @Post()
    async submitClaim(@Req() req: Request, @Body() claimData: Partial<Claim>): Promise<Claim> {
        console.log('Received claim submission request');
        console.log('Request headers:', req.headers);
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);

        const user = extractUserFromToken(req);
        if (!user) {
            console.error('Authentication failed - no valid token found');
            throw new BadRequestException('Authentication required');
        }
        console.log('Authenticated user:', user);

        if (!req.files) {
            console.error('No files object in request');
            throw new BadRequestException('No files were uploaded');
        }

        if (!req.files.file) {
            console.error('No file field in request.files');
        throw new BadRequestException('File is required');
    }

        const file = req.files.file as UploadedFile;
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
        throw new BadRequestException('Missing required fields');
    }

        // Generate a unique filename
        const fileExt = path.extname(file.name);
        const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;
        const filePath = join('uploads', fileName);
        const fullPath = join(process.cwd(), filePath);

        console.log('File paths:', {
            fileName,
            filePath,
            fullPath
        });

        try {
            // Create uploads directory if it doesn't exist
            const uploadsDir = join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
                console.log('Created uploads directory');
            }

            // Save the file
            console.log('Attempting to save file...');
            await file.mv(fullPath);
            console.log('File saved successfully at:', fullPath);

            // Create the claim with file information and userId
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
        } catch (error) {
            console.error('Error in submitClaim:', error);
            
            // Clean up the file if claim creation fails
            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                    console.log('Cleaned up file after error:', fullPath);
                } catch (e) {
                    console.error('Failed to clean up file after error:', e);
                }
            }

            if (error instanceof Error) {
                throw new BadRequestException(`Failed to submit claim: ${error.message}`);
            }
            throw new BadRequestException('Failed to submit claim');
        }
    }

    @Get()
    async getClaims(@Req() req: Request): Promise<Claim[]> {
        const user = extractUserFromToken(req);
        if (!user) {
            throw new BadRequestException('Authentication required');
        }

        // If user is insurer, return all claims
        // If user is patient, return only their claims
        const claims = await this.claimsService.getClaims(
            user.role === 'patient' ? user.userId : undefined
        );
        console.log('Retrieved claims for user:', user.userId);
        return claims;
    }

    @Get('file/:claimId')
    async getClaimFile(
        @Param('claimId') claimId: string,
        @Query('token') token: string,
        @Res() res: Response,
    ) {
        console.log('Received file request for claim:', claimId);
        console.log('Token from query:', token ? token.substring(0, 20) + '...' : 'no token');
        
        try {
            // Verify token from query parameter
            if (!token) {
                console.log('No token provided in query parameters');
                throw new UnauthorizedException('Authentication required');
            }

            let decodedToken;
            try {
                decodedToken = this.jwtService.verify(token) as { userId: string; email: string; role: string };
                console.log('Token verified successfully:', {
                    role: decodedToken.role,
                    userId: decodedToken.userId
                });
            } catch (error) {
                console.error('Token verification failed:', error);
                throw new UnauthorizedException('Invalid token');
            }

            // Get file info
            console.log('Fetching file info for claim:', claimId);
            const fileInfo = await this.claimsService.getClaimFileInfo(claimId);
            console.log('File info retrieved:', {
                path: fileInfo.path,
                exists: fileInfo.exists,
                mimeType: fileInfo.mimeType
            });

            // Get claim details to verify access
            console.log('Fetching claim details for access verification');
            const claim = await this.claimsService.findOne(claimId);
            console.log('Claim found:', {
                id: claimId,
                userId: claim.userId,
                status: claim.status
            });

            // Check if user has access to this claim
            if (decodedToken.role !== 'insurer' && claim.userId !== decodedToken.userId) {
                console.log('Access denied:', {
                    userRole: decodedToken.role,
                    userId: decodedToken.userId,
                    claimUserId: claim.userId
                });
                throw new UnauthorizedException('You do not have access to this file');
            }

            // Set response headers
            const headers = {
                'Content-Type': fileInfo.mimeType,
                'Content-Disposition': `inline; filename="${fileInfo.originalName}"`,
            };
            console.log('Setting response headers:', headers);
            res.set(headers);

            // Send the file
            console.log('Attempting to send file:', fileInfo.path);
            return res.sendFile(fileInfo.path, { root: './' });
        } catch (error) {
            console.error('Error in getClaimFile:', error);
            if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
                throw error;
            }
            throw new Error('Error sending file: ' + error.message);
        }
    }

    @Get(':id/file-info')
    async getClaimFileInfo(@Req() req: Request, @Param('id') id: string) {
        const user = extractUserFromToken(req);
        if (!user) {
            throw new BadRequestException('Authentication required');
        }

        console.log('Getting file info for claim:', id);
        try {
        const claim = await this.claimsService.getClaimById(id);
        if (!claim || !claim.filePath) {
                console.log('No file info found for claim:', id);
            throw new NotFoundException('File not found');
        }

            // Check if user has access to this claim
            if (user.role === 'patient' && claim.userId !== user.userId) {
                throw new BadRequestException('Access denied');
            }

            console.log('Claim data:', claim);
            const filePath = join(process.cwd(), claim.filePath);
            console.log('Absolute file path:', filePath);

        if (!fs.existsSync(filePath)) {
                console.log('File does not exist at path:', filePath);
            throw new NotFoundException('File does not exist');
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
        } catch (error) {
            console.error('Error in getClaimFileInfo:', error);
            throw error;
        }
    }

    @Patch(':id')
    async updateClaimStatus(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updateData: { status: string; approvedAmount?: number; insurerComments?: string }
    ): Promise<Claim> {
        const user = extractUserFromToken(req);
        if (!user || user.role !== 'insurer') {
            throw new BadRequestException('Only insurers can update claim status');
        }

        const updatedClaim = await this.claimsService.updateClaimStatus(
            id,
            updateData.status,
            updateData.approvedAmount,
            updateData.insurerComments
        );

        if (!updatedClaim) {
            throw new NotFoundException(`Claim with ID ${id} not found.`);
        }

        return updatedClaim;
    }
}

