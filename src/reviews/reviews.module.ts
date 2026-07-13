import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { SessionsModule } from '../sessions/sessions.module';
import { SummariesModule } from '../summaries/summaries.module';
import {
  SupabaseReviewRepository,
  ReviewRepository,
} from './review.repository';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [CommonModule, SessionsModule, SummariesModule],
  providers: [
    ReviewsService,
    SupabaseReviewRepository,
    { provide: ReviewRepository, useExisting: SupabaseReviewRepository },
  ],
  controllers: [ReviewsController],
})
export class ReviewsModule {}
