'use client'

import { BeatLoader } from 'react-spinners'

import classes from './quotes.module.scss'

import { merriweather } from '@/shared/fonts/font-merriweather'
import { useQuote } from '@/shared/hooks/quotes/useQuote'

export const QuotesBlock = () => {
	const { quote, isLoading } = useQuote()

	return (
		<section className={`${classes.quotes} ${merriweather.className}`}>
			{isLoading || !quote ? (
				<BeatLoader color='#aaa' size={10} className={classes.loader} />
			) : (
				<>
					<blockquote className={classes.quoteContent}>{`"${quote.content}"`}</blockquote>
					<div className={classes.quoteAuthor}>{quote.author}</div>
				</>
			)}
		</section>
	)
}
