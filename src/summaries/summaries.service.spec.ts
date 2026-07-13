import { NotFoundException } from '@nestjs/common';
import { SummariesService } from './summaries.service';

describe('SummariesService', () => {
  const repositories = {
    getBranchDiff: jest.fn(),
  };
  const generator = {
    model: 'gemini-3.5-flash',
    generate: jest.fn(),
  };
  const history = {
    create: jest.fn(),
    listByUser: jest.fn(),
    findByUser: jest.fn(),
    removeByUser: jest.fn(),
  };
  const service = new SummariesService(
    repositories as never,
    generator,
    history,
  );

  beforeEach(() => jest.clearAllMocks());

  it('compares branches, generates a summary, and persists it', async () => {
    repositories.getBranchDiff.mockResolvedValueOnce({
      files: [
        {
          filename: 'src/a.ts',
          status: 'modified',
          additions: 1,
          deletions: 0,
          patch: '+code',
        },
      ],
    });
    generator.generate.mockResolvedValueOnce({
      purpose: '기능 추가',
      keyChanges: ['코드 추가'],
      reviewNotes: [],
      codeSmells: [],
    });
    history.create.mockResolvedValueOnce({ id: 'summary-1' });

    await expect(
      service.create(
        {
          id: 'user-1',
          githubLogin: 'octocat',
          avatarUrl: null,
          githubToken: 'token',
        },
        { owner: 'octocat', repo: 'gitbrief', base: 'main', head: 'feature' },
      ),
    ).resolves.toEqual({ id: 'summary-1' });
    expect(generator.generate).toHaveBeenCalledWith(
      expect.stringContaining('src/a.ts'),
    );
    expect(history.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        repositoryFullName: 'octocat/gitbrief',
      }),
    );
  });

  it('does not return another user summary', async () => {
    history.findByUser.mockResolvedValueOnce(null);
    await expect(service.findOne('user-1', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
