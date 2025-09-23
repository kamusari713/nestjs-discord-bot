import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChannelSnapshot } from './entities/channel-snapshot.entity';
import { SnapshotsService } from './snapshots.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller('snapshots')
export class SnapshotsController {
  constructor(private readonly snapshotsService: SnapshotsService) {}

  @Get(':id/snapshots')
  async getSnapshots(@Param('id') id: string): Promise<ChannelSnapshot[]> {
    return this.snapshotsService.getSnapshotsById(id);
  }
}
