import { Injectable } from '@nestjs/common';
import { ConventionCheckResultDto } from './dto/convention-check-result.dto';

@Injectable()
export class ReviewsService {
  /**
   * TODO: LLM에 커밋 메시지와 Conventional Commits 규칙을 전달해 적합성을 판단하고
   * 어긋난 경우 올바른 예시를 추천받는다.
   */
  checkCommitConvention(message: string): ConventionCheckResultDto {
    void message;
    return { isValid: true, suggestion: '' };
  }
}
