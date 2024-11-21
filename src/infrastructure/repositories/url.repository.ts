import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UrlRepositoryPort } from '../../core/application/ports/repository.port';
import { Repository } from 'typeorm';
import { UrlEntity as UrlOrmEntity } from '../entities/url.entity';
import { UrlEntity } from '../../core/domain/entities/url.entity';

@Injectable()
export class UrlRepository implements UrlRepositoryPort {
  constructor(
    @InjectRepository(UrlOrmEntity)
    private readonly repository: Repository<UrlOrmEntity>,
  ) {}

  async save(url: UrlEntity): Promise<UrlEntity> {
    const savedUrl = await this.repository.save(url);
    return new UrlEntity(savedUrl);
  }

  async findByShortUrlId(shortUrlId: string): Promise<UrlEntity | null> {
    const url = await this.repository.findOne({ where: { shortUrlId } });
    return url ? new UrlEntity(url) : null;
  }

  async findByLongUrl(longUrl: string): Promise<UrlEntity | null> {
    const url = await this.repository.findOne({ where: { longUrl } });
    return url ? new UrlEntity(url) : null;
  }

  async deleteByShortUrlId(shortUrlId: string): Promise<void> {
    await this.repository.delete({ shortUrlId });
  }

  async deleteByLongUrl(longUrl: string): Promise<void> {
    await this.repository.delete({ longUrl });
  }

  async incrementClicksAndLastAccess(shortUrlId: string): Promise<void> {
    await this.repository.increment({ shortUrlId }, 'clicks', 1);
    await this.repository.update({ shortUrlId }, { lastAccessed: new Date() });
  }
}
