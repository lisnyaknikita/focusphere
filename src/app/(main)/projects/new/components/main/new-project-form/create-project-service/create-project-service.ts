import { account, ID, teams } from '@/lib/appwrite'
import { CALENDAR_COLORS } from '@/lib/events/calendar-config'
import { createProject } from '@/lib/projects/projects'
import { ProjectFormValues } from '@/shared/schemas/project-schema'

export async function createNewProject(data: ProjectFormValues) {
	const user = await account.get()
	let teamId: string | undefined = undefined

	if (data.type === 'team') {
		const team = await teams.create(ID.unique(), data.title)
		teamId = team.$id
	}

	const newProject = await createProject({
		title: data.title,
		type: data.type,
		color: CALENDAR_COLORS.GOLD,
		ownerId: user.$id,
		teamId: teamId,
	})

	return newProject
}
