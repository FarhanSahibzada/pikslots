import { CLASS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse, RegisterClassInput, RegisterClassResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const registerClass = async (input: RegisterClassInput): Promise<RegisterClassResponse> => {
	const { data } = await apiClient.post<PikslotResponse<RegisterClassResponse>>(
		CLASS_ENDPOINTS.REGISTER,
		input
	);
	return data.data;
};

export const registerClassMutationOptions = () =>
	mutationOptions<RegisterClassResponse, AxiosError<BaseErrorResponse>, RegisterClassInput>({
		mutationKey: ['register-class'],
		mutationFn: registerClass
	});
