import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordModule } from '../discord/discord.module';
import { ChannelSnapshot } from './entities/channel-snapshot.entity';
import { SnapshotsService } from './snapshots.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelSnapshot]),
    forwardRef(() => DiscordModule),
  ],
  providers: [SnapshotsService],
  exports: [SnapshotsService],
})
export class SnapshotsModule {}
