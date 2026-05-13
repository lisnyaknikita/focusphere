import { TimeBlock } from '@/shared/types/time-block'
import { useEffect, useMemo, useState } from 'react'

export const useActiveBlockLogic = (timeBlocks: TimeBlock[]) => {
	const [now, setNow] = useState(new Date())

	useEffect(() => {
		const interval = setInterval(() => setNow(new Date()), 1000 * 60)
		return () => clearInterval(interval)
	}, [])

	const { activeBlock, nextBlock, progress } = useMemo(() => {
		const currentTime = now.getTime()

		const active = timeBlocks.find(block => {
			const start = new Date(block.startDate).getTime()
			const end = new Date(block.endDate).getTime()
			return currentTime >= start && currentTime <= end
		})

		let currentProgress = 0
		if (active) {
			const start = new Date(active.startDate).getTime()
			const end = new Date(active.endDate).getTime()
			currentProgress = ((currentTime - start) / (end - start)) * 100
		}

		const next = timeBlocks
			.filter(block => new Date(block.startDate).getTime() > currentTime)
			.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]

		return {
			activeBlock: active,
			nextBlock: next,
			progress: Math.min(100, Math.max(0, currentProgress)),
		}
	}, [timeBlocks, now])

	return { activeBlock, nextBlock, progress }
}
