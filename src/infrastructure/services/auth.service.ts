import { Injectable } from '@nestjs/common';
import { AuthUseCases } from '../../core/application/use-cases/auth.use-cases';

@Injectable()
export class AuthService {
  constructor(private readonly authUseCases: AuthUseCases) {}

  async register(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    return this.authUseCases.register(username, password);
  }

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    return this.authUseCases.login(username, password);
  }

  async validateUser(username: string, password: string): Promise<any> {
    try {
      const result = await this.authUseCases.login(username, password);
      return { username, access_token: result.access_token };
    } catch (error) {
      return null;
    }
  }
}
