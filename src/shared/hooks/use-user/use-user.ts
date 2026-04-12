import { account } from '@/lib/appwrite'
import { CustomUser } from '@/shared/types/custom-appwrite'
import { ensureDefaultAvatar } from '@/shared/utils/ensure-default-avatar/ensure-default-avatar'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

const fetchCurrentUser = async (): Promise<CustomUser | null> => {
	try {
		let currentUser = (await account.get()) as CustomUser

		if (!currentUser.prefs?.avatarId) {
			const avatarId = await ensureDefaultAvatar()
			currentUser = {
				...currentUser,
				prefs: { ...currentUser.prefs, avatarId },
			}
		}
		return currentUser
	} catch (error) {
		console.error(error)
		return null
	}
}

export const useUser = () => {
	const queryClient = useQueryClient()
	const router = useRouter()

	const { data: user, isLoading } = useQuery({
		queryKey: ['user'],
		queryFn: fetchCurrentUser,
		staleTime: 1000 * 60 * 60,
		retry: false,
	})

	const updateUserData = (updatedFields: Partial<CustomUser>) => {
		queryClient.setQueryData(['user'], (old: CustomUser | null) => {
			if (!old) return null
			return { ...old, ...updatedFields }
		})
	}

	const logoutMutation = useMutation({
		mutationFn: () => account.deleteSession({ sessionId: 'current' }),
		onSuccess: () => {
			queryClient.setQueryData(['user'], null)
			router.push('/login')
		},
	})

	return { user, loading: isLoading, logout: logoutMutation.mutate, updateUserData }
}
