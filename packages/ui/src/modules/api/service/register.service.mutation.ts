import { SERVICE_ENDPOINTS } from '@pikslots/shared';
import type {
	BaseErrorResponse,
	RegisterServiceInput,
	RegisterServiceResponse
} from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const registerService = async (
	input: RegisterServiceInput
): Promise<RegisterServiceResponse> => {
	const { data } = await apiClient.post<PikslotResponse<RegisterServiceResponse>>(
		SERVICE_ENDPOINTS.REGISTER,
		input
	);
	return data.data;
};

export const registerServiceMutationOptions = () =>
	mutationOptions<RegisterServiceResponse, AxiosError<BaseErrorResponse>, RegisterServiceInput>({
		mutationKey: ['register-service'],
		mutationFn: registerService
	});
