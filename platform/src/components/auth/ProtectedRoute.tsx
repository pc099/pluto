'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService, User } from '@/lib/auth'
import LoginForm from './LoginForm'
import LoadingScreen from '@/components/LoadingScreen'

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          setIsAuthenticated(true)
        } else {
          authService.logout()
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      authService.logout()
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setUser(authService.getUser())
  }

  if (isLoading) {
    return (
      <LoadingScreen />
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onAuthSuccess={handleAuthSuccess} />
  }

  return <>{children}</>
}
