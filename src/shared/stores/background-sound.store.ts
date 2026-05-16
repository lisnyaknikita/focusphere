import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SoundOption = 'white-noise' | 'pink-noise' | 'brown-noise' | 'lofi' | null

export const SOUND_FILES: Partial<Record<NonNullable<SoundOption>, string>> = {
	lofi: '/lofi.webm',
}

function generateNoiseBuffer(ctx: AudioContext, type: 'white-noise' | 'pink-noise' | 'brown-noise'): AudioBuffer {
	const bufferSize = ctx.sampleRate * 5 // 5 seconds loop
	const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
	const output = buffer.getChannelData(0)

	let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
	let lastOut = 0

	for (let i = 0; i < bufferSize; i++) {
		const white = Math.random() * 2 - 1

		if (type === 'white-noise') {
			output[i] = white * 0.1
		} else if (type === 'pink-noise') {
			b0 = 0.99886 * b0 + white * 0.0555179
			b1 = 0.99332 * b1 + white * 0.0750759
			b2 = 0.969 * b2 + white * 0.153852
			b3 = 0.8665 * b3 + white * 0.3104856
			b4 = 0.55 * b4 + white * 0.5329522
			b5 = -0.7616 * b5 - white * 0.016898
			output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
			output[i] *= 0.11 
			b6 = white * 0.115926
		} else if (type === 'brown-noise') {
			lastOut = (lastOut + 0.02 * white) / 1.02
			output[i] = lastOut * 3.5 
		}
	}
	return buffer
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
					if (sound === 'white-noise' || sound === 'pink-noise' || sound === 'brown-noise') {
						buffer = generateNoiseBuffer(ctx, sound)
						buffers[sound] = buffer
					} else {
						const url = SOUND_FILES[sound]
						if (url) {
							const res = await fetch(url)
							const arrayBuffer = await res.arrayBuffer()
							buffer = await ctx.decodeAudioData(arrayBuffer)
							buffers[sound] = buffer
						}
					}
				}

				if (get().activeSound !== sound) return
				if (!buffer) return

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
