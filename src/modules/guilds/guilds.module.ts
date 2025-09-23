import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from './entities/guild.entity';
import { GuildsController } from './guilds.controller';
import { GuildsRepository } from './guilds.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Guild]), JwtModule],
  providers: [GuildsRepository],
  exports: [GuildsRepository],
  controllers: [GuildsController],
})
export class GuildsModule {}
