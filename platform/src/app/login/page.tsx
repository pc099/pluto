'use client'
import LoginForm from '@/components/auth/LoginForm'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth'
import { useEffect } from 'react'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/overview') // Redirect to overview if already authenticated
    }
  }, [router])

  const handleAuthSuccess = () => {
    router.push('/overview') // Redirect to overview after successful login/registration
  }

  return <LoginForm onAuthSuccess={handleAuthSuccess} />
}
