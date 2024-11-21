import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlController } from '../adapters/controllers/url.controller';
import { UrlEntity } from '../entities/url.entity';
import { UrlRepository } from '../repositories/url.repository';
import { UrlUseCases } from '../../core/application/use-cases/url.use-cases';
import { HashService } from '../services/hash.service';
import { RedisCacheAdapter } from '../adapters/cache/redis.cache.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([UrlEntity])],
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
  exports: [UrlUseCases],
})
export class UrlModule {}
