import { BOOKING_ENDPOINTS } from '@pikslots/shared';
import type { BaseErrorResponse, EditBookingRequest, EditBookingResponse } from '@pikslots/shared';
import { apiClient } from '$lib/http/axios.js';
import { mutationOptions } from '@tanstack/svelte-query';
import type { AxiosError } from 'axios';
import type { PikslotResponse } from '../common/common-models';

export const editBooking = async (
	bookingId: string,
	input: EditBookingRequest
): Promise<EditBookingResponse> => {
	const url = BOOKING_ENDPOINTS.EDIT.replace(':bookingId', bookingId);
	const { data } = await apiClient.patch<PikslotResponse<EditBookingResponse>>(url, input);
	return data.data;
};

export const editBookingMutationOptions = () =>
	mutationOptions<
		EditBookingResponse,
		AxiosError<BaseErrorResponse>,
		{ bookingId: string; input: EditBookingRequest }
	>({
		mutationKey: ['edit-booking'],
		mutationFn: ({ bookingId, input }) => editBooking(bookingId, input)
	});
