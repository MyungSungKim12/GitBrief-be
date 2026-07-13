import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CommitMessageDto {
  @IsString() @IsNotEmpty() @MaxLength(500) message: string;
}

export class CodeSmellDto {
  @IsString() @IsNotEmpty() @MaxLength(120000) diff: string;
}
