import { Test, TestingModule } from '@nestjs/testing';
import { RedisCacheAdapter } from './redis.cache.adapter';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    set: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
  })),
}));

describe('RedisCacheAdapter', () => {
  let redisCacheAdapter: RedisCacheAdapter;
  let configService: ConfigService;
  let redisClient: any;

  beforeEach(async () => {
    redisClient = {
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      set: jest.fn(),
      setEx: jest.fn(),
      del: jest.fn(),
    };
    (createClient as jest.Mock).mockReturnValue(redisClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheAdapter,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('redis://localhost:6379'),
          },
        },
      ],
    }).compile();

    redisCacheAdapter = module.get<RedisCacheAdapter>(RedisCacheAdapter);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('get', () => {
    it('should get value by key', async () => {
      redisClient.get.mockResolvedValue('value');
      const result = await redisCacheAdapter.get('key');
      expect(redisClient.get).toHaveBeenCalledWith('key');
      expect(result).toEqual('value');
    });
  });

  describe('set', () => {
    it('should set value without ttl', async () => {
      await redisCacheAdapter.set('key', 'value');
      expect(redisClient.set).toHaveBeenCalledWith('key', 'value');
    });

    it('should set value with ttl', async () => {
      await redisCacheAdapter.set('key', 'value', 60);
      expect(redisClient.setEx).toHaveBeenCalledWith('key', 60, 'value');
    });
  });

  describe('del', () => {
    it('should delete a key', async () => {
      await redisCacheAdapter.del('key');
      expect(redisClient.del).toHaveBeenCalledWith('key');
    });
  });
});
