import { db, storage } from '@/lib/appwrite'
import { useQuery } from '@tanstack/react-query'

const fetchAvatar = async (userId: string) => {
	if (!userId) return null

	try {
		const profile = await db.getRow({
			databaseId: process.env.NEXT_PUBLIC_DB_ID!,
			tableId: 'profiles',
			rowId: userId,
		})

		if (profile?.avatarId) {
			return storage.getFileView(process.env.NEXT_PUBLIC_AVATAR_BUCKET_ID!, profile.avatarId) as string
		}
	} catch (e) {
		console.log(e)
	}

	return null
}

export const useOwnerAvatar = (userId: string) => {
	const { data, isLoading } = useQuery({
		queryKey: ['owner-avatar', userId],
		queryFn: () => fetchAvatar(userId),
		staleTime: 5 * 60 * 1000,
		gcTime: 1000 * 60 * 60,
	})

	return {
		avatarUrl: data ?? null,
		isLoading,
	}
}
