import { ArrayUnique, IsArray, IsEnum } from 'class-validator';
import { PermissionKey } from '@prisma/client';

export class UpdateStaffPermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsEnum(PermissionKey, { each: true })
  permissions!: PermissionKey[];
}
