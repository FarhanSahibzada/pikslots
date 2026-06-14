import { SERVICE_GROUP_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { ServiceGroupModel } from './models/service-group-model';
import type { PikslotResponse } from '../common/common-models';

export const getServiceGroupsByBusiness = async (
	businessId: string
): Promise<ServiceGroupModel[]> => {
	const url = SERVICE_GROUP_ENDPOINTS.FIND_ALL_BY_BUSINESS.replace(':businessId', businessId);
	const { data } = await apiClient.get<PikslotResponse<ServiceGroupModel[]>>(url);
	return data.data;
};

export const getServiceGroupsByBusinessQueryOptions = (businessId: string) =>
	queryOptions({
		queryKey: ['service-groups', businessId],
		queryFn: () => getServiceGroupsByBusiness(businessId)
	});
