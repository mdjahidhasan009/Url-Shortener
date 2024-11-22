import { Test, TestingModule } from '@nestjs/testing';
import { UrlRepository } from './url.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UrlEntity as UrlOrmEntity } from '../entities/url.entity';
import { UserEntity as UserOrmEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';

describe('UrlRepository', () => {
  let urlRepository: UrlRepository;
  let repository: Repository<UrlOrmEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlRepository,
        {
          provide: getRepositoryToken(UrlOrmEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    urlRepository = module.get<UrlRepository>(UrlRepository);
    repository = module.get<Repository<UrlOrmEntity>>(
      getRepositoryToken(UrlOrmEntity),
    );
  });

  describe('save', () => {
    it('should save a URL entity', async () => {
      const user = new UserOrmEntity();
      user.id = 'user-id-123';
      user.username = 'testuser';
      user.password = 'hashedpassword';
      user.urls = [];

      const urlEntity = new UrlOrmEntity();
      urlEntity.shortUrlId = 'abc123';
      urlEntity.longUrl = 'http://example.com';
      urlEntity.user = user;
      urlEntity.userId = user.id;
      urlEntity.createdAt = new Date();
      urlEntity.clicks = 0;
      urlEntity.isActive = true;

      jest.spyOn(repository, 'save').mockResolvedValue(urlEntity);

      const result = await urlRepository.save(urlEntity);

      expect(repository.save).toHaveBeenCalledWith(urlEntity);
      expect(result).toEqual(urlEntity);
    });
  });

  describe('findByShortUrlId', () => {
    it('should find a URL by shortUrlId', async () => {
      const urlEntity = new UrlOrmEntity();
      urlEntity.shortUrlId = 'abc123';
      urlEntity.longUrl = 'http://example.com';

      jest.spyOn(repository, 'findOne').mockResolvedValue(urlEntity);

      const result = await urlRepository.findByShortUrlId('abc123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { shortUrlId: 'abc123' },
      });
      expect(result).toEqual(urlEntity);
    });

    it('should return null if not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await urlRepository.findByShortUrlId('abc123');

      expect(result).toBeNull();
    });
  });

  ////TODO: Will add more tests here
});
