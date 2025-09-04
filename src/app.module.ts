import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { DiscordModule } from './modules/discord/discord.module';
import { GuildsModule } from './modules/guilds/guilds.module';
import { QuietModule } from './modules/quiet/quiet.module';
import { SnapshotsModule } from './modules/snapshots/snapshots.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ScheduleModule.forRoot(),
    AdminModule,
    AuthModule,
    DiscordModule.forRootAsync(),
    GuildsModule,
    QuietModule,
    SnapshotsModule,
  ],
  controllers: [],
})
export class AppModule {}
