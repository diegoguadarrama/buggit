import { createContext, useContext, useState, useEffect } from 'react'

type SidebarContextType = {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem('sidebarExpanded')
    return saved ? JSON.parse(saved) : false
  })

  const handleSetExpanded = (value: boolean) => {
    setExpanded(value)
    localStorage.setItem('sidebarExpanded', JSON.stringify(value))
  }

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded: handleSetExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
} 