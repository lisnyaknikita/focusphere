import { z } from 'zod'

export const projectSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters').max(50, 'Title is too long').trim(),
	type: z.enum(['solo', 'team'], {
		message: 'Please select a project type',
	}),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
