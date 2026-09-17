import { ArrayMinSize, IsArray, IsBoolean, IsDateString, IsInt, IsOptional, IsString, Min, MaxLength, MinLength } from 'class-validator';

export class UpdateShowDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  ticketPrice?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  artistNames?: string[];

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
