import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { SessionsService } from './sessions.service';
import type { AuthenticatedUser } from './session.types';

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessions: SessionsService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookieName =
      this.config.get<string>('SESSION_COOKIE_NAME') ?? 'gitbrief_session';
    const sessionId = request.cookies?.[cookieName] as string | undefined;
    if (!sessionId) throw new UnauthorizedException('Authentication required');

    const user = await this.sessions.resolve(sessionId);
    if (!user) throw new UnauthorizedException('Session expired');
    request.user = user;
    return true;
  }
}
