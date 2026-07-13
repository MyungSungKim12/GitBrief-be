import { Injectable } from '@nestjs/common';
import { SummaryGenerator } from '../summaries/summary.generator';
import { checkConventionalCommit } from './conventional-commit';
import { ReviewRepository } from './review.repository';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly repository: ReviewRepository,
    private readonly generator: SummaryGenerator,
  ) {}

  async checkCommitConvention(userId: string, message: string) {
    const result = checkConventionalCommit(message);
    await this.repository.create({
      ...result,
      userId,
      originalMessage: message,
    });
    return result;
  }

  async analyzeCodeSmells(diff: string) {
    const result = await this.generator.generate(diff);
    return result.codeSmells;
  }
}
