'use client'

import { createGeneralNote } from '@/lib/notes/notes'
import { useBilling } from '@/shared/context/billing-context'
import { useGeneralNotes } from '@/shared/hooks/notes/use-general-notes'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { Modal } from '@/shared/ui/modal/modal'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { QuickIdeaModal } from '../quick-idea-modal/quick-idea-modal'

const FREE_NOTE_LIMIT = 6

export const QuickIdeaModalWrapper = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { user } = useUser()
	const { isPro, isBillingLoading, openPaywall } = useBilling()
	const { notes, isLoading: isNotesLoading } = useGeneralNotes(user?.$id ?? '')

	const isOpen = searchParams.get('modal') === 'quick-idea'

	const isLimitExceeded = !isPro && notes.length >= FREE_NOTE_LIMIT

	const handleClose = () => {
		router.push('/dashboard')
		const event = new CustomEvent('refresh-daily-tasks')
		window.dispatchEvent(event)
	}

	useEffect(() => {
		if (isBillingLoading || isNotesLoading || !isOpen) return

		if (isLimitExceeded) {
			handleClose()
			openPaywall('notes_unlimited')
		}
	}, [isOpen, isPro, isBillingLoading, isNotesLoading, notes.length, openPaywall])

	const handleSave = async (content: string) => {
		if (!user) return

		if (isLimitExceeded) {
			openPaywall('notes_unlimited')
			return
		}

		const blockNoteContent = [
			{
				type: 'paragraph',
				content: [
					{
						type: 'text',
						text: content,
						styles: {},
					},
				],
			},
		]

		const jsonContent = JSON.stringify(blockNoteContent)

		await createGeneralNote({
			title: 'Quick note',
			content: jsonContent,
			userId: user.$id,
		})

		router.refresh()
	}

	if (isOpen && (isBillingLoading || isNotesLoading)) {
		return null
	}

	if (isLimitExceeded) {
		return null
	}

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<QuickIdeaModal onSave={handleSave} onClose={handleClose} />
		</Modal>
	)
}
