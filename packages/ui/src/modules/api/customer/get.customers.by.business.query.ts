import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { CustomerModel } from './models/customer-model';
import type { PikslotResponse } from '../common/common-models';

export const getCustomersByBusiness = async (businessId: string): Promise<CustomerModel[]> => {
	const url = CUSTOMER_ENDPOINTS.FIND_ALL_BY_BUSINESS.replace(':businessId', businessId);
	const { data } = await apiClient.get<PikslotResponse<CustomerModel[]>>(url);
	return data.data;
};

export const getCustomersByBusinessQueryOptions = (businessId: string) =>
	queryOptions({
		queryKey: ['customers', businessId],
		queryFn: () => getCustomersByBusiness(businessId)
	});
