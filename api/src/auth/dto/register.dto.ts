import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

/** Auto-registro público: siempre crea un CUSTOMER (el staff se crea desde el panel del tenant). */
export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72)
  password!: string;
}
