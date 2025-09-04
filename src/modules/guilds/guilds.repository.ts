import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGuildDto } from './dto/create-guild.dto';
import { UpdateGuildDto } from './dto/update-guild.dto';
import { Guild } from './entities/guild.entity';
import { Policy } from './types/policy.type';

@Injectable()
export class GuildsRepository {
  constructor(
    @InjectRepository(Guild)
    private readonly guildsRepository: Repository<Guild>,
  ) {}

  async findAll(): Promise<Guild[]> {
    const guilds = await this.guildsRepository.find();
    if (guilds) return guilds;
    throw new NotFoundException('No guilds provided');
  }

  async findAllActive(): Promise<Guild[]> {
    const guilds = await this.guildsRepository.find({
      where: { enabled: true, revoked: false },
    });
    if (guilds) return guilds;
    throw new NotFoundException('No active guilds provided');
  }

  async findByIdOrThrow(id: string): Promise<Guild> {
    const guild = await this.guildsRepository.findOneByOrFail({ id: id });
    return guild;
  }

  async findById(id: string): Promise<Guild | null> {
    const guild = await this.guildsRepository.findOneBy({ id: id });
    return guild;
  }

  async upsert(guild: CreateGuildDto): Promise<Guild | void> {
    const guildEntity = await this.findById(guild.id);

    if (guildEntity) {
      if (guildEntity.revoked) {
        await this.guildsRepository.update(
          { id: guild.id },
          { revoked: false },
        );
      }
      return guildEntity;
    }

    await this.guildsRepository.save({
      id: guild.id,
      name: guild.name,
      startHour: guild.startHour,
      startMinute: guild.startMinute,
      endHour: guild.endHour,
      endMinute: guild.endMinute,
      timezone: guild.timezone,
      enabled: guild.enabled,
      active: guild.active,
      policy: guild.policy,
    });
  }

  async update(id: string, updateGuildDto: UpdateGuildDto): Promise<void> {
    await this.guildsRepository.update({ id: id }, updateGuildDto);
  }

  async updateActivity(id: string, activity: boolean): Promise<void> {
    await this.guildsRepository.update({ id: id }, { active: activity });
  }

  async togglePolicy(id: string): Promise<string> {
    const guild = await this.findById(id);
    if (guild) {
      const newPolicy =
        guild.policy === Policy.MOVE ? Policy.STRICT : Policy.MOVE;
      await this.guildsRepository.update({ id: id }, { policy: newPolicy });

      return newPolicy;
    }
    throw new NotFoundException(`No guild with id: ${id} provided`);
  }

  async toggleGuild(id: string): Promise<boolean> {
    const guild = await this.findById(id);
    if (guild) {
      const newStatus = !guild.enabled;
      await this.guildsRepository.update({ id: id }, { enabled: newStatus });

      return newStatus;
    }
    throw new NotFoundException(`No guild with id: ${id} provided`);
  }

  async revokeById(id: string): Promise<void> {
    await this.guildsRepository.update({ id: id }, { revoked: true });
  }
}
