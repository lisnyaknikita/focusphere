import { createContext, useContext } from 'react'

export const CalendarCopyModeContext = createContext(false)
export const useCalendarCopyMode = () => useContext(CalendarCopyModeContext)
