import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  it('applies runtime defaults without external credentials', () => {
    expect(validateEnvironment({ NODE_ENV: 'test' })).toMatchObject({
      NODE_ENV: 'test',
      PORT: 4000,
      FRONTEND_URL: 'http://localhost:3000',
      SESSION_COOKIE_NAME: 'gitbrief_session',
      SESSION_TTL_SECONDS: 604800,
    });
  });

  it('rejects invalid numeric configuration', () => {
    expect(() => validateEnvironment({ PORT: 'invalid' })).toThrow(
      'PORT must be a positive integer',
    );
  });
});
