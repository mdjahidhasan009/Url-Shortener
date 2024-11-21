import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepositoryPort } from '../../core/application/ports/repository.port';
import { Repository } from 'typeorm';
import { UserEntity as UserOrmEntity } from '../entities/user.entity';
import { UserEntity } from '../../core/domain/entities/user.entity';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const newUser = this.repository.create(user);
    const savedUser = await this.repository.save(newUser);
    return new UserEntity(savedUser);
  }

  async findOneByUsername(username: string): Promise<UserEntity | undefined> {
    const user = await this.repository.findOne({ where: { username } });
    return user ? new UserEntity(user) : undefined;
  }

  async findOneById(id: string): Promise<UserEntity | undefined> {
    const user = await this.repository.findOne({ where: { id } });
    return user ? new UserEntity(user) : undefined;
  }
}
