import z from 'zod';

export const AddCustomerSchema = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string(),
	countryCode: z.string(),
	phone: z.string(),
	email: z.string().email('Invalid email').or(z.literal('')),
	company: z.string(),
	country: z.string(),
	address: z.string(),
	city: z.string(),
	state: z.string(),
	zipCode: z.string(),
	additionalPhone: z.string(),
	additionalEmail: z.string().email('Invalid email').or(z.literal('')),
	website: z.string(),
	instagram: z.string(),
	facebook: z.string(),
	x: z.string(),
	youtube: z.string(),
	linkedin: z.string()
});
