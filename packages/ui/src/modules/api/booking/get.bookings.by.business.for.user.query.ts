import { BOOKING_ENDPOINTS } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { queryOptions } from '@tanstack/svelte-query';
import type { FindAllBookingsByBusinessForUserResponse } from '@pikslots/shared';
import type { PikslotResponse } from '../common/common-models';

export const getBookingsByBusinessForUser = async (
	businessId: string,
	userId: string,
	startDateTime: string,
	endDateTime: string,
	timezone: string
): Promise<FindAllBookingsByBusinessForUserResponse> => {
	const url = BOOKING_ENDPOINTS.FIND_ALL_BY_BUSINESS_FOR_USER.replace(
		':businessId',
		businessId
	).replace(':userId', userId);

	const params = new URLSearchParams({
		startDateTime,
		endDateTime,
		timezone
	});

	const { data } = await apiClient.get<PikslotResponse<FindAllBookingsByBusinessForUserResponse>>(
		`${url}?${params.toString()}`
	);

	return data.data;
};

export const getBookingsByBusinessForUserQueryOptions = (
	businessId: string,
	userId: string,
	startDateTime: string,
	endDateTime: string,
	timezone: string
) =>
	queryOptions({
		queryKey: [
			'bookings-by-business-for-user',
			businessId,
			userId,
			startDateTime,
			endDateTime,
			timezone
		],
		queryFn: () =>
			getBookingsByBusinessForUser(businessId, userId, startDateTime, endDateTime, timezone)
	});
