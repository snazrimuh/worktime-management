import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';

export enum ScheduleTypeDto {
  FIXED = 'FIXED',
  FLEXI = 'FLEXI',
  SHIFT = 'SHIFT',
}

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ScheduleTypeDto)
  type: ScheduleTypeDto;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
  endTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  minHours?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  gracePeriodMinutes?: number;

  @IsOptional()
  @IsNotEmpty()
  isActive?: boolean;
}
