import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // For now, use in-memory cache
        // To use Redis, install: npm install cache-manager-redis-store
        // and uncomment Redis configuration below
        
        const redisHost = configService.get<string>('REDIS_HOST');
        
        // In-memory cache (default)
        const config: any = {
          ttl: 300, // 5 minutes
          max: 100, // Maximum number of items in cache
        };

        // Uncomment below to use Redis (requires cache-manager-redis-store)
        // if (redisHost) {
        //   const redisStore = require('cache-manager-redis-store');
        //   return {
        //     store: redisStore,
        //     host: redisHost,
        //     port: configService.get<number>('REDIS_PORT', 6379),
        //     password: configService.get<string>('REDIS_PASSWORD'),
        //     ...config,
        //   };
        // }

        return config;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}

