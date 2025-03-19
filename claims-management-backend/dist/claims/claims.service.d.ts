import { Model } from 'mongoose';
import { Claim } from './claim.schema';
export declare class ClaimsService {
    private claimModel;
    constructor(claimModel: Model<Claim>);
    getClaims(userId?: string): Promise<Claim[]>;
    getClaimById(id: string): Promise<Claim | null>;
    submitClaim(claimData: Partial<Claim>): Promise<Claim>;
    updateClaimStatus(id: string, status: string, approvedAmount?: number, insurerComments?: string): Promise<Claim | null>;
    findOne(id: string): Promise<Claim>;
    getClaimFileInfo(claimId: string): Promise<{
        path: string;
        originalName: string;
        mimeType: string;
        size: number;
        createdAt: Date;
        exists: boolean;
    }>;
}
