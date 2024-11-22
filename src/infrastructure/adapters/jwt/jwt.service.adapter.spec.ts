import { Test, TestingModule } from '@nestjs/testing';
import { JwtServiceAdapter } from './jwt.service.adapter';
import { JwtService } from '@nestjs/jwt';

describe('JwtServiceAdapter', () => {
  let jwtServiceAdapter: JwtServiceAdapter;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtServiceAdapter,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    jwtServiceAdapter = module.get<JwtServiceAdapter>(JwtServiceAdapter);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('sign', () => {
    it('should sign a payload', () => {
      const payload = { username: 'testuser', sub: 'user-id-123' };
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = jwtServiceAdapter.sign(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toEqual('jwt-token');
    });
  });
});
