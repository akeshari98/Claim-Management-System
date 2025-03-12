import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import * as fileUpload from 'express-fileupload';
import * as fs from 'fs';

// Load environment variables
config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS with comprehensive configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Disposition', 'Content-Type'],
    credentials: true,
    maxAge: 3600,
  });

  // Ensure uploads directory exists
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('Uploads directory path:', uploadsPath);
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log('Created uploads directory');
  }

  // Configure express-fileupload
  app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
    createParentPath: true,
    useTempFiles: false, // Changed to false to avoid temp file issues
    debug: true, // Enable debug mode for more detailed logs
    abortOnLimit: true,
    safeFileNames: true, // Remove special characters from filenames
    preserveExtension: true, // Preserve file extensions
    uploadTimeout: 30000, // 30 seconds timeout
  }));

  // Serve static files from uploads directory
  app.use('/uploads', express.static(uploadsPath));
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();