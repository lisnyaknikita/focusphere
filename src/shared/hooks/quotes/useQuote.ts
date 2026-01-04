import { quotes } from '@/shared/quotes'
import { useEffect, useState } from 'react'

interface Quote {
	content: string
	author: string
}

export const useQuote = () => {
	const [quote, setQuote] = useState<Quote | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * quotes.length)
		const q = quotes[randomIndex]

		setQuote({ content: q.text, author: q.author })
		setIsLoading(false)
	}, [])

	return { quote, isLoading }
}
