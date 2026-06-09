import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { SecurityContext } from '../context/security.context';
import { JwtLoginService } from '../jwt/jwt.login.service';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';

// Routes bypassed from JWT verification.
// Supports exact paths ('/users/register') and wildcards ('/users/*').
const PUBLIC_ROUTES: string[] = [
  '/users/register',
  '/users/login',
  '/users/refresh',
  '/users/invite/request-otp',
  '/users/invite/accept',
  '/businesses/register',
  '/service-groups/by-business/*', // service groups by business public for booking page
  '/services/by-business/*', // services by business public for booking page
];

function isPublicRoute(originalUrl: string): boolean {
  const path = originalUrl.split('?')[0];
  console.log(path);

  return PUBLIC_ROUTES.some((route) => {
    if (route.endsWith('/*')) {
      const prefix = route.slice(0, -2);
      return path === prefix || path.startsWith(prefix + '/');
    }
    return path === route;
  });
}

@Injectable()
export class JwtVerificationMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtLoginService: JwtLoginService,
    private readonly securityContext: SecurityContext,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (isPublicRoute(req.originalUrl)) return next();

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          new PikslotsBaseErrorResponse(
            'Missing or malformed authorization header',
            HttpStatus.UNAUTHORIZED,
          ),
        );
    }

    const token = authHeader.slice(7);

    try {
      const payload = this.jwtLoginService.verifyAccessToken(token);
      if (!payload.ok)
        return res.status(HttpStatus.UNAUTHORIZED).json(payload.error);

      this.securityContext.userId = payload.value.userId;
      this.securityContext.role = payload.value.role;
      this.securityContext.businessId = payload.value.businessId;

      next();
    } catch {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          new PikslotsBaseErrorResponse(
            'Invalid or expired token',
            HttpStatus.UNAUTHORIZED,
          ),
        );
    }
  }
}
