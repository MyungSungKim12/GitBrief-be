import { Inject, Injectable } from '@nestjs/common';
import {
  SUPABASE_CLIENT,
  type SupabaseAccessor,
} from '../common/supabase.provider';
import type { GitHubViewer } from './github-oauth.client';

export abstract class UserRepository {
  abstract upsertGitHubUser(user: GitHubViewer): Promise<{ id: string }>;
}

@Injectable()
export class SupabaseUserRepository extends UserRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseAccessor,
  ) {
    super();
  }

  async upsertGitHubUser(user: GitHubViewer) {
    const { data, error } = await this.supabase
      .getClient()
      .from('users')
      .upsert(
        {
          github_id: user.githubId,
          github_login: user.githubLogin,
          display_name: user.displayName,
          avatar_url: user.avatarUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'github_id' },
      )
      .select('id')
      .single();
    if (error) throw error;
    return { id: data.id as string };
  }
}
