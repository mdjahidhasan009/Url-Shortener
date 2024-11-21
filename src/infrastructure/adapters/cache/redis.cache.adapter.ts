import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { CachePort } from '../../../core/application/ports/cache.port';

@Injectable()
export class RedisCacheAdapter implements CachePort {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisCacheAdapter.name);

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    this.logger.log(`Connecting to Redis at ${redisUrl}`);

    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
    });

    this.client.connect().catch((err) => {
      this.logger.error('Could not connect to Redis', err);
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
