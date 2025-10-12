'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import MissionControlDashboard from '@/components/MissionControlDashboard'
import { authService, User } from '@/lib/auth'

export default function MissionControlPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

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

  const handleProfile = () => {
    router.push('/')
  }

  const handleSettings = () => {
    router.push('/settings')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        user={user}
        onAuth={handleAuth}
        onLogout={handleLogout}
      />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Mission Control</h1>
              <p className="text-gray-600 mt-1">Enterprise AI Traffic Monitoring & Control Center</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MissionControlDashboard />
      </div>
    </div>
  )
}
