// import { useEffect, useRef, useState } from 'react'

// export const useSectionHeight = (ratio: number = 0.75) => {
// 	const sectionRef = useRef<HTMLDivElement | null>(null)
// 	const [listHeight, setListHeight] = useState(0)

// 	useEffect(() => {
// 		const updateHeight = () => {
// 			if (sectionRef.current) {
// 				const sectionHeight = sectionRef.current.offsetHeight
// 				setListHeight(sectionHeight * ratio)
// 			}
// 		}

// 		updateHeight()
// 		window.addEventListener('resize', updateHeight)
// 		return () => window.removeEventListener('resize', updateHeight)
// 	}, [ratio])

// 	return { sectionRef, listHeight }
// }

// import { useEffect, useRef, useState } from 'react'

// export const useSectionHeight = (ratio: number = 0.75) => {
// 	// Оставляем ref, чтобы не "ломать" деструктуризацию в компоненте
// 	const sectionRef = useRef<HTMLDivElement | null>(null)

// 	// Инициализируем высоту сразу (например, 70% от текущего окна),
// 	// чтобы при первом рендере не было 0
// 	const [listHeight, setListHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight * ratio : 0))

// 	useEffect(() => {
// 		const updateHeight = () => {
// 			// Считаем высоту от окна браузера.
// 			// Это решает проблему "замкнутого круга" с динамическими данными.
// 			const vh = window.innerHeight
// 			setListHeight(vh * ratio)
// 		}

// 		// Вызываем расчет сразу
// 		updateHeight()

// 		window.addEventListener('resize', updateHeight)
// 		return () => window.removeEventListener('resize', updateHeight)
// 	}, [ratio])

// 	return { sectionRef, listHeight }
// }

import { useEffect, useRef, useState } from 'react'

export const useSectionHeight = (ratio: number = 0.75) => {
	const sectionRef = useRef<HTMLDivElement | null>(null)

	// КЛЮЧЕВОЕ ИЗМЕНЕНИЕ:
	// Мы не ставим 0 в начале. Мы даем "черновик" высоты (75% от окна),
	// чтобы задачи вообще отрендерились и дали контейнеру высоту.
	const [listHeight, setListHeight] = useState(() => (typeof window !== 'undefined' ? window.innerHeight * ratio : 0))

	useEffect(() => {
		const updateHeight = () => {
			if (sectionRef.current) {
				const sectionHeight = sectionRef.current.offsetHeight
				// Используем твою формулу один в один
				if (sectionHeight > 0) {
					setListHeight(sectionHeight * ratio)
				}
			}
		}

		// 1. Первичный расчет
		updateHeight()

		// 2. Следим за изменением окна (твой код)
		window.addEventListener('resize', updateHeight)

		// 3. КЛЮЧЕВОЙ МОМЕНТ: Следим за самим контейнером.
		// Как только задачи загрузятся, контейнер расширится,
		// ResizeObserver это увидит и вызовет updateHeight.
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
