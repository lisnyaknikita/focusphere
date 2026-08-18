import { merriweather } from '@/shared/fonts/font-merriweather'
import { useQuote } from '@/shared/hooks/quotes/useQuote'
import { BeatLoader } from 'react-spinners'
import classes from './quotes-view.module.scss'

export const QuotesView = () => {
	const { quote, isLoading } = useQuote()

	return (
		<div className={`${classes.quotes} ${merriweather.className}`}>
			{isLoading || !quote ? (
				<BeatLoader color='#aaa' size={10} className={classes.loader} />
			) : (
				<>
					<blockquote className={classes.quoteContent}>{`"${quote.content}"`}</blockquote>
					<div className={classes.quoteAuthor}>{quote.author}</div>
				</>
			)}
		</div>
	)
}
