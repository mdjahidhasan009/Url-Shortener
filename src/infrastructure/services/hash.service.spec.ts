import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from './hash.service';
import { UrlRepositoryPort } from '../../core/application/ports/repository.port';
import { UrlEntity } from '../../core/domain/entities/url.entity';

describe('HashService', () => {
  let hashService: HashService;
  let urlRepository: UrlRepositoryPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HashService,
        {
          provide: 'UrlRepositoryPort',
          useValue: {
            findByShortUrlId: jest.fn(),
          },
        },
      ],
    }).compile();

    hashService = module.get<HashService>(HashService);
    urlRepository = module.get<UrlRepositoryPort>('UrlRepositoryPort');
  });

  describe('generateUniqueHash', () => {
    it('should generate a unique hash', async () => {
      const longUrl = 'http://example.com';
      jest.spyOn(urlRepository, 'findByShortUrlId').mockResolvedValue(null);

      const hash = await hashService.generateUniqueHash(longUrl);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(7);
    });

    it('should regenerate hash if collision occurs', async () => {
      const longUrl = 'http://example.com';
      let callCount = 0;

      jest
        .spyOn(urlRepository, 'findByShortUrlId')
        .mockImplementation(async () => {
          callCount++;
          return callCount === 1
            ? new UrlEntity({ shortUrlId: 'abc123' })
            : null;
        });

      const hash = await hashService.generateUniqueHash(longUrl);

      expect(hash).toBeDefined();
      expect(hash.length).toBe(7);
      expect(callCount).toBe(2);
    });
  });
});
