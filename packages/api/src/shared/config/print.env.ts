import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './env';

@Injectable()
export class PrintLoadedEnv {
  private readonly logger: Logger = new Logger(PrintLoadedEnv.name);
  private readonly sensitiveKeys: Array<keyof Env> = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'REDIS_PASSWORD',
  ];

  private readonly envKeys: Array<keyof Env> = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN',
    'JWT_REFRESH_SECRET',
    'CORS_ORIGINS',
    'REDIS_HOST',
    'REDIS_PORT',
  ];

  constructor(private readonly configService: ConfigService<Env, true>) {}

  public logEnv(): void {
    this.logger.log('Loaded environment variables:');
    for (const key of this.envKeys) {
      const raw = String(this.configService.get(key, { infer: true }));
      const value = this.sensitiveKeys.includes(key)
        ? '*'.repeat(raw.length)
        : raw;
      this.logger.log(`${key} = ${value}`);
    }
  }
}
