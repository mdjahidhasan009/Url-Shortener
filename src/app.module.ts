import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlController } from './infrastructure/adapters/controllers/url.controller';
import { UrlEntity as UrlOrmEntity } from './infrastructure/entities/url.entity';
import { UserEntity as UserOrmEntity } from './infrastructure/entities/user.entity';
import { UrlRepository } from './infrastructure/repositories/url.repository';
import { UrlUseCases } from './core/application/use-cases/url.use-cases';
import { RedisCacheAdapter } from './infrastructure/adapters/cache/redis.cache.adapter';
import { HashService } from './infrastructure/services/hash.service';
import { AuthModule } from './infrastructure/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', // or your database type
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [UrlOrmEntity, UserOrmEntity],
        synchronize: true, // Disable in production
      }),
    }),
    TypeOrmModule.forFeature([UrlOrmEntity, UserOrmEntity]),
    AuthModule,
  ],
  controllers: [UrlController],
  providers: [
    UrlUseCases,
    HashService,
    {
      provide: 'UrlRepositoryPort',
      useClass: UrlRepository,
    },
    {
      provide: 'CachePort',
      useClass: RedisCacheAdapter,
    },
    {
      provide: 'HashServicePort',
      useClass: HashService,
    },
  ],
})
export class AppModule {}
