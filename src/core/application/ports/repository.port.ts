import { UrlEntity } from '../../domain/entities/url.entity';

export abstract class UrlRepositoryPort {
  abstract save(url: UrlEntity): Promise<UrlEntity>;
  abstract findByShortUrlId(shortUrlId: string): Promise<UrlEntity | null>;
  abstract deleteByLongUrl(longUrl: string): Promise<void>;
  abstract incrementClicksAndLastAccess(shortUrlId: string): Promise<void>;
}
