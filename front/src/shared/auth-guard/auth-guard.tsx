'use client'

import { useUser } from '@/shared/hooks/use-user/use-user'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

interface AuthGuardProps {
	children: React.ReactNode
}

const LOGIN_PATH = '/login'

export const AuthGuard = ({ children }: AuthGuardProps) => {
	const { user, loading } = useUser()
	const router = useRouter()
	const pathname = usePathname()

	useEffect(() => {
		if (loading) {
			return
		}

		if (!user) {
			if (pathname !== LOGIN_PATH) {
				router.replace(LOGIN_PATH)
			}
		}
	}, [user, loading, router, pathname])

	if (loading || !user) {
		return null
	}

	return <>{children}</>
}
