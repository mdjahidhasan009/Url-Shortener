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
import { AuthUseCases } from '../../core/application/use-cases/auth.use-cases';
import { JwtServiceAdapter } from '../adapters/jwt/jwt.service.adapter';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
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
    AuthUseCases,
    {
      provide: 'UserRepositoryPort',
      useClass: UserRepository,
    },
    {
      provide: 'JwtServicePort',
      useClass: JwtServiceAdapter,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
