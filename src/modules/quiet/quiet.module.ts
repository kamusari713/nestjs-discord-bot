import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordModule } from '../discord/discord.module';
import { Guild } from '../guilds/entities/guild.entity';
import { GuildsRepository } from '../guilds/guilds.repository';
import { SnapshotsModule } from '../snapshots/snapshots.module';
import { QuietEnforceService } from './quiet-enforce.service';
import { QuietSchedulerSerivce } from './quiet-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guild]),
    SnapshotsModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [GuildsRepository, QuietEnforceService, QuietSchedulerSerivce],
  exports: [QuietSchedulerSerivce],
})
export class QuietModule {}
