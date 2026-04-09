import { z } from 'zod'

export const teamInvitationSchema = z.object({
	members: z.array(
		z.object({
			email: z.string().email('Invalid email address'),
		})
	),
	currentInput: z.string().optional(),
})

export type TeamInvitationValues = z.infer<typeof teamInvitationSchema>
