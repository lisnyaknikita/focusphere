import { db } from '@/lib/appwrite'
import { Project } from '@/shared/types/project'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useCallback, useEffect, useState } from 'react'

export const useProjects = (
	type: 'solo' | 'team',
	searchQuery: string = '',
	page: number = 1,
	favoritesOnly: boolean = false
) => {
	const [projects, setProjects] = useState<Project[]>([])
	const [total, setTotal] = useState(0)
	const [isLoading, setIsLoading] = useState(true)

	const limit = 9

	const getProjects = useCallback(async () => {
		setIsLoading(true)
		try {
			const userId = await getCurrentUserId()
			if (!userId) return

			const offset = (page - 1) * limit
			const queries = [
				Query.equal('type', type),
				Query.orderDesc('$createdAt'),
				Query.limit(limit),
				Query.offset(offset),
			]

			if (type === 'solo') {
				queries.push(Query.equal('ownerId', userId))
			}

			if (searchQuery.trim()) {
				queries.push(Query.contains('title', searchQuery))
			}

			if (favoritesOnly) {
				queries.push(Query.equal('isFavorite', true))
			}

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
				queries: queries,
			})

			setProjects(response.rows as unknown as Project[])
			setTotal(response.total)
		} catch (error) {
			console.error('Error fetching projects:', error)
		} finally {
			setIsLoading(false)
		}
	}, [type, searchQuery, page, favoritesOnly])

	useEffect(() => {
		getProjects()
	}, [getProjects])

	return {
		projects,
		total,
		limit,
		isLoading,
		refreshProjects: getProjects,
	}
}
