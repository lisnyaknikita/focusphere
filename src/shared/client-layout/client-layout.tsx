'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import { BetaWelcomeContent } from '../ui/beta-welcome-content/beta-welcome-content'
import { Modal } from '../ui/modal/modal'
import classes from './client-layout.module.scss'

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
	const [isLoading, setIsLoading] = useState(true)
	const [isWelcomeVisible, setIsWelcomeVisible] = useState(false)

	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						refetchOnWindowFocus: false,
						retry: 1,
					},
				},
			})
	)

	useEffect(() => {
		const timer = setTimeout(() => setIsLoading(false), 200)
		return () => clearTimeout(timer)
	}, [])

	useEffect(() => {
		const hasSeenWelcome = localStorage.getItem('focusphere_welcome_seen')

		if (!hasSeenWelcome) {
			setIsWelcomeVisible(true)
		}
	}, [])

	const handleCloseWelcome = () => {
		setIsWelcomeVisible(false)
		localStorage.setItem('focusphere_welcome_seen', 'true')
	}

	return (
		<QueryClientProvider client={queryClient}>
			<div className={classes.wrapper}>
				{children}
				{isLoading && (
					<div className='main-loader'>
						<BeatLoader color='#aaa' size={14} />
					</div>
				)}
			</div>
			<Modal isVisible={isWelcomeVisible} onClose={handleCloseWelcome}>
				<BetaWelcomeContent onConfirm={handleCloseWelcome} />
			</Modal>
		</QueryClientProvider>
	)
}
