import { BOOKING_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { FindBookingByIdResponse } from '@pikslots/shared';
import type { PikslotResponse } from '../common/common-models';

export const getBookingById = async (bookingId: string): Promise<FindBookingByIdResponse> => {
	const url = BOOKING_ENDPOINTS.FIND_BY_ID.replace(':bookingId', bookingId);
	const { data } = await apiClient.get<PikslotResponse<FindBookingByIdResponse>>(url);
	return data.data;
};

export const getBookingByIdQueryOptions = (bookingId: string, enabled: boolean = true) =>
	queryOptions({
		queryKey: ['booking-by-id', bookingId],
		queryFn: () => getBookingById(bookingId),
		enabled: enabled && !!bookingId
	});
