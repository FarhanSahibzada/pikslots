import { Global, Module } from '@nestjs/common';
import { QUEUE_CONFIG, REGISTERED_QUEUES } from './queue.config';

@Global()
@Module({
  exports: [QUEUE_CONFIG, REGISTERED_QUEUES],
  imports: [QUEUE_CONFIG, REGISTERED_QUEUES],
})
export class PikslotsQueueModule {}
