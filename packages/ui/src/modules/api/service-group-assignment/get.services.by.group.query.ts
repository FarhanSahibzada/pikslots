import { SERVICE_GROUP_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { ServiceNameResponse } from '@pikslots/shared';
import type { PikslotResponse } from '../common/common-models';

export const getServicesByGroup = async (serviceGroupId: string): Promise<ServiceNameResponse[]> => {
	const url = SERVICE_GROUP_ASSIGNMENT_ENDPOINTS.FIND_BY_GROUP.replace(
		':serviceGroupId',
		serviceGroupId
	);
	const { data } = await apiClient.get<PikslotResponse<ServiceNameResponse[]>>(url);
	return data.data;
};

export const getServicesByGroupQueryOptions = (serviceGroupId: string | null) =>
	queryOptions({
		queryKey: ['service-group-assignments', 'by-group', serviceGroupId],
		queryFn: () => getServicesByGroup(serviceGroupId!),
		enabled: !!serviceGroupId
	});
