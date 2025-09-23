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
import { UpdateGuildDto } from './dto/update-guild.dto';
import { GuildsRepository } from './guilds.repository';

@UseGuards(AuthGuard)
@Controller('guilds')
export class GuildsController {
  constructor(private readonly guildsRepository: GuildsRepository) {}

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
}
