import { autoUpdate, flip, offset, shift, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { ReactNode, useState } from 'react'

interface ActionTooltipProps {
	children: (setRef: (node: HTMLElement | null) => void, referenceProps: Record<string, unknown>) => ReactNode
	text: string
	isActive?: boolean
}

export const ActionTooltip = ({ children, text, isActive = true }: ActionTooltipProps) => {
	const [isOpen, setIsOpen] = useState(false)

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen && isActive,
		onOpenChange: setIsOpen,
		placement: 'top',
		whileElementsMounted: autoUpdate,
		middleware: [offset(8), flip(), shift()],
	})

	const { getReferenceProps, getFloatingProps } = useInteractions([useHover(context)])

	return (
		<div style={{ display: 'inline-block' }}>
			{children(refs.setReference, getReferenceProps())}
			{isOpen && isActive && (
				<div
					ref={refs.setFloating}
					style={{
						...floatingStyles,
						background: isActive ? 'var(--save-button-bg)' : '#d79716',
						color: 'var(--save-button-text)',
						padding: '4px 8px',
						borderRadius: '5px',
						fontSize: '12px',
						fontWeight: 700,
						zIndex: 1000,
						whiteSpace: 'nowrap',
					}}
					{...getFloatingProps()}
				>
					{text}
				</div>
			)}
		</div>
	)
}
