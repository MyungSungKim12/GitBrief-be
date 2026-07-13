import { Inject, Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CLIENT } from './gemini.provider';
import { SummaryResultDto } from './dto/summary-result.dto';

const SYSTEM_PROMPT = `당신은 숙련된 개발자입니다. 주어진 코드 diff를 읽고 아래 세 항목을 한글로 간결하게 요약하세요.
1. 수정 목적
2. 주요 변경 로직
3. 리뷰어 주의 사항`;

@Injectable()
export class SummariesService {
  constructor(
    @Inject(GEMINI_CLIENT) private readonly gemini: GoogleGenerativeAI,
  ) {}

  /**
   * TODO: diff를 인자로 받아 Gemini에 프롬프트를 전송하고 결과를 파싱한다.
   * 현재는 초기 셋팅 단계로 뼈대만 구현되어 있다.
   */
  summarizeDiff(diff: string): SummaryResultDto {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    void model;
    void diff;
    void SYSTEM_PROMPT;

    return {
      purpose: '',
      keyChanges: '',
      reviewNotes: '',
    };
  }
}
