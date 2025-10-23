import { useEffect, useRef, useState } from 'react'

export const useSectionHeight = (ratio: number = 0.75) => {
	const sectionRef = useRef<HTMLDivElement | null>(null)
	const [listHeight, setListHeight] = useState(0)

	useEffect(() => {
		const updateHeight = () => {
			if (sectionRef.current) {
				const sectionHeight = sectionRef.current.offsetHeight
				setListHeight(sectionHeight * ratio)
			}
		}

		updateHeight()
		window.addEventListener('resize', updateHeight)
		return () => window.removeEventListener('resize', updateHeight)
	}, [ratio])

	return { sectionRef, listHeight }
}
