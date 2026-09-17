import { Module } from '@nestjs/common';
import { TenantsModule } from '../tenants/tenants.module';
import { MyReservationsController } from './my-reservations.controller';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  imports: [TenantsModule],
  controllers: [ReservationsController, MyReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}
