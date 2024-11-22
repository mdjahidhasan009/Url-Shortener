import { Test, TestingModule } from '@nestjs/testing';
import { AuthUseCases } from './auth.use-cases';
import { UserRepositoryPort } from '../ports/repository.port';
import { JwtServicePort } from '../ports/jwt.service.port';
import { UserEntity } from '../../domain/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthUseCases', () => {
  let authUseCases: AuthUseCases;
  let userRepository: UserRepositoryPort;
  let jwtService: JwtServicePort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUseCases,
        {
          provide: 'UserRepositoryPort',
          useValue: {
            findOneByUsername: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'JwtServicePort',
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authUseCases = module.get<AuthUseCases>(AuthUseCases);
    userRepository = module.get<UserRepositoryPort>('UserRepositoryPort');
    jwtService = module.get<JwtServicePort>('JwtServicePort');
  });

  describe('register', () => {
    it('should register a new user and return an access token', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const userId = 'user-id-123';

      jest.spyOn(userRepository, 'findOneByUsername').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockImplementation(async (user) => {
        return new UserEntity({ ...user, id: userId });
      });
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await authUseCases.register(username, password);

      expect(userRepository.findOneByUsername).toHaveBeenCalledWith(username);
      expect(userRepository.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith({ username, sub: userId });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw an error if username already exists', async () => {
      const username = 'existinguser';
      const password = 'password';

      jest
        .spyOn(userRepository, 'findOneByUsername')
        .mockResolvedValue(new UserEntity({ username }));

      await expect(authUseCases.register(username, password)).rejects.toThrow(
        'Username already exists',
      );
    });
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = 'user-id-123';

      jest
        .spyOn(userRepository, 'findOneByUsername')
        .mockResolvedValue(
          new UserEntity({ id: userId, username, password: hashedPassword }),
        );

      // Updated this line
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await authUseCases.login(username, password);

      expect(userRepository.findOneByUsername).toHaveBeenCalledWith(username);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(jwtService.sign).toHaveBeenCalledWith({ username, sub: userId });
      expect(result).toEqual({ access_token: 'jwt-token' });
    });

    it('should throw an error if credentials are invalid', async () => {
      const username = 'testuser';
      const password = 'wrongpassword';

      jest
        .spyOn(userRepository, 'findOneByUsername')
        .mockResolvedValue(
          new UserEntity({ username, password: 'hashedpassword' }),
        );

      // Updated this line
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(authUseCases.login(username, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
