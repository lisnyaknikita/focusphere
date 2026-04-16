import { Block } from '@blocknote/core'

export const getBlockNotePreview = (jsonContent: string | undefined): string => {
	if (!jsonContent) return 'Empty note'

	try {
		const blocks = JSON.parse(jsonContent) as Block[]

		const text = blocks
			.map((block: Block) => {
				if (Array.isArray(block.content)) {
					return block.content
						.map((inline: unknown) => {
							if (typeof inline === 'object' && inline !== null && 'text' in inline) {
								return (inline as { text: string }).text
							}
							return ''
						})
						.join('')
				}
				return ''
			})
			.filter((t: string) => t.length > 0)
			.join(' ')

		return text.trim() || 'No additional content'
	} catch (e) {
		console.error(e)
		return ''
	}
}
