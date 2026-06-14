import { CLASS_GROUP_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse, EditClassGroupInput } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';

export const editClassGroup = async (
	classGroupId: string,
	input: EditClassGroupInput
): Promise<void> => {
	const url = CLASS_GROUP_ENDPOINTS.EDIT.replace(':classGroupId', classGroupId);
	await apiClient.patch(url, input);
};

export const editClassGroupMutationOptions = () =>
	mutationOptions<void, AxiosError<BaseErrorResponse>, { classGroupId: string } & EditClassGroupInput>({
		mutationKey: ['edit-class-group'],
		mutationFn: ({ classGroupId, ...input }) => editClassGroup(classGroupId, input)
	});
