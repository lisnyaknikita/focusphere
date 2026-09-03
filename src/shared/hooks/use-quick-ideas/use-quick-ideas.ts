'use client'

import { createQuickIdea, deleteQuickIdea, getQuickIdeas, updateQuickIdea } from '@/lib/quick-ideas/quick-ideas'
import { QuickIdea } from '@/shared/types/quick-idea'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useUser } from '../use-user/use-user'

export const useQuickIdeas = () => {
	const queryClient = useQueryClient()
	const { user } = useUser()
	const userId = user?.$id

	const queryKey = ['quick-ideas', userId]

	const {
		data: ideas = [],
		isLoading,
		isFetched,
		refetch: refetchIdeas,
	} = useQuery<QuickIdea[]>({
		queryKey,
		queryFn: () => getQuickIdeas(userId!),
		enabled: !!userId,
	})

	const addMutation = useMutation({
		mutationFn: (text: string) => createQuickIdea({ text, userId: userId! }),
		onSuccess: newIdea => {
			queryClient.setQueryData<QuickIdea[]>(queryKey, (prev = []) => [newIdea, ...prev])
		},
	})

	const editMutation = useMutation({
		mutationFn: ({ ideaId, text }: { ideaId: string; text: string }) => updateQuickIdea(ideaId, { text }),
		onMutate: async ({ ideaId, text }) => {
			await queryClient.cancelQueries({ queryKey })
			const previousIdeas = queryClient.getQueryData<QuickIdea[]>(queryKey) ?? []

			queryClient.setQueryData<QuickIdea[]>(queryKey, (prev = []) =>
				prev.map(item => (item.$id === ideaId ? { ...item, text } : item))
			)

			return { previousIdeas }
		},
		onError: (_, __, context) => {
			if (context?.previousIdeas) {
				queryClient.setQueryData(queryKey, context.previousIdeas)
			}
		},
	})

	const deleteMutation = useMutation({
		mutationFn: (ideaId: string) => deleteQuickIdea(ideaId),
		onMutate: async ideaId => {
			await queryClient.cancelQueries({ queryKey })
			const previousIdeas = queryClient.getQueryData<QuickIdea[]>(queryKey) ?? []

			queryClient.setQueryData<QuickIdea[]>(queryKey, (prev = []) => prev.filter(item => item.$id !== ideaId))

			return { previousIdeas }
		},
		onError: (_, __, context) => {
			if (context?.previousIdeas) {
				queryClient.setQueryData(queryKey, context.previousIdeas)
			}
		},
	})

	const handleAddIdea = useCallback(
		async (text: string) => {
			await addMutation.mutateAsync(text)
		},
		[addMutation]
	)

	const handleEditIdea = useCallback(
		async (ideaId: string, text: string) => {
			await editMutation.mutateAsync({ ideaId, text })
		},
		[editMutation]
	)

	const handleDeleteIdea = useCallback(
		async (ideaId: string) => {
			await deleteMutation.mutateAsync(ideaId)
		},
		[deleteMutation]
	)

	return {
		ideas,
		isLoading,
		isFetched,
		isSaving: addMutation.isPending,
		handleAddIdea,
		handleEditIdea,
		handleDeleteIdea,
		refetchIdeas,
	}
}
