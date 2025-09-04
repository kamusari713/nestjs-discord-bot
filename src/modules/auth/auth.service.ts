import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { AuthInputDto } from './dto/auth-input.dto';
import { AuthOutputDto } from './dto/auth-output.dto';
import { SignInDto } from './dto/sign-in.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async authenticate(
    authInputDto: AuthInputDto,
  ): Promise<AuthOutputDto | null> {
    const user = await this.verifyUser(authInputDto);

    if (!user) {
      throw new BadRequestException();
    }

    return this.signin(user);
  }

  async verifyUser(authInputDto: AuthInputDto): Promise<SignInDto | void> {
    const user = await this.userRepository.findByUsername(
      authInputDto.username,
    );
    if (user) {
      const hashedPassword = createHash('sha256')
        .update(authInputDto.password)
        .digest('hex');
      if (hashedPassword === user.password) {
        return {
          id: user.id,
          username: user.username,
        };
      }
    }
  }

  async signin(signInDto: SignInDto): Promise<AuthOutputDto> {
    const tokenPayload = {
      sub: signInDto.id,
      username: signInDto.username,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);

    return {
      username: signInDto.username,
      accessToken: accessToken,
    };
  }

  async onModuleInit() {
    const username =
      this.configService.get<string>('ADMIN_USERNAME') || 'admin';

    const password =
      this.configService.get<string>('ADMIN_PASSWORD') || 'password';

    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      await this.userRepository.create({
        username: username,
        password: password,
      });
    }
  }
}
