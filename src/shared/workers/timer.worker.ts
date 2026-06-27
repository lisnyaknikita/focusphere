let intervalId: NodeJS.Timeout | null = null

self.onmessage = (e: MessageEvent<'start' | 'stop'>) => {
	if (e.data === 'start') {
		if (!intervalId) {
			intervalId = setInterval(() => self.postMessage('tick'), 1000)
		}
	} else if (e.data === 'stop') {
		if (intervalId) {
			clearInterval(intervalId)
			intervalId = null
		}
	}
}
