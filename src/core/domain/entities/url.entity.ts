export class UrlEntity {
  shortUrlId: string;
  longUrl: string;
  createdAt: Date;
  expiresAt?: Date;
  userId: string;
  clicks: number;
  lastAccessed?: Date;
  metadata?: Record<string, any>;
  isActive: boolean;

  constructor(partial: Partial<UrlEntity>) {
    Object.assign(this, partial);
  }
}
