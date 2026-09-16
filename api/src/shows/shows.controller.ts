import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ShowsService } from './shows.service';

@ApiTags('shows')
@Public()
@Controller('shows')
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  @Get('upcoming')
  listUpcoming(@Query('limit') limit?: string, @Query('tenantSlug') tenantSlug?: string) {
    return this.showsService.listUpcoming({
      limit: limit ? Number(limit) : undefined,
      tenantSlug,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showsService.findByIdOrThrow(id);
  }
}
