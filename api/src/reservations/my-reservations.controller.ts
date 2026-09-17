import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/auth-user.type';
import { ReservationsService } from './reservations.service';

@ApiTags('reservations')
@Controller('reservations')
export class MyReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /** Reservas del usuario logueado, en todos los boliches. */
  @Get('me')
  listMine(@CurrentUser() user: AuthUser) {
    return this.reservationsService.listByUser(user.id);
  }
}
