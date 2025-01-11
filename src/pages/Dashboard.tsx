import { Sidebar } from "@/components/Sidebar"
import { TaskBoard } from "@/components/TaskBoard"
import { ProfileSidebar } from "@/components/ProfileSidebar"
import { PricingDialog } from "@/components/PricingDialog"
import { useState } from "react"
import { UserProvider } from "@/components/UserContext"
import { useAuth } from "@/components/AuthProvider"

export default function Dashboard() {
  const [profileOpen, setProfileOpen] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('profile')
  const { user } = useAuth()

  const handleProfileClick = (tab?: string) => {
    if (tab === 'subscription') {
      setPricingOpen(true)
    } else {
      setActiveTab(tab || 'profile')
      setProfileOpen(true)
    }
  }

  const handlePricingClose = () => {
    setPricingOpen(false)
  }

  const handleProfileClose = () => {
    setProfileOpen(false)
  }

  return (
    <UserProvider value={{ user }}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Sidebar />
        <div className="pl-16">
          <TaskBoard onProfileClick={handleProfileClick} />
          {profileOpen && (
            <ProfileSidebar 
              open={profileOpen} 
              onOpenChange={handleProfileClose}
              defaultTab={activeTab}
            />
          )}
          {pricingOpen && (
            <PricingDialog
              open={pricingOpen}
              onOpenChange={handlePricingClose}
            />
          )}
        </div>
      </div>
    </UserProvider>
  )
} 