import { ClaimsService } from './claims.service';
import { Claim } from './claim.schema';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
export declare class ClaimsController {
    private readonly claimsService;
    private readonly jwtService;
    constructor(claimsService: ClaimsService, jwtService: JwtService);
    submitClaim(req: Request, claimData: Partial<Claim>): Promise<Claim>;
    getClaims(req: Request): Promise<Claim[]>;
    getClaimFile(claimId: string, token: string, res: Response): Promise<void>;
    getClaimFileInfo(req: Request, id: string): Promise<{
        originalName: string;
        size: number;
        mimeType: string;
        createdAt: Date;
        exists: boolean;
    }>;
    updateClaimStatus(req: Request, id: string, updateData: {
        status: string;
        approvedAmount?: number;
        insurerComments?: string;
    }): Promise<Claim>;
}
