import { Inject, Injectable } from '@nestjs/common';
import {
  Business,
  BusinessAlreadyExistsError,
  IBusinessRepository,
  InfrastructureError,
  RegisterBusinessCommand,
  RegisterBusinessUseCase,
  Result,
  err,
  ok,
} from '@pikslots/domain';
import { v7 as uuidv7 } from 'uuid';
import type { BusinessRepository } from '@pikslots/domain';

@Injectable()
export class RegisterBusinessUseCaseImpl implements RegisterBusinessUseCase {
  constructor() {}

  async execute(
    command: RegisterBusinessCommand,
  ): Promise<
    Result<
      { message: 'success' },
      BusinessAlreadyExistsError | InfrastructureError
    >
  > {
    // const business: Business = Business.create({
    //   id: uuidv7(),
    //   ownerId: command.ownerId,
    //   slug: command.slug,
    //   name: command.name,
    //   industry: command.industry,
    //   address: command.address,
    //   email: command.email,
    //   phone: command.phone,
    //   description: command.description,
    //   website: command.website,
    //   defaultTimeZone: command.defaultTimeZone,
    //   defaultCurrency: command.defaultCurrency,
    //   defaultLanguage: command.defaultLanguage,
    //   createdBy: command.ownerId,
    // });
    //
    // const result = await this.businessRepository.save(business);
    //
    // if (!result.ok) {
    //   return err(result.error);
    // }

    return ok({ message: 'success' });
  }
}
