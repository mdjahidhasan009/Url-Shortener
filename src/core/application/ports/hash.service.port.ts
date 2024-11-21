export abstract class HashServicePort {
  abstract generateUniqueHash(longUrl: string): Promise<string>;
}
