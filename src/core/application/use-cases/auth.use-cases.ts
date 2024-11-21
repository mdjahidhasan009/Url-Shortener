import { Injectable, Inject } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepositoryPort } from '../ports/repository.port';
import { UserEntity } from '../../domain/entities/user.entity';
import { JwtServicePort } from '../ports/jwt.service.port';

@Injectable()
export class AuthUseCases {
  constructor(
    @Inject('UserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
    @Inject('JwtServicePort')
    private readonly jwtService: JwtServicePort,
  ) {}

  async register(username: string, password: string): Promise<{ access_token: string }> {
    const existingUser = await this.userRepository.findOneByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserEntity({ username, password: hashedPassword });
    const savedUser = await this.userRepository.create(newUser);

    const payload = { username: savedUser.username, sub: savedUser.id };
    const access_token = this.jwtService.sign(payload);

    return { access_token };
  }

  async login(username: string, password: string): Promise<{ access_token: string }> {
    const user = await this.userRepository.findOneByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username: user.username, sub: user.id };
      const access_token = this.jwtService.sign(payload);
      return { access_token };
    }
    throw new Error('Invalid credentials');
  }
}
