import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ChannelType } from 'discord.js';
import { DiscordService } from '../discord/discord.service';
import { Guild } from '../guilds/entities/guild.entity';
import { Policy } from '../guilds/types/policy.type';
import { SnapshotsService } from '../snapshots/snapshots.service';

@Injectable()
export class QuietEnforceService {
  constructor(
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
    private readonly snapshotService: SnapshotsService,
  ) {}

  private readonly logger = new Logger(QuietEnforceService.name, {
    timestamp: true,
  });

  async enterQuiet(guildEntity: Guild): Promise<void> {
    const guild = this.discordService.getGuild(guildEntity.id);

    await this.snapshotService.deleteOldSnapshots(guild);
    await this.snapshotService.takeSnapshots(guild);

    await this.discordService.disconnectEveryone(guild);
    if (guildEntity.policy === Policy.STRICT) {
      await this.discordService.deleteAllChannels(guild);
    }

    this.logger.log(
      `Enter in quiet mode for "${guildEntity.name}" (id: ${guildEntity.id}), policy=${guildEntity.policy}`,
    );
  }

  async exitQuiet(guildEntity: Guild): Promise<void> {
    const guild = this.discordService.getGuild(guildEntity.id);

    const pendingSnapshots =
      await this.snapshotService.getPendingSnapshots(guild);
    const restored: string[] = [];

    // if by any chance a channel still alive during quiet, skip creating it
    for (const snapshot of pendingSnapshots) {
      // restore channel
      const created = await guild.channels.create({
        name: snapshot.name,
        type:
          snapshot.type === 'voice'
            ? ChannelType.GuildVoice
            : ChannelType.GuildStageVoice,
        parent: snapshot.parentId || undefined,
        position: snapshot.position ?? undefined,
        rtcRegion: snapshot.rtcRegion || undefined,
        // voice only
        bitrate:
          snapshot.type === 'voice' && snapshot.bitrate != null
            ? snapshot.bitrate
            : undefined,
        userLimit:
          snapshot.type === 'voice' && snapshot.userLimit != null
            ? snapshot.userLimit
            : undefined,
      });

      // then restore channel permissions
      const overwrites = snapshot.permissionOverwrites;
      await created.permissionOverwrites.set(
        overwrites.map((permission) => ({
          id: permission.id,
          type: permission.type,
          allow: BigInt(permission.allow),
          deny: BigInt(permission.deny),
        })),
      );

      restored.push(snapshot.id);
    }

    if (restored.length) {
      await this.snapshotService.restoreSnapshots(restored);
    }

    this.logger.log(
      `Exit quiet mode for "${guildEntity.name}" (id: ${guildEntity.id}), policy=${guildEntity.policy}`,
    );
  }
}
