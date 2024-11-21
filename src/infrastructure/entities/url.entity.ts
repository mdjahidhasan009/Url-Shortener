import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('urls')
export class UrlEntity {
  @PrimaryColumn()
  shortUrlId: string;

  @Column()
  longUrl: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.urls)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

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
