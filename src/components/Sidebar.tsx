import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  NotebookText,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react"
import { useAuth } from "@/components/AuthProvider"
import { useSidebar } from "./SidebarContext"
import { useProject } from "./ProjectContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"

interface SidebarProps {
  onDashboardClick?: () => boolean;
  onSignOut?: () => boolean;
}

export const Sidebar = ({ onDashboardClick, onSignOut }: SidebarProps) => {
  const { expanded, setExpanded } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut } = useAuth()
  const { projects } = useProject()
  const [mobileOpen, setMobileOpen] = useState(false)

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { 
      icon: NotebookText, 
      label: "Notes", 
      path: "/notes",
      disabled: projects.length === 0,
      tooltip: projects.length === 0 ? "Create a project to start taking notes" : undefined
    },
  ]

  const handleNavigation = (path: string) => {
    if (path === location.pathname) return
    
    if (path === "/dashboard" && onDashboardClick) {
      if (!onDashboardClick()) return;
    }
    
    navigate(path === "/dashboard" ? "/" : path)
  }

  const isCurrentPath = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/"
    }
    return location.pathname.startsWith(path)
  }

  const handleSignOutClick = () => {
    if (onSignOut && !onSignOut()) return;
    signOut();
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="left" 
              className="w-[240px] bg-primary text-primary-foreground p-4 border-0"
            >
              <div className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={cn(
                      "w-full transition-colors duration-200",
                      "flex items-center text-primary-foreground justify-start px-4 gap-4",
                      isCurrentPath(item.path) 
                        ? "bg-primary-foreground/20" 
                        : "hover:bg-primary-foreground/20",
                      item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}
                    onClick={() => {
                      if (!item.disabled) {
                        handleNavigation(item.path);
                        setMobileOpen(false);
                      }
                    }}
                    disabled={item.disabled}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Button>
                ))}
                <div className="mt-auto pt-4 border-t border-primary-foreground/20">
                  <Button
                    variant="ghost"
                    className="w-full transition-colors duration-200 flex items-center text-primary-foreground hover:bg-primary-foreground/20 justify-start px-4 gap-4"
                    onClick={() => {
                      handleSignOutClick();
                      setMobileOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-lg">Buggit</span>
        </div>
      </div>

      {/* Main Content Container - Mobile */}
      <div className="md:hidden pt-14">
        <div className="container mx-auto p-4">
          {/* Your main content goes here */}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col justify-between",
        "bg-primary text-primary-foreground",
        "transition-[width] duration-300 ease-in-out",
        expanded ? "w-52" : "w-14",
        "hidden md:flex" // Hide on mobile, show on desktop
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
              <TooltipProvider key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full transition-colors duration-200",
                          "flex items-center text-primary-foreground",
                          expanded ? "justify-start px-4 gap-4" : "justify-center",
                          isCurrentPath(item.path) 
                            ? "bg-primary-foreground/20" 
                            : "hover:bg-primary-foreground/20",
                          item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                        )}
                        onClick={() => !item.disabled && handleNavigation(item.path)}
                        disabled={item.disabled}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {expanded && <span>{item.label}</span>}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {item.tooltip && !expanded && (
                    <TooltipContent side="right">
                      <p>{item.tooltip}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        <div className="p-2 border-t border-primary-foreground/20">
          <Button
            variant="ghost"
            className={cn(
              "w-full transition-colors duration-200",
              "flex items-center text-primary-foreground hover:bg-primary-foreground/20",
              expanded ? "justify-start px-4 gap-4" : "justify-center"
            )}
            onClick={handleSignOutClick}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {expanded && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    </>
  )
} 