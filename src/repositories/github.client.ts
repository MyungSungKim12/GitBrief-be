import {
  HttpException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

export abstract class GitHubClient {
  abstract get<T>(
    path: string,
    accessToken: string,
    query?: Record<string, string>,
  ): Promise<T>;
}

@Injectable()
export class FetchGitHubClient extends GitHubClient {
  async get<T>(
    path: string,
    accessToken: string,
    query: Record<string, string> = {},
  ) {
    const url = new URL(path, 'https://api.github.com');
    for (const [key, value] of Object.entries(query)) {
      if (value) url.searchParams.set(key, value);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${accessToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new ServiceUnavailableException('GitHub API request timed out');
    }

    if (!response.ok) {
      const rateLimited =
        response.status === 403 &&
        response.headers.get('x-ratelimit-remaining') === '0';
      throw new HttpException(
        rateLimited
          ? 'GitHub API rate limit exceeded'
          : 'GitHub API request failed',
        rateLimited ? 429 : response.status,
      );
    }
    return (await response.json()) as T;
  }
}
