import { Inject, Injectable } from '@nestjs/common';
import {
  Business,
  IBusinessRepository,
  InfrastructureError,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import type {
  BusinessRepository,
  FindAllRegisteredBusinessesUseCase,
} from '@pikslots/domain';

@Injectable()
export class FindAllRegisteredBusinessesUseCaseImpl implements FindAllRegisteredBusinessesUseCase {
  constructor() {}
  async execute(): Promise<Result<Business[], InfrastructureError>> {
    // const result = await this.businessRepository.findAll();
    // if (!result.ok) return err(result.error);
    // return ok(result.value);

    return ok([]);
  }
}
