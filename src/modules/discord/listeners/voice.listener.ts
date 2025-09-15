import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, VoiceState } from 'discord.js';
import { GuildsRepository } from 'src/modules/guilds/guilds.repository';
import { Policy } from 'src/modules/guilds/types/policy.type';
import { DiscordService } from '../discord.service';

@Injectable()
export class VoiceListener implements OnModuleInit {
  constructor(
    private readonly discordService: DiscordService,
    private readonly guildsRepository: GuildsRepository,
  ) {
    this.client = this.discordService.getClient();
  }

  private client: Client;
  private readonly logger = new Logger(VoiceListener.name, { timestamp: true });

  onModuleInit() {
    this.client.on(
      'voiceStateUpdate',
      (oldState: VoiceState, newState: VoiceState) =>
        void this.onVoiceStateUpdate(oldState, newState),
    );
  }

  private async onVoiceStateUpdate(
    oldState: VoiceState,
    newState: VoiceState,
  ): Promise<void> {
    try {
      if (newState.member?.partial) await newState.member.fetch();
      const guild = await this.guildsRepository.findById(newState.guild.id);
      if (guild && guild.active) {
        await this.discordService.disconnectEveryone(newState.guild);
        if (guild.policy === Policy.STRICT) {
          await this.discordService.deleteAllChannels(newState.guild);
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
}
