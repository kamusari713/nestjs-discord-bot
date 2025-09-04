import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import {
  Channel,
  ChannelType,
  Client,
  Guild,
  GuildMember,
  VoiceBasedChannel,
  VoiceChannel,
} from 'discord.js';
import { DISCORD_CLIENT } from './types/tokens.type';

@Injectable()
export class DiscordService implements OnApplicationShutdown {
  constructor(@Inject(DISCORD_CLIENT) private readonly client: Client) {}

  private readonly logger = new Logger(DiscordService.name, {
    timestamp: true,
  });

  getClient() {
    return this.client;
  }

  getGuild(id: string): Guild {
    return this.client.guilds.cache
      .filter((guild: Guild) => guild.id === id)
      .map((guild) => guild)[0];
  }

  listVoiceChannels(guild: Guild) {
    return guild.channels.cache
      .filter(
        (channel: Channel) =>
          channel.type === ChannelType.GuildVoice ||
          channel.type === ChannelType.GuildStageVoice,
      )
      .map((channel: VoiceChannel) => channel);
  }

  listVoiceMembers(guild: Guild) {
    const channels = this.listVoiceChannels(guild);
    const members: GuildMember[] = [];
    channels.forEach((channel: VoiceChannel) => {
      channel.members.map((member: GuildMember) => members.push(member));
    });

    return members;
  }

  async deleteChannel(channel: VoiceBasedChannel | null) {
    try {
      if (channel) {
        await channel.delete('Sleep hours enforcement');
      }
    } catch (e) {
      this.logger.warn(`Delete failed for ${e}`);
    }
  }

  async deleteAllChannels(guild: Guild) {
    const channels = this.listVoiceChannels(guild);
    for (const channel of channels) {
      await this.deleteChannel(channel);
    }
  }

  async disconnectMember(member: GuildMember | null) {
    if (member && member.voice?.channel) {
      await member.voice.disconnect('Sleep hours enforcement');
    }
  }

  async disconnectEveryone(guild: Guild) {
    const members = this.listVoiceMembers(guild);
    for (const member of members) {
      await this.disconnectMember(member);
    }
  }

  async onApplicationShutdown() {
    this.client.removeAllListeners();
    await this.client.destroy();
  }
}
