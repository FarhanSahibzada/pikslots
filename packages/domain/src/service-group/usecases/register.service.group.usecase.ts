import type { InfrastructureError, Result } from '../../shared';
import type { ServiceGroupAlreadyExistsInBusinessError } from '../errors';

export interface RegisterServiceGroupCommand {
  name: string;
  businessId: string;
  associatedServices: string[];
  createdBy: string;
}

export const IRegisterServiceGroupUseCase = Symbol('IRegisterServiceGroupUseCase');

export interface RegisterServiceGroupUseCase {
  execute(
    command: RegisterServiceGroupCommand,
  ): Promise<
    Result<{ message: 'success' }, ServiceGroupAlreadyExistsInBusinessError | InfrastructureError>
  >;
}
