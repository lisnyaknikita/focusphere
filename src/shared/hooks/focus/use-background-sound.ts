// shared/hooks/use-background-sound/use-background-sound.ts
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type SoundOption = 'pink-noise' | 'brown-noise' | 'lofi' | null

const SOUND_FILES: Record<NonNullable<SoundOption>, string> = {
	'pink-noise': '/pink.webm',
	'brown-noise': 'brown.webm',
	lofi: '/lofi.webm',
}

export function useBackgroundSound() {
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

	const loadBuffer = useCallback(
		async (sound: NonNullable<SoundOption>): Promise<AudioBuffer> => {
			if (buffersRef.current[sound]) return buffersRef.current[sound]!
			const ctx = getOrCreateCtx()
			const res = await fetch(SOUND_FILES[sound])
			const arrayBuffer = await res.arrayBuffer()
			const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
			buffersRef.current[sound] = audioBuffer
			return audioBuffer
		},
		[getOrCreateCtx]
	)

	const stopCurrent = useCallback(() => {
		if (sourceRef.current) {
			sourceRef.current.loop = false
			try {
				sourceRef.current.stop()
			} catch {}
			sourceRef.current.disconnect()
			sourceRef.current = null
		}
	}, [])

	const play = useCallback(
		async (sound: NonNullable<SoundOption>) => {
			setIsLoading(true)
			stopCurrent()

			const ctx = getOrCreateCtx()
			if (ctx.state === 'suspended') await ctx.resume()

			const buffer = await loadBuffer(sound)

			const source = ctx.createBufferSource()
			source.buffer = buffer
			source.loop = true
			source.connect(gainRef.current!)
			source.start(0)
			sourceRef.current = source
			setIsLoading(false)
		},
		[getOrCreateCtx, loadBuffer, stopCurrent]
	)

	const selectSound = useCallback(
		async (sound: SoundOption) => {
			if (sound === activeSound) {
				stopCurrent()
				setActiveSound(null)
				return
			}
			setActiveSound(sound)
			if (sound) await play(sound)
			else stopCurrent()
		},
		[activeSound, play, stopCurrent]
	)

	const setVolume = useCallback((value: number) => {
		setVolumeState(value)
		if (gainRef.current) {
			gainRef.current.gain.setTargetAtTime(value, audioCtxRef.current!.currentTime, 0.05)
		}
	}, [])

	useEffect(() => () => stopCurrent(), [])

	return { activeSound, selectSound, isLoading, volume, setVolume }
}
