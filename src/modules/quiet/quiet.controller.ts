import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ControlOption } from '../guilds/types/control-option.type';
import { QuietEnforceService } from './quiet-enforce.service';

@UseGuards(AuthGuard)
@Controller('quiet')
export class QuietController {
  constructor(private readonly quietEnforceService: QuietEnforceService) {}

  @Post(':id/quiet/start')
  async startQuiet(@Param('id') id: string): Promise<void> {
    await this.quietEnforceService.manualQuiet(id, ControlOption.START);
  }

  @Post(':id/quiet/stop')
  async stopQuiet(@Param('id') id: string): Promise<void> {
    await this.quietEnforceService.manualQuiet(id, ControlOption.STOP);
  }
}
