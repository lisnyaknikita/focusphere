import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SoundOption = 'pink-noise' | 'brown-noise' | 'lofi' | null

export const SOUND_FILES: Record<NonNullable<SoundOption>, string> = {
	'pink-noise': '/pink.webm',
	'brown-noise': '/brown.webm',
	lofi: '/lofi.webm',
}

interface BackgroundSoundState {
	activeSound: SoundOption
	volume: number
	isLoading: boolean
}

interface BackgroundSoundActions {
	selectSound: (sound: SoundOption) => Promise<void>
	setVolume: (value: number) => void
	_stopCurrent: () => void
	_getOrCreateCtx: () => AudioContext
}

let audioCtx: AudioContext | null = null
let sourceNode: AudioBufferSourceNode | null = null
let gainNode: GainNode | null = null
const buffers: Partial<Record<NonNullable<SoundOption>, AudioBuffer>> = {}

export const useBackgroundSoundStore = create<BackgroundSoundState & BackgroundSoundActions>()(
	persist(
		(set, get) => ({
			activeSound: null,
			volume: 0.5,
			isLoading: false,

			_getOrCreateCtx: () => {
				if (!audioCtx) {
					const AudioContextClass =
						window.AudioContext ||
						(window as unknown as Window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
					audioCtx = new AudioContextClass()
					gainNode = audioCtx.createGain()
					gainNode.gain.value = get().volume
					gainNode.connect(audioCtx.destination)
				}
				return audioCtx
			},

			_stopCurrent: () => {
				if (sourceNode) {
					try {
						sourceNode.stop()
					} catch {}
					sourceNode.disconnect()
					sourceNode = null
				}
			},

			selectSound: async sound => {
				const { activeSound, _stopCurrent, _getOrCreateCtx } = get()
				if (sound === activeSound || !sound) {
					_stopCurrent()
					set({ activeSound: null })
					return
				}

				set({ isLoading: true })
				_stopCurrent()
				set({ activeSound: sound })

				if (typeof window === 'undefined') return

				const ctx = _getOrCreateCtx()
				if (ctx.state === 'suspended') await ctx.resume()

				let buffer = buffers[sound]
				if (!buffer) {
					const res = await fetch(SOUND_FILES[sound])
					const arrayBuffer = await res.arrayBuffer()
					buffer = await ctx.decodeAudioData(arrayBuffer)
					buffers[sound] = buffer
				}

				if (get().activeSound !== sound) return

				const source = ctx.createBufferSource()
				source.buffer = buffer
				source.loop = true
				source.connect(gainNode!)
				source.start(0)
				sourceNode = source

				set({ isLoading: false })
			},

			setVolume: value => {
				set({ volume: value })
				if (gainNode && audioCtx) {
					gainNode.gain.setTargetAtTime(value, audioCtx.currentTime, 0.05)
				}
			},
		}),
		{
			name: 'focusphere_background_sounds',
			partialize: state => ({ volume: state.volume }),
		}
	)
)
