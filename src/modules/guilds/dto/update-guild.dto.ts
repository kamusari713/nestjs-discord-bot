import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsTimeZone,
  Max,
  Min,
} from 'class-validator';
import { Policy } from '../types/policy.type';

export class UpdateGuildDto {
  @IsOptional()
  @IsTimeZone()
  timezone?: string;

  @IsOptional()
  @Min(0)
  @Max(23)
  @IsNumber()
  startHour?: number;

  @IsOptional()
  @Min(0)
  @Max(59)
  @IsNumber()
  startMinute?: number;

  @IsOptional()
  @Min(0)
  @Max(23)
  @IsNumber()
  endHour?: number;

  @IsOptional()
  @Min(0)
  @Max(59)
  @IsNumber()
  endMinute?: number;

  @IsOptional()
  @IsEnum(Policy)
  policy?: Policy;
}

export class UpdatePolicyDto {
  @IsEnum(Policy)
  policy: Policy;
}
