import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { Repository } from 'typeorm';
import { AuthInputDto } from '../dto/auth-input.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ username: username });
    return user;
  }

  async create(authInputDto: AuthInputDto): Promise<User> {
    const hashedPassword = createHash('sha256')
      .update(authInputDto.password)
      .digest('hex');
    authInputDto.password = hashedPassword;

    const createdUser = await this.userRepository.save(authInputDto);
    return createdUser;
  }
}
