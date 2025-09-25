'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  BarChart3, 
  Brain, 
  Users, 
  Globe,
  CheckCircle,
  Star,
  Rocket
} from 'lucide-react'
import PlutoLogo from '@/components/PlutoLogo'

interface LandingPageProps {
  onGetStarted: () => void
  onSignIn: () => void
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI Intelligence",
      description: "Unified interface for all major AI models with intelligent routing and failover"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Built-in compliance monitoring for NIST, EU AI Act, HIPAA, and more"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Monitor AI performance, costs, and quality with comprehensive dashboards"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Quality Detection",
      description: "Detect hallucinations, bias, and security vulnerabilities in real-time"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multi-Agent Management",
      description: "Orchestrate multiple AI agents with intelligent routing and load balancing"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Scale",
      description: "Deploy and manage AI workloads across multiple providers and regions"
    }
  ]

  const stats = [
    { label: "12T+", description: "Monthly Tokens" },
    { label: "4.2M+", description: "Global Users" },
    { label: "60+", description: "AI Providers" },
    { label: "500+", description: "Models Available" }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO, TechCorp",
      content: "Pluto has revolutionized how we manage our AI infrastructure. The intelligent routing alone saved us 40% on costs.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "AI Lead, InnovateLab",
      content: "The compliance monitoring features are game-changing. We can now confidently deploy AI in regulated industries.",
      rating: 5
    },
    {
      name: "Emily Watson",
      role: "Product Manager, DataFlow",
      content: "The quality detection caught issues we never knew existed. Our AI reliability improved by 60%.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <PlutoLogo size={40} />
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onSignIn}>
                Sign In
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Main Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                The Unified Interface
                <br />
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  For AI Models
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Better prices, better uptime, no subscription. Manage all your AI models from one intelligent platform with enterprise-grade security and compliance.
              </p>

              {/* Chat Interface */}
              <div className="max-w-lg mb-8">
                <div className="relative">
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">
                    <p className="text-gray-500 text-sm">Start a message...</p>
                  </div>
                  <Button 
                    size="sm"
                    className="absolute right-2 top-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch to Pluto
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-gray-300 hover:bg-gray-50"
                >
                  View Demo
                </Button>
              </div>
            </div>

            {/* Right Side - Featured Models */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Featured Models</h3>
                <a href="#" className="text-sm text-purple-600 hover:text-purple-700 flex items-center">
                  View Trending
                  <ArrowRight className="w-3 h-3 ml-1" />
                </a>
              </div>

              <div className="space-y-4">
                {/* GPT-4 Model Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">G</span>
                      </div>
                      <span className="font-semibold text-gray-900">GPT-4 Turbo</span>
                    </div>
                    <div className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">O</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">by openai</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">171.5B Tokens/wk</span>
                      <span className="text-gray-600">2.4s Latency</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">+8.82% Weekly growth</div>
                  </div>
                </div>

                {/* Claude Model Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-xs font-bold">C</span>
                      </div>
                      <span className="font-semibold text-gray-900">Claude 3.5 Sonnet</span>
                    </div>
                    <div className="w-5 h-5 bg-orange-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">by anthropic</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">69.1B Tokens/wk</span>
                      <span className="text-gray-600">5.8s Latency</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">+21.67% Weekly growth</div>
                  </div>
                </div>

                {/* Gemini Model Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">G</span>
                      </div>
                      <span className="font-semibold text-gray-900">Gemini 2.0 Flash</span>
                    </div>
                    <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">by google</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">624.0B Tokens/wk</span>
                      <span className="text-gray-600">1.8s Latency</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium">+4.04% Weekly growth</div>
                  </div>
                </div>
              </div>

              {/* Connection Lines */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 hidden lg:block">
                <div className="space-y-8">
                  <div className="w-8 h-px bg-gray-300"></div>
                  <div className="w-8 h-px bg-gray-300"></div>
                  <div className="w-8 h-px bg-gray-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From intelligent routing to compliance monitoring, Pluto provides all the tools you need to manage AI at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to launch your AI journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of developers and enterprises already using Pluto to manage their AI infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <PlutoLogo size={40} />
              <p className="text-gray-400 mt-4">
                The unified interface for AI models. Better prices, better uptime, no subscription.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pluto. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
