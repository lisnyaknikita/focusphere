import {
	completeSprint,
	createSprint,
	deleteSprint,
	getSprints,
	startSprint,
	updateSprint,
} from '@/lib/projects/sprints/sprints'
import { CreateSprintPayload, Sprint } from '@/shared/types/sprint'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'

export const useSprints = (projectId: string | undefined) => {
	const queryClient = useQueryClient()

	const { data: sprints = [], isLoading } = useQuery<Sprint[]>({
		queryKey: ['sprints', projectId],
		queryFn: async () => {
			if (!projectId) return []
			const res = await getSprints(projectId)
			return (res?.rows || []) as unknown as Sprint[]
		},
		enabled: !!projectId,
		staleTime: 5000,
		retry: 1,
		refetchOnWindowFocus: true,
	})

	const activeSprint = useMemo(() => sprints.find(s => s.status === 'active'), [sprints])

	const plannedSprints = useMemo(() => sprints.filter(s => s.status === 'planned'), [sprints])

	const completedSprints = useMemo(() => sprints.filter(s => s.status === 'completed'), [sprints])

	const createSprintMutation = useMutation({
		mutationFn: (payload: CreateSprintPayload) => createSprint(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
			toast.success('Sprint created')
		},
		onError: err => {
			console.error(err)
			toast.error('Failed to create sprint')
		},
	})

	const startSprintMutation = useMutation({
		mutationFn: (sprintId: string) => startSprint(projectId!, sprintId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
			toast.success('Sprint started!')
		},
		onError: err => {
			console.error(err)
			toast.error('Failed to start sprint')
		},
	})

	const completeSprintMutation = useMutation({
		mutationFn: (sprintId: string) => completeSprint(sprintId, projectId!),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
			queryClient.invalidateQueries({ queryKey: ['kanban-tasks', projectId] })
			toast.success('Sprint completed and cleared!')
		},
		onError: err => {
			console.error(err)
			toast.error('Failed to complete sprint')
		},
	})

	const updateSprintMutation = useMutation({
		mutationFn: ({ sprintId, data }: { sprintId: string; data: Partial<CreateSprintPayload> }) =>
			updateSprint(sprintId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
			toast.success('Sprint updated')
		},
		onError: err => {
			console.error(err)
			toast.error('Failed to update sprint')
		},
	})

	const deleteSprintMutation = useMutation({
		mutationFn: (sprintId: string) => deleteSprint(sprintId, projectId!),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['sprints', projectId] })
			queryClient.invalidateQueries({ queryKey: ['kanban-tasks', projectId] })
			toast.success('Sprint deleted')
		},
		onError: err => {
			console.error(err)
			toast.error('Failed to delete sprint')
		},
	})

	return {
		sprints,
		activeSprint,
		plannedSprints,
		completedSprints,
		isLoading,
		createSprint: createSprintMutation.mutateAsync,
		startSprint: startSprintMutation.mutateAsync,
		completeSprint: completeSprintMutation.mutateAsync,
		updateSprint: updateSprintMutation.mutateAsync,
		deleteSprint: deleteSprintMutation.mutateAsync,
	}
}
