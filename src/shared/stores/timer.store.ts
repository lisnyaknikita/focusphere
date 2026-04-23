import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerStatus = 'idle' | 'work' | 'break' | 'paused' | 'completed'

export interface TimerSettings {
	flowDuration: number
	breakDuration: number
	totalSessions: number
}

interface TimerState {
	timeLeft: number
	status: TimerStatus
	currentSession: number
	settings: TimerSettings
	expiry: number | null
	mode: 'work' | 'break'
}

interface TimerActions {
	startTimer: () => void
	pauseTimer: () => void
	resetTimer: () => void
	updateSettings: (newSettings: Partial<TimerSettings>) => void
	tickLogic: () => void
	// jumpToFinish: () => void
}

export const useTimerStore = create<TimerState & TimerActions>()(
	persist(
		(set, get) => ({
			timeLeft: 50 * 60,
			status: 'idle',
			currentSession: 1,
			expiry: null,
			mode: 'work',
			settings: {
				flowDuration: 50,
				breakDuration: 10,
				totalSessions: 4,
			},

			startTimer: () => {
				const { status, timeLeft, settings, mode } = get()
				let nextStatus: 'work' | 'break' = mode

				if (status === 'idle') {
					nextStatus = 'work'
				}

				const seconds = status === 'idle' ? settings.flowDuration * 60 : timeLeft
				const expiry = Date.now() + seconds * 1000

				set({ status: nextStatus, mode: nextStatus, timeLeft: seconds, expiry })
			},

			pauseTimer: () => {
				const { status, timeLeft } = get()
				if (status === 'work' || status === 'break') {
					set({ mode: status })
				}
				set({ status: 'paused', expiry: null, timeLeft })
			},

			resetTimer: () => {
				const { settings } = get()
				set({
					status: 'idle',
					currentSession: 1,
					timeLeft: settings.flowDuration * 60,
					expiry: null,
				})
			},

			updateSettings: newSettings => {
				set(state => {
					const updated = { ...state.settings, ...newSettings }
					if (state.status === 'idle') {
						return { settings: updated, timeLeft: updated.flowDuration * 60 }
					}
					return { settings: updated }
				})
			},

			// jumpToFinish: () => {
			// 	const { status } = get()
			// 	if (status === 'idle' || status === 'paused') return

			// 	const buffer = 5
			// 	const expiry = Date.now() + buffer * 1000
			// 	set({ timeLeft: buffer, expiry })
			// },

			tickLogic: () => {
				const { status, expiry, settings, currentSession } = get()
				if (!expiry || status === 'paused' || status === 'idle') return

				const now = Date.now()
				const distance = Math.max(0, Math.round((expiry - now) / 1000))

				if (distance <= 0) {
					if (typeof window !== 'undefined') {
						const audio = new Audio('/ding-sound.webm')
						audio.volume = 0.5
						audio.play().catch(err => console.error('Audio error: ', err))

						if ('Notification' in window && Notification.permission === 'granted') {
							new Notification(status === 'work' ? 'Break Time! ☕' : 'Back to Work! 🚀', {
								body: status === 'work' ? 'You completed a flow session.' : 'Your break is over.',
								icon: '/favicon.ico',
							})
						}
					}

					let nextState: Partial<TimerState> = {}

					if (status === 'work') {
						if (currentSession < settings.totalSessions) {
							const nextSeconds = settings.breakDuration * 60
							nextState = {
								mode: 'break',
								status: 'break',
								timeLeft: nextSeconds,
								expiry: Date.now() + nextSeconds * 1000,
							}
						} else {
							nextState = {
								status: 'completed',
							}
							if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
								new Notification('Goal reached! 🏆', {
									body: 'You have completed all flow sessions.',
									icon: '/favicon.ico',
								})
							}
						}
					} else if (status === 'break') {
						const nextSession = currentSession + 1
						const nextSeconds = settings.flowDuration * 60
						nextState = {
							mode: 'work',
							status: 'work',
							currentSession: nextSession,
							timeLeft: nextSeconds,
							expiry: Date.now() + nextSeconds * 1000,
						}
					}
					set(nextState)
				} else {
					set({ timeLeft: distance })
				}
			},
		}),
		{
			name: 'focusphere_timer_state',
			partialize: state => ({
				status: state.status,
				expiry: state.expiry,
				currentSession: state.currentSession,
				settings: state.settings,
				timeLeft: state.timeLeft,
				mode: state.mode,
			}),
		}
	)
)

if (typeof window !== 'undefined') {
	let intervalId: NodeJS.Timeout | null = null
	let lastActiveStatus: 'work' | 'break' = 'work'

	if ('Notification' in window && Notification.permission === 'default') {
		Notification.requestPermission()
	}

	useTimerStore.subscribe(state => {
		const { status, timeLeft } = state

		if ((status === 'work' || status === 'break') && !intervalId) {
			intervalId = setInterval(() => {
				useTimerStore.getState().tickLogic()
			}, 1000)
		} else if (status !== 'work' && status !== 'break' && intervalId) {
			clearInterval(intervalId)
			intervalId = null
		}

		if (status === 'idle') {
			document.title = 'Focus & Timer - Focusphere'
			return
		}
		if (status === 'completed') {
			document.title = 'Done! 🏆 - Focusphere'
			return
		}

		if (status === 'work' || status === 'break') {
			lastActiveStatus = status
		}

		const mins = Math.floor(timeLeft / 60)
			.toString()
			.padStart(2, '0')
		const secs = (timeLeft % 60).toString().padStart(2, '0')

		const currentMode = status === 'paused' ? lastActiveStatus : status
		const emoji = currentMode === 'work' ? '🚀' : '☕'
		const pauseSign = status === 'paused' ? '⏸️ ' : ''

		document.title = `${pauseSign}${emoji} ${mins}:${secs} - Focusphere`
	})

	const state = useTimerStore.getState()
	if (state.status === 'work' || state.status === 'break') {
		state.tickLogic()
	}
}
