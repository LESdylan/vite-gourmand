import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { join } from 'path';
import { existsSync } from 'fs';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Serve static frontend files in production
  // In production: __dirname = /app/dist/src, so we go up 2 levels to /app
  if (process.env.NODE_ENV === 'production') {
    const publicPath = join(__dirname, '..', '..', 'public');
    logger.log(`📁 Static assets path: ${publicPath}`);
    app.useStaticAssets(publicPath);
  }

  // Security headers with Helmet
  // Configured to allow Google Identity Services (popup-based OAuth)
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, // Allow Google OAuth popup
      crossOriginEmbedderPolicy: false, // Disable for Google scripts
    }),
  );

  // Response compression for better performance
  app.use(compression());

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  });

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Vite Gourmand API')
    .setDescription(
      'API documentation for the Vite Gourmand restaurant ordering platform',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('menus', 'Menu management endpoints')
    .addTag('orders', 'Order management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // SPA fallback: serve index.html for non-API routes in production
  if (process.env.NODE_ENV === 'production') {
    const spaPublicPath = join(__dirname, '..', '..', 'public');
    const indexPath = join(spaPublicPath, 'index.html');

    if (existsSync(indexPath)) {
      logger.log(`📄 SPA index.html found at: ${indexPath}`);
      app.use((req: Request, res: Response, next: NextFunction) => {
        // Skip API routes and static files
        if (req.path.startsWith('/api') || req.path.includes('.')) {
          return next();
        }
        // Serve index.html for SPA client-side routing
        res.sendFile(indexPath);
      });
    } else {
      logger.warn(`⚠️ SPA index.html not found at: ${indexPath}`);
    }
  }

  const port = process.env.PORT ?? 3000;
  // Listen on 0.0.0.0 to accept connections from outside the container
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://0.0.0.0:${port}`);
  logger.log(`📚 API endpoints: http://0.0.0.0:${port}/api`);
  logger.log(`📚 Swagger docs: http://0.0.0.0:${port}/api/docs`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔒 Security: Helmet enabled`);
  logger.log(`📦 Compression: enabled`);
  if (process.env.NODE_ENV === 'production') {
    logger.log(`🌐 Frontend: Serving static files from /public`);
  }
}
bootstrap();
