import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SessionRepository,
  SupabaseSessionRepository,
} from './session.repository';
import { SessionsService } from './sessions.service';
import { CommonModule } from '../common/common.module';
import { SessionGuard } from './session.guard';

@Module({
  imports: [CommonModule],
  providers: [
    SupabaseSessionRepository,
    { provide: SessionRepository, useExisting: SupabaseSessionRepository },
    {
      provide: SessionsService,
      inject: [SessionRepository, ConfigService],
      useFactory: (repository: SessionRepository, config: ConfigService) =>
        new SessionsService(
          repository,
          config.get<number>('SESSION_TTL_SECONDS') ?? 604800,
        ),
    },
    SessionGuard,
  ],
  exports: [SessionsService, SessionGuard],
})
export class SessionsModule {}
