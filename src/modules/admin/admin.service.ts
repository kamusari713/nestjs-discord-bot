import { BadRequestException, Injectable } from '@nestjs/common';
import { GuildsRepository } from '../guilds/guilds.repository';
import { ControlOption } from '../guilds/types/control-option.type';
import { QuietEnforceService } from '../quiet/quiet-enforce.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly quietEnforceService: QuietEnforceService,
    private readonly guildsRepository: GuildsRepository,
  ) {}

  async manualQuiet(id: string, option: ControlOption) {
    const guild = await this.guildsRepository.findByIdOrThrow(id);

    if (guild.revoked) {
      throw new BadRequestException(
        `Guild "${guild.name}" (id: ${guild.id}) is revoked`,
      );
    }

    if (!guild.enabled) {
      throw new BadRequestException(
        `Guild "${guild.name}" (id: ${guild.id}) quiet feature is disabled`,
      );
    }

    if (option === ControlOption.STOP) {
      await this.guildsRepository.updateActivity(id, false);
      await this.quietEnforceService.exitQuiet(guild);
    } else if (option === ControlOption.START) {
      await this.guildsRepository.updateActivity(id, true);
      await this.quietEnforceService.enterQuiet(guild);
    }
  }
}
