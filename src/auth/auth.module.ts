import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { SessionsModule } from '../sessions/sessions.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  FetchGitHubOAuthClient,
  GitHubOAuthClient,
} from './github-oauth.client';
import { OAuthStateService } from './oauth-state.service';
import { SupabaseUserRepository, UserRepository } from './user.repository';

@Module({
  imports: [CommonModule, SessionsModule],
  providers: [
    AuthService,
    OAuthStateService,
    FetchGitHubOAuthClient,
    { provide: GitHubOAuthClient, useExisting: FetchGitHubOAuthClient },
    SupabaseUserRepository,
    { provide: UserRepository, useExisting: SupabaseUserRepository },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
