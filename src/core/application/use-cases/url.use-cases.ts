import { Injectable, Inject } from '@nestjs/common';
import { UrlEntity } from '../../domain/entities/url.entity';
import { validateUrl } from '../../../infrastructure/validation/url.validator';
import { HashServicePort } from '../ports/hash.service.port';
import { UrlRepositoryPort } from '../ports/repository.port';
import { CachePort } from '../ports/cache.port';

@Injectable()
export class UrlUseCases {
  constructor(
    @Inject('UrlRepositoryPort')
    private readonly urlRepository: UrlRepositoryPort,
    @Inject('CachePort')
    private readonly cache: CachePort,
    @Inject('HashServicePort')
    private readonly hashService: HashServicePort,
  ) {}

  async createUrl(longUrl: string, userId: string): Promise<string> {
    if (!validateUrl(longUrl)) {
      throw new Error('Invalid URL');
    }

    // Ensure the URL has a protocol
    longUrl = this.ensureProtocol(longUrl);

    // Check if the URL is present in the cache
    const cachedShortUrl = await this.cache.get(longUrl);
    if (cachedShortUrl) return cachedShortUrl;

    const shortUrlId = await this.hashService.generateUniqueHash(longUrl);

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

    //return short url attached with the domain from the config
    return `${process.env.BACKEND_DOMAIN}/url/${shortUrlId}`;
  }

  // Add this helper method
  private ensureProtocol(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'http://' + url;
    }
    return url;
  }

  async getUrl(shortUrlId: string): Promise<string> {
    // Check if the URL is present in the cache
    const cachedLongUrl = await this.cache.get(shortUrlId);
    if (cachedLongUrl) return this.ensureProtocol(cachedLongUrl);

    const urlEntity = await this.urlRepository.findByShortUrlId(shortUrlId);

    console.log('result from urlRepository', urlEntity);
    if (!urlEntity) {
      throw new Error('URL not found');
    }

    await this.urlRepository.incrementClicksAndLastAccess(shortUrlId);

    // Set the long URL in the cache
    await this.cache.set(shortUrlId, urlEntity.longUrl);

    return this.ensureProtocol(urlEntity.longUrl);
  }

  async deleteUrl(shortUrlId: string, userId: string): Promise<void> {
    const urlEntity = await this.urlRepository.findByShortUrlId(shortUrlId);
    if (!urlEntity) {
      throw new Error('URL not found');
    }
    if (urlEntity.userId !== userId) {
      throw new Error('Unauthorized');
    }
    await this.urlRepository.deleteByShortUrlId(shortUrlId);
    await this.cache.del(urlEntity.longUrl);
  }

  async updateUrl(
    shortUrlId: string,
    newLongUrl: string,
    userId: string,
  ): Promise<void> {
    if (!validateUrl(newLongUrl)) {
      throw new Error('Invalid URL');
    }

    const urlEntity = await this.urlRepository.findByShortUrlId(shortUrlId);
    if (!urlEntity) {
      throw new Error('URL not found');
    }
    if (urlEntity.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const oldLongUrl = urlEntity.longUrl;
    urlEntity.longUrl = newLongUrl;

    await this.urlRepository.save(urlEntity);

    await this.cache.del(oldLongUrl);
    await this.cache.set(newLongUrl, shortUrlId);
  }
}
