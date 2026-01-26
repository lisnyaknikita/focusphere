'use client'

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type TimerStatus = 'idle' | 'work' | 'break' | 'paused' | 'completed'

interface TimerSettings {
	flowDuration: number
	breakDuration: number
	totalSessions: number
}

interface TimerPersistedState {
	status: TimerStatus
	expiry: number | null
	currentSession: number
	settings: TimerSettings
	timeLeft: number
	mode: 'work' | 'break'
}

interface TimerContextType {
	timeLeft: number
	status: TimerStatus
	currentSession: number
	settings: TimerSettings
	startTimer: () => void
	pauseTimer: () => void
	resetTimer: () => void
	updateSettings: (newSettings: Partial<TimerSettings>) => void
	// jumpToFinish: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)
const STORAGE_KEY = 'focusphere_timer_state'

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [settings, setSettings] = useState<TimerSettings>({
		flowDuration: 50,
		breakDuration: 10,
		totalSessions: 4,
	})
	const [status, setStatus] = useState<TimerStatus>('idle')
	const [currentSession, setCurrentSession] = useState(1)
	const [timeLeft, setTimeLeft] = useState(settings.flowDuration * 60)

	const expiryTimestampRef = useRef<number | null>(null)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)
	const lastActiveStatusRef = useRef<'work' | 'break'>('work')
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const modeRef = useRef<'work' | 'break'>('work')

	const persist = useCallback((data: Partial<TimerPersistedState>) => {
		const current = localStorage.getItem(STORAGE_KEY)
		const base = current ? JSON.parse(current) : {}
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				...base,
				...data,
				mode: modeRef.current,
			})
		)
	}, [])

	// const jumpToFinish = useCallback(() => {
	// 	if (status === 'idle' || status === 'paused') return

	// 	const buffer = 5
	// 	const newExpiry = Date.now() + buffer * 1000

	// 	expiryTimestampRef.current = newExpiry
	// 	setTimeLeft(buffer)
	// 	persist({ expiry: newExpiry })
	// }, [status, persist])

	const resetTimer = useCallback(() => {
		setStatus('idle')
		setCurrentSession(1)
		setTimeLeft(settings.flowDuration * 60)
		expiryTimestampRef.current = null
		localStorage.removeItem(STORAGE_KEY)
		if (intervalRef.current) clearInterval(intervalRef.current)
	}, [settings.flowDuration])

	const handleTimerComplete = useCallback(() => {
		playNotification()

		if (status === 'work') {
			if (currentSession < settings.totalSessions) {
				const nextSeconds = settings.breakDuration * 60
				modeRef.current = 'break'
				setStatus('break')
				setTimeLeft(nextSeconds)
				expiryTimestampRef.current = Date.now() + nextSeconds * 1000
				persist({ status: 'break', expiry: expiryTimestampRef.current })
			} else {
				setStatus('completed')
				persist({ status: 'completed' })
			}
		} else if (status === 'break') {
			const nextSession = currentSession + 1
			const nextSeconds = settings.flowDuration * 60
			modeRef.current = 'work'
			setCurrentSession(nextSession)
			setStatus('work')
			setTimeLeft(nextSeconds)
			expiryTimestampRef.current = Date.now() + nextSeconds * 1000
			persist({ status: 'work', expiry: expiryTimestampRef.current, currentSession: nextSession })
		}
	}, [status, currentSession, settings, persist, resetTimer])

	const tickLogic = useCallback(() => {
		if (!expiryTimestampRef.current || status === 'paused' || status === 'idle') return

		const now = Date.now()
		const distance = Math.max(0, Math.round((expiryTimestampRef.current - now) / 1000))

		if (distance <= 0) {
			handleTimerComplete()
		} else {
			setTimeLeft(distance)
		}
	}, [status, handleTimerComplete])

	const playNotification = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.currentTime = 0.5
			audioRef.current.play().catch(err => {
				console.error('Audio error: ', err)
			})
		}
	}, [])

	useEffect(() => {
		if (status === 'idle') {
			document.title = 'Focusphere | Timer'
			return
		}

		if (status === 'completed') {
			document.title = 'Done! 🏆 | Focusphere'
			return
		}

		const mins = Math.floor(timeLeft / 60)
			.toString()
			.padStart(2, '0')
		const secs = (timeLeft % 60).toString().padStart(2, '0')

		const currentMode = status === 'paused' ? lastActiveStatusRef.current : status
		const emoji = currentMode === 'work' ? '🚀' : '☕'

		const pauseSign = status === 'paused' ? '⏸️ ' : ''

		document.title = `${pauseSign}${emoji} ${mins}:${secs} | Focusphere`
	}, [timeLeft, status])

	useEffect(() => {
		audioRef.current = new Audio('/ding-sound.webm')

		if (audioRef.current) audioRef.current.volume = 0.5
	}, [])

	useEffect(() => {
		if (status === 'work' || status === 'break') {
			intervalRef.current = setInterval(tickLogic, 1000)
		} else {
			if (intervalRef.current) clearInterval(intervalRef.current)
		}
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current)
		}
	}, [status, tickLogic])

	const startTimer = () => {
		let nextStatus: 'work' | 'break' = modeRef.current

		if (status === 'idle') {
			nextStatus = 'work'
		}

		const seconds = status === 'idle' ? settings.flowDuration * 60 : timeLeft
		const expiry = Date.now() + seconds * 1000

		expiryTimestampRef.current = expiry
		modeRef.current = nextStatus
		setTimeLeft(seconds)
		setStatus(nextStatus)

		persist({ status: nextStatus, expiry, currentSession, settings })
	}

	const pauseTimer = () => {
		if (status === 'work' || status === 'break') {
			modeRef.current = status
		}
		setStatus('paused')
		persist({ status: 'paused', expiry: null, timeLeft: timeLeft })
	}

	const updateSettings = (newSettings: Partial<TimerSettings>) => {
		setSettings(prev => {
			const updated = { ...prev, ...newSettings }
			if (status === 'idle') {
				setTimeLeft(updated.flowDuration * 60)
			}
			persist({ settings: updated })
			return updated
		})
	}

	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved) {
			const data: TimerPersistedState = JSON.parse(saved)
			if (data.settings) setSettings(data.settings)
			if (data.currentSession) setCurrentSession(data.currentSession)

			if (data.mode) modeRef.current = data.mode

			if (data.status) setStatus(data.status)

			if (data.status === 'paused') {
				setTimeLeft(data.timeLeft)
			} else if (data.status === 'work' || data.status === 'break') {
				if (data.expiry) {
					expiryTimestampRef.current = data.expiry
					const distance = Math.max(0, Math.round((data.expiry - Date.now()) / 1000))
					if (distance > 0) {
						setTimeLeft(distance)
					} else {
						handleTimerComplete()
					}
				}
			} else {
				if (data.settings) setTimeLeft(data.settings.flowDuration * 60)
			}
		}
	}, [])

	return (
		<TimerContext.Provider
			value={{
				timeLeft,
				status,
				currentSession,
				settings,
				startTimer,
				pauseTimer,
				resetTimer,
				updateSettings,
				// jumpToFinish,
			}}
		>
			{children}
		</TimerContext.Provider>
	)
}

export const useTimer = () => {
	const context = useContext(TimerContext)
	if (!context) throw new Error('useTimer must be used within TimerProvider')
	return context
}
