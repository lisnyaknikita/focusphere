'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './client-layout.module.scss'

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
	const [isLoading, setIsLoading] = useState(true)

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
		</QueryClientProvider>
	)
}
