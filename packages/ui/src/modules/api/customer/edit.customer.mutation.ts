import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse, EditCustomerInput, EditCustomerResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const editCustomer = async (input: EditCustomerInput): Promise<EditCustomerResponse> => {
	const url = CUSTOMER_ENDPOINTS.EDIT.replace(':customerId', input.id);
	const { data } = await apiClient.patch<PikslotResponse<EditCustomerResponse>>(url, input);
	return data.data;
};

export const editCustomerMutationOptions = () =>
	mutationOptions<EditCustomerResponse, AxiosError<BaseErrorResponse>, EditCustomerInput>({
		mutationKey: ['edit-customer'],
		mutationFn: editCustomer
	});
