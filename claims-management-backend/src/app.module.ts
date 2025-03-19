import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimsModule } from './claims/claims.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { join } from 'path';
import * as fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://Ayush:akeshari986@cluster0.aiubw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'),
    JwtModule.register({
      global: true,
      secret: 'your-secret-key', // In production, use environment variables
      signOptions: { expiresIn: '1d' },
    }),
    ClaimsModule,
    UsersModule,
  ],
})
export class AppModule {}
