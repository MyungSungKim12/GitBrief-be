import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { SupabaseProvider } from './supabase.provider';

@Module({
  providers: [CommonService, SupabaseProvider],
  exports: [CommonService, SupabaseProvider],
})
export class CommonModule {}
