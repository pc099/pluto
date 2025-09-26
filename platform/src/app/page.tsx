'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ComprehensiveIntelligenceDashboard from '@/components/ComprehensiveIntelligenceDashboard'
import LiveMonitoringDashboard from '@/components/LiveMonitoringDashboard'
import PolicyManagementDashboard from '@/components/PolicyManagementDashboard'
import AIQualityDashboard from '@/components/AIQualityDashboard'
import ComplianceDashboard from '@/components/ComplianceDashboard'
import MultiAgentDashboard from '@/components/MultiAgentDashboard'
import Navigation from '@/components/Navigation'
import DashboardLayout from '@/components/DashboardLayout'
import LandingPage from '@/components/LandingPage'
import UserProfile from '@/components/UserProfile'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { authService, User } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [showProfile, setShowProfile] = useState(false)
  const [activeTab, setActiveTab] = useState<'intelligence' | 'live' | 'analytics' | 'quality' | 'policies' | 'compliance' | 'multi-agent' | 'settings'>('intelligence')
  const [isLandingPage, setIsLandingPage] = useState(true)

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setIsLandingPage(false)
        } else {
          authService.logout()
          setIsLandingPage(true)
        }
      } else {
        setIsLandingPage(true)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setShowProfile(false)
    setIsLandingPage(true)
  }

  const handleAuth = () => {
    router.push('/login')
  }

  const handleProfile = () => {
    setShowProfile(true)
  }

  const handleSettings = () => {
    router.push('/settings')
  }

  const handleGetStarted = () => {
    router.push('/login')
  }

  const handleSignIn = () => {
    router.push('/login')
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  // Show landing page if user is not logged in
  if (isLandingPage) {
    return (
      <LandingPage 
        onGetStarted={handleGetStarted}
        onSignIn={handleSignIn}
      />
    )
  }

  // Show profile page
  if (showProfile && user) {
    return (
      <>
      <Navigation
        user={user || undefined}
        onAuth={handleAuth}
        onLogout={handleLogout}
        onProfile={handleProfile}
        onSettings={handleSettings}
        currentPage="profile"
      />
        <UserProfile
          user={user}
          onUpdate={updateUser}
          onLogout={handleLogout}
        />
      </>
    )
  }

  // Only show dashboard on the root path
  if (pathname !== '/') {
    return null // Let Next.js handle routing to other pages
  }

  // Show dashboard
  return (
    <>
      <Navigation
        user={user || undefined}
        onAuth={handleAuth}
        onLogout={handleLogout}
        onProfile={handleProfile}
        onSettings={handleSettings}
        currentPage="dashboard"
      />
      
      <DashboardLayout
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as typeof activeTab)}
      >
        <div className="p-8">
          {renderMainContent()}
        </div>
      </DashboardLayout>

    </>
  )

  function renderMainContent() {
    switch (activeTab) {
      case 'intelligence':
        return (
          <div className="text-white">
            <ComprehensiveIntelligenceDashboard />
          </div>
        )
      
      case 'live':
        return (
          <div className="text-white">
            <LiveMonitoringDashboard />
          </div>
        )
      
      case 'analytics':
        return (
          <div className="text-white">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
              <p className="text-gray-300 mb-6">Navigate to the Analytics page for detailed insights</p>
              <Button 
                onClick={() => router.push('/analytics')}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Go to Analytics
              </Button>
            </div>
          </div>
        )
      
      case 'quality':
        return (
          <div className="text-white">
            <AIQualityDashboard />
          </div>
        )
      
      case 'policies':
        return (
          <div className="text-white">
            <PolicyManagementDashboard />
          </div>
        )
      
      case 'compliance':
        return (
          <div className="text-white">
            <ComplianceDashboard />
          </div>
        )
      
      case 'multi-agent':
        return (
          <div className="text-white">
            <MultiAgentDashboard />
          </div>
        )
      
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
                    <p className="text-gray-600 mb-4">Manage your account preferences and settings.</p>
                    <Button onClick={handleProfile}>
                      View Profile
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">API Configuration</h3>
                    <p className="text-gray-600 mb-4">Configure your API keys and endpoints.</p>
                    <Button variant="outline">
                      Manage API Keys
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Notifications</h3>
                    <p className="text-gray-600 mb-4">Set up your notification preferences.</p>
                    <Button variant="outline">
                      Configure Notifications
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      
      default:
        return null
    }
  }
}