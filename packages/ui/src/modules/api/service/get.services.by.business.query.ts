import { SERVICE_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { ServiceModel } from './models/service-model';
import type { PikslotResponse } from '../common/common-models';

export const getServicesByBusiness = async (businessId: string): Promise<ServiceModel[]> => {
	const url = SERVICE_ENDPOINTS.FIND_ALL_BY_BUSINESS.replace(':businessId', businessId);
	const { data } = await apiClient.get<PikslotResponse<ServiceModel[]>>(url);
	return data.data;
};

export const getServicesByBusinessQueryOptions = (businessId: string) =>
	queryOptions({
		queryKey: ['services', businessId],
		queryFn: () => getServicesByBusiness(businessId)
	});
