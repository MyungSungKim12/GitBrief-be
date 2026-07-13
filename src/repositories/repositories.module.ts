import { Module } from '@nestjs/common';
import { SessionsModule } from '../sessions/sessions.module';
import { FetchGitHubClient, GitHubClient } from './github.client';
import { RepositoriesController } from './repositories.controller';
import { RepositoriesService } from './repositories.service';

@Module({
  imports: [SessionsModule],
  providers: [
    RepositoriesService,
    FetchGitHubClient,
    { provide: GitHubClient, useExisting: FetchGitHubClient },
  ],
  controllers: [RepositoriesController],
  exports: [RepositoriesService, GitHubClient],
})
export class RepositoriesModule {}
