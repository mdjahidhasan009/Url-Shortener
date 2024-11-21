export class UserEntity {
  id: string;
  username: string;
  password: string; // Hashed password

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
