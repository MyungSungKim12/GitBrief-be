import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  const repository = { create: jest.fn() };
  const generator = { model: 'test', generate: jest.fn() };
  const service = new ReviewsService(repository, generator);

  beforeEach(() => jest.clearAllMocks());

  it('checks and stores a commit message for the current user', async () => {
    repository.create.mockResolvedValueOnce({ id: 'review-1' });
    await expect(
      service.checkCommitConvention('user-1', 'bad message'),
    ).resolves.toMatchObject({
      isValid: false,
      suggestion: 'chore: bad message',
    });
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        originalMessage: 'bad message',
      }),
    );
  });

  it('returns only code smells from AI review', async () => {
    generator.generate.mockResolvedValueOnce({
      purpose: 'x',
      keyChanges: [],
      reviewNotes: [],
      codeSmells: [{ file: 'a.ts', severity: 'high', message: '문제' }],
    });
    await expect(service.analyzeCodeSmells('diff')).resolves.toEqual([
      { file: 'a.ts', severity: 'high', message: '문제' },
    ]);
  });
});
