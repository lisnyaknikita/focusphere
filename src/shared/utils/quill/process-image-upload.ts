import { uploadEditorImage } from '@/shared/editor-storage'
import Quill from 'quill'
import { toast } from 'sonner'

const MAX_FILE_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const PLACEHOLDER_TEXT = '📷 Uploading image...'

const getQuillTextIndex = (quill: Quill, searchText: string): number => {
	let index = 0
	const contents = quill.getContents()

	for (const op of contents.ops) {
		if (typeof op.insert === 'string') {
			const matchIndex = op.insert.indexOf(searchText)
			if (matchIndex !== -1) {
				return index + matchIndex
			}
			index += op.insert.length
		} else if (op.insert) {
			index += 1
		}
	}

	return -1
}

export const processImageUpload = async (file: File, quill: Quill): Promise<void> => {
	if (!ALLOWED_TYPES.includes(file.type)) {
		toast.error('Unsupported image format. Use PNG, JPEG, WEBP or GIF.')
		return
	}

	if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
		toast.error(`Image size must be less than ${MAX_FILE_SIZE_MB}MB`)
		return
	}

	const range = quill.getSelection(true)
	const insertIndex = range ? range.index : quill.getLength()

	try {
		quill.insertText(insertIndex, PLACEHOLDER_TEXT, { italic: true, color: '#8e8e93' })
		quill.setSelection(insertIndex + PLACEHOLDER_TEXT.length)

		const imageUrl = await uploadEditorImage(file)

		const targetIndex = getQuillTextIndex(quill, PLACEHOLDER_TEXT)
		const deleteAt = targetIndex !== -1 ? targetIndex : insertIndex

		quill.deleteText(deleteAt, PLACEHOLDER_TEXT.length)
		quill.format('italic', false)
		quill.format('color', false)

		quill.insertEmbed(deleteAt, 'image', imageUrl, 'user')
		quill.setSelection(deleteAt + 1, 0, 'user')
	} catch (error) {
		console.error('Failed to process image upload:', error)

		const targetIndex = getQuillTextIndex(quill, PLACEHOLDER_TEXT)
		if (targetIndex !== -1) {
			quill.deleteText(targetIndex, PLACEHOLDER_TEXT.length)
			quill.format('italic', false)
			quill.format('color', false)
		}

		toast.error('Failed to upload image. Please try again.')
	}
}
