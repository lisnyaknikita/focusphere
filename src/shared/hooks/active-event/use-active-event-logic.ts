import { CalendarEvent } from '@/shared/types/event'
import { useEffect, useMemo, useState } from 'react'

export const useActiveEventLogic = (events: CalendarEvent[]) => {
	const [now, setNow] = useState(new Date())

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 60_000)
		return () => clearInterval(interval)
	}, [])

	return useMemo(() => {
		const currentTime = now.getTime()
		const activeEvent = events.find(
			event => currentTime >= new Date(event.startDate).getTime() && currentTime < new Date(event.endDate).getTime()
		)

		const progress = activeEvent
			? ((currentTime - new Date(activeEvent.startDate).getTime()) /
					(new Date(activeEvent.endDate).getTime() - new Date(activeEvent.startDate).getTime())) *
			  100
			: 0

		const nextEvent = events
			.filter(event => new Date(event.startDate).getTime() > currentTime)
			.sort((a, b) => a.startDate.localeCompare(b.startDate))[0]

		return { activeEvent, nextEvent, progress: Math.min(100, Math.max(0, progress)) }
	}, [events, now])
}
