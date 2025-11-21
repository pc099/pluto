'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import ComplianceReportBuilder from '@/components/ComplianceReportBuilder'
import LoadingScreen from '@/components/LoadingScreen'
import { authService, User } from '@/lib/auth'

export default function ComplianceReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
        <ComplianceReportBuilder />
      </div>
    </AppLayout>
  )
}
