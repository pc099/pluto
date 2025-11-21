'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import UserProfile from '@/components/UserProfile'
import LoadingScreen from '@/components/LoadingScreen'
import { authService, User } from '@/lib/auth'

export default function ProfilePage() {
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

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return
    
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    
    // In a real app, you would save to backend here
    console.log('User updated:', updatedUser)
  }

  if (!user) {
    return <LoadingScreen />
  }

  return (
    <>
      <Navigation
        user={user}
        onAuth={handleAuth}
        onLogout={handleLogout}
      />
      <UserProfile
        user={user}
        onUpdate={updateUser}
        onLogout={handleLogout}
      />
    </>
  )
}
