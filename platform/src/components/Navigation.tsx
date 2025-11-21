'use client'
import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Bell, 
  Settings, 
  User as UserIcon, 
  LogOut, 
  CreditCard, 
  HelpCircle,
  Menu,
  X,
  Home,
  Bot,
  Shield,
  BarChart3,
  Lock,
  FileCheck,
  MessageSquare
} from 'lucide-react'
import PlutoLogo from '@/components/PlutoLogo'

import { User } from '@/lib/auth'

interface NavigationProps {
  user?: User
  onAuth: () => void
  onLogout: () => void
}

export default function Navigation({ 
  user, 
  onAuth, 
  onLogout
}: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Main navigation items (always visible)
  const mainNavigationItems = [
    { id: 'dashboard', label: 'Overview', href: '/overview', icon: Home, description: 'System overview' },
    { id: 'chat', label: 'AI Chat', href: '/chat', icon: MessageSquare, description: 'Chat with AI' },
    { id: 'agents', label: 'Agents', href: '/agents', icon: Bot, description: 'AI agents' },
    { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Reports & insights' }
  ]

  // Advanced navigation items (in dropdown)
  const advancedNavigationItems = [
    { id: 'mission-control', label: 'Mission Control', href: '/mission-control', icon: Shield, description: 'Traffic monitoring' },
    { id: 'security', label: 'Security', href: '/security', icon: Lock, description: 'Security threats' },
    { id: 'compliance', label: 'Compliance', href: '/compliance', icon: FileCheck, description: 'Compliance monitoring' },
    { id: 'policies', label: 'Policies', href: '/policies', icon: Settings, description: 'Policy management' }
  ]

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <PlutoLogo size={60} showText={false} iconOnly />
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {mainNavigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.href)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title={item.description}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                )
              })}
              
              {/* More Menu for Advanced Features */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <Menu className="h-4 w-4 mr-2" />
                    More
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Advanced Features</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {advancedNavigationItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <DropdownMenuItem key={item.id} onClick={() => router.push(item.href)}>
                        <IconComponent className="mr-2 h-4 w-4" />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Search Bar - Removed to reduce clutter */}
          <div className="flex-1"></div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative hidden sm:flex">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-blue-200">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-blue-700 text-white text-sm font-semibold">
                          {getInitials(`${user.first_name} ${user.last_name}`)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{user.first_name} {user.last_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground capitalize mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/billing')}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/help')}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Help & Support</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Auth Buttons */}
                <Button variant="ghost" onClick={onAuth} className="hidden sm:flex">
                  Sign In
                </Button>
                <Button 
                  onClick={onAuth}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {/* Main Navigation Items */}
              <div className="mb-2">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main</p>
                {mainNavigationItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(item.href)
                        setMobileMenuOpen(false)
                      }}
                      className={`flex items-center space-x-3 w-full text-left px-3 py-3 rounded-lg text-base font-medium ${
                        pathname === item.href
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
              
              {/* Advanced Navigation Items */}
              <div>
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Advanced</p>
                {advancedNavigationItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        router.push(item.href)
                        setMobileMenuOpen(false)
                      }}
                      className={`flex items-center space-x-3 w-full text-left px-3 py-3 rounded-lg text-base font-medium ${
                        pathname === item.href
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
