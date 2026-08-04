import { uploadEditorImage } from '@/shared/editor-storage'
import Quill from 'quill'
import { toast } from 'sonner'

const MAX_FILE_SIZE_MB = 5
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

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
	const placeholderText = '📷 Uploading image...'

	try {
		quill.insertText(insertIndex, placeholderText, { italic: true, color: '#8e8e93' })
		quill.setSelection(insertIndex + placeholderText.length)

		const imageUrl = await uploadEditorImage(file)

		quill.deleteText(insertIndex, placeholderText.length)

		quill.insertEmbed(insertIndex, 'image', imageUrl, 'user')
		quill.setSelection(insertIndex + 1, 0, 'user')
	} catch (error) {
		console.error('Failed to process image upload:', error)
		quill.deleteText(insertIndex, placeholderText.length)
		toast.error('Failed to upload image. Please try again.')
	}
}
