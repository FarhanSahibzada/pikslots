import { SERVICE_GROUP_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';

export const deleteServiceGroup = async (serviceGroupId: string): Promise<void> => {
	const url = SERVICE_GROUP_ENDPOINTS.DELETE.replace(':serviceGroupId', serviceGroupId);
	await apiClient.delete(url);
};

export const deleteServiceGroupMutationOptions = () =>
	mutationOptions<void, AxiosError<BaseErrorResponse>, string>({
		mutationKey: ['delete-service-group'],
		mutationFn: deleteServiceGroup
	});
