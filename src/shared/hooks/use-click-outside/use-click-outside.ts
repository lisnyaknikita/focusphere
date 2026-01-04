import { useEffect, useRef } from 'react'

export const useClickOutside = <T extends HTMLElement>(callback: () => void, isEnabled: boolean = true) => {
	const ref = useRef<T>(null)

	useEffect(() => {
		if (!isEnabled) return

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node
			if (ref.current && !ref.current.contains(target)) {
				callback()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [callback, isEnabled])

	return ref
}
