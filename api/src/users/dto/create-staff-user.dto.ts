import { ArrayUnique, IsArray, IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { PermissionKey } from '@prisma/client';

export class CreateStaffUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsArray()
  @ArrayUnique()
  @IsEnum(PermissionKey, { each: true })
  permissions!: PermissionKey[];
}
