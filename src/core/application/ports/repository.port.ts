import { UrlEntity } from '../../domain/entities/url.entity';
import { UserEntity } from '../../domain/entities/user.entity';

export abstract class UrlRepositoryPort {
  abstract save(url: UrlEntity): Promise<UrlEntity>;
  abstract findByShortUrlId(shortUrlId: string): Promise<UrlEntity | null>;
  abstract findByLongUrl(longUrl: string): Promise<UrlEntity | null>;
  abstract deleteByShortUrlId(shortUrlId: string): Promise<void>;
  abstract deleteByLongUrl(longUrl: string): Promise<void>;
  abstract incrementClicksAndLastAccess(shortUrlId: string): Promise<void>;
}

export abstract class UserRepositoryPort {
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract findOneByUsername(username: string): Promise<UserEntity | undefined>;
  abstract findOneById(id: string): Promise<UserEntity | undefined>;
}
