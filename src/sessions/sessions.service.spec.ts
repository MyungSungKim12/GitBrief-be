import { createHash } from 'node:crypto';
import { SessionsService } from './sessions.service';
import type {
  NewSessionRecord,
  SessionRecord,
  SessionRepository,
} from './session.repository';

class MemorySessionRepository implements SessionRepository {
  inserted?: NewSessionRecord;
  record: SessionRecord | null = null;
  revokedHash?: string;

  insert(session: NewSessionRecord) {
    this.inserted = session;
    return Promise.resolve();
  }

  findActiveByHash(sessionHash: string) {
    if (this.record?.sessionHash !== sessionHash) return Promise.resolve(null);
    return Promise.resolve(this.record);
  }

  touch() {
    return Promise.resolve();
  }

  revoke(sessionHash: string) {
    this.revokedHash = sessionHash;
    return Promise.resolve();
  }
}

describe('SessionsService', () => {
  const now = new Date('2026-07-13T00:00:00.000Z');
  let repository: MemorySessionRepository;
  let service: SessionsService;

  beforeEach(() => {
    repository = new MemorySessionRepository();
    service = new SessionsService(repository, 3600, () => now);
  });

  it('stores only a SHA-256 session hash', async () => {
    const created = await service.create('user-1', 'github-token');
    const expectedHash = createHash('sha256')
      .update(created.sessionId)
      .digest('hex');

    expect(repository.inserted).toMatchObject({
      userId: 'user-1',
      githubToken: 'github-token',
      sessionHash: expectedHash,
      expiresAt: new Date('2026-07-13T01:00:00.000Z'),
    });
    expect(JSON.stringify(repository.inserted)).not.toContain(
      created.sessionId,
    );
  });

  it('resolves an active session and updates last use', async () => {
    const sessionId = 'session-id';
    repository.record = {
      id: 'db-session',
      sessionHash: createHash('sha256').update(sessionId).digest('hex'),
      userId: 'user-1',
      githubToken: 'token',
      expiresAt: new Date('2026-07-13T01:00:00.000Z'),
      user: { id: 'user-1', githubLogin: 'octocat', avatarUrl: null },
    };
    const touch = jest.spyOn(repository, 'touch');

    await expect(service.resolve(sessionId)).resolves.toMatchObject({
      id: 'user-1',
      githubLogin: 'octocat',
      githubToken: 'token',
    });
    expect(touch).toHaveBeenCalledWith('db-session', now);
  });

  it('rejects an expired session', async () => {
    const sessionId = 'expired';
    repository.record = {
      id: 'db-session',
      sessionHash: createHash('sha256').update(sessionId).digest('hex'),
      userId: 'user-1',
      githubToken: 'token',
      expiresAt: new Date('2026-07-12T23:59:59.000Z'),
      user: { id: 'user-1', githubLogin: 'octocat', avatarUrl: null },
    };

    await expect(service.resolve(sessionId)).resolves.toBeNull();
  });

  it('revokes a session by hash', async () => {
    await service.revoke('session-id');
    expect(repository.revokedHash).toBe(
      createHash('sha256').update('session-id').digest('hex'),
    );
  });
});
