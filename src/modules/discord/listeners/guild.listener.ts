import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, Guild } from 'discord.js';
import { GuildsRepository } from 'src/modules/guilds/guilds.repository';
import { DiscordService } from '../discord.service';

@Injectable()
export class GuildListener implements OnModuleInit {
  constructor(
    private readonly discordService: DiscordService,
    private readonly guildsRepository: GuildsRepository,
  ) {
    this.client = this.discordService.getClient();
  }

  private client: Client;
  private readonly logger = new Logger(GuildListener.name, { timestamp: true });

  // guild create delete means discord server join/leave
  onModuleInit() {
    this.client.on('guildDelete', (guild: Guild) => void this.onDelete(guild));
    this.client.on('guildCreate', (guild: Guild) => void this.onCreate(guild));
  }

  private async onDelete(guild: Guild): Promise<void> {
    await this.guildsRepository.revokeById(guild.id);

    this.logger.log(`Guild "${guild.name}" (id: ${guild.id}) has been deleted`);
  }

  private async onCreate(guild: Guild): Promise<void> {
    await this.guildsRepository.upsert({
      id: guild.id,
      name: guild.name,
    });

    this.logger.log(`Guild "${guild.name}" (id: ${guild.id}) has been created`);
  }
}
