import { db } from '@/lib/appwrite'
import { Project } from '@/shared/types/project'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { Query } from 'appwrite'
import { useCallback, useEffect, useState } from 'react'

export const useProjects = (type: 'solo' | 'team', searchQuery: string = '') => {
	const [projects, setProjects] = useState<Project[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const getProjects = useCallback(async () => {
		setIsLoading(true)
		try {
			const userId = await getCurrentUserId()
			if (!userId) return

			const queries = [Query.equal('type', type), Query.orderDesc('$createdAt')]

			if (type === 'solo') {
				queries.push(Query.equal('ownerId', userId))
			}

			if (searchQuery.trim()) {
				queries.push(Query.contains('title', searchQuery))
			}

			const response = await db.listRows({
				databaseId: process.env.NEXT_PUBLIC_DB_ID!,
				tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
				queries: queries,
			})

			setProjects(response.rows as unknown as Project[])
		} catch (error) {
			console.error('Error fetching projects:', error)
		} finally {
			setIsLoading(false)
		}
	}, [type, searchQuery])

	useEffect(() => {
		getProjects()
	}, [getProjects])

	return {
		projects,
		isLoading,
		refreshProjects: getProjects,
	}
}
