import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { SessionsModule } from '../sessions/sessions.module';
import { GeminiSummaryGenerator, SummaryGenerator } from './summary.generator';
import {
  SupabaseSummaryRepository,
  SummaryRepository,
} from './summary.repository';
import { SummariesController } from './summaries.controller';
import { SummariesService } from './summaries.service';

@Module({
  imports: [CommonModule, RepositoriesModule, SessionsModule],
  providers: [
    SummariesService,
    GeminiSummaryGenerator,
    { provide: SummaryGenerator, useExisting: GeminiSummaryGenerator },
    SupabaseSummaryRepository,
    { provide: SummaryRepository, useExisting: SupabaseSummaryRepository },
  ],
  controllers: [SummariesController],
})
export class SummariesModule {}
