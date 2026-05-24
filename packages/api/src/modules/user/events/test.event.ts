import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EVENTS } from 'src/shared/queue/queue.config';

@Processor(EVENTS)
export class UserEventConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'test': {
        console.log('Received job :' + JSON.stringify(job.data));
        return {};
      }
      case 'concatenate': {
        break;
      }
    }
  }
}
