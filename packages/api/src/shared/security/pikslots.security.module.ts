import { Global, Module } from '@nestjs/common';
import { SecurityContext } from './context/security.context';
import { PasswordHashingService } from './hashing/password.hashing.service';
import { JwtLoginService } from './jwt/jwt.login.service';
import { JwtVerificationMiddleware } from './middleware/jwt.verficiation.middleware';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  providers: [
    JwtLoginService,
    JwtVerificationMiddleware,
    SecurityContext,
    PasswordHashingService,
    RolesGuard,
  ],
  exports: [
    JwtLoginService,
    JwtVerificationMiddleware,
    SecurityContext,
    PasswordHashingService,
    RolesGuard,
  ],
})
export class PikslotsSecurityModule {}
