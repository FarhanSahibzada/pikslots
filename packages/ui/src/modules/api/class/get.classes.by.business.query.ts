import { CLASS_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { ClassModel } from './models/class-model';
import type { PikslotResponse } from '../common/common-models';

export const getClassesByBusiness = async (businessId: string): Promise<ClassModel[]> => {
	const url = CLASS_ENDPOINTS.FIND_ALL_BY_BUSINESS.replace(':businessId', businessId);
	const { data } = await apiClient.get<PikslotResponse<ClassModel[]>>(url);
	return data.data;
};

export const getClassesByBusinessQueryOptions = (businessId: string) =>
	queryOptions({
		queryKey: ['classes', businessId],
		queryFn: () => getClassesByBusiness(businessId)
	});
