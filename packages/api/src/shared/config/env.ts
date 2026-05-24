import { Injectable } from '@nestjs/common';
import { plainToInstance, Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

@Injectable()
export class Env {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv;

  @IsNumber()
  @Min(1)
  PORT: number = 3000;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string = '15m';

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((s: string) => s.trim())
      : value,
  )
  CORS_ORIGINS: string[];

  @IsString()
  REDIS_HOST: string;

  @IsString()
  REDIS_PASSWORD: string;

  @IsNumber()
  REDIS_PORT: number;
}

export function validateEnv(config: Record<string, unknown>): Env {
  const env = plainToInstance(Env, config, { enableImplicitConversion: true });

  const errors = validateSync(env, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('\n  ');

    throw new Error(
      `[PikslotsConfigModule] Invalid environment variables:\n  ${messages}`,
    );
  }

  return env;
}
