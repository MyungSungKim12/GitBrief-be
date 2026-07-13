import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';

@Injectable()
export class OAuthStateService {
  private readonly states = new Map<string, number>();
  private readonly ttlMilliseconds = 600_000;

  create() {
    this.removeExpired();
    const state = randomBytes(24).toString('base64url');
    this.states.set(state, Date.now() + this.ttlMilliseconds);
    return state;
  }

  consume(state: string) {
    const expiresAt = this.states.get(state);
    this.states.delete(state);
    return expiresAt !== undefined && expiresAt > Date.now();
  }

  private removeExpired() {
    const now = Date.now();
    for (const [state, expiresAt] of this.states)
      if (expiresAt <= now) this.states.delete(state);
  }
}
