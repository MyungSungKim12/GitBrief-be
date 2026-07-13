import { BadRequestException, PayloadTooLargeException } from '@nestjs/common';

export type DiffFile = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  patch: string | null;
};

export function normalizeDiff(files: DiffFile[], maxCharacters = 120_000) {
  const text = files
    .filter((file) => file.patch)
    .map(
      (file) =>
        `### ${file.filename} (${file.status}, +${file.additions}/-${file.deletions})\n${file.patch}`,
    )
    .join('\n\n');

  if (!text) throw new BadRequestException('EMPTY_DIFF');
  if (text.length > maxCharacters) {
    throw new PayloadTooLargeException('DIFF_TOO_LARGE');
  }
  return text;
}
