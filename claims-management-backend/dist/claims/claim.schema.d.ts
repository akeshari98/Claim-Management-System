import { Document, Schema as MongooseSchema } from 'mongoose';
export type ClaimDocument = Claim & Document;
export declare class Claim {
    name: string;
    email: string;
    claimAmount: number;
    description: string;
    userId: string;
    documentUrl: string;
    status: string;
    approvedAmount?: number;
    insurerComments?: string;
    submissionDate: Date;
    filePath?: string;
    originalFileName?: string;
    fileSize?: number;
    fileMimeType?: string;
}
export declare const ClaimSchema: MongooseSchema<Claim, import("mongoose").Model<Claim, any, any, any, Document<unknown, any, Claim> & Claim & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Claim, Document<unknown, {}, import("mongoose").FlatRecord<Claim>> & import("mongoose").FlatRecord<Claim> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
