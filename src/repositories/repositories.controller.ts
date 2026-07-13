import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../sessions/current-user.decorator';
import { SessionGuard } from '../sessions/session.guard';
import type { AuthenticatedUser } from '../sessions/session.types';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
@UseGuards(SessionGuard)
export class RepositoriesController {
  constructor(private readonly repositories: RepositoriesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.repositories.listRepositories(user.githubToken);
  }

  @Get('activity')
  activity(@CurrentUser() user: AuthenticatedUser) {
    return this.repositories.listActivity(user.githubToken, user.githubLogin);
  }

  @Get(':owner/:repo/branches')
  branches(
    @CurrentUser() user: AuthenticatedUser,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositories.listBranches(user.githubToken, owner, repo);
  }

  @Get(':owner/:repo/pulls')
  pulls(
    @CurrentUser() user: AuthenticatedUser,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.repositories.listPulls(user.githubToken, owner, repo);
  }

  @Get(':owner/:repo/diff')
  diff(
    @CurrentUser() user: AuthenticatedUser,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('base') base: string,
    @Query('head') head: string,
  ) {
    return this.repositories.getBranchDiff(
      user.githubToken,
      owner,
      repo,
      base,
      head,
    );
  }
}
