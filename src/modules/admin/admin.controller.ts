import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateGuildDto } from '../guilds/dto/update-guild.dto';
import { GuildsRepository } from '../guilds/guilds.repository';
import { ControlOption } from '../guilds/types/control-option.type';
import { ChannelSnapshot } from '../snapshots/entities/channel-snapshot.entity';
import { SnapshotsService } from '../snapshots/snapshots.service';
import { AdminService } from './admin.service';

@UseGuards(AuthGuard)
@Controller('admin/guilds')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly snapshotsService: SnapshotsService,
    private readonly guildsRepository: GuildsRepository,
  ) {}

  @Get()
  getGuilds() {
    return this.guildsRepository.findAll();
  }

  @Post(':id/toggle')
  async toggleGuild(@Param('id') id: string): Promise<boolean> {
    return this.guildsRepository.toggleGuild(id);
  }

  @Post(':id/toggle/policy')
  async changePolicy(@Param('id') id: string): Promise<string> {
    return this.guildsRepository.togglePolicy(id);
  }

  @Put(':id')
  async updateGuild(
    @Param('id') id: string,
    @Body() updateGuildDto: UpdateGuildDto,
  ): Promise<void> {
    await this.guildsRepository.update(id, updateGuildDto);
  }

  @Get(':id/snapshots')
  async getSnapshots(@Param('id') id: string): Promise<ChannelSnapshot[]> {
    return this.snapshotsService.getSnapshotsById(id);
  }

  @Post(':id/quiet/start')
  async startQuiet(@Param('id') id: string): Promise<void> {
    await this.adminService.manualQuiet(id, ControlOption.START);
  }

  @Post(':id/quiet/stop')
  async stopQuiet(@Param('id') id: string): Promise<void> {
    await this.adminService.manualQuiet(id, ControlOption.STOP);
  }
}
