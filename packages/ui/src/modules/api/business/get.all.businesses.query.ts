import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { BusinessModel } from './models/business-model';
import type { PikslotResponse } from '../common/common-models';

export const getAllBusinesses = async (): Promise<BusinessModel[]> => {
	const { data } = await apiClient.get<PikslotResponse<BusinessModel[]>>(
		BUSINESS_ENDPOINTS.GET_ALL
	);
	return data.data;
};

export const getAllBusinessesQueryOptions = () =>
	queryOptions({
		queryKey: ['businesses'],
		queryFn: getAllBusinesses
	});
