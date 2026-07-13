import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateSummaryDto {
  @IsString() @IsNotEmpty() @Matches(/^[A-Za-z0-9_.-]+$/) owner: string;
  @IsString() @IsNotEmpty() @Matches(/^[A-Za-z0-9_.-]+$/) repo: string;
  @IsString() @IsNotEmpty() base: string;
  @IsString() @IsNotEmpty() head: string;
}
