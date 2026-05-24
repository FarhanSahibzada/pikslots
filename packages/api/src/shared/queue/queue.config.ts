import { ConfigService } from '@nestjs/config';
import { Env } from '../config/env';
import { BullModule } from '@nestjs/bullmq';

export const EVENTS = 'EVENTS';

export const QUEUE_CONFIG = BullModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService<Env, true>) => ({
    connection: {
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD'),
    },
    defaultJobOptions: {},
    settings: {},
  }),
});

export const REGISTERED_QUEUES = BullModule.registerQueue({
  name: EVENTS,
});
