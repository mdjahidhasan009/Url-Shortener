import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthUseCases } from '../../core/application/use-cases/auth.use-cases';

describe('AuthService', () => {
  let authService: AuthService;
  let authUseCases: AuthUseCases;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthUseCases,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authUseCases = module.get<AuthUseCases>(AuthUseCases);
  });

  describe('register', () => {
    it('should call authUseCases.register', async () => {
      const username = 'testuser';
      const password = 'password';
      const token = { access_token: 'jwt-token' };

      jest.spyOn(authUseCases, 'register').mockResolvedValue(token);

      const result = await authService.register(username, password);

      expect(authUseCases.register).toHaveBeenCalledWith(username, password);
      expect(result).toEqual(token);
    });
  });

  describe('login', () => {
    it('should call authUseCases.login', async () => {
      const username = 'testuser';
      const password = 'password';
      const token = { access_token: 'jwt-token' };

      jest.spyOn(authUseCases, 'login').mockResolvedValue(token);

      const result = await authService.login(username, password);

      expect(authUseCases.login).toHaveBeenCalledWith(username, password);
      expect(result).toEqual(token);
    });
  });

  describe('validateUser', () => {
    it('should return user data if credentials are valid', async () => {
      const username = 'testuser';
      const password = 'password';
      const token = { access_token: 'jwt-token' };

      jest.spyOn(authUseCases, 'login').mockResolvedValue(token);

      const result = await authService.validateUser(username, password);

      expect(authUseCases.login).toHaveBeenCalledWith(username, password);
      expect(result).toEqual({ username, access_token: 'jwt-token' });
    });

    it('should return null if credentials are invalid', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';

      jest
        .spyOn(authUseCases, 'login')
        .mockRejectedValue(new Error('Invalid credentials'));

      const result = await authService.validateUser(username, password);

      expect(authUseCases.login).toHaveBeenCalledWith(username, password);
      expect(result).toBeNull();
    });
  });
});
