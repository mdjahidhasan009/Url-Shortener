import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class UrlEntity {
  @PrimaryColumn()
  shortUrlId: string;

  @Column()
  longUrl: string;

  @Column()
  userId: string;

  @Column()
  createdAt: Date;

  @Column()
  clicks: number;

  @Column()
  isActive: boolean;

  @Column({ nullable: true })
  expiresAt?: Date;

  @Column({ nullable: true })
  lastAccessed?: Date;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;
}
