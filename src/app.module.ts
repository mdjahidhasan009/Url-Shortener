// app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlController } from './infrastructure/adapters/controllers/url.controller';
import { UrlUseCases } from './core/application/use-cases/url.use-cases';
import { UrlRepositoryPort } from './core/application/ports/repository.port';
import { UrlRepository } from './infrastructure/repositories/url.repository';
import { CachePort } from './core/application/ports/cache.port';
import { RedisCacheAdapter } from './infrastructure/adapters/cache/redis.cache';
import { HashService } from './infrastructure/services/hash.service';
import { UrlEntity } from './entities/url.entity';

@Module({
  imports: [
    // Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configure TypeORM with database connection from .env
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', // Change this if you're using a different database type
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [UrlEntity],
        synchronize: true, // Disable synchronize in production for safety
      }),
    }),
    // Register the UrlEntity repository
    TypeOrmModule.forFeature([UrlEntity]),
  ],
  controllers: [UrlController],
  providers: [
    UrlUseCases,
    HashService,
    {
      provide: UrlRepositoryPort,
      useClass: UrlRepository,
    },
    {
      provide: CachePort,
      useClass: RedisCacheAdapter,
    },
  ],
})
export class AppModule {}
