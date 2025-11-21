'use client'
import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ArrowRight, 
  Shield, 
  Brain, 
  CheckCircle,
  Lock,
  Eye,
  Sparkles,
  AlertTriangle,
  DollarSign
} from 'lucide-react'
import PlutoLogo from '@/components/PlutoLogo'
import MascotElle from '../../layouts/Elle.png'

interface LandingPageProps {
  onGetStarted: () => void
  onSignIn: () => void
}

export default function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const useCases = [
    {
      title: "Universal AI Gateway",
      description: "Single API endpoint for 12+ AI providers with automatic failover, load balancing, and smart routing",
      icon: <Shield className="w-5 h-5 text-purple-600" />
    },
    {
      title: "Multi-Agent Orchestration",
      description: "Build and deploy AI agent teams with intelligent task routing, execution monitoring, and chain-of-thought tracking",
      icon: <Brain className="w-5 h-5 text-blue-600" />
    },
    {
      title: "Production AI Observability",
      description: "Complete request logging, cost analytics, PII detection, and hallucination prevention for enterprise AI",
      icon: <Eye className="w-5 h-5 text-green-600" />
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO at TechCorp",
      content: "Pluto's PII detection saved us from a major compliance issue. The automatic redaction is a game-changer.",
      avatar: "SC"
    },
    {
      name: "Michael Rodriguez",
      role: "AI Lead at InnovateLab",
      content: "We reduced our AI costs by 40% with smart routing. The platform pays for itself.",
      avatar: "MR"
    },
    {
      name: "Emily Watson",
      role: "Product Manager at DataFlow",
      content: "The hallucination detection caught errors we never knew existed. Our AI quality improved dramatically.",
      avatar: "EW"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-border bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <PlutoLogo size={64} showText={false} />
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Features</a>
              <a href="#use-cases" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Use Cases</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Pricing</a>
              <a href="#docs" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Docs</a>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={onSignIn} className="text-sm">
                Sign In
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-primary hover:bg-primary/90 text-white text-sm"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>Your workbench for AI engineering</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Rigorously build<br />great AI products
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Unified platform for AI observability, PII detection, hallucination prevention, and cost optimization. Ship production AI with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6 h-auto"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 h-auto border-gray-300"
            >
              View Demo
            </Button>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-gray-200 p-8 shadow-2xl">
              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
                <div className="grid gap-8 md:grid-cols-2 items-center">
                  {/* API request preview */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex space-x-1">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 bg-gray-100 rounded px-3 py-1 text-xs text-gray-500">
                        api.pluto.ai/v1/chat/completions
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-3 text-left">
                          <p className="text-sm text-gray-700">Analyze this customer feedback and extract sentiment...</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 text-left">
                          <p className="text-sm text-gray-700">✓ PII Detected & Redacted</p>
                          <p className="text-sm text-gray-700">✓ Hallucination Check: Pass</p>
                          <p className="text-sm text-gray-700">✓ Cost Optimized</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swagger pup mascot */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-200/60 blur-3xl rounded-full opacity-70" />
                      <div className="relative rounded-2xl bg-blue-100 p-4 shadow-xl border border-blue-200">
                        <Image
                          src={MascotElle}
                          alt="Pluto swagger pup mascot"
                          width={320}
                          height={320}
                          className="h-auto w-40 sm:w-48 md:w-64"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Use cases
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <Card key={index} className="border-2 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    {useCase.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {useCase.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* PII Detection */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">PII Detection</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Automatically detect and redact sensitive data in real-time. GDPR and HIPAA compliant out of the box.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Detect emails, SSN, credit cards, phone numbers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Automatic redaction and masking</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Compliance audit logs</span>
                </li>
              </ul>
            </div>

            {/* Hallucination Prevention */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Hallucination Prevention</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Real-time fact-checking against external sources. Prevent AI errors before they reach production.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Verify against 6 external sources</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Confidence scoring for every response</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Automatic flagging of suspicious content</span>
                </li>
              </ul>
            </div>

            {/* Cost Optimization */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Cost Optimization</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Smart routing across 12+ AI providers. Automatically reduce costs while maintaining quality.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Intelligent provider selection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Automatic failover and load balancing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Real-time cost tracking and alerts</span>
                </li>
              </ul>
            </div>

            {/* Complete Observability */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Complete Observability</h3>
              </div>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Monitor every AI request with powerful search, filtering, and analytics capabilities.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Full request/response logging</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Advanced search and filtering</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Export and analysis tools</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What users are saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                      <p className="text-gray-500 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to build production AI?
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            Join teams shipping AI products with confidence
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 h-auto border-white text-white hover:bg-white/10"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-blue-950 via-slate-950 to-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-sm">Product</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Company</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-sm">Legal</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
                <li><a href="#" className="hover:text-white">Licenses</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800/60 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <PlutoLogo size={24} showText={false} />
              <span className="text-sm text-blue-100">&copy; 2024 Pluto. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-blue-200 hover:text-white text-sm">Twitter</a>
              <a href="#" className="text-blue-200 hover:text-white text-sm">GitHub</a>
              <a href="#" className="text-blue-200 hover:text-white text-sm">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
