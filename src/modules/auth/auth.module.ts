import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { AuthGuard } from './guards/auth.guard';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configSerice: ConfigService) => ({
        secret: configSerice.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configSerice.getOrThrow<string>('JWT_EXPIRED_TIME'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, UserRepository],
  exports: [AuthGuard],
})
export class AuthModule {}
