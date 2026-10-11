import z from 'zod';

export const EditBookingSchema = z
	.object({
		serviceId: z.string().min(1, 'Please select a service'),
		customerId: z.string().min(1, 'Please select a customer'),
		startTime: z.string().min(1, 'Start time is required'),
		endTime: z.string().min(1, 'End time is required')
	})
	.refine((data) => data.endTime > data.startTime, {
		message: 'End time must be after start time',
		path: ['endTime']
	});

export type EditBookingSchemaType = z.infer<typeof EditBookingSchema>;
