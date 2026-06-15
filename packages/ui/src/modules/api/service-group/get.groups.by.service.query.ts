import { SERVICE_GROUP_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { ServiceGroupNameResponse } from '@pikslots/shared';
import type { PikslotResponse } from '../common/common-models';

export const getGroupsByService = async (
	serviceId: string
): Promise<ServiceGroupNameResponse[]> => {
	const url = SERVICE_GROUP_ASSIGNMENT_ENDPOINTS.FIND_GROUPS_BY_SERVICE.replace(
		':serviceId',
		serviceId
	);
	const { data } = await apiClient.get<PikslotResponse<ServiceGroupNameResponse[]>>(url);
	return data.data;
};

export const getGroupsByServiceQueryOptions = (serviceId: string | undefined) =>
	queryOptions({
		queryKey: ['service-group-assignments', 'by-service', serviceId],
		queryFn: () => getGroupsByService(serviceId!),
		enabled: !!serviceId
	});
