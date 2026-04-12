'use client'

import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'
import classes from './client-layout.module.scss'

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const timer = setTimeout(() => setIsLoading(false), 200)
		return () => clearTimeout(timer)
	}, [])

	return (
		<div className={classes.wrapper}>
			{children}
			{isLoading && (
				<div className='main-loader'>
					<BeatLoader color='#aaa' size={14} />
				</div>
			)}
		</div>
	)
}
