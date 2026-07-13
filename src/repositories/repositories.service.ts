import { Injectable } from '@nestjs/common';
import { GitHubClient } from './github.client';

type RepositoryRow = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  owner: { login: string };
};
type BranchRow = { name: string; protected: boolean; commit: { sha: string } };
type PullRow = {
  number: number;
  title: string;
  state: string;
  html_url: string;
  updated_at: string;
  user: { login: string };
  base: { ref: string };
  head: { ref: string };
};
type EventRow = {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: { action?: string };
};
type CompareRow = {
  status: string;
  ahead_by: number;
  behind_by: number;
  total_commits: number;
  files?: Array<{
    filename: string;
    status: string;
    additions: number;
    deletions: number;
    patch?: string;
  }>;
};

@Injectable()
export class RepositoriesService {
  constructor(private readonly github: GitHubClient) {}

  async listRepositories(accessToken: string) {
    const rows = await this.github.get<RepositoryRow[]>(
      '/user/repos',
      accessToken,
      {
        affiliation: 'owner,collaborator,organization_member',
        per_page: '100',
        sort: 'updated',
      },
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      fullName: row.full_name,
      owner: row.owner.login,
      isPrivate: row.private,
      defaultBranch: row.default_branch,
    }));
  }

  async listBranches(accessToken: string, owner: string, repo: string) {
    const rows = await this.github.get<BranchRow[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches`,
      accessToken,
      { per_page: '100' },
    );
    return rows.map((row) => ({
      name: row.name,
      protected: row.protected,
      sha: row.commit.sha,
    }));
  }

  async listPulls(accessToken: string, owner: string, repo: string) {
    const rows = await this.github.get<PullRow[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`,
      accessToken,
      { state: 'all', per_page: '30', sort: 'updated' },
    );
    return rows.map((row) => ({
      number: row.number,
      title: row.title,
      state: row.state,
      url: row.html_url,
      author: row.user.login,
      base: row.base.ref,
      head: row.head.ref,
      updatedAt: row.updated_at,
    }));
  }

  async listActivity(accessToken: string, githubLogin: string) {
    const rows = await this.github.get<EventRow[]>(
      `/users/${encodeURIComponent(githubLogin)}/events`,
      accessToken,
      { per_page: '30' },
    );
    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      repository: row.repo.name,
      action: row.payload.action ?? null,
      createdAt: row.created_at,
    }));
  }

  async getBranchDiff(
    accessToken: string,
    owner: string,
    repo: string,
    base: string,
    head: string,
  ) {
    const row = await this.github.get<CompareRow>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`,
      accessToken,
    );
    return {
      status: row.status,
      aheadBy: row.ahead_by,
      behindBy: row.behind_by,
      totalCommits: row.total_commits,
      files: (row.files ?? []).map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        patch: file.patch ?? null,
      })),
    };
  }
}
