import { CLASS_GROUP_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';

export const deleteClassGroup = async (classGroupId: string): Promise<void> => {
	const url = CLASS_GROUP_ENDPOINTS.DELETE.replace(':classGroupId', classGroupId);
	await apiClient.delete(url);
};

export const deleteClassGroupMutationOptions = () =>
	mutationOptions<void, AxiosError<BaseErrorResponse>, string>({
		mutationKey: ['delete-class-group'],
		mutationFn: deleteClassGroup
	});
