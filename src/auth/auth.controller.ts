import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { CurrentUser } from '../sessions/current-user.decorator';
import { SessionGuard } from '../sessions/session.guard';
import type { AuthenticatedUser } from '../sessions/session.types';
import { SessionsService } from '../sessions/sessions.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly sessions: SessionsService,
    private readonly config: ConfigService,
  ) {}

  @Get('github')
  start(@Res() response: Response) {
    return response.redirect(this.auth.start().authorizationUrl);
  }

  @Get('github/callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: Response,
  ) {
    const session = await this.auth.callback(code, state);
    response.cookie(this.cookieName, session.sessionId, this.cookieOptions);
    return response.redirect(`${this.frontendUrl}/auth/callback?success=1`);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@CurrentUser() user: AuthenticatedUser) {
    return {
      id: user.id,
      githubLogin: user.githubLogin,
      avatarUrl: user.avatarUrl,
    };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res() response: Response) {
    const sessionId = request.cookies?.[this.cookieName] as string | undefined;
    if (sessionId) await this.sessions.revoke(sessionId);
    response.clearCookie(this.cookieName, this.cookieOptions);
    return response.status(204).send();
  }

  private get cookieName() {
    return this.config.get<string>('SESSION_COOKIE_NAME') ?? 'gitbrief_session';
  }

  private get frontendUrl() {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  private get cookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      path: '/',
      maxAge: (this.config.get<number>('SESSION_TTL_SECONDS') ?? 604800) * 1000,
    };
  }
}
