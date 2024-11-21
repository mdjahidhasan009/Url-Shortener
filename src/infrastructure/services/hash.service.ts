import * as md5 from 'md5';
import { Injectable, Inject } from '@nestjs/common';
import { HashServicePort } from '../../core/application/ports/hash.service.port';
import { UrlRepositoryPort } from '../../core/application/ports/repository.port';

@Injectable()
export class HashService implements HashServicePort {
  constructor(
    @Inject('UrlRepositoryPort')
    private readonly urlRepository: UrlRepositoryPort,
  ) {}

  async generateUniqueHash(longUrl: string): Promise<string> {
    let hash = md5(longUrl).slice(0, 7);
    while (await this.urlRepository.findByShortUrlId(hash)) {
      hash = md5(hash + Math.random()).slice(0, 7);
    }
    return hash;
  }
}
