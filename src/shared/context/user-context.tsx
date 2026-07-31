'use client'

import { account } from '@/lib/appwrite'
import { CustomUser } from '@/shared/types/custom-appwrite'
import { AppwriteException } from 'appwrite'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface UserContextType {
	user: CustomUser | null
	isGoogleConnected: boolean
	loading: boolean
	isLoggingOut: boolean
	logout: () => Promise<void>
	updateUserData: (updatedFields: Partial<CustomUser>) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<CustomUser | null>(null)
	const [isGoogleConnected, setIsGoogleConnected] = useState(false)
	const [loading, setLoading] = useState(true)
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	useEffect(() => {
		const getUser = async () => {
			try {
				const currentUser = (await account.get()) as CustomUser
				const session = await account.getSession('current')

				setIsGoogleConnected(session.provider === 'google')

				setUser(currentUser)
			} catch (error: unknown) {
				if (error instanceof AppwriteException) {
					console.log('Appwrite Error during user retrieval:', error.message)
				} else if (error instanceof Error) {
					console.error('General Error during user retrieval:', error.message)
				} else {
					console.error('An unexpected error occurred.')
				}

				setUser(null)
			} finally {
				setLoading(false)
			}
		}

		getUser()
	}, [])

	useEffect(() => {
		const handleUserUpdate = (e: Event) => {
			const customEvent = e as CustomEvent<Partial<CustomUser>>
			setUser(current => {
				if (!current) return null
				return { ...current, ...customEvent.detail }
			})
		}

		window.addEventListener('user-updated', handleUserUpdate)
		return () => window.removeEventListener('user-updated', handleUserUpdate)
	}, [])

	const updateUserData = (updatedFields: Partial<CustomUser>) => {
		window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedFields }))
	}

	const logout = async () => {
		try {
			setIsLoggingOut(true)
			await account.deleteSession({ sessionId: 'current' })
			window.location.href = '/login'
		} catch (error) {
			console.error('Logout error:', error)
			setIsLoggingOut(false)
		}
	}

	return (
		<UserContext.Provider value={{ user, loading, logout, updateUserData, isGoogleConnected, isLoggingOut }}>
			{children}
		</UserContext.Provider>
	)
}

export const useUserFromContext = () => {
	const context = useContext(UserContext)
	if (!context) throw new Error('useUserFromContext must be used within UserProvider')
	return context
}
