import { SERVICE_GROUP_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse, EditServiceGroupInput } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';

export const editServiceGroup = async (
	serviceGroupId: string,
	input: EditServiceGroupInput
): Promise<void> => {
	const url = SERVICE_GROUP_ENDPOINTS.EDIT.replace(':serviceGroupId', serviceGroupId);
	await apiClient.patch(url, input);
};

export const editServiceGroupMutationOptions = () =>
	mutationOptions<
		void,
		AxiosError<BaseErrorResponse>,
		{ serviceGroupId: string } & EditServiceGroupInput
	>({
		mutationKey: ['edit-service-group'],
		mutationFn: ({ serviceGroupId, ...input }) => editServiceGroup(serviceGroupId, input)
	});
