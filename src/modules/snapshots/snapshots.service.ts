import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChannelType,
  Guild,
  PermissionOverwriteManager,
  PermissionOverwrites,
  VoiceChannel,
} from 'discord.js';
import { Repository } from 'typeorm';
import { DiscordService } from '../discord/discord.service';
import { ChannelSnapshot } from './entities/channel-snapshot.entity';
import { SerializedOverwrite } from './types/serialized-overwrite.type';

@Injectable()
export class SnapshotsService {
  constructor(
    @InjectRepository(ChannelSnapshot)
    private readonly snapshotRepository: Repository<ChannelSnapshot>,
    private readonly discordService: DiscordService,
  ) {}

  async takeSnapshots(guild: Guild): Promise<void> {
    await this.snapshotRepository.delete({
      guildId: guild.id,
      restored: false,
    });

    const channels = this.discordService.listVoiceChannels(guild);

    const snapshots = channels.map((channel: VoiceChannel) => {
      return this.snapshotRepository.create({
        guildId: guild.id,
        originalChannelId: channel.id,
        name: channel.name,
        type: channel.type === ChannelType.GuildVoice ? 'voice' : 'stage',
        parentId: channel.parentId ?? null,
        position: channel.position ?? null,
        userLimit:
          channel.type === ChannelType.GuildVoice
            ? (channel.userLimit ?? null)
            : null,
        bitrate:
          channel.type === ChannelType.GuildVoice
            ? (channel.bitrate ?? null)
            : null,
        rtcRegion: channel.rtcRegion ?? null,
        permissionOverwrites: this.serializeOverwrites(
          channel.permissionOverwrites,
        ),
      });
    });

    await this.snapshotRepository.save(snapshots);
  }

  async getSnapshotsById(id: string): Promise<ChannelSnapshot[]> {
    const snapshots = await this.snapshotRepository.findBy({ guildId: id });
    if (snapshots) {
      return snapshots;
    }
    throw new NotFoundException(`No snapshots where find by guild id: ${id}`);
  }

  async getPendingSnapshots(guild: Guild): Promise<ChannelSnapshot[]> {
    const pendings = await this.snapshotRepository.find({
      where: { guildId: guild.id, restored: false },
      order: { createdAt: 'ASC' },
    });

    if (pendings) {
      return pendings;
    }
    throw new NotFoundException();
  }

  async restoreSnapshots(ids: string[]): Promise<void> {
    await this.snapshotRepository.update(ids, { restored: true });
  }

  async deleteOldSnapshots(guild: Guild): Promise<void> {
    await this.snapshotRepository.delete({ guildId: guild.id, restored: true });
  }

  private serializeOverwrites(
    overwrites: PermissionOverwriteManager,
  ): SerializedOverwrite[] {
    return overwrites.cache.map((permission: PermissionOverwrites) => ({
      id: permission.id,
      type: permission.type,
      allow: permission.allow.bitfield.toString(),
      deny: permission.deny.bitfield.toString(),
    }));
  }
}
