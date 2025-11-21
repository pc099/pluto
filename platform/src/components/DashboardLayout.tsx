'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Brain, 
  Activity, 
  BarChart3, 
  Shield, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Users,
  FileText,
  Globe
} from 'lucide-react'
import PlutoLogo from '@/components/PlutoLogo'

interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  href?: string
  badge?: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const sidebarItems: SidebarItem[] = [
    {
      id: 'intelligence',
      label: 'AI Intelligence',
      icon: <Brain className="w-5 h-5" />,
      description: 'Cross-provider AI orchestration'
    },
    {
      id: 'live',
      label: 'Live Monitoring',
      icon: <Activity className="w-5 h-5" />,
      description: 'Real-time AI performance tracking'
    },
    {
      id: 'quality',
      label: 'Quality Analysis',
      icon: <Zap className="w-5 h-5" />,
      description: 'AI response quality scoring'
    },
    {
      id: 'policies',
      label: 'Policies',
      icon: <FileText className="w-5 h-5" />,
      description: 'AI governance and policies'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: <Shield className="w-5 h-5" />,
      description: 'Regulatory compliance monitoring'
    },
    {
      id: 'multi-agent',
      label: 'Multi-Agent',
      icon: <Users className="w-5 h-5" />,
      description: 'Intelligent agent routing & orchestration'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Platform configuration'
    }
  ]

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          {sidebarCollapsed ? (
            <div className="flex justify-center">
              <PlutoLogo size={32} showText={false} iconOnly />
            </div>
          ) : (
            <PlutoLogo size={40} showText={false} />
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className={`${activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`}>
                {item.icon}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-75 truncate">{item.description}</p>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full justify-center"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 capitalize">
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-base text-gray-600 mt-1">
                {sidebarItems.find(item => item.id === activeTab)?.description || 'Manage your AI platform'}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Globe className="w-4 h-4 mr-2" />
                API Docs
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Zap className="w-4 h-4 mr-2" />
                Quick Start
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
