import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { GitHubOAuthClient } from './github-oauth.client';
import { OAuthStateService } from './oauth-state.service';
import { UserRepository } from './user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly github: GitHubOAuthClient,
    private readonly users: UserRepository,
    private readonly states: OAuthStateService,
    private readonly sessions: SessionsService,
  ) {}

  start() {
    const state = this.states.create();
    return { authorizationUrl: this.github.getAuthorizationUrl(state) };
  }

  async callback(code: string, state: string) {
    if (!code || !state || !this.states.consume(state))
      throw new UnauthorizedException('Invalid or expired OAuth state');
    const githubToken = await this.github.exchangeCode(code);
    const viewer = await this.github.getViewer(githubToken);
    const user = await this.users.upsertGitHubUser(viewer);
    return this.sessions.create(user.id, githubToken);
  }
}
