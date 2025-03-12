import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ClaimDocument = Claim & Document;

@Schema()
export class Claim {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  claimAmount: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: false })
  documentUrl: string;

  @Prop({ default: 'Pending' }) // Status: Pending, Approved, Rejected
  status: string;

  @Prop({ required: false })
  approvedAmount?: number;

  @Prop({ required: false })
  insurerComments?: string;

  @Prop({ default: Date.now })
  submissionDate: Date;

  @Prop() // Store the file path
  filePath?: string;

  @Prop() // Store the original file name
  originalFileName?: string;

  @Prop() // Store the file size
  fileSize?: number;

  @Prop() // Store the file MIME type
  fileMimeType?: string;
}

export const ClaimSchema = SchemaFactory.createForClass(Claim);
