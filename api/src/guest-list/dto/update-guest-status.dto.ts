import { IsEnum } from 'class-validator';
import { GuestStatus } from '@prisma/client';

export class UpdateGuestStatusDto {
  @IsEnum(GuestStatus)
  status!: GuestStatus;
}
