import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from 'discord.js';
import { GuildsRepository } from 'src/modules/guilds/guilds.repository';
import { QuietSchedulerSerivce } from 'src/modules/quiet/quiet-scheduler.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class ClientListener implements OnModuleInit {
  constructor(
    private readonly discordService: DiscordService,
    private readonly quietSchedulerService: QuietSchedulerSerivce,
    private readonly guildsRepository: GuildsRepository,
  ) {
    this.client = this.discordService.getClient();
  }

  private client: Client;
  private readonly logger = new Logger(ClientListener.name, {
    timestamp: true,
  });

  onModuleInit() {
    this.client.once(
      'clientReady',
      (client: Client<true>) => void this.onClientReady(client),
    );
  }

  private async onClientReady(client: Client<true>): Promise<void> {
    this.logger.log(
      `Discord ready as "${client.user?.username}" user (id: ${client.user?.id})`,
    );

    const guilds = await client.guilds.fetch();
    const presentIds = new Set<string>();

    // upsert all cached guilds
    for (const [, guild] of guilds) {
      presentIds.add(guild.id);
      await this.guildsRepository.upsert({
        id: guild.id,
        name: guild.name,
      });
    }

    // if any guild not in cache then revoke it
    const existingGuilds = await this.guildsRepository.findAll();
    for (const guild of existingGuilds) {
      if (!presentIds.has(guild.id)) {
        if (!guild.revoked) {
          await this.guildsRepository.revokeById(guild.id);
          await this.quietSchedulerService.cancelForGuild(guild);
          this.logger.log(
            `Marked guild "${guild.name}" (id: ${guild.id}) as revoked`,
          );
        }
      }
    }

    // schedule for every active guild
    const activeGuilds = await this.guildsRepository.findAllActive();
    for (const guild of activeGuilds) {
      await this.quietSchedulerService.scheduleForGuild(guild);
    }

    this.logger.log(`Sync complete: scheduled ${activeGuilds.length} guild(s)`);
  }
}
