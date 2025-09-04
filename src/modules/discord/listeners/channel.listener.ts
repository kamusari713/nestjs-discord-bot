import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChannelType, Client, NonThreadGuildBasedChannel } from 'discord.js';
import { GuildsRepository } from 'src/modules/guilds/guilds.repository';
import { Policy } from 'src/modules/guilds/types/policy.type';
import { DiscordService } from '../discord.service';

@Injectable()
export class ChannelListener implements OnModuleInit {
  constructor(
    private readonly discordService: DiscordService,
    private readonly guildsRepository: GuildsRepository,
  ) {
    this.client = this.discordService.getClient();
  }

  private client: Client;
  private readonly logger = new Logger(ChannelListener.name, {
    timestamp: true,
  });

  onModuleInit() {
    this.client.on(
      'channelCreate',
      (channel: NonThreadGuildBasedChannel) => void this.onCreate(channel),
    );
    this.client.on(
      'channelDelete',
      (channel: NonThreadGuildBasedChannel) => void this.onDelete(channel),
    );
  }

  private async onCreate(channel: NonThreadGuildBasedChannel) {
    const guild = channel.guild;
    const guildEntity = await this.guildsRepository.findById(guild.id);

    if (
      guildEntity &&
      guildEntity.active &&
      guildEntity.policy === Policy.STRICT
    ) {
      if (
        channel.type === ChannelType.GuildVoice ||
        channel.type === ChannelType.GuildStageVoice
      )
        await this.discordService.deleteChannel(channel);
    }

    this.logger.log(
      `Channel "${channel.name}" (id: ${channel.id}) has been created`,
    );
  }

  private onDelete(channel: NonThreadGuildBasedChannel) {
    this.logger.log(
      `Channel "${channel.name}" (id: ${channel.id}) has been deleted`,
    );
  }
}
