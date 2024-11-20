import { Injectable } from '@nestjs/common';
import { UrlEntity } from '../../domain/entities/url.entity';
import { validateUrl } from '../../../infrastructure/validation/url.validator';
import { HashService } from '../../../infrastructure/services/hash.service';
import { UrlRepositoryPort } from '../ports/repository.port';
import { CachePort } from '../ports/cache.port';

@Injectable()
export class UrlUseCases {
  constructor(
    private readonly urlRepository: UrlRepositoryPort,
    private readonly cache: CachePort,
    private readonly hashService: HashService,
  ) {}

  async createUrl(longUrl: string, userId: string): Promise<string> {
    if (!validateUrl(longUrl)) {
      throw new Error('Invalid URL');
    }

    const cachedShortUrl = await this.cache.get(longUrl);
    if (cachedShortUrl) return cachedShortUrl;

    const shortUrlId = await this.hashService.generateUniqueHash(
      longUrl,
      this.urlRepository,
    );

    const urlEntity = new UrlEntity({
      shortUrlId,
      longUrl,
      userId,
      createdAt: new Date(),
      clicks: 0,
      isActive: true,
    });

    await this.urlRepository.save(urlEntity);
    await this.cache.set(longUrl, shortUrlId);

    return shortUrlId;
  }

  async getUrl(shortUrlId: string): Promise<string> {
    const urlEntity = await this.urlRepository.findByShortUrlId(shortUrlId);
    if (!urlEntity) {
      throw new Error('URL not found');
    }

    if (
      !urlEntity.isActive ||
      (urlEntity.expiresAt && urlEntity.expiresAt < new Date())
    ) {
      throw new Error('URL is expired or inactive');
    }

    await this.urlRepository.incrementClicksAndLastAccess(shortUrlId);
    return urlEntity.longUrl;
  }

  async deleteUrl(longUrl: string): Promise<void> {
    await this.urlRepository.deleteByLongUrl(longUrl);
  }
}
