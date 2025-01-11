import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  StickyNote,
  ChevronRight,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/components/AuthProvider"

export function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: StickyNote, label: "Notes", path: "/notes" },
  ]

  return (
    <div className={cn(
      "h-screen fixed left-0 top-0 z-40 flex flex-col justify-between",
      "bg-primary transition-all duration-300 text-primary-foreground",
      expanded ? "w-56" : "w-16"
    )}>
      <div>
        <div className="flex items-center justify-between p-4 border-b border-primary-foreground/20">
          {expanded && (
            <span className="font-semibold text-lg">Buggit</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 hover:bg-primary-foreground/20 text-primary-foreground"
          >
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform duration-300",
              expanded ? "rotate-180" : ""
            )} />
          </Button>
        </div>

        <div className="flex flex-col gap-2 p-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "justify-start gap-4 text-primary-foreground hover:bg-primary-foreground/20",
                expanded ? "px-4" : "px-0 py-2 justify-center"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="h-5 w-5" />
              {expanded && <span>{item.label}</span>}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-2 border-t border-primary-foreground/20">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-4 text-primary-foreground hover:bg-primary-foreground/20",
            expanded ? "px-4" : "px-0 py-2 justify-center"
          )}
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5" />
          {expanded && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  )
} 