import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { ShowsController } from './shows.controller';
import { ShowsService } from './shows.service';
import { TenantShowsController } from './tenant-shows.controller';

@Module({
  imports: [TenantsModule],
  controllers: [ShowsController, TenantShowsController],
  providers: [ShowsService],
  exports: [ShowsService],
})
export class ShowsModule {}
