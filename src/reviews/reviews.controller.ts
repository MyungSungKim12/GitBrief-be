import { Body, Controller, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('commit-message')
  checkCommitMessage(@Body('message') message: string) {
    return this.reviewsService.checkCommitConvention(message);
  }
}
