'use client'

import { createGeneralNote } from '@/lib/notes/notes'
import { useUser } from '@/shared/hooks/use-user/use-user'
import { Modal } from '@/shared/ui/modal/modal'
import { useRouter, useSearchParams } from 'next/navigation'
import { QuickIdeaModal } from '../quick-idea-modal/quick-idea-modal'

export const QuickIdeaModalWrapper = () => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { user } = useUser()

	const isOpen = searchParams.get('modal') === 'quick-idea'

	const handleClose = () => {
		router.push('/dashboard')
		const event = new CustomEvent('refresh-daily-tasks')
		window.dispatchEvent(event)
	}

	const handleSave = async (content: string) => {
		if (!user) return

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

	return (
		<Modal isVisible={isOpen} onClose={handleClose}>
			<QuickIdeaModal onSave={handleSave} onClose={handleClose} />
		</Modal>
	)
}
