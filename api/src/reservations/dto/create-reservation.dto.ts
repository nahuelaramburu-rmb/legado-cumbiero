import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  customerName!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(30)
  customerPhone!: string;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity!: number;
}
