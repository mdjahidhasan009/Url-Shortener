import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UrlRepositoryPort } from '../../core/application/ports/repository.port';
import { UrlEntity } from '../../entities/url.entity';

@Injectable()
export class UrlRepository implements UrlRepositoryPort {
  constructor(
    @InjectRepository(UrlEntity)
    private readonly repository: Repository<UrlEntity>,
  ) {}

  async save(url: UrlEntity): Promise<UrlEntity> {
    return await this.repository.save(url);
  }

  async findByShortUrlId(shortUrlId: string): Promise<UrlEntity | null> {
    return await this.repository.findOne({ where: { shortUrlId } });
  }

  async deleteByLongUrl(longUrl: string): Promise<void> {
    await this.repository.delete({ longUrl });
  }

  async incrementClicksAndLastAccess(shortUrlId: string): Promise<void> {
    await this.repository.increment({ shortUrlId }, 'clicks', 1);
    await this.repository.update({ shortUrlId }, { lastAccessed: new Date() });
  }
}
