'use client'
import React, { useState } from 'react'
import TopBar from '@/components/TopBar'
import Sidebar from '@/components/Sidebar'
import { User } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  user?: User
  onAuth: () => void
  onLogout: () => void
  children: React.ReactNode
}

export default function AppLayout({ 
  user, 
  onAuth, 
  onLogout,
  children 
}: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <TopBar 
        user={user}
        onAuth={onAuth}
        onLogout={onLogout}
        onSidebarToggle={toggleMobileSidebar}
      />

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Sidebar - Mobile */}
      {mobileSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleMobileSidebar}
          />
          <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-50 lg:hidden overflow-y-auto">
            <Sidebar collapsed={false} onToggle={toggleMobileSidebar} />
          </div>
        </>
      )}

      {/* Main Content */}
      <main 
        className={cn(
          "pt-16 transition-all duration-300",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        {children}
      </main>
    </div>
  )
}
