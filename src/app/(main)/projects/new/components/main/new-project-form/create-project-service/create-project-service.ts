import { account, ID, teams } from '@/lib/appwrite'
import { CALENDAR_COLORS } from '@/lib/events/calendar-config'
import { createProject } from '@/lib/projects/projects'
import { ProjectFormValues } from '@/shared/schemas/project-schema'

const generateProjectPrefix = (title: string) => {
	const cleanTitle = title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '')
	return (cleanTitle.substring(0, 3) || 'PRJ').toUpperCase()
}

export async function createNewProject(data: ProjectFormValues) {
	const user = await account.get()
	let teamId: string | undefined = undefined

	if (data.type === 'team') {
		const team = await teams.create(ID.unique(), data.title)
		teamId = team.$id
	}

	const prefix = generateProjectPrefix(data.title)

	const newProject = await createProject({
		title: data.title,
		type: data.type,
		color: CALENDAR_COLORS.GOLD,
		ownerId: user.$id,
		teamId: teamId,
		prefix,
		taskCounter: 0,
	})

	return newProject
}
