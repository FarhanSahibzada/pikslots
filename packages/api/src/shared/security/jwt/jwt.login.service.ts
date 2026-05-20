import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  UnauthorizedError,
  ValidationError,
  Result,
} from '@pikslots/domain';
import { LoginJwtPayload } from '@pikslots/shared';
import * as jwt from 'jsonwebtoken';
import { Env } from 'src/shared/config/env';

@Injectable()
export class JwtLoginService {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  private get accessSecret(): string {
    return this.configService.getOrThrow('JWT_SECRET', { infer: true });
  }

  private get refreshSecret(): string {
    return this.configService.getOrThrow('JWT_REFRESH_SECRET', { infer: true });
  }

  signAccessToken(payload: LoginJwtPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.configService.getOrThrow('JWT_EXPIRES_IN', {
        infer: true,
      }),
    });
  }

  verifyAccessToken(
    token: string,
  ): Result<LoginJwtPayload, UnauthorizedError | ValidationError> {
    try {
      const payload = jwt.verify(token, this.accessSecret) as LoginJwtPayload;
      return { ok: true, value: payload };
    } catch (error) {
      return { ok: false, error: this.mapJwtError(error, 'access') };
    }
  }

  signRefreshToken(payload: LoginJwtPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN', {
        infer: true,
      }),
    });
  }

  verifyRefreshToken(
    token: string,
  ): Result<LoginJwtPayload, UnauthorizedError | ValidationError> {
    try {
      const payload = jwt.verify(token, this.refreshSecret) as LoginJwtPayload;
      return { ok: true, value: payload };
    } catch (error) {
      return { ok: false, error: this.mapJwtError(error, 'refresh') };
    }
  }

  private mapJwtError(
    error: unknown,
    tokenType: 'access' | 'refresh',
  ): UnauthorizedError | ValidationError {
    if (error instanceof jwt.TokenExpiredError) {
      // Token was valid in structure but has passed its expiry time
      return {
        kind: 'unauthorized',
        message: `${tokenType} token has expired`,
        timestamp: new Date(),
      } satisfies UnauthorizedError;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      // Token is malformed or signature is invalid — cannot be parsed or trusted
      return {
        kind: 'validation',
        message: `${tokenType} token is malformed or has an invalid signature`,
        timestamp: new Date(),
      } satisfies ValidationError;
    }

    // Unexpected JWT error (e.g. NotBeforeError) — treat as unauthorized
    return {
      kind: 'unauthorized',
      message: `${tokenType} token is not accepted`,
      timestamp: new Date(),
    } satisfies UnauthorizedError;
  }
}
