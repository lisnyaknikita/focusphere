import { CALENDAR_COLORS, CALENDARS_CONFIG, getCalendarIdByColor } from '@/lib/events/calendar-config'
import { useClickOutside } from '@/shared/hooks/use-click-outside/use-click-outside'
import { EventForm } from '@/shared/types/event'
import { ArrowBottomIcon } from '@/shared/ui/icons/calendar/arrow-bottom-icon'
import { ArrowTopIcon } from '@/shared/ui/icons/calendar/arrow-top-icon'
import { useState } from 'react'
import classes from './color-picker.module.scss'

type FormType = EventForm

interface ColorPickerProps<T extends FormType> {
	form: T
	setFormField: <K extends keyof T>(key: K, value: T[K]) => void
}

const COLORS = Object.values(CALENDAR_COLORS)

const getDisplayColor = (color: string): string => {
	const calendarId = getCalendarIdByColor(color)
	const config = CALENDARS_CONFIG[calendarId as keyof typeof CALENDARS_CONFIG]
	return config?.darkColors.container || color
}

export const ColorPicker = <T extends EventForm>({ form, setFormField }: ColorPickerProps<T>) => {
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
				<span
					className={classes.selectedColorCircle}
					style={{ backgroundColor: getDisplayColor(selectedColor) }}
				></span>
				<span className={classes.arrow}>{open ? <ArrowTopIcon /> : <ArrowBottomIcon />}</span>
			</button>

			{open && (
				<div className={classes.dropdown}>
					{COLORS.map(color => (
						<button
							type='button'
							key={color}
							className={classes.colorOption}
							style={{ backgroundColor: getDisplayColor(color) }}
							onClick={e => handleColorSelect(e, color)}
						/>
					))}
				</div>
			)}
		</div>
	)
}
