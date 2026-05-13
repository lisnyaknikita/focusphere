import { createContext, useContext } from 'react'

export const CopyModeContext = createContext(false)
export const useCopyMode = () => useContext(CopyModeContext)
