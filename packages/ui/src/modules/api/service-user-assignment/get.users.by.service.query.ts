import { SERVICE_USER_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { UserNameResponse } from '@pikslots/shared';
import type { PikslotResponse } from '../common/common-models';

export const getUsersByService = async (serviceId: string): Promise<UserNameResponse[]> => {
	const url = SERVICE_USER_ASSIGNMENT_ENDPOINTS.FIND_BY_SERVICE.replace(':serviceId', serviceId);
	const { data } = await apiClient.get<PikslotResponse<UserNameResponse[]>>(url);
	return data.data;
};

export const getUsersByServiceQueryOptions = (serviceId: string | null) =>
	queryOptions({
		queryKey: ['service-group-assignments', 'by-group', serviceId],
		queryFn: () => getUsersByService(serviceId!),
		enabled: !!serviceId
	});
