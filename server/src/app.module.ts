import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TemplatesModule } from './templates/templates.module';
import { UsersModule } from './users/users.module';
import { ImagesModule } from './images/images.module';
import { CreditsModule } from './credits/credits.module';
import { IAPModule } from './iap/iap.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Load .env.local first (highest priority), then .env
      // .env.local is for local development secrets (gitignored)
      // .env.example serves as template for team
      envFilePath: ['.env.local', '.env'],
    }),
    ServeStaticModule.forRoot({
      // Use process.cwd() to get project root, works in both dev and prod
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public',
      serveStaticOptions: {
        index: false, // Don't look for index.html
      },
    }),
    PrismaModule,
    TemplatesModule,
    UsersModule,
    ImagesModule,
    CreditsModule,
    IAPModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
