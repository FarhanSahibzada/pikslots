import { CLASS_GROUP_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { ClassGroupNameResponse } from '@pikslots/shared';
import type { PikslotResponse } from '../common/common-models';

export const getGroupsByClass = async (classId: string): Promise<ClassGroupNameResponse[]> => {
	const url = CLASS_GROUP_ASSIGNMENT_ENDPOINTS.FIND_GROUPS_BY_CLASS.replace(':classId', classId);
	const { data } = await apiClient.get<PikslotResponse<ClassGroupNameResponse[]>>(url);
	return data.data;
};

export const getGroupsByClassQueryOptions = (classId: string | undefined) =>
	queryOptions({
		queryKey: ['class-group-assignments', 'by-class', classId],
		queryFn: () => getGroupsByClass(classId!),
		enabled: !!classId
	});
