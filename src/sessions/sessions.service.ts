import { createHash, randomBytes } from 'node:crypto';
import { SessionRepository } from './session.repository';
import type { AuthenticatedUser } from './session.types';

export class SessionsService {
  constructor(
    private readonly repository: SessionRepository,
    private readonly ttlSeconds: number,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async create(userId: string, githubToken: string) {
    const sessionId = randomBytes(32).toString('base64url');
    const expiresAt = new Date(this.now().getTime() + this.ttlSeconds * 1000);

    await this.repository.insert({
      sessionHash: this.hash(sessionId),
      userId,
      githubToken,
      expiresAt,
    });

    return { sessionId, expiresAt };
  }

  async resolve(sessionId: string): Promise<AuthenticatedUser | null> {
    const record = await this.repository.findActiveByHash(this.hash(sessionId));
    const now = this.now();
    if (!record || record.expiresAt <= now) return null;

    await this.repository.touch(record.id, now);
    return {
      id: record.user.id,
      githubLogin: record.user.githubLogin,
      avatarUrl: record.user.avatarUrl,
      githubToken: record.githubToken,
    };
  }

  async revoke(sessionId: string) {
    await this.repository.revoke(this.hash(sessionId));
  }

  private hash(sessionId: string) {
    return createHash('sha256').update(sessionId).digest('hex');
  }
}
