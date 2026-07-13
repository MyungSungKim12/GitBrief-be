import { Inject, Injectable } from '@nestjs/common';
import {
  SUPABASE_CLIENT,
  type SupabaseAccessor,
} from '../common/supabase.provider';

export type NewSessionRecord = {
  sessionHash: string;
  userId: string;
  githubToken: string;
  expiresAt: Date;
};

export type SessionRecord = NewSessionRecord & {
  id: string;
  user: {
    id: string;
    githubLogin: string;
    avatarUrl: string | null;
  };
};

export abstract class SessionRepository {
  abstract insert(session: NewSessionRecord): Promise<void>;
  abstract findActiveByHash(sessionHash: string): Promise<SessionRecord | null>;
  abstract touch(id: string, usedAt: Date): Promise<void>;
  abstract revoke(sessionHash: string): Promise<void>;
}

type SessionRow = {
  id: string;
  session_hash: string;
  user_id: string;
  github_access_token: string;
  expires_at: string;
  users: { id: string; github_login: string; avatar_url: string | null };
};

@Injectable()
export class SupabaseSessionRepository extends SessionRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseAccessor,
  ) {
    super();
  }

  async insert(session: NewSessionRecord) {
    const { error } = await this.supabase.getClient().from('sessions').insert({
      session_hash: session.sessionHash,
      user_id: session.userId,
      github_access_token: session.githubToken,
      expires_at: session.expiresAt.toISOString(),
    });
    if (error) throw error;
  }

  async findActiveByHash(sessionHash: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('sessions')
      .select(
        'id, session_hash, user_id, github_access_token, expires_at, users!inner(id, github_login, avatar_url)',
      )
      .eq('session_hash', sessionHash)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const row = data as unknown as SessionRow;
    return {
      id: row.id,
      sessionHash: row.session_hash,
      userId: row.user_id,
      githubToken: row.github_access_token,
      expiresAt: new Date(row.expires_at),
      user: {
        id: row.users.id,
        githubLogin: row.users.github_login,
        avatarUrl: row.users.avatar_url,
      },
    };
  }

  async touch(id: string, usedAt: Date) {
    const { error } = await this.supabase
      .getClient()
      .from('sessions')
      .update({ last_used_at: usedAt.toISOString() })
      .eq('id', id);
    if (error) throw error;
  }

  async revoke(sessionHash: string) {
    const { error } = await this.supabase
      .getClient()
      .from('sessions')
      .delete()
      .eq('session_hash', sessionHash);
    if (error) throw error;
  }
}
