import { z } from 'zod'

const passwordRequirement = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)

export const signupSchema = z.object({
	fullName: z
		.string()
		.min(1, 'Full name must be at least 1 character long.')
		.max(100, 'Full name cannot exceed 100 characters.')
		.trim(),

	email: z.email('Invalid email address format.').max(254, 'Email address is too long.'),

	password: z
		.string()
		.min(8, 'Password must be at least 8 characters.')
		.regex(passwordRequirement, 'Password must contain at least one letter and one number.'),
})

export type SignupFormValues = z.infer<typeof signupSchema>
