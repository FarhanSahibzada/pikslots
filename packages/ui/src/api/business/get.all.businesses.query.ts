import type { BaseResponse, GetAllBusinessesResponse } from '@pikslots/shared';
import { BUSINESS_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';

export const getAllBusinesses = async (): Promise<GetAllBusinessesResponse> => {
	const { data } = await apiClient.get<BaseResponse<GetAllBusinessesResponse>>(
		BUSINESS_ENDPOINTS.GET_ALL
	);
	return data.data;
};

export const getAllBusinessesQueryOptions = () =>
	queryOptions({
		queryKey: ['businesses'],
		queryFn: getAllBusinesses
	});
