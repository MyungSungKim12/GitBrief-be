import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type GitHubViewer = {
  githubId: number;
  githubLogin: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export abstract class GitHubOAuthClient {
  abstract getAuthorizationUrl(state: string): string;
  abstract exchangeCode(code: string): Promise<string>;
  abstract getViewer(accessToken: string): Promise<GitHubViewer>;
}

@Injectable()
export class FetchGitHubOAuthClient extends GitHubOAuthClient {
  constructor(private readonly config: ConfigService) {
    super();
  }

  getAuthorizationUrl(state: string) {
    const query = new URLSearchParams({
      client_id: this.required('GITHUB_CLIENT_ID'),
      redirect_uri: this.required('GITHUB_CALLBACK_URL'),
      scope: 'read:user repo',
      state,
    });
    return `https://github.com/login/oauth/authorize?${query.toString()}`;
  }

  async exchangeCode(code: string) {
    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.required('GITHUB_CLIENT_ID'),
          client_secret: this.required('GITHUB_CLIENT_SECRET'),
          redirect_uri: this.required('GITHUB_CALLBACK_URL'),
          code,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    const body = (await response.json()) as {
      access_token?: string;
      error_description?: string;
    };
    if (!response.ok || !body.access_token)
      throw new UnauthorizedException(
        body.error_description ?? 'GitHub OAuth token exchange failed',
      );
    return body.access_token;
  }

  async getViewer(accessToken: string) {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok)
      throw new UnauthorizedException('GitHub user lookup failed');
    const body = (await response.json()) as {
      id: number;
      login: string;
      name: string | null;
      avatar_url: string | null;
    };
    return {
      githubId: body.id,
      githubLogin: body.login,
      displayName: body.name,
      avatarUrl: body.avatar_url,
    };
  }

  private required(name: string) {
    const value = this.config.get<string>(name);
    if (!value)
      throw new ServiceUnavailableException(`${name} is not configured`);
    return value;
  }
}
