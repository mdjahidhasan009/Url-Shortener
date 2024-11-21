import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UrlEntity } from './url.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; // Hashed password

  @OneToMany(() => UrlEntity, (url) => url.user)
  urls: UrlEntity[];
}
