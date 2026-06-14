import type { ClassSummary, InfrastructureError, Result } from '../../shared';
import type { ClassGroupAssignment } from '../class.group.assignment.entity';
import type { ClassGroupSummary } from '../read-models/class.group.summary';

export const IClassGroupAssignmentRepository = Symbol('IClassGroupAssignmentRepository');

export interface ClassGroupAssignmentRepository {
  save(assignment: ClassGroupAssignment): Promise<Result<void, InfrastructureError>>;
  saveAll(assignments: ClassGroupAssignment[]): Promise<Result<void, InfrastructureError>>;
  findById(id: string): Promise<Result<ClassGroupAssignment | null, InfrastructureError>>;
  findAllByClassGroup(
    classGroupId: string,
  ): Promise<Result<ClassGroupAssignment[], InfrastructureError>>;
  findAllByClass(
    classId: string,
  ): Promise<Result<ClassGroupAssignment[], InfrastructureError>>;
  findAllByBusiness(
    businessId: string,
  ): Promise<Result<ClassGroupAssignment[], InfrastructureError>>;
  findByClassAndGroup(
    classId: string,
    classGroupId: string,
  ): Promise<Result<ClassGroupAssignment | null, InfrastructureError>>;
  existsByClassAndGroup(
    classId: string,
    classGroupId: string,
  ): Promise<Result<boolean, InfrastructureError>>;
  findGroupsByClass(
    classId: string,
  ): Promise<Result<ClassGroupSummary[], InfrastructureError>>;
  findClassesByGroup(
    classGroupId: string,
  ): Promise<Result<ClassSummary[], InfrastructureError>>;
  update(assignment: ClassGroupAssignment): Promise<Result<void, InfrastructureError>>;
  deleteById(id: string): Promise<Result<void, InfrastructureError>>;
}
