import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { DateTime } from 'luxon';
import { Guild } from '../guilds/entities/guild.entity';
import { GuildsRepository } from '../guilds/guilds.repository';
import { QuietEnforceService } from './quiet-enforce.service';

@Injectable()
export class QuietSchedulerSerivce implements OnApplicationShutdown {
  constructor(
    private readonly guildsRepository: GuildsRepository,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly sleepEnforceService: QuietEnforceService,
  ) {}

  private readonly logger = new Logger(QuietSchedulerSerivce.name, {
    timestamp: true,
  });

  async onApplicationShutdown(): Promise<void> {
    const jobs = this.schedulerRegistry.getCronJobs().keys();
    for (const name of jobs) {
      await this.safeDelete(name);
    }
  }

  async scheduleForGuild(guildEntity: Guild): Promise<void> {
    this.registerCronJobs(guildEntity);

    this.logger.log(
      `Scheduled for "${guildEntity.name}" (id: ${guildEntity.id}) job: (tz=${guildEntity.timezone} start=${String(guildEntity.startHour).padStart(2, '0')}:${String(guildEntity.startMinute).padStart(2, '0')} end=${String(guildEntity.endHour).padStart(2, '0')}:${String(guildEntity.endMinute).padStart(2, '0')})`,
    );

    await this.reconcileNow(guildEntity);
  }

  async cancelForGuild(guildEntity: Guild): Promise<void> {
    await this.safeDelete(this.startKey(guildEntity.id));
    await this.safeDelete(this.endKey(guildEntity.id));
    this.logger.log(
      `Canceled schedules for "${guildEntity.name}" (id: ${guildEntity.id})`,
    );
  }

  private registerCronJobs(guildEntity: Guild): void {
    const startKey = this.startKey(guildEntity.id);
    const endKey = this.endKey(guildEntity.id);

    const startCron = `0 ${guildEntity.startMinute} ${guildEntity.startHour} * * *`;
    const endCron = `0 ${guildEntity.endMinute} ${guildEntity.endHour} * * *`;

    const startJob = new CronJob(
      startCron,
      async () => this.handleStart(guildEntity),
      null,
      false,
      guildEntity.timezone,
    );

    const endJob = new CronJob(
      endCron,
      async () => this.handleEnd(guildEntity),
      null,
      false,
      guildEntity.timezone,
    );

    this.schedulerRegistry.addCronJob(startKey, startJob);
    this.schedulerRegistry.addCronJob(endKey, endJob);

    startJob.start();
    endJob.start();
  }

  private startKey(id: string): string {
    return `sleep:start:${id}`;
  }

  private endKey(id: string): string {
    return `sleep:end:${id}`;
  }

  private async safeDelete(name: string): Promise<void> {
    try {
      const job = this.schedulerRegistry.getCronJob(name);
      if (job) {
        await job?.stop();
        this.schedulerRegistry.deleteCronJob(name);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async handleStart(guildEntity: Guild): Promise<void> {
    await this.guildsRepository.updateActivity(guildEntity.id, true);
    await this.sleepEnforceService.enterQuiet(guildEntity);
  }

  private async handleEnd(guildEntity: Guild): Promise<void> {
    await this.guildsRepository.updateActivity(guildEntity.id, false);
    await this.sleepEnforceService.exitQuiet(guildEntity);
  }

  private isNowInWindow(guild: Guild): boolean {
    const nowZoned = DateTime.now().setZone(guild.timezone);

    const startZoned = nowZoned.set({
      hour: guild.startHour,
      minute: guild.startMinute,
    });

    const endZoned = nowZoned.set({
      hour: guild.endHour,
      minute: guild.endMinute,
    });

    if (
      startZoned.hour == endZoned.hour &&
      startZoned.minute == endZoned.minute
    )
      return false;

    if (startZoned <= endZoned) {
      return nowZoned >= startZoned && nowZoned < endZoned;
    } else {
      return nowZoned >= startZoned || nowZoned < endZoned;
    }
  }

  private async reconcileNow(guildEntity: Guild): Promise<void> {
    // if active and state still false make it true and enter quiet mode
    if (this.isNowInWindow(guildEntity)) {
      if (!guildEntity.active) {
        this.logger.log(
          `Reconcile ON for "${guildEntity.name}" (id: ${guildEntity.id})`,
        );
        await this.handleStart(guildEntity);
      }
      // else if now not in window and state still true make if false and exit queit
    } else {
      if (guildEntity.active) {
        this.logger.log(
          `Reconcile OFF for "${guildEntity.name}" (id: ${guildEntity.id})`,
        );
        await this.handleEnd(guildEntity);
      }
    }
  }
}
