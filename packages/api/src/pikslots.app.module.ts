import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PikslotsConfigModule } from './shared/config/pikslots.config.module';
import { PikslotsDatabaseModule } from './shared/database/pikslots.database.module';
import { UserModule } from './modules/user/user.module';
import { PikslotsSecurityModule } from './shared/security/pikslots.security.module';
import { JwtVerificationMiddleware } from './shared/security/middleware/jwt.verficiation.middleware';
import { BusinessModule } from './modules/business/business.module';
import { PikslotsQueueModule } from './shared/queue/pikslots.queue.module';

@Module({
  imports: [
    PikslotsSecurityModule,
    PikslotsConfigModule,
    PikslotsDatabaseModule, // also runs the migrations
    PikslotsQueueModule,

    // domain modules
    UserModule,
    BusinessModule,
  ],
  controllers: [],
  providers: [],
})
export class PikslotsAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtVerificationMiddleware).forRoutes('*');
  }
}
