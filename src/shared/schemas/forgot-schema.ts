import * as z from 'zod'

export const forgotSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
})

export type ForgotFormValues = z.infer<typeof forgotSchema>
