import { parseSummaryPayload } from './summary-payload';

describe('parseSummaryPayload', () => {
  it('accepts a complete structured summary', () => {
    expect(
      parseSummaryPayload({
        purpose: '인증 오류 수정',
        keyChanges: ['세션 만료 검사 추가'],
        reviewNotes: ['쿠키 옵션 확인'],
        codeSmells: [
          {
            file: 'src/auth.ts',
            line: 10,
            severity: 'medium',
            message: '함수가 큽니다.',
          },
        ],
      }),
    ).toMatchObject({ purpose: '인증 오류 수정' });
  });

  it('rejects malformed model output', () => {
    expect(() =>
      parseSummaryPayload({ purpose: '', keyChanges: 'wrong' }),
    ).toThrow('Gemini returned an invalid summary');
  });
});
