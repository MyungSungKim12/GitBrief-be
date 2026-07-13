import { RepositoriesService } from './repositories.service';
import type { GitHubClient } from './github.client';

describe('RepositoriesService', () => {
  const get = jest.fn();
  const github: GitHubClient = { get };
  const service = new RepositoriesService(github);

  beforeEach(() => jest.clearAllMocks());

  it('maps the authenticated user repositories', async () => {
    get.mockResolvedValueOnce([
      {
        id: 10,
        name: 'gitbrief',
        full_name: 'octocat/gitbrief',
        private: true,
        default_branch: 'main',
        owner: { login: 'octocat' },
      },
    ]);

    await expect(service.listRepositories('token')).resolves.toEqual([
      {
        id: 10,
        name: 'gitbrief',
        fullName: 'octocat/gitbrief',
        owner: 'octocat',
        isPrivate: true,
        defaultBranch: 'main',
      },
    ]);
    expect(get).toHaveBeenCalledWith('/user/repos', 'token', {
      affiliation: 'owner,collaborator,organization_member',
      per_page: '100',
      sort: 'updated',
    });
  });

  it('returns compare metadata and textual patches', async () => {
    get.mockResolvedValueOnce({
      status: 'ahead',
      ahead_by: 2,
      behind_by: 0,
      total_commits: 2,
      files: [
        {
          filename: 'src/a.ts',
          status: 'modified',
          additions: 3,
          deletions: 1,
          patch: '@@ diff',
        },
        {
          filename: 'image.png',
          status: 'modified',
          additions: 0,
          deletions: 0,
        },
      ],
    });

    await expect(
      service.getBranchDiff('token', 'octocat', 'gitbrief', 'main', 'feature'),
    ).resolves.toEqual({
      status: 'ahead',
      aheadBy: 2,
      behindBy: 0,
      totalCommits: 2,
      files: [
        {
          filename: 'src/a.ts',
          status: 'modified',
          additions: 3,
          deletions: 1,
          patch: '@@ diff',
        },
        {
          filename: 'image.png',
          status: 'modified',
          additions: 0,
          deletions: 0,
          patch: null,
        },
      ],
    });
  });
});
