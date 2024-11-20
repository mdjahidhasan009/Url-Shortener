import * as md5 from 'md5';
import { Injectable } from '@nestjs/common';
import { UrlRepositoryPort } from '../../core/application/ports/repository.port';

@Injectable()
export class HashService {
  async generateUniqueHash(
    longUrl: string,
    repository: UrlRepositoryPort,
  ): Promise<string> {
    let hash = md5(longUrl).slice(0, 7);
    while (await repository.findByShortUrlId(hash)) {
      hash = md5(hash + Math.random()).slice(0, 7);
    }
    return hash;
  }
}
