import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';
import { normalizeDiff } from './diff-normalizer';

describe('normalizeDiff', () => {
  it('rejects compare results without textual patches', () => {
    expect(() =>
      normalizeDiff([
        {
          filename: 'image.png',
          status: 'modified',
          additions: 0,
          deletions: 0,
          patch: null,
        },
      ]),
    ).toThrow(BadRequestException);
  });

  it('formats textual files and excludes binary files', () => {
    expect(
      normalizeDiff([
        {
          filename: 'src/app.ts',
          status: 'modified',
          additions: 2,
          deletions: 1,
          patch: '@@\n-code\n+new',
        },
        {
          filename: 'image.png',
          status: 'modified',
          additions: 0,
          deletions: 0,
          patch: null,
        },
      ]),
    ).toContain('### src/app.ts (modified, +2/-1)\n@@\n-code\n+new');
  });

  it('rejects diffs beyond the configured character limit', () => {
    expect(() =>
      normalizeDiff(
        [
          {
            filename: 'large.ts',
            status: 'modified',
            additions: 1,
            deletions: 0,
            patch: 'x'.repeat(101),
          },
        ],
        100,
      ),
    ).toThrow(PayloadTooLargeException);
  });
});
