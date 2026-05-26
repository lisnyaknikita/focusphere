export const statusLabels: Record<string, string> = {
	todo: 'To Do',
	inprogress: 'In Progress',
	done: 'Done',
	backlog: 'Backlog',
}

export const statusColors: Record<string, { bg: string; text: string; border: string }> = {
	todo: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)' },
	inprogress: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
	done: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
	backlog: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.2)' },
}

export const priorityLabels: Record<string, string> = {
	low: 'Low',
	medium: 'Medium',
	high: 'High',
	urgent: 'Urgent',
}

export const priorityColors: Record<string, string> = {
	low: '#A3A3A3',
	medium: '#FBBF24',
	high: '#F97316',
	urgent: '#DC2626',
}
