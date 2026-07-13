import { Inject, Injectable } from '@nestjs/common';
import {
  SUPABASE_CLIENT,
  type SupabaseAccessor,
} from '../common/supabase.provider';
import type { SummaryPayload } from './summary-payload';

export type NewSummary = SummaryPayload & {
  userId: string;
  repositoryFullName: string;
  base: string;
  head: string;
  diffHash: string;
  model: string;
};

export type SummaryRecord = SummaryPayload & {
  id: string;
  repositoryFullName: string;
  base: string;
  head: string;
  model: string;
  status: string;
  createdAt: string;
};

export abstract class SummaryRepository {
  abstract create(summary: NewSummary): Promise<SummaryRecord | { id: string }>;
  abstract listByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: SummaryRecord[]; total: number }>;
  abstract findByUser(
    userId: string,
    id: string,
  ): Promise<SummaryRecord | null>;
  abstract removeByUser(userId: string, id: string): Promise<boolean>;
}

type SummaryRow = {
  id: string;
  repository_full_name: string;
  base_ref: string;
  head_ref: string;
  purpose: string;
  key_changes: string[];
  review_notes: string[];
  code_smells: SummaryPayload['codeSmells'];
  model: string;
  status: string;
  created_at: string;
};

function mapRow(row: SummaryRow): SummaryRecord {
  return {
    id: row.id,
    repositoryFullName: row.repository_full_name,
    base: row.base_ref,
    head: row.head_ref,
    purpose: row.purpose,
    keyChanges: row.key_changes,
    reviewNotes: row.review_notes,
    codeSmells: row.code_smells,
    model: row.model,
    status: row.status,
    createdAt: row.created_at,
  };
}

@Injectable()
export class SupabaseSummaryRepository extends SummaryRepository {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseAccessor,
  ) {
    super();
  }

  async create(summary: NewSummary) {
    // Supabase returns `any` until generated database types are supplied.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = await this.supabase
      .getClient()
      .from('summaries')
      .insert({
        user_id: summary.userId,
        repository_full_name: summary.repositoryFullName,
        base_ref: summary.base,
        head_ref: summary.head,
        diff_hash: summary.diffHash,
        purpose: summary.purpose,
        key_changes: summary.keyChanges,
        review_notes: summary.reviewNotes,
        code_smells: summary.codeSmells,
        model: summary.model,
        status: 'completed',
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapRow(data as SummaryRow);
  }

  async listByUser(userId: string, page: number, limit: number) {
    const from = (page - 1) * limit;
    const { data, error, count } = await this.supabase
      .getClient()
      .from('summaries')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw error;
    return { items: (data as SummaryRow[]).map(mapRow), total: count ?? 0 };
  }

  async findByUser(userId: string, id: string) {
    // Supabase returns `any` until generated database types are supplied.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = await this.supabase
      .getClient()
      .from('summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapRow(data as SummaryRow) : null;
  }

  async removeByUser(userId: string, id: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('summaries')
      .delete()
      .eq('user_id', userId)
      .eq('id', id)
      .select('id');
    if (error) throw error;
    return data.length > 0;
  }
}
