import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity as UserOrmEntity } from '../entities/user.entity';
import { Repository } from 'typeorm';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let repository: Repository<UserOrmEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    repository = module.get<Repository<UserOrmEntity>>(
      getRepositoryToken(UserOrmEntity),
    );
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userEntity = new UserOrmEntity();
      userEntity.username = 'testuser';
      userEntity.password = 'hashedpassword';
      userEntity.urls = [];

      const savedUser = { ...userEntity, id: 'user-id-123' };

      jest.spyOn(repository, 'create').mockReturnValue(userEntity);
      jest.spyOn(repository, 'save').mockResolvedValue(savedUser);

      const result = await userRepository.create(userEntity);

      expect(repository.create).toHaveBeenCalledWith(userEntity);
      expect(repository.save).toHaveBeenCalledWith(userEntity);
      expect(result).toEqual(savedUser);
    });
  });

  describe('findOneByUsername', () => {
    it('should find a user by username', async () => {
      const userOrmEntity = new UserOrmEntity();
      userOrmEntity.username = 'testuser';

      jest.spyOn(repository, 'findOne').mockResolvedValue(userOrmEntity);

      const result = await userRepository.findOneByUsername('testuser');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(result).toEqual(userOrmEntity);
    });

    it('should return undefined if not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);

      const result = await userRepository.findOneByUsername('testuser');

      expect(result).toBeUndefined();
    });
  });

  ////TODO: Will add more tests for other methods
});
