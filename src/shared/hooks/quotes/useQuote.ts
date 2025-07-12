import { useEffect, useState } from 'react'

interface Quote {
	content: string
	author: string
}

export const useQuote = () => {
	const [quote, setQuote] = useState<Quote | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	const fetchQuote = async () => {
		try {
			const res = await fetch('https://api.realinspire.live/v1/quotes/random')
			const data = await res.json()
			setQuote({ content: data[0].content, author: data[0].author })
		} catch (e) {
			console.error('Failed to fetch quote:', e)
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		fetchQuote()
	}, [])

	return { quote, isLoading }
}
