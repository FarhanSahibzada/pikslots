import type { InfrastructureError, Result } from '../../shared';
import type {
  ServiceGroupAlreadyExistsInBusinessError,
  ServiceGroupNotFoundError,
} from '../errors';

export interface EditServiceGroupCommand {
  serviceGroupId: string;
  name: string;
  serviceIds: string[];
  businessId: string;
  updatedBy: string;
}

export const IEditServiceGroupUseCase = Symbol('IEditServiceGroupUseCase');

export interface EditServiceGroupUseCase {
  execute(
    command: EditServiceGroupCommand,
  ): Promise<
    Result<
      void,
      ServiceGroupNotFoundError | ServiceGroupAlreadyExistsInBusinessError | InfrastructureError
    >
  >;
}
