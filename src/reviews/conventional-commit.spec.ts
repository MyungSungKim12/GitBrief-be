import { checkConventionalCommit } from './conventional-commit';

describe('checkConventionalCommit', () => {
  it.each(['feat: add login', 'fix(api): handle timeout', 'docs!: update API'])(
    'accepts %s',
    (message) => {
      expect(checkConventionalCommit(message)).toMatchObject({ isValid: true });
    },
  );

  it('suggests a normalized message for vague input', () => {
    expect(checkConventionalCommit('update login logic')).toEqual({
      isValid: false,
      suggestion: 'chore: update login logic',
      explanation:
        'Conventional Commit 형식(type(scope): subject)이 필요합니다.',
    });
  });

  it('rejects an empty message', () => {
    expect(checkConventionalCommit('   ')).toMatchObject({
      isValid: false,
      suggestion: 'chore: describe the change',
    });
  });
});
