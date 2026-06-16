import { useEffect, useRef, useState } from 'react'

export const useSectionHeight = (ratio: number = 0.75) => {
	const sectionRef = useRef<HTMLDivElement | null>(null)

	const [listHeight, setListHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight * ratio : 0))

	useEffect(() => {
		const updateHeight = () => {
			if (sectionRef.current) {
				const sectionHeight = sectionRef.current.offsetHeight
				if (sectionHeight > 0) {
					setListHeight(sectionHeight * ratio)
				}
			}
		}

		updateHeight()

		window.addEventListener('resize', updateHeight)

		const observer = new ResizeObserver(() => {
			updateHeight()
		})

		if (sectionRef.current) {
			observer.observe(sectionRef.current)
		}

		return () => {
			window.removeEventListener('resize', updateHeight)
			observer.disconnect()
		}
	}, [ratio])

	return { sectionRef, listHeight }
}
