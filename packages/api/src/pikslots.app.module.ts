import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PikslotsConfigModule } from './shared/config/pikslots.config.module';
import { PikslotsDatabaseModule } from './shared/database/pikslots.database.module';
import { UserModule } from './modules/user/user.module';
import { PikslotsSecurityModule } from './shared/security/pikslots.security.module';
import { JwtVerificationMiddleware } from './shared/security/middleware/jwt.verficiation.middleware';
import { BusinessModule } from './modules/business/business.module';
import { PikslotsQueueModule } from './shared/queue/pikslots.queue.module';
import { PikslotEmailModule } from './shared/email/pikslot.email.module';
import { PikslotCacheModule } from './shared/cache/pikslot.cache.module';
import { ServiceModule } from './modules/service/service.module';
import { ServiceGroupModule } from './modules/service-group/service.group.module';
import { ServiceGroupAssignmentModule } from './modules/service-group-assignment/service.group.assignment.module';
import { ServiceUserAssignmentModule } from './modules/service-user-assignment/service.user.assignment.module';
import { ClassModule } from './modules/class/class.module';
import { ClassGroupModule } from './modules/class-group/class.group.module';
import { ClassGroupAssignmentModule } from './modules/class-group-assignment/class.group.assignment.module';

@Module({
  imports: [
    PikslotsSecurityModule,
    PikslotsConfigModule,
    PikslotsDatabaseModule, // also runs the migrations
    PikslotsQueueModule,
    PikslotEmailModule,
    PikslotCacheModule,

    // domain modules
    UserModule,
    BusinessModule,
    ServiceModule,
    ServiceGroupModule,
    ServiceGroupAssignmentModule,
    ServiceUserAssignmentModule,
    ClassModule,
    ClassGroupModule,
    ClassGroupAssignmentModule,
  ],
  controllers: [],
  providers: [],
})
export class PikslotsAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtVerificationMiddleware).forRoutes('*');
  }
}
