import { TaskHighlight } from '@/app/(main)/projects/[id]/chat/components/chat-area/components/message-item/components/task-highlight/task-highlight'
import { KanbanTask } from '@/shared/types/kanban-task'
import React from 'react'

const parseHtmlToReact = (node: Node, tasks: KanbanTask[], nodeKey: string | number): React.ReactNode => {
	if (node.nodeType === Node.TEXT_NODE) {
		const text = node.textContent || ''
		const regex = /#([A-Za-z0-9]+-\d+)/g

		const parts = []
		let lastIndex = 0
		let match

		while ((match = regex.exec(text)) !== null) {
			const matchIndex = match.index
			const fullMatch = match[0]
			const taskCode = match[1]

			if (matchIndex > lastIndex) {
				parts.push(text.substring(lastIndex, matchIndex))
			}

			const task = tasks.find(t => t.taskCode?.toLowerCase() === taskCode.toLowerCase())

			if (task) {
				parts.push(<TaskHighlight key={`${nodeKey}-${matchIndex}`} task={task} />)
			} else {
				parts.push(fullMatch)
			}

			lastIndex = regex.lastIndex
		}

		if (lastIndex < text.length) {
			parts.push(text.substring(lastIndex))
		}

		return parts.length > 0 ? <React.Fragment key={nodeKey}>{parts}</React.Fragment> : text
	}

	if (node.nodeType === Node.ELEMENT_NODE) {
		const element = node as Element
		const tagName = element.tagName.toLowerCase()

		const attribs: Record<string, string> = {}
		for (let i = 0; i < element.attributes.length; i++) {
			const attr = element.attributes[i]
			let name = attr.name
			if (name === 'class') name = 'className'
			attribs[name] = attr.value
		}

		const children = Array.from(element.childNodes).map((child, idx) => {
			return parseHtmlToReact(child, tasks, `${nodeKey}-${idx}`)
		})

		return React.createElement(tagName, { ...attribs, key: nodeKey }, ...children)
	}

	return null
}

export const renderParsedContent = (htmlContent: string, tasks: KanbanTask[]) => {
	try {
		const parser = new DOMParser()
		const doc = parser.parseFromString(htmlContent, 'text/html')
		const elements: React.ReactNode[] = []

		doc.body.childNodes.forEach((child, index) => {
			const parsed = parseHtmlToReact(child, tasks, index)
			if (parsed !== null) {
				elements.push(<React.Fragment key={index}>{parsed}</React.Fragment>)
			}
		})
		return elements
	} catch (e) {
		console.error('Failed to parse message content:', e)
		return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
	}
}
