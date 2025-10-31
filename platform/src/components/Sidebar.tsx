'use client'
import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Home,
  Bot,
  Shield,
  BarChart3,
  Lock,
  FileCheck,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Globe,
  Eye,
  AlertTriangle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const mainNavigationItems = [
    { id: 'home', label: 'Home', href: '/home', icon: Home, description: 'Get started' },
  ]

  const gatewayNavigationItems = [
    { id: 'gateway-home', label: 'Gateway Home', href: '/gateway/home', icon: Globe, description: 'Gateway overview' },
    { id: 'requests', label: 'Requests', href: '/requests', icon: Activity, description: 'Request logs' },
    { id: 'analytics', label: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Usage analytics' },
    { id: 'pii-tracking', label: 'PII Detection', href: '/pii-tracking', icon: Eye, description: 'PII detection' },
    { id: 'security', label: 'Security', href: '/security', icon: Lock, description: 'Security dashboard' },
    { id: 'compliance', label: 'Compliance', href: '/compliance', icon: FileCheck, description: 'Compliance tracking' },
    { id: 'policies', label: 'Policies', href: '/policies', icon: Shield, description: 'Policy management' },
  ]

  const agentsNavigationItems = [
    { id: 'agents-home', label: 'Agents Home', href: '/agents/home', icon: Bot, description: 'Agents overview' },
    { id: 'agents', label: 'My Agents', href: '/agents', icon: Bot, description: 'Manage agents' },
    { id: 'chat', label: 'Playground', href: '/chat', icon: MessageSquare, description: 'Test agents' },
  ]

  const isActive = (href: string) => {
    if (href === '/home' && pathname === '/') return true
    return pathname === href
  }

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <div 
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50 transition-colors shadow-sm"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Sidebar Content */}
      <div className="flex flex-col h-full py-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="px-3 mb-6">
          <nav className="space-y-1">
            {mainNavigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    active
                      ? "bg-purple-50 text-purple-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={collapsed ? item.label : ''}
                >
                  <Icon className={cn(
                    "flex-shrink-0",
                    collapsed ? "h-5 w-5" : "h-5 w-5 mr-3",
                    active ? "text-purple-600" : "text-gray-500"
                  )} />
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  {!collapsed && active && (
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Gateway Section */}
        <div className="px-3 mb-6">
          {!collapsed && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center">
              <Globe className="h-3 w-3 mr-1" />
              Gateway
            </h3>
          )}
          {collapsed && (
            <div className="border-t border-gray-200 my-4"></div>
          )}
          <nav className="space-y-1">
            {gatewayNavigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    active
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={collapsed ? item.label : ''}
                >
                  <Icon className={cn(
                    "flex-shrink-0",
                    collapsed ? "h-5 w-5" : "h-5 w-5 mr-3",
                    active ? "text-blue-600" : "text-gray-500"
                  )} />
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  {!collapsed && active && (
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Agents Section */}
        <div className="px-3 mb-6">
          {!collapsed && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-purple-600 uppercase tracking-wider flex items-center">
              <Bot className="h-3 w-3 mr-1" />
              Agents
            </h3>
          )}
          {collapsed && (
            <div className="border-t border-gray-200 my-4"></div>
          )}
          <nav className="space-y-1">
            {agentsNavigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    active
                      ? "bg-purple-50 text-purple-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  title={collapsed ? item.label : ''}
                >
                  <Icon className={cn(
                    "flex-shrink-0",
                    collapsed ? "h-5 w-5" : "h-5 w-5 mr-3",
                    active ? "text-purple-600" : "text-gray-500"
                  )} />
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  {!collapsed && active && (
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings at Bottom */}
        <div className="mt-auto px-3">
          {collapsed && (
            <div className="border-t border-gray-200 mb-4"></div>
          )}
          <button
            onClick={() => handleNavigation('/settings')}
            className={cn(
              "w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
              isActive('/settings')
                ? "bg-purple-50 text-purple-700 shadow-sm"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            )}
            title={collapsed ? 'Settings' : ''}
          >
            <Settings className={cn(
              "flex-shrink-0",
              collapsed ? "h-5 w-5" : "h-5 w-5 mr-3",
              isActive('/settings') ? "text-purple-600" : "text-gray-500"
            )} />
            {!collapsed && (
              <span className="flex-1 text-left">Settings</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
