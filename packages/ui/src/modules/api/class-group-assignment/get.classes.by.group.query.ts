import { CLASS_GROUP_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { ClassNameResponse } from '@pikslots/shared';
import type { PikslotResponse } from '../common/common-models';

export const getClassesByGroup = async (classGroupId: string): Promise<ClassNameResponse[]> => {
	const url = CLASS_GROUP_ASSIGNMENT_ENDPOINTS.FIND_BY_GROUP.replace(
		':classGroupId',
		classGroupId
	);
	const { data } = await apiClient.get<PikslotResponse<ClassNameResponse[]>>(url);
	return data.data;
};

export const getClassesByGroupQueryOptions = (classGroupId: string | null) =>
	queryOptions({
		queryKey: ['class-group-assignments', 'by-group', classGroupId],
		queryFn: () => getClassesByGroup(classGroupId!),
		enabled: !!classGroupId
	});
