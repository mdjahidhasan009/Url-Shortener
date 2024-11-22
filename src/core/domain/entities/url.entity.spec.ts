import { UrlEntity } from './url.entity';

describe('UrlEntity', () => {
  it('should create a UrlEntity with partial data', () => {
    const partial = {
      shortUrlId: 'abc123',
      longUrl: 'http://example.com',
      userId: 'user-id-123',
    };
    const urlEntity = new UrlEntity(partial);

    expect(urlEntity.shortUrlId).toEqual(partial.shortUrlId);
    expect(urlEntity.longUrl).toEqual(partial.longUrl);
    expect(urlEntity.userId).toEqual(partial.userId);
    expect(urlEntity.createdAt).toBeUndefined();
    expect(urlEntity.clicks).toBeUndefined();
  });
});
