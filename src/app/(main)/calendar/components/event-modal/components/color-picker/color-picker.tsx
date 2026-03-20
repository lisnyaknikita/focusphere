import { CALENDAR_COLORS } from '@/lib/events/calendar-config'
import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { EventForm } from '@/shared/types/event'
import { TimeBlockForm } from '@/shared/types/time-block'
import { ArrowBottomIcon } from '@/shared/ui/icons/calendar/arrow-bottom-icon'
import { ArrowTopIcon } from '@/shared/ui/icons/calendar/arrow-top-icon'
import { useState } from 'react'
import classes from './color-picker.module.scss'

type FormType = EventForm | TimeBlockForm

interface ColorPickerProps<T extends FormType> {
	form: T
	setFormField: <K extends keyof T>(key: K, value: T[K]) => void
}

const COLORS = Object.values(CALENDAR_COLORS)

export const ColorPicker = <T extends EventForm | TimeBlockForm>({ form, setFormField }: ColorPickerProps<T>) => {
	const [open, setOpen] = useState(false)

	const dropdownRef = useClickOutside<HTMLDivElement>(() => setOpen(false), open)

	const selectedColor = form.color

	const handleColorSelect = (e: React.MouseEvent, color: string) => {
		e.stopPropagation()

		setFormField('color', color)
		setOpen(false)
	}

	const handleTriggerClick = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setOpen(prev => !prev)
	}

	return (
		<div className={classes.colorPicker} ref={dropdownRef}>
			<button className={classes.triggerButton} onClick={handleTriggerClick} type='button'>
				<span className={classes.selectedColorCircle} style={{ backgroundColor: selectedColor }}></span>
				<span className={classes.arrow}>{open ? <ArrowTopIcon /> : <ArrowBottomIcon />}</span>
			</button>

			{open && (
				<div className={classes.dropdown}>
					{COLORS.map(color => (
						<button
							type='button'
							key={color}
							className={classes.colorOption}
							style={{ backgroundColor: color }}
							onClick={e => handleColorSelect(e, color)}
						/>
					))}
				</div>
			)}
		</div>
	)
}
