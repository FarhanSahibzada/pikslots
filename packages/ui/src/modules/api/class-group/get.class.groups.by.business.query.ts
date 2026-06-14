import { CLASS_GROUP_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { ClassGroupModel } from './models/class-group-model';
import type { PikslotResponse } from '../common/common-models';

export const getClassGroupsByBusiness = async (businessId: string): Promise<ClassGroupModel[]> => {
	const url = CLASS_GROUP_ENDPOINTS.FIND_ALL_BY_BUSINESS.replace(':businessId', businessId);
	const { data } = await apiClient.get<PikslotResponse<ClassGroupModel[]>>(url);
	return data.data;
};

export const getClassGroupsByBusinessQueryOptions = (businessId: string) =>
	queryOptions({
		queryKey: ['class-groups', businessId],
		queryFn: () => getClassGroupsByBusiness(businessId)
	});
