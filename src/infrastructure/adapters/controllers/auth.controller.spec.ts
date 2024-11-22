import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../services/auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const body = { username: 'testuser', password: 'password' };
      const token = { access_token: 'jwt-token' };

      jest.spyOn(authService, 'register').mockResolvedValue(token);

      const result = await authController.register(body);

      expect(authService.register).toHaveBeenCalledWith(
        body.username,
        body.password,
      );
      expect(result).toEqual(token);
    });
  });

  describe('login', () => {
    it('should return user data after login', async () => {
      const req = { user: { username: 'testuser', access_token: 'jwt-token' } };

      const result = await authController.login(req);

      expect(result).toEqual(req.user);
    });
  });
});
