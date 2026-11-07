import { toast } from 'sonner'
import { create } from 'zustand'

export interface CalendarOperation {
	id: string
	label: string
	affectedIds?: string[]
}

interface CalendarOperationState {
	operation: CalendarOperation | null
	isMutating: boolean
	start: (label: string, affectedIds?: string[]) => string | null
	finish: (id: string) => void
	isEventMutating: (eventId: string) => boolean
}

let safetyTimeoutId: NodeJS.Timeout | null = null
const OPERATION_TIMEOUT_MS = 15000

export const useCalendarOperationStore = create<CalendarOperationState>((set, get) => ({
	operation: null,
	isMutating: false,

	start: (label, affectedIds) => {
		if (get().operation) return null

		if (safetyTimeoutId) {
			clearTimeout(safetyTimeoutId)
			safetyTimeoutId = null
		}

		const id = crypto.randomUUID()
		set({ operation: { id, label, affectedIds }, isMutating: true })

		safetyTimeoutId = setTimeout(() => {
			const current = get().operation
			if (current?.id === id) {
				console.warn(`[CalendarOperation] Safety timeout triggered for: "${label}" (${id})`)

				set({ operation: null, isMutating: false })
				safetyTimeoutId = null

				toast.error('Operation took too long. Calendar unlocked.')
			}
		}, OPERATION_TIMEOUT_MS)

		return id
	},

	finish: id => {
		const current = get().operation
		if (current?.id === id) {
			if (safetyTimeoutId) {
				clearTimeout(safetyTimeoutId)
				safetyTimeoutId = null
			}
			set({ operation: null, isMutating: false })
		}
	},

	isEventMutating: (eventId: string) => {
		const current = get().operation
		if (!current || !current.affectedIds) return false
		return current.affectedIds.includes(eventId)
	},
}))

export const runCalendarOperation = async <T>(
	label: string,
	operation: () => Promise<T>,
	affectedIds?: string[]
): Promise<T | undefined> => {
	const id = useCalendarOperationStore.getState().start(label, affectedIds)
	if (!id) return undefined

	try {
		return await operation()
	} finally {
		useCalendarOperationStore.getState().finish(id)
	}
}
