import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  /**
   * TODO: GitHub OAuth 콜백에서 받은 code를 access token으로 교환한다.
   */
  async exchangeCodeForToken(code: string) {
    void code;
    return { accessToken: '' };
  }
}
