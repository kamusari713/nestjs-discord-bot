import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordService } from '../discord/discord.service';
import { ChannelSnapshot } from './entities/channel-snapshot.entity';
import { SnapshotsController } from './snapshots.controller';
import { SnapshotsService } from './snapshots.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelSnapshot]), JwtModule],
  providers: [SnapshotsService, DiscordService],
  exports: [SnapshotsService],
  controllers: [SnapshotsController],
})
export class SnapshotsModule {}
