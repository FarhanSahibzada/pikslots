import { CUSTOMER_ENDPOINTS } from '@pikslots/shared';
import type {
	BaseErrorResponse,
	RegisterCustomerInput,
	RegisterCustomerResponse
} from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const registerCustomer = async (
	input: RegisterCustomerInput
): Promise<RegisterCustomerResponse> => {
	const { data } = await apiClient.post<PikslotResponse<RegisterCustomerResponse>>(
		CUSTOMER_ENDPOINTS.REGISTER,
		input
	);
	return data.data;
};

export const registerCustomerMutationOptions = () =>
	mutationOptions<RegisterCustomerResponse, AxiosError<BaseErrorResponse>, RegisterCustomerInput>({
		mutationKey: ['register-customer'],
		mutationFn: registerCustomer
	});
