export type ListType = 'bullet' | 'ordered' | null

export const getQuillListType = (element: Element): ListType => {
	const dataList = element.getAttribute('data-list')

	if (dataList === 'bullet') return 'bullet'
	if (dataList === 'ordered') return 'ordered'

	const tagName = element.tagName.toLowerCase()
	if (tagName === 'ul') return 'bullet'
	if (tagName === 'ol') return 'ordered'

	return null
}
