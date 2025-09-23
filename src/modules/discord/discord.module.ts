import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { DiscordService } from './discord.service';
import { DiscordOptions } from './types/options.type';
import { DISCORD_CLIENT, DISCORD_OPTIONS } from './types/tokens.type';

@Global()
@Module({})
export class DiscordModule {
  static forRootAsync(): DynamicModule {
    return {
      module: DiscordModule,
      providers: [
        // firstfull inject and provide our config service
        {
          provide: DISCORD_OPTIONS,
          inject: [ConfigService],
          useFactory: (cfg: ConfigService) => ({
            token: cfg.getOrThrow<string>('DISCORD_BOT_TOKEN'),
            intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.GuildVoiceStates,
            ],
            partials: [Partials.Channel, Partials.User, Partials.GuildMember],
          }),
        },
        // secondary implement and provide our discord bot client instance
        {
          provide: DISCORD_CLIENT,
          inject: [DISCORD_OPTIONS],
          useFactory: async (opts: DiscordOptions) => {
            const client = new Client({
              intents: opts.intents,
              partials: opts.partials,
            });
            await client.login(opts.token);
            return client;
          },
        },

        DiscordService,
      ],
      exports: [DISCORD_CLIENT, DiscordService],
    };
  }
}
