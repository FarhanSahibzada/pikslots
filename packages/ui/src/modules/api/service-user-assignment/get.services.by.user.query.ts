import { SERVICE_USER_ASSIGNMENT_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { ServiceTitleResponse } from '@pikslots/shared';
import type { PikslotResponse } from '../common/common-models';

export const getServicesByUser = async (userId: string): Promise<ServiceTitleResponse[]> => {
	const url = SERVICE_USER_ASSIGNMENT_ENDPOINTS.FIND_SERVICES_BY_USER.replace(':userId', userId);
	const { data } = await apiClient.get<PikslotResponse<ServiceTitleResponse[]>>(url);
	return data.data;
};

export const getServicesByUserQueryOptions = (userId: string | null) =>
	queryOptions({
		queryKey: ['service-user-assignments', 'by-user', userId],
		queryFn: () => getServicesByUser(userId!),
		enabled: !!userId
	});
