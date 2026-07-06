import { Module } from '@nestjs/common';
import { SummariesService } from './summaries.service';
import { SummariesController } from './summaries.controller';
import { GeminiProvider } from './gemini.provider';

@Module({
  providers: [SummariesService, GeminiProvider],
  controllers: [SummariesController],
})
export class SummariesModule {}
