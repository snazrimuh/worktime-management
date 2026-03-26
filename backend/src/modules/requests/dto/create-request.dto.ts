import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsObject,
} from 'class-validator';

export enum RequestTypeDto {
  CHANGE = 'CHANGE',
  SWAP = 'SWAP',
}

export class CreateRequestDto {
  @IsEnum(RequestTypeDto)
  @IsNotEmpty()
  type: RequestTypeDto;

  @IsOptional()
  @IsString()
  targetUserId?: string;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsObject()
  details?: any; // E.g., target schedule ID
}
