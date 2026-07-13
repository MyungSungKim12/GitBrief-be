import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../sessions/current-user.decorator';
import { SessionGuard } from '../sessions/session.guard';
import type { AuthenticatedUser } from '../sessions/session.types';
import { CodeSmellDto, CommitMessageDto } from './dto/review-input.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
@UseGuards(SessionGuard)
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}
  @Post('commit-message') checkCommitMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() input: CommitMessageDto,
  ) {
    return this.reviews.checkCommitConvention(user.id, input.message);
  }
  @Post('code-smells') codeSmells(@Body() input: CodeSmellDto) {
    return this.reviews.analyzeCodeSmells(input.diff);
  }
}
