import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { BusinessUserModel, BusinessUsersResult } from './models/user-model';
import type { PikslotResponse } from '../common/common-models';

export const getUsersInsideBusiness = async (businessId: string): Promise<BusinessUserModel[]> => {
	const url = USER_ENDPOINTS.BUSINESS_USERS.replace(':businessId', businessId);
	const { data } = await apiClient.get<PikslotResponse<BusinessUsersResult>>(url);
	return data.data;
};

export const getUsersInsideBusinessQueryOptions = (businessId: string, enabled: boolean = true) =>
	queryOptions({
		queryKey: ['users-inside-business', businessId],
		queryFn: () => getUsersInsideBusiness(businessId),
		enabled
	});
