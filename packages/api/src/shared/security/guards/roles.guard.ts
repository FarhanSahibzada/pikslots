import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@pikslots/domain';
import { PikslotsBaseErrorResponse } from 'src/shared/types/base.error.response';
import { Response } from 'express';
import { ROLES_KEY } from './roles.decorator';
import { SecurityContext } from '../context/security.context';

/**
 * Restricts route access to users whose role matches the @Roles() decorator.
 * Reads the required roles from metadata set by @Roles() and compares against
 * the authenticated user's role in SecurityContext.
 *
 * - No @Roles() on the handler → access granted to all authenticated users.
 * - Role mismatch → 403 Access denied. (response written directly, returns false).
 *
 * @example
 * @UseGuards(RolesGuard)
 * @Roles('superAdmin')
 * @Get()
 * findAll() { ... }
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly securityContext: SecurityContext,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() decorator on this route — unrestricted, allow through.
    if (!requiredRoles || requiredRoles.length === 0) return true;

    if (requiredRoles.includes(this.securityContext.role)) return true;

    const res: Response = context.switchToHttp().getResponse();
    res
      .status(HttpStatus.FORBIDDEN)
      .json(new PikslotsBaseErrorResponse('Access denied.', HttpStatus.FORBIDDEN));

    return false;
  }
}
