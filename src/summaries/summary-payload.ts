import { ServiceUnavailableException } from '@nestjs/common';
import { z } from 'zod';

export const summaryPayloadSchema = z.object({
  purpose: z.string().min(1),
  keyChanges: z.array(z.string().min(1)),
  reviewNotes: z.array(z.string().min(1)),
  codeSmells: z.array(
    z.object({
      file: z.string().min(1),
      line: z.number().int().positive().optional(),
      severity: z.enum(['low', 'medium', 'high']),
      message: z.string().min(1),
    }),
  ),
});

export type SummaryPayload = z.infer<typeof summaryPayloadSchema>;

export function parseSummaryPayload(value: unknown): SummaryPayload {
  const parsed = summaryPayloadSchema.safeParse(value);
  if (!parsed.success) {
    throw new ServiceUnavailableException('Gemini returned an invalid summary');
  }
  return parsed.data;
}
