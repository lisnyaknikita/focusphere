import { uploadEditorImage } from '@/shared/editor-storage'
import Quill from 'quill'
import { toast } from 'sonner'

const MAX_FILE_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
export const PLACEHOLDER_TEXT = '📷 Uploading image...'

const findPlaceholderRange = (quill: Quill): { index: number; length: number } | null => {
	const text = quill.getText()
	const match = text.match(/📷\s*Uploading image(?:\.\.\.|…)?/)
	if (match && match.index !== undefined) {
		return {
			index: match.index,
			length: match[0].length,
		}
	}
	return null
}

export const processImageUpload = async (
	file: File,
	quill: Quill,
	onUploadingChange?: (isUploading: boolean) => void
): Promise<void> => {
	if (!ALLOWED_TYPES.includes(file.type)) {
		toast.error('Unsupported image format. Use PNG, JPEG, WEBP or GIF.')
		return
	}

	if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
		toast.error(`Image size must be less than ${MAX_FILE_SIZE_MB}MB`)
		return
	}

	onUploadingChange?.(true)

	const range = quill.getSelection()
	const docLength = quill.getLength()
	const insertIndex = range ? range.index : Math.max(0, docLength - 1)

	try {
		quill.insertText(insertIndex, PLACEHOLDER_TEXT, { italic: true, color: '#8e8e93' })
		quill.setSelection(insertIndex + PLACEHOLDER_TEXT.length)

		const imageUrl = await uploadEditorImage(file)

		const placeholder = findPlaceholderRange(quill)
		const deleteAt = placeholder ? placeholder.index : insertIndex
		const deleteLength = placeholder ? placeholder.length : PLACEHOLDER_TEXT.length

		quill.deleteText(deleteAt, deleteLength)
		quill.format('italic', false)
		quill.format('color', false)

		quill.insertEmbed(deleteAt, 'image', imageUrl, 'user')
		quill.setSelection(deleteAt + 1, 0, 'user')
	} catch (error) {
		console.error('Failed to process image upload:', error)

		const placeholder = findPlaceholderRange(quill)
		if (placeholder) {
			quill.deleteText(placeholder.index, placeholder.length)
			quill.format('italic', false)
			quill.format('color', false)
		}

		toast.error('Failed to upload image. Please try again.')
	} finally {
		onUploadingChange?.(false)
	}
}
