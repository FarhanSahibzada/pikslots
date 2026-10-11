import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { PartialCustomerModel } from './models/customer-model';
import type { PikslotResponse } from '../common/common-models';

export const debounceCustomerSearchByBusiness = async (
	businessId: string,
	searchString: string
): Promise<PartialCustomerModel[]> => {
	const url = CUSTOMER_ENDPOINTS.DEBOUNCE_CUSTOMER_SEARCH_BY_BUSINESS.replace(
		':businessId',
		businessId
	);
	const { data } = await apiClient.post<PikslotResponse<PartialCustomerModel[]>>(url, {
		searchString
	});
	return data.data ?? [];
};

export const debounceCustomerSearchQueryOptions = (businessId: string, searchString: string) =>
	queryOptions({
		queryKey: ['customers-search', businessId, searchString],
		queryFn: () => debounceCustomerSearchByBusiness(businessId, searchString),
		enabled: searchString.trim().length > 0
	});
