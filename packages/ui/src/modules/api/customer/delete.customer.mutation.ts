import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';

export interface DeleteCustomerInput {
	customerId: string;
	businessId: string;
}

export const deleteCustomer = async (input: DeleteCustomerInput): Promise<void> => {
	const url = CUSTOMER_ENDPOINTS.DELETE.replace(':customerId', input.customerId);
	await apiClient.delete(url, { data: { businessId: input.businessId } });
};

export const deleteCustomerMutationOptions = () =>
	mutationOptions<void, AxiosError<BaseErrorResponse>, DeleteCustomerInput>({
		mutationKey: ['delete-customer'],
		mutationFn: deleteCustomer
	});
