import z from 'zod';

export const CreateBookingSchema = z
	.object({
		serviceId: z.string().min(1, 'Please select a service'),
		classId: z.string().default(''),
		customerId: z.string().min(1, 'Please select a customer'),
		startTime: z.string().min(1, 'Start time is required'),
		endTime: z.string().min(1, 'End time is required'),
		label: z.string().max(50, 'Label must be 50 characters or less').optional().or(z.literal(''))
	})
	.refine((data) => data.endTime > data.startTime, {
		message: 'End time must be after start time',
		path: ['endTime']
	});

export type CreateBookingSchemaType = z.infer<typeof CreateBookingSchema>;
