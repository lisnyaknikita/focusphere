'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

export type SoundOption = 'pink-noise' | 'brown-noise' | 'lofi' | null

const SOUND_FILES: Record<NonNullable<SoundOption>, string> = {
	'pink-noise': '/pink.webm',
	'brown-noise': '/brown.webm',
	lofi: '/lofi.webm',
}

interface BackgroundSoundContextType {
	activeSound: SoundOption
	volume: number
	isLoading: boolean
	selectSound: (sound: SoundOption) => Promise<void>
	setVolume: (value: number) => void
}

const BackgroundSoundContext = createContext<BackgroundSoundContextType | undefined>(undefined)

export const BackgroundSoundProvider = ({ children }: { children: React.ReactNode }) => {
	const [activeSound, setActiveSound] = useState<SoundOption>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [volume, setVolumeState] = useState(0.5)

	const audioCtxRef = useRef<AudioContext | null>(null)
	const sourceRef = useRef<AudioBufferSourceNode | null>(null)
	const gainRef = useRef<GainNode | null>(null)
	const buffersRef = useRef<Partial<Record<NonNullable<SoundOption>, AudioBuffer>>>({})

	const getOrCreateCtx = useCallback(() => {
		if (!audioCtxRef.current) {
			audioCtxRef.current = new AudioContext()
			gainRef.current = audioCtxRef.current.createGain()
			gainRef.current.gain.value = volume
			gainRef.current.connect(audioCtxRef.current.destination)
		}
		return audioCtxRef.current
	}, [volume])

	const stopCurrent = useCallback(() => {
		if (sourceRef.current) {
			try {
				sourceRef.current.stop()
			} catch {}
			sourceRef.current.disconnect()
			sourceRef.current = null
		}
	}, [])

	const selectSound = useCallback(
		async (sound: SoundOption) => {
			if (sound === activeSound || !sound) {
				stopCurrent()
				setActiveSound(null)
				return
			}

			setIsLoading(true)
			stopCurrent()
			setActiveSound(sound)

			const ctx = getOrCreateCtx()
			if (ctx.state === 'suspended') await ctx.resume()

			let buffer = buffersRef.current[sound]
			if (!buffer) {
				const res = await fetch(SOUND_FILES[sound])
				const arrayBuffer = await res.arrayBuffer()
				buffer = await ctx.decodeAudioData(arrayBuffer)
				buffersRef.current[sound] = buffer
			}

			const source = ctx.createBufferSource()
			source.buffer = buffer
			source.loop = true
			source.connect(gainRef.current!)
			source.start(0)
			sourceRef.current = source
			setIsLoading(false)
		},
		[activeSound, getOrCreateCtx, stopCurrent]
	)

	const setVolume = useCallback((value: number) => {
		setVolumeState(value)
		if (gainRef.current && audioCtxRef.current) {
			gainRef.current.gain.setTargetAtTime(value, audioCtxRef.current.currentTime, 0.05)
		}
	}, [])

	return (
		<BackgroundSoundContext.Provider value={{ activeSound, volume, isLoading, selectSound, setVolume }}>
			{children}
		</BackgroundSoundContext.Provider>
	)
}

export const useBackgroundSound = () => {
	const context = useContext(BackgroundSoundContext)
	if (!context) throw new Error('useBackgroundSound must be used within BackgroundSoundProvider')
	return context
}
