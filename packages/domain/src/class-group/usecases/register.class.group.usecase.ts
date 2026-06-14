import type { InfrastructureError, Result } from '../../shared';
import type { ClassGroupAlreadyExistsInBusinessError } from '../errors';

export interface RegisterClassGroupCommand {
  name: string;
  businessId: string;
  associatedClasses: string[];
  createdBy: string;
}

export const IRegisterClassGroupUseCase = Symbol('IRegisterClassGroupUseCase');

export interface RegisterClassGroupUseCase {
  execute(
    command: RegisterClassGroupCommand,
  ): Promise<
    Result<{ message: 'success' }, ClassGroupAlreadyExistsInBusinessError | InfrastructureError>
  >;
}
