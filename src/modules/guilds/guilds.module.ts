import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from './entities/guild.entity';
import { GuildsRepository } from './guilds.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Guild])],
  providers: [GuildsRepository],
  exports: [GuildsRepository],
})
export class GuildsModule {}
