import { CLASS_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';

export const deleteClass = async (classId: string): Promise<void> => {
	const url = CLASS_ENDPOINTS.DELETE.replace(':classId', classId);
	await apiClient.delete(url);
};

export const deleteClassMutationOptions = () =>
	mutationOptions<void, AxiosError<BaseErrorResponse>, string>({
		mutationKey: ['delete-class'],
		mutationFn: deleteClass
	});
