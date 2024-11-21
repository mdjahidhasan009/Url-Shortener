import { Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../adapters/strategies/jwt.strategy';
import { LocalStrategy } from '../adapters/strategies/local.strategy';
import { AuthController } from '../adapters/controllers/auth.controller';

@Module({
  imports: [
    ConfigModule, // Ensure ConfigModule is imported
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule], // Ensure ConfigModule is imported
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    {
      provide: 'UserRepositoryPort',
      useClass: UserRepository,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
