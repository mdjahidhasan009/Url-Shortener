import { validateUrl } from './url.validator';

describe('validateUrl', () => {
  it('should return true for valid URLs', () => {
    expect(validateUrl('http://example.com')).toBe(true);
    expect(validateUrl('https://example.com')).toBe(true);
    expect(validateUrl('http://www.example.com')).toBe(true);
    expect(validateUrl('www.example.com')).toBe(true);
    expect(validateUrl('example.com')).toBe(true);
  });

  it('should return false for invalid URLs', () => {
    expect(validateUrl('invalid-url')).toBe(false);
    expect(validateUrl('htp://example.com')).toBe(false);
    expect(validateUrl('http:/example.com')).toBe(false);
    expect(validateUrl('')).toBe(false);
  });
});
