import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { GitHubOAuthClient } from './github-oauth.client';
import type { UserRepository } from './user.repository';

describe('AuthService', () => {
  const exchangeCode = jest.fn(() => Promise.resolve('github-token'));
  const upsertGitHubUser = jest.fn(() => Promise.resolve({ id: 'user-1' }));
  const github: GitHubOAuthClient = {
    getAuthorizationUrl: jest.fn(
      (state: string) => `https://github.test?state=${state}`,
    ),
    exchangeCode,
    getViewer: jest.fn(() =>
      Promise.resolve({
        githubId: 1,
        githubLogin: 'octocat',
        displayName: 'Octo Cat',
        avatarUrl: null,
      }),
    ),
  };
  const users: UserRepository = {
    upsertGitHubUser,
  };
  const states = {
    create: jest.fn(() => 'valid-state'),
    consume: jest.fn((state: string) => state === 'valid-state'),
  };
  const sessions = {
    create: jest.fn(() =>
      Promise.resolve({
        sessionId: 'browser-session',
        expiresAt: new Date('2026-07-14T00:00:00.000Z'),
      }),
    ),
    resolve: jest.fn(),
    revoke: jest.fn(),
  };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(github, users, states, sessions);
  });

  it('creates a GitHub authorization URL with one-time state', () => {
    expect(service.start()).toEqual({
      authorizationUrl: 'https://github.test?state=valid-state',
    });
  });

  it('rejects a callback with an unknown state', async () => {
    await expect(service.callback('code', 'forged')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(exchangeCode).not.toHaveBeenCalled();
  });

  it('creates a server session without returning the GitHub token', async () => {
    const result = await service.callback('code', 'valid-state');

    expect(upsertGitHubUser).toHaveBeenCalledWith({
      githubId: 1,
      githubLogin: 'octocat',
      displayName: 'Octo Cat',
      avatarUrl: null,
    });
    expect(sessions.create).toHaveBeenCalledWith('user-1', 'github-token');
    expect(result).toEqual({
      sessionId: 'browser-session',
      expiresAt: new Date('2026-07-14T00:00:00.000Z'),
    });
    expect(JSON.stringify(result)).not.toContain('github-token');
  });
});
