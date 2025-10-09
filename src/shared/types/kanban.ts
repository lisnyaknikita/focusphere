export type Column = {
	id: string
	title: string
}

export type Task = {
	id: string
	title: string
	description: string
	assignee: string
	createdAt: string
	columnId: string
}
