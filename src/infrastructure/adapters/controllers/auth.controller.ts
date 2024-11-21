import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from '../../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    const user = await this.authService.register(username, password);

    // After registration, automatically log in the user and return the access token
    const accessToken = await this.authService.login(user);
    return accessToken;
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: any }) {
    return this.authService.login(req.user);
  }
}
