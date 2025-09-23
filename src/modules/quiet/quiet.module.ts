import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordService } from '../discord/discord.service';
import { Guild } from '../guilds/entities/guild.entity';
import { GuildsRepository } from '../guilds/guilds.repository';
import { ChannelSnapshot } from '../snapshots/entities/channel-snapshot.entity';
import { SnapshotsService } from '../snapshots/snapshots.service';
import { QuietEnforceService } from './quiet-enforce.service';
import { QuietSchedulerSerivce } from './quiet-scheduler.service';
import { QuietController } from './quiet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Guild, ChannelSnapshot]), JwtModule],
  providers: [
    GuildsRepository,
    QuietEnforceService,
    QuietSchedulerSerivce,
    SnapshotsService,
    DiscordService,
  ],
  exports: [QuietSchedulerSerivce],
  controllers: [QuietController],
})
export class QuietModule {}
