import z from 'zod';

export const InviteOwnerFormSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	username: z.string().min(3, 'Username must be at least 3 characters'),
	email: z.string().min(1, 'Email is required').email('Invalid email address'),
	phone: z.string().optional()
});

const INDUSTRIES = [
	'salon_and_beauty',
	'health_and_wellness',
	'fitness',
	'medical',
	'education',
	'legal',
	'financial',
	'hospitality',
	'retail',
	'other'
] as const;

export const CreateBusinessFormSchema = z.object({
	ownerId: z.string().min(1, 'Please select a business owner'),
	businessName: z.string().min(1, 'Business name is required'),
	slug: z
		.string()
		.min(1, 'Slug is required')
		.regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens'),
	industry: z.enum(INDUSTRIES, { error: 'Please select an industry' }),
	defaultTimeZone: z.string().optional()
});
