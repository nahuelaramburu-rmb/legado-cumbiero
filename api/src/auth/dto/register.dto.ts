import { IsBoolean, IsDateString, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Auto-registro público: siempre crea un CUSTOMER (el staff se crea desde el panel del tenant). */
export class RegisterDto {
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
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(6)
  phoneAreaCode!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(15)
  phoneNumber!: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  provinceId?: string;

  @IsOptional()
  @IsString()
  cityId?: string;

  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;
}
