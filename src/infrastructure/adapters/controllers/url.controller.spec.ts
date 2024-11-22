import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlUseCases } from '../../../core/application/use-cases/url.use-cases';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('UrlController', () => {
  let urlController: UrlController;
  let urlUseCases: UrlUseCases;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlUseCases,
          useValue: {
            createUrl: jest.fn(),
            getUrl: jest.fn(),
            deleteUrl: jest.fn(),
            updateUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    urlController = module.get<UrlController>(UrlController);
    urlUseCases = module.get<UrlUseCases>(UrlUseCases);
  });

  describe('createUrl', () => {
    it('should create a new short URL', async () => {
      const longUrl = 'http://example.com';
      const req = { user: { userId: 'user-id-123' } };
      const shortUrl = 'http://short.url/abc123';

      jest.spyOn(urlUseCases, 'createUrl').mockResolvedValue(shortUrl);

      const result = await urlController.createUrl(longUrl, req);

      expect(urlUseCases.createUrl).toHaveBeenCalledWith(
        longUrl,
        'user-id-123',
      );
      expect(result).toEqual(shortUrl);
    });
  });

  describe('getUrl', () => {
    it('should redirect to the long URL', async () => {
      const shortUrlId = 'abc123';
      const longUrl = 'http://example.com';
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      jest.spyOn(urlUseCases, 'getUrl').mockResolvedValue(longUrl);

      await urlController.getUrl(shortUrlId, res);

      expect(urlUseCases.getUrl).toHaveBeenCalledWith(shortUrlId);
      expect(res.redirect).toHaveBeenCalledWith(HttpStatus.FOUND, longUrl);
    });

    it('should return 404 if URL not found', async () => {
      const shortUrlId = 'invalid123';
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      jest
        .spyOn(urlUseCases, 'getUrl')
        .mockRejectedValue(new Error('URL not found'));

      await urlController.getUrl(shortUrlId, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.send).toHaveBeenCalledWith({ message: 'URL not found' });
    });
  });

  describe('deleteUrl', () => {
    it('should delete the URL', async () => {
      const shortUrlId = 'abc123';
      const req = { user: { userId: 'user-id-123' } };

      jest.spyOn(urlUseCases, 'deleteUrl').mockResolvedValue();

      await urlController.deleteUrl(shortUrlId, req);

      expect(urlUseCases.deleteUrl).toHaveBeenCalledWith(
        shortUrlId,
        'user-id-123',
      );
    });
  });

  describe('updateUrl', () => {
    it('should update the URL', async () => {
      const shortUrlId = 'abc123';
      const newLongUrl = 'http://newexample.com';
      const req = { user: { userId: 'user-id-123' } };

      jest.spyOn(urlUseCases, 'updateUrl').mockResolvedValue();

      await urlController.updateUrl(shortUrlId, newLongUrl, req);

      expect(urlUseCases.updateUrl).toHaveBeenCalledWith(
        shortUrlId,
        newLongUrl,
        'user-id-123',
      );
    });
  });
});
