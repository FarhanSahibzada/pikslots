import { SERVICE_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';

export const deleteService = async (serviceId: string): Promise<void> => {
	const url = SERVICE_ENDPOINTS.DELETE.replace(':serviceId', serviceId);
	await apiClient.delete(url);
};

export const deleteServiceMutationOptions = () =>
	mutationOptions<void, AxiosError<BaseErrorResponse>, string>({
		mutationKey: ['delete-service'],
		mutationFn: deleteService
	});
