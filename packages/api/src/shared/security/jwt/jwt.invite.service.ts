import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  UnauthorizedError,
  ValidationError,
  Result,
} from '@pikslots/domain';
import * as jwt from 'jsonwebtoken';
import { Env } from 'src/shared/config/env';

@Injectable()
export class JwtInviteService {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  private get secret(): string {
    return this.configService.getOrThrow('INVITE_JWT_SECRET', { infer: true });
  }

  signInviteToken<T extends object>(payload: T): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.configService.getOrThrow('INVITE_JWT_EXPIRES_IN', {
        infer: true,
      }),
    });
  }

  verifyInviteToken<T extends object>(
    token: string,
  ): Result<T, UnauthorizedError | ValidationError> {
    try {
      const payload = jwt.verify(token, this.secret) as T;
      return { ok: true, value: payload };
    } catch (error) {
      return { ok: false, error: this.mapJwtError(error) };
    }
  }

  private mapJwtError(error: unknown): UnauthorizedError | ValidationError {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        kind: 'unauthorized',
        message: 'Invite link has expired',
        timestamp: new Date(),
      } satisfies UnauthorizedError;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return {
        kind: 'validation',
        message: 'Invite link is invalid or has been tampered with',
        timestamp: new Date(),
      } satisfies ValidationError;
    }

    return {
      kind: 'unauthorized',
      message: 'Invite link is not accepted',
      timestamp: new Date(),
    } satisfies UnauthorizedError;
  }
}
