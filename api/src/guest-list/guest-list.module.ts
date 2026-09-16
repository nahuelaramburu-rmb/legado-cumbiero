import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { GuestListController } from './guest-list.controller';
import { GuestListService } from './guest-list.service';

@Module({
  imports: [TenantsModule],
  controllers: [GuestListController],
  providers: [GuestListService],
})
export class GuestListModule {}
