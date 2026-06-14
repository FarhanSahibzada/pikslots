import { SERVICE_ENDPOINTS } from '@pikslots/shared';
import type {
	BaseErrorResponse,
	UpdateServiceInput,
	UpdateServiceResponse
} from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const updateService = async (input: UpdateServiceInput): Promise<UpdateServiceResponse> => {
	const url = SERVICE_ENDPOINTS.UPDATE.replace(':serviceId', input.id);
	const { data } = await apiClient.patch<PikslotResponse<UpdateServiceResponse>>(url, input);
	return data.data;
};

export const updateServiceMutationOptions = () =>
	mutationOptions<UpdateServiceResponse, AxiosError<BaseErrorResponse>, UpdateServiceInput>({
		mutationKey: ['update-service'],
		mutationFn: updateService
	});
