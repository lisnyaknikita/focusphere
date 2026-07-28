'use client'

import { createQuickIdea, deleteQuickIdea, getQuickIdeas, updateQuickIdea } from '@/lib/quick-ideas/quick-ideas'
import { QuickIdea } from '@/shared/types/quick-idea'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

export const useQuickIdeas = () => {
	const queryClient = useQueryClient()
	const [userId, setUserId] = useState<string | null>(null)
	const [newIdeaText, setNewIdeaText] = useState('')
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		getCurrentUserId().then(setUserId)
	}, [])

	const {
		data: ideas = [],
		isLoading,
		isFetched,
		refetch: refetchIdeas,
	} = useQuery<QuickIdea[]>({
		queryKey: ['quick-ideas', userId],
		queryFn: async () => {
			if (!userId) return []
			return await getQuickIdeas(userId)
		},
		enabled: !!userId,
	})

	const handleAddIdea = useCallback(
		async (textToSave?: string) => {
			const text = textToSave ?? newIdeaText
			const trimmedText = text.trim()

			if (!trimmedText || !userId) return

			try {
				setIsSaving(true)
				const newIdea = await createQuickIdea({
					text: trimmedText,
					userId,
				})

				queryClient.setQueryData<QuickIdea[]>(['quick-ideas', userId], (prev = []) => [newIdea, ...prev])
				setNewIdeaText('')
			} catch (error) {
				console.error('Failed to create quick idea:', error)
				throw error
			} finally {
				setIsSaving(false)
			}
		},
		[newIdeaText, userId, queryClient]
	)

	const handleEditIdea = useCallback(
		async (ideaId: string, newText: string) => {
			const trimmed = newText.trim()
			if (!trimmed || !userId) return

			const previousIdeas = queryClient.getQueryData<QuickIdea[]>(['quick-ideas', userId]) ?? []

			queryClient.setQueryData<QuickIdea[]>(['quick-ideas', userId], (prev = []) =>
				prev.map(item => (item.$id === ideaId ? { ...item, text: trimmed } : item))
			)

			try {
				await updateQuickIdea(ideaId, { text: trimmed })
			} catch (error) {
				console.error('Failed to edit quick idea:', error)
				queryClient.setQueryData(['quick-ideas', userId], previousIdeas)
			}
		},
		[userId, queryClient]
	)

	const handleDeleteIdea = useCallback(
		async (ideaId: string) => {
			if (!userId) return

			const previousIdeas = queryClient.getQueryData<QuickIdea[]>(['quick-ideas', userId]) ?? []

			queryClient.setQueryData<QuickIdea[]>(['quick-ideas', userId], (prev = []) =>
				prev.filter(item => item.$id !== ideaId)
			)

			try {
				await deleteQuickIdea(ideaId)
			} catch (error) {
				console.error('Failed to delete quick idea:', error)
				queryClient.setQueryData(['quick-ideas', userId], previousIdeas)
			}
		},
		[userId, queryClient]
	)

	return {
		ideas,
		isLoading,
		isFetched,
		newIdeaText,
		setNewIdeaText,
		isSaving,
		handleAddIdea,
		handleEditIdea,
		handleDeleteIdea,
		refetchIdeas,
	}
}
