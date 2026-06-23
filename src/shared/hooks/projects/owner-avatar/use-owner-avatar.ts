import { db, storage } from '@/lib/appwrite'
import { useQuery } from '@tanstack/react-query'

const fetchAvatar = async (userId: string) => {
	if (!userId) return '/avatar.jpg'

	const profile = await db.getRow({
		databaseId: process.env.NEXT_PUBLIC_DB_ID!,
		tableId: 'profiles',
		rowId: userId,
	})

	if (profile?.avatarId) {
		return storage.getFileView(process.env.NEXT_PUBLIC_AVATAR_BUCKET_ID!, profile.avatarId)
	}

	return '/avatar.jpg'
}

export const useOwnerAvatar = (userId: string) => {
	const { data, isLoading } = useQuery({
		queryKey: ['owner-avatar', userId],
		queryFn: () => fetchAvatar(userId),
		staleTime: Infinity,
		gcTime: 1000 * 60 * 60,
	})

	return {
		avatarUrl: data ?? '/avatar.jpg',
		isLoading,
	}
}
