'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import ComplianceDashboard from '@/components/ComplianceDashboard'
import ComplianceViolationsPanel from '@/components/ComplianceViolationsPanel'
import LoadingScreen from '@/components/LoadingScreen'
import { authService, User } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function CompliancePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'violations' | 'frameworks'>('violations')

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        } else {
          authService.logout()
          router.push('/login')
        }
      } else {
        router.push('/login')
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router])

  const handleLogout = () => {
    authService.logout()
    router.push('/login')
  }

  const handleAuth = () => {
    router.push('/login')
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <AppLayout 
      user={user || undefined}
      onAuth={handleAuth}
      onLogout={handleLogout}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Quick Links */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Compliance Center</h1>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={activeTab === 'violations' ? 'default' : 'outline'}
              onClick={() => setActiveTab('violations')}
            >
              Violations
            </Button>
            <Button
              variant={activeTab === 'frameworks' ? 'default' : 'outline'}
              onClick={() => setActiveTab('frameworks')}
            >
              Frameworks
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/compliance/data-rights')}
            >
              Data Rights Portal
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/compliance/retention')}
            >
              Retention Policies
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/compliance/reports')}
            >
              Compliance Reports
            </Button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'violations' && <ComplianceViolationsPanel />}
        {activeTab === 'frameworks' && <ComplianceDashboard />}
      </div>
    </AppLayout>
  )
}
