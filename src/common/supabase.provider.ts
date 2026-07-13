import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

export type SupabaseAccessor = {
  getClient(): SupabaseClient;
};

export const SupabaseProvider: Provider = {
  provide: SUPABASE_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): SupabaseAccessor => {
    let client: SupabaseClient | undefined;

    return {
      getClient() {
        if (client) return client;

        const url = config.get<string>('SUPABASE_URL');
        const serviceKey = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!url || !serviceKey) {
          throw new Error(
            'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다.',
          );
        }

        client = createClient(url, serviceKey);
        return client;
      },
    };
  },
};
