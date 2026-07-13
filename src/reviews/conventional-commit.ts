export type ConventionResult = {
  isValid: boolean;
  suggestion: string;
  explanation: string;
};

const pattern =
  /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9._-]+\))?!?: .+/;

export function checkConventionalCommit(message: string): ConventionResult {
  const normalized = message.trim();
  if (pattern.test(normalized)) {
    return {
      isValid: true,
      suggestion: normalized,
      explanation: '유효한 Conventional Commit 형식입니다.',
    };
  }
  return {
    isValid: false,
    suggestion: `chore: ${normalized || 'describe the change'}`,
    explanation: 'Conventional Commit 형식(type(scope): subject)이 필요합니다.',
  };
}
