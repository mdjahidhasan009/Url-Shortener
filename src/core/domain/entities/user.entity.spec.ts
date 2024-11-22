import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  it('should create a UserEntity with partial data', () => {
    const partial = {
      id: 'user-id-123',
      username: 'testuser',
      password: 'hashedpassword',
    };
    const userEntity = new UserEntity(partial);

    expect(userEntity.id).toEqual(partial.id);
    expect(userEntity.username).toEqual(partial.username);
    expect(userEntity.password).toEqual(partial.password);
  });
});
