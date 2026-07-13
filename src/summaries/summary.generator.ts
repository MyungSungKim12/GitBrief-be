import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { parseSummaryPayload, type SummaryPayload } from './summary-payload';

const responseSchema = {
  type: 'object',
  properties: {
    purpose: { type: 'string' },
    keyChanges: { type: 'array', items: { type: 'string' } },
    reviewNotes: { type: 'array', items: { type: 'string' } },
    codeSmells: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'integer' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          message: { type: 'string' },
        },
        required: ['file', 'severity', 'message'],
      },
    },
  },
  required: ['purpose', 'keyChanges', 'reviewNotes', 'codeSmells'],
};

export abstract class SummaryGenerator {
  abstract readonly model: string;
  abstract generate(diff: string): Promise<SummaryPayload>;
}

@Injectable()
export class GeminiSummaryGenerator extends SummaryGenerator {
  readonly model: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.model = config.get<string>('GEMINI_MODEL') ?? 'gemini-3.5-flash';
  }

  async generate(diff: string) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey)
      throw new ServiceUnavailableException('GEMINI_API_KEY is not configured');

    const client = new GoogleGenAI({ apiKey });
    const interaction = await client.interactions.create({
      model: this.model,
      input: `다음 Git diff를 한국어로 분석하세요. 변경 목적, 주요 변경점, 리뷰 주의사항, 구체적인 코드 스멜을 반환하세요.\n\n${diff}`,
      system_instruction:
        '당신은 숙련된 코드 리뷰어입니다. 근거 없는 문제는 만들지 마세요.',
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: responseSchema,
      },
    });
    if (!interaction.output_text)
      throw new ServiceUnavailableException('Gemini returned an empty summary');

    try {
      return parseSummaryPayload(
        JSON.parse(interaction.output_text) as unknown,
      );
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('Gemini returned invalid JSON');
    }
  }
}
