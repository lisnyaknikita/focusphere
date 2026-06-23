import { db } from '@/lib/appwrite'
import { Project } from '@/shared/types/project'
import { getCurrentUserId } from '@/shared/utils/get-current-userid/get-current-userid'
import { useQuery } from '@tanstack/react-query'
import { Query } from 'appwrite'

const LIMIT = 12

const fetchProjects = async (type: 'solo' | 'team', searchQuery: string, page: number, favoritesOnly: boolean) => {
	const userId = await getCurrentUserId()
	if (!userId) return { rows: [], total: 0 }

	const offset = (page - 1) * LIMIT
	const queries = [Query.equal('type', type), Query.orderDesc('$createdAt'), Query.limit(LIMIT), Query.offset(offset)]

	if (type === 'solo') queries.push(Query.equal('ownerId', userId))
	if (favoritesOnly) queries.push(Query.equal('isFavorite', true))

	if (searchQuery.trim()) {
		queries.push(Query.or([Query.contains('title', searchQuery), Query.contains('description', searchQuery)]))
	}

	const response = await db.listRows({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: process.env.NEXT_PUBLIC_TABLE_PROJECTS!,
		queries,
	})

	return {
		rows: response.rows as unknown as Project[],
		total: response.total,
	}
}

export const useProjects = (
	type: 'solo' | 'team' | null,
	searchQuery: string = '',
	page: number = 1,
	favoritesOnly: boolean = false
) => {
	const { data, isLoading, isFetching, refetch } = useQuery({
		queryKey: ['projects', type, searchQuery, page, favoritesOnly],
		queryFn: () => fetchProjects(type!, searchQuery, page, favoritesOnly),
		enabled: !!type,
		placeholderData: previousData => previousData,
	})

	return {
		projects: data?.rows ?? [],
		total: data?.total ?? 0,
		limit: LIMIT,
		isLoading,
		isFetching,
		refreshProjects: async () => {
			await refetch()
		},
	}
}
