import { z } from 'zod'

export const projectSchema = z.object({
	title: z.string().min(3, 'Title must be at least 3 characters').max(50, 'Title is too long').trim(),
	type: z.enum(['solo', 'team'], {
		message: 'Please select a project type',
	}),
	description: z.string().max(200, 'Description is too long').optional(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
