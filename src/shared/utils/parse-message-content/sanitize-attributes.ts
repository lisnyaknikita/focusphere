const ATTRIBUTE_MAP: Record<string, string> = {
	class: 'className',
	contenteditable: 'contentEditable',
	spellcheck: 'spellCheck',
	tabindex: 'tabIndex',
	readonly: 'readOnly',
	autocomplete: 'autoComplete',
	autofocus: 'autoFocus',
	colspan: 'colSpan',
	rowspan: 'rowSpan',
	for: 'htmlFor',
	maxlength: 'maxLength',
	minlength: 'minLength',
}

const parseInlineStyle = (styleString: string): Record<string, string> => {
	const styleObject: Record<string, string> = {}
	if (!styleString) return styleObject

	styleString.split(';').forEach(declaration => {
		const colonIndex = declaration.indexOf(':')
		if (colonIndex === -1) return

		const property = declaration.slice(0, colonIndex).trim()
		const value = declaration.slice(colonIndex + 1).trim()

		if (property && value) {
			const camelProperty = property.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
			styleObject[camelProperty] = value
		}
	})

	return styleObject
}

export const sanitizeAttributes = (element: Element): Record<string, unknown> => {
	const attribs: Record<string, unknown> = {}

	for (let i = 0; i < element.attributes.length; i++) {
		const attr = element.attributes[i]
		const rawName = attr.name.toLowerCase()

		if (rawName === 'contenteditable') continue

		if (rawName === 'style') {
			attribs.style = parseInlineStyle(attr.value)
			continue
		}

		const jsxName = ATTRIBUTE_MAP[rawName] || attr.name
		attribs[jsxName] = attr.value
	}

	return attribs
}
