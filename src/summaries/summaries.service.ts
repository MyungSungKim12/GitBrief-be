import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { RepositoriesService } from '../repositories/repositories.service';
import type { AuthenticatedUser } from '../sessions/session.types';
import type { CreateSummaryDto } from './dto/create-summary.dto';
import { normalizeDiff } from './diff-normalizer';
import { SummaryGenerator } from './summary.generator';
import { SummaryRepository } from './summary.repository';

@Injectable()
export class SummariesService {
  constructor(
    private readonly repositories: RepositoriesService,
    private readonly generator: SummaryGenerator,
    private readonly history: SummaryRepository,
  ) {}

  async create(user: AuthenticatedUser, input: CreateSummaryDto) {
    const compare = await this.repositories.getBranchDiff(
      user.githubToken,
      input.owner,
      input.repo,
      input.base,
      input.head,
    );
    const diff = normalizeDiff(compare.files);
    const payload = await this.generator.generate(diff);
    return this.history.create({
      ...payload,
      userId: user.id,
      repositoryFullName: `${input.owner}/${input.repo}`,
      base: input.base,
      head: input.head,
      diffHash: createHash('sha256').update(diff).digest('hex'),
      model: this.generator.model,
    });
  }

  list(userId: string, page = 1, limit = 20) {
    return this.history.listByUser(
      userId,
      Math.max(page, 1),
      Math.min(Math.max(limit, 1), 100),
    );
  }

  async findOne(userId: string, id: string) {
    const summary = await this.history.findByUser(userId, id);
    if (!summary) throw new NotFoundException('Summary not found');
    return summary;
  }

  async regenerate(user: AuthenticatedUser, id: string) {
    const previous = await this.findOne(user.id, id);
    const [owner, repo] = previous.repositoryFullName.split('/');
    return this.create(user, {
      owner,
      repo,
      base: previous.base,
      head: previous.head,
    });
  }

  async remove(userId: string, id: string) {
    if (!(await this.history.removeByUser(userId, id)))
      throw new NotFoundException('Summary not found');
  }
}
