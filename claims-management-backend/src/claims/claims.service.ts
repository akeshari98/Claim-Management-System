import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Claim } from './claim.schema';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const stat = promisify(fs.stat);
const exists = promisify(fs.access);

@Injectable()
export class ClaimsService {
    constructor(@InjectModel(Claim.name) private claimModel: Model<Claim>) {}

    async getClaims(userId?: string): Promise<Claim[]> {
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
        } catch (error) {
            console.error('Error fetching claims:', error);
            throw error;
        }
    }

    async getClaimById(id: string): Promise<Claim | null> {
        console.log('Getting claim by id:', id);
        const claim = await this.claimModel.findById(id).exec();
        console.log('Found claim:', claim);
        return claim;
    }

    async submitClaim(claimData: Partial<Claim>): Promise<Claim> {
        console.log('Submitting new claim with data:', {
            ...claimData,
            file: claimData.filePath ? 'File included' : 'No file'
        });
        const claim = new this.claimModel(claimData);
        const savedClaim = await claim.save();
        console.log('Saved claim:', savedClaim);
        return savedClaim;
    }

    async updateClaimStatus(
        id: string,
        status: string,
        approvedAmount?: number,
        insurerComments?: string
    ): Promise<Claim | null> {
        console.log('Updating claim status:', {
            id,
            status,
            approvedAmount,
            insurerComments
        });
        
        const updateData: any = { status };
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

    async findOne(id: string): Promise<Claim> {
        const claim = await this.claimModel.findById(id).exec();
        if (!claim) {
            throw new NotFoundException(`Claim with ID ${id} not found`);
        }
        return claim;
    }

    async getClaimFileInfo(claimId: string) {
        const claim = await this.findOne(claimId);
        if (!claim.filePath) {
            throw new NotFoundException('No file associated with this claim');
        }

        const filePath = path.join(process.cwd(), claim.filePath);
        let fileExists = false;
        try {
            await exists(filePath);
            fileExists = true;
        } catch {
            fileExists = false;
        }

        if (!fileExists) {
            throw new NotFoundException('File not found on disk');
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
}
