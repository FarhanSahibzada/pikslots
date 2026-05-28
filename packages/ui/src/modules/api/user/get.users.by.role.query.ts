import { USER_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { UserByRoleInput, UserByRoleResult } from './models/user-model';
import type { PikslotResponse } from '../common/common-models';

export const getUsersByRole = async (input: UserByRoleInput): Promise<UserByRoleResult> => {
	const { data } = await apiClient.get<PikslotResponse<UserByRoleResult>>(USER_ENDPOINTS.BY_ROLE, {
		params: { role: input.role }
	});
	return data.data;
};

export const getUsersByRoleQueryOptions = (input: UserByRoleInput) =>
	queryOptions({
		queryKey: ['users', 'by-role', input.role],
		queryFn: () => getUsersByRole(input)
	});
