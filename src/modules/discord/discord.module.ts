import { DynamicModule, forwardRef, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { Guild } from '../guilds/entities/guild.entity';
import { GuildsRepository } from '../guilds/guilds.repository';
import { QuietModule } from '../quiet/quiet.module';
import { DiscordService } from './discord.service';
import * as Listeners from './listeners';
import { DiscordOptions } from './types/options.type';
import { DISCORD_CLIENT, DISCORD_OPTIONS } from './types/tokens.type';

@Global()
@Module({})
export class DiscordModule {
  static forRootAsync(): DynamicModule {
    return {
      module: DiscordModule,
      imports: [
        TypeOrmModule.forFeature([Guild]),
        forwardRef(() => QuietModule),
      ],
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
        GuildsRepository,

        Listeners.ChannelListener,
        Listeners.ClientListener,
        Listeners.GuildListener,
        Listeners.VoiceListener,
      ],
      exports: [DISCORD_CLIENT, DiscordService],
    };
  }
}
