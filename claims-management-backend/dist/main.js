"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
(0, dotenv_1.config)();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        exposedHeaders: ['Content-Disposition', 'Content-Type'],
        credentials: false,
        maxAge: 3600,
    });
    const uploadsPath = (0, path_1.join)(process.cwd(), 'uploads');
    console.log('Uploads directory path:', uploadsPath);
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
        console.log('Created uploads directory');
    }
    app.use(fileUpload({
        limits: { fileSize: 10 * 1024 * 1024 },
        createParentPath: true,
        useTempFiles: false,
        debug: true,
        abortOnLimit: true,
        safeFileNames: true,
        preserveExtension: true,
        uploadTimeout: 30000,
    }));
    app.use('/uploads', express.static(uploadsPath));
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map