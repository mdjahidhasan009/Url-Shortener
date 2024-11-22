import { Test, TestingModule } from '@nestjs/testing';
import { UrlUseCases } from './url.use-cases';
import { UrlRepositoryPort } from '../ports/repository.port';
import { CachePort } from '../ports/cache.port';
import { HashServicePort } from '../ports/hash.service.port';
import { UrlEntity } from '../../domain/entities/url.entity';
import * as urlValidator from '../../../infrastructure/validation/url.validator';

jest.mock('../../../infrastructure/validation/url.validator');

describe('UrlUseCases', () => {
  let urlUseCases: UrlUseCases;
  let urlRepository: UrlRepositoryPort;
  let cache: CachePort;
  let hashService: HashServicePort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlUseCases,
        {
          provide: 'UrlRepositoryPort',
          useValue: {
            save: jest.fn(),
            findByShortUrlId: jest.fn(),
            deleteByShortUrlId: jest.fn(),
            incrementClicksAndLastAccess: jest.fn(),
          },
        },
        {
          provide: 'CachePort',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: 'HashServicePort',
          useValue: {
            generateUniqueHash: jest.fn(),
          },
        },
      ],
    }).compile();

    urlUseCases = module.get<UrlUseCases>(UrlUseCases);
    urlRepository = module.get<UrlRepositoryPort>('UrlRepositoryPort');
    cache = module.get<CachePort>('CachePort');
    hashService = module.get<HashServicePort>('HashServicePort');
    (urlValidator.validateUrl as jest.Mock).mockReturnValue(true);
  });

  describe('createUrl', () => {
    it('should create a short URL', async () => {
      const longUrl = 'http://example.com';
      const userId = 'user-id-123';
      const shortUrlId = 'short123';

      jest.spyOn(cache, 'get').mockResolvedValue(null);
      jest
        .spyOn(hashService, 'generateUniqueHash')
        .mockResolvedValue(shortUrlId);
      jest.spyOn(urlRepository, 'save').mockResolvedValue(new UrlEntity({}));
      jest.spyOn(cache, 'set').mockResolvedValue();

      const result = await urlUseCases.createUrl(longUrl, userId);

      expect(cache.get).toHaveBeenCalledWith(longUrl);
      expect(hashService.generateUniqueHash).toHaveBeenCalledWith(longUrl);
      expect(urlRepository.save).toHaveBeenCalled();
      expect(cache.set).toHaveBeenCalledWith(longUrl, shortUrlId);
      expect(result).toEqual(`${process.env.BACKEND_DOMAIN}/url/${shortUrlId}`);
    });

    it('should throw an error for invalid URL', async () => {
      (urlValidator.validateUrl as jest.Mock).mockReturnValue(false);
      const longUrl = 'invalid-url';
      const userId = 'user-id-123';

      await expect(urlUseCases.createUrl(longUrl, userId)).rejects.toThrow(
        'Invalid URL',
      );
    });
  });

  describe('getUrl', () => {
    it('should return the long URL from cache', async () => {
      const shortUrlId = 'short123';
      const longUrl = 'http://example.com';

      jest.spyOn(cache, 'get').mockResolvedValue(longUrl);

      const result = await urlUseCases.getUrl(shortUrlId);

      expect(cache.get).toHaveBeenCalledWith(shortUrlId);
      expect(result).toEqual(longUrl);
    });

    it('should return the long URL from repository and cache it', async () => {
      const shortUrlId = 'short123';
      const longUrl = 'http://example.com';
      const urlEntity = new UrlEntity({ shortUrlId, longUrl });

      jest.spyOn(cache, 'get').mockResolvedValue(null);
      jest
        .spyOn(urlRepository, 'findByShortUrlId')
        .mockResolvedValue(urlEntity);
      jest
        .spyOn(urlRepository, 'incrementClicksAndLastAccess')
        .mockResolvedValue();
      jest.spyOn(cache, 'set').mockResolvedValue();

      const result = await urlUseCases.getUrl(shortUrlId);

      expect(urlRepository.findByShortUrlId).toHaveBeenCalledWith(shortUrlId);
      expect(urlRepository.incrementClicksAndLastAccess).toHaveBeenCalledWith(
        shortUrlId,
      );
      expect(cache.set).toHaveBeenCalledWith(shortUrlId, longUrl);
      expect(result).toEqual(longUrl);
    });

    it('should throw an error if URL not found', async () => {
      const shortUrlId = 'invalid123';

      jest.spyOn(cache, 'get').mockResolvedValue(null);
      jest.spyOn(urlRepository, 'findByShortUrlId').mockResolvedValue(null);

      await expect(urlUseCases.getUrl(shortUrlId)).rejects.toThrow(
        'URL not found',
      );
    });
  });

  describe('deleteUrl', () => {
    it('should delete a URL', async () => {
      const shortUrlId = 'short123';
      const userId = 'user-id-123';
      const longUrl = 'http://example.com';
      const urlEntity = new UrlEntity({ shortUrlId, userId, longUrl });

      jest
        .spyOn(urlRepository, 'findByShortUrlId')
        .mockResolvedValue(urlEntity);
      jest.spyOn(urlRepository, 'deleteByShortUrlId').mockResolvedValue();
      jest.spyOn(cache, 'del').mockResolvedValue();

      await urlUseCases.deleteUrl(shortUrlId, userId);

      expect(urlRepository.deleteByShortUrlId).toHaveBeenCalledWith(shortUrlId);
      expect(cache.del).toHaveBeenCalledWith(longUrl);
    });

    it('should throw an error if URL not found', async () => {
      const shortUrlId = 'invalid123';
      const userId = 'user-id-123';

      jest.spyOn(urlRepository, 'findByShortUrlId').mockResolvedValue(null);

      await expect(urlUseCases.deleteUrl(shortUrlId, userId)).rejects.toThrow(
        'URL not found',
      );
    });

    it('should throw an error if unauthorized', async () => {
      const shortUrlId = 'short123';
      const userId = 'user-id-123';
      const urlEntity = new UrlEntity({ shortUrlId, userId: 'other-user-id' });

      jest
        .spyOn(urlRepository, 'findByShortUrlId')
        .mockResolvedValue(urlEntity);

      await expect(urlUseCases.deleteUrl(shortUrlId, userId)).rejects.toThrow(
        'Unauthorized',
      );
    });
  });

  describe('updateUrl', () => {
    it('should update the long URL', async () => {
      const shortUrlId = 'short123';
      const userId = 'user-id-123';
      const oldLongUrl = 'http://old.com';
      const newLongUrl = 'http://new.com';
      const urlEntity = new UrlEntity({
        shortUrlId,
        userId,
        longUrl: oldLongUrl,
      });

      jest.spyOn(urlValidator, 'validateUrl').mockReturnValue(true);
      jest
        .spyOn(urlRepository, 'findByShortUrlId')
        .mockResolvedValue(urlEntity);
      jest.spyOn(urlRepository, 'save').mockResolvedValue(urlEntity);
      jest.spyOn(cache, 'del').mockResolvedValue();
      jest.spyOn(cache, 'set').mockResolvedValue();

      await urlUseCases.updateUrl(shortUrlId, newLongUrl, userId);

      expect(urlRepository.save).toHaveBeenCalled();
      expect(cache.del).toHaveBeenCalledWith(oldLongUrl);
      expect(cache.set).toHaveBeenCalledWith(newLongUrl, shortUrlId);
    });

    it('should throw an error if URL not found', async () => {
      const shortUrlId = 'invalid123';
      const newLongUrl = 'http://new.com';
      const userId = 'user-id-123';

      jest.spyOn(urlRepository, 'findByShortUrlId').mockResolvedValue(null);

      await expect(
        urlUseCases.updateUrl(shortUrlId, newLongUrl, userId),
      ).rejects.toThrow('URL not found');
    });

    it('should throw an error if unauthorized', async () => {
      const shortUrlId = 'short123';
      const userId = 'user-id-123';
      const newLongUrl = 'http://new.com';
      const urlEntity = new UrlEntity({ shortUrlId, userId: 'other-user-id' });

      jest
        .spyOn(urlRepository, 'findByShortUrlId')
        .mockResolvedValue(urlEntity);

      await expect(
        urlUseCases.updateUrl(shortUrlId, newLongUrl, userId),
      ).rejects.toThrow('Unauthorized');
    });
  });
});
