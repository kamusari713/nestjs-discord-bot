import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordService } from '../discord/discord.service';
import { Guild } from '../guilds/entities/guild.entity';
import { GuildsRepository } from '../guilds/guilds.repository';
import { QuietEnforceService } from '../quiet/quiet-enforce.service';
import { QuietSchedulerSerivce } from '../quiet/quiet-scheduler.service';
import { ChannelListener } from './channel.listener';
import { ClientListener } from './client.listener';
import { GuildListener } from './guild.listener';
import { VoiceListener } from './voice.listener';
import { SnapshotsService } from '../snapshots/snapshots.service';
import { ChannelSnapshot } from '../snapshots/entities/channel-snapshot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Guild, ChannelSnapshot])],
  providers: [
    SnapshotsService,
    DiscordService,
    GuildsRepository,
    QuietSchedulerSerivce,
    QuietEnforceService,
    ChannelListener,
    ClientListener,
    GuildListener,
    VoiceListener,
  ],
})
export class ListenersModule {}
