'use client'

import { BeatLoader } from 'react-spinners'

import classes from './quotes.module.scss'

import { useQuote } from '@/shared/hooks/quotes/useQuote'
import { Merriweather } from 'next/font/google'

export const merriweather = Merriweather({
	subsets: ['latin'],
	weight: ['400', '700'],
	variable: '--font-merriweather',
	display: 'swap',
})

export const QuotesBlock = () => {
	const { quote, isLoading } = useQuote()

	return (
		<section className={`${classes.quotes} ${merriweather.className}`}>
			{isLoading || !quote ? (
				<BeatLoader color='#fff' size={10} className={classes.loader} />
			) : (
				<>
					<blockquote className={classes.quoteContent}>{quote.content}</blockquote>
					<div className={classes.quoteAuthor}>{quote.author}</div>
				</>
			)}
		</section>
	)
}
//TODO: change the approach of getting quote font, commit
