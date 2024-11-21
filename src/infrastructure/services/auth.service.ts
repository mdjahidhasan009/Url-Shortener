// src/infrastructure/services/auth.service.ts

import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryPort } from '../../core/application/ports/repository.port';
import { UserEntity } from '../../core/domain/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserRepositoryPort')
    private userRepository: UserRepositoryPort,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOneByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user; // Exclude password
      return result;
    }
    return null;
  }

  async login(user: UserEntity) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(username: string, password: string): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOneByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserEntity({ username, password: hashedPassword });
    return this.userRepository.create(newUser);
  }
}
