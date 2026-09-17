import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTenantAdminDto {
  @IsString()
  tenantSlug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
