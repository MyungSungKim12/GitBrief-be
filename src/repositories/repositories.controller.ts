import { Controller, Get, Query } from '@nestjs/common';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Get()
  list(@Query('accessToken') accessToken: string) {
    return this.repositoriesService.listRepositories(accessToken);
  }

  @Get('diff')
  diff(
    @Query('owner') owner: string,
    @Query('repo') repo: string,
    @Query('base') base: string,
    @Query('head') head: string,
  ) {
    return this.repositoriesService.getBranchDiff(owner, repo, base, head);
  }
}
