import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guild } from '../guilds/entities/guild.entity';
import { GuildsRepository } from '../guilds/guilds.repository';
import { QuietEnforceService } from '../quiet/quiet-enforce.service';
import { ChannelSnapshot } from '../snapshots/entities/channel-snapshot.entity';
import { SnapshotsService } from '../snapshots/snapshots.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Guild, ChannelSnapshot]), JwtModule],
  controllers: [AdminController],
  providers: [
    GuildsRepository,
    QuietEnforceService,
    SnapshotsService,
    AdminService,
  ],
})
export class AdminModule {}
