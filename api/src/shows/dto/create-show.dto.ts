import { ArrayMinSize, IsArray, IsDateString, IsInt, IsOptional, IsString, Min, MaxLength, MinLength } from 'class-validator';

export class CreateShowDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  ticketPrice?: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  artistNames!: string[];

  @IsOptional()
  @IsString()
  genre?: string;
}
