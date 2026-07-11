'use client'

import { useUserFromContext } from '@/shared/context/user-context'

export const useUser = () => {
	return useUserFromContext()
}
