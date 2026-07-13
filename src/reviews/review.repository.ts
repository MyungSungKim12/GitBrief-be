import { Inject, Injectable } from '@nestjs/common';
import {
  SUPABASE_CLIENT,
  type SupabaseAccessor,
} from '../common/supabase.provider';
import type { ConventionResult } from './conventional-commit';

export type NewReviewResult = ConventionResult & {
  userId: string;
  originalMessage: string;
};
export abstract class ReviewRepository {
  abstract create(result: NewReviewResult): Promise<{ id: string }>;
}

@Injectable()
export class SupabaseReviewRepository extends ReviewRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseAccessor,
  ) {
    super();
  }
  async create(result: NewReviewResult) {
    const response = await this.supabase
      .getClient()
      .from('review_results')
      .insert({
        user_id: result.userId,
        original_message: result.originalMessage,
        is_valid: result.isValid,
        suggestion: result.suggestion,
        explanation: result.explanation,
      })
      .select('id')
      .single();
    if (response.error) throw response.error;
    return { id: response.data.id as string };
  }
}
