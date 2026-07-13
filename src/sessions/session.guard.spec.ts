import { UnauthorizedException } from '@nestjs/common';
import { SessionGuard } from './session.guard';

describe('SessionGuard', () => {
  it('rejects requests without a session cookie', async () => {
    const guard = new SessionGuard(
      { resolve: jest.fn() } as never,
      { get: jest.fn(() => 'gitbrief_session') } as never,
    );
    const context = {
      switchToHttp: () => ({ getRequest: () => ({ cookies: {} }) }),
    } as never;

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('attaches the authenticated user to the request', async () => {
    const user = {
      id: 'user-1',
      githubLogin: 'octocat',
      avatarUrl: null,
      githubToken: 'secret',
    };
    const request = { cookies: { gitbrief_session: 'session-id' } } as Record<
      string,
      unknown
    >;
    const guard = new SessionGuard(
      { resolve: jest.fn(() => Promise.resolve(user)) } as never,
      { get: jest.fn(() => 'gitbrief_session') } as never,
    );
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as never;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual(user);
  });
});
