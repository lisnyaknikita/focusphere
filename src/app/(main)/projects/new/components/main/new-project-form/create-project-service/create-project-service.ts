import { account } from '@/lib/appwrite'
import { createProject } from '@/lib/projects/projects'
import { ProjectFormValues } from '@/shared/schemas/project-schema'

export async function createNewProject(data: ProjectFormValues) {
	const user = await account.get()

	const newProject = await createProject({
		title: data.title,
		type: data.type,
		ownerId: user.$id,
	})

	return newProject
}
