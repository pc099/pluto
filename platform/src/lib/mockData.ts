// Centralized mock data for consistent metrics across the platform

export const MOCK_METRICS = {
  // Gateway Metrics
  gateway: {
    requestsToday: 18813,
    activeProviders: 6,
    avgProxyLatency: '124ms',
    blockedRequests: 47,
    costSavings: 34, // percentage
    dailyCost: 247.32,
  },
  
  // Agents Metrics
  agents: {
    activeAgents: 12,
    totalExecutions: 8432,
    successRate: 98.7,
    avgLatency: '1.2s',
    totalRequests: 13727,
  },
  
  // Shared Metrics
  shared: {
    totalRequests: 18813, // Same as gateway.requestsToday
    avgResponseTime: '847ms',
    uptime: 99.9,
  },
  
  // PII Detection
  pii: {
    detectionRate: 98.7,
    totalScanned: 18813,
    issuesDetected: 127,
    avgConfidence: 94.3,
  },
  
  // Hallucination Detection
  hallucination: {
    detectionRate: 98.7,
    verifiedClaims: 12847,
    issuesDetected: 127,
    avgConfidence: 94.3,
    hallucinationRate: 0.99,
  },
  
  // Smart Routing
  smartRouting: {
    totalRequests: 13727,
    avgLatency: '2.4s',
    successRate: 97.2,
    activeAgents: 4,
  },
}

export const MOCK_PROVIDERS = [
  { name: 'OpenAI', endpoint: 'api.openai.com', requests: 8234, status: 'active' },
  { name: 'Anthropic', endpoint: 'api.anthropic.com', requests: 3421, status: 'active' },
  { name: 'Google AI', endpoint: 'generativelanguage.googleapis.com', requests: 2156, status: 'active' },
  { name: 'Cohere', endpoint: 'api.cohere.ai', requests: 1892, status: 'active' },
  { name: 'Mistral', endpoint: 'api.mistral.ai', requests: 1234, status: 'active' },
  { name: 'Perplexity', endpoint: 'api.perplexity.ai', requests: 876, status: 'active' },
]

export const MOCK_AGENTS = [
  {
    id: 'agent-1',
    name: 'Customer Support Agent',
    specialty: 'Customer queries, FAQ, troubleshooting',
    requests: 8234,
    avgLatency: '1.2s',
    successRate: 98.7,
    status: 'active',
  },
  {
    id: 'agent-2',
    name: 'Code Review Agent',
    specialty: 'Code analysis, bug detection',
    requests: 2145,
    avgLatency: '2.8s',
    successRate: 96.3,
    status: 'active',
  },
  {
    id: 'agent-3',
    name: 'Content Generator',
    specialty: 'Blog posts, marketing copy',
    requests: 1892,
    avgLatency: '3.5s',
    successRate: 94.8,
    status: 'active',
  },
  {
    id: 'agent-4',
    name: 'Data Analyst',
    specialty: 'Data analysis, insights',
    requests: 1456,
    avgLatency: '4.2s',
    successRate: 97.2,
    status: 'active',
  },
]

export const MOCK_MODELS = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    description: 'Most capable model, best for complex tasks',
    contextWindow: '8K tokens',
    requests: 8234,
    avgLatency: '1.2s',
    successRate: 98.7,
    status: 'active',
    cost: '$0.03/1K tokens',
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    description: 'Faster and cheaper than GPT-4, 128K context',
    contextWindow: '128K tokens',
    requests: 5892,
    avgLatency: '0.9s',
    successRate: 97.5,
    status: 'active',
    cost: '$0.01/1K tokens',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Optimized for speed and cost, multimodal',
    contextWindow: '128K tokens',
    requests: 4321,
    avgLatency: '0.7s',
    successRate: 96.8,
    status: 'active',
    cost: '$0.005/1K tokens',
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    description: 'Most intelligent Claude model, best quality',
    contextWindow: '200K tokens',
    requests: 3145,
    avgLatency: '1.5s',
    successRate: 98.2,
    status: 'active',
    cost: '$0.015/1K tokens',
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Balanced performance and cost, very capable',
    contextWindow: '200K tokens',
    requests: 6234,
    avgLatency: '1.1s',
    successRate: 97.9,
    status: 'active',
    cost: '$0.003/1K tokens',
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    description: 'Fastest and most affordable Claude model',
    contextWindow: '200K tokens',
    requests: 2876,
    avgLatency: '0.5s',
    successRate: 95.4,
    status: 'active',
    cost: '$0.00025/1K tokens',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Google\'s most capable model, multimodal',
    contextWindow: '32K tokens',
    requests: 1987,
    avgLatency: '1.0s',
    successRate: 96.3,
    status: 'active',
    cost: '$0.0005/1K tokens',
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    description: 'Top-tier reasoning, multilingual support',
    contextWindow: '32K tokens',
    requests: 1234,
    avgLatency: '0.8s',
    successRate: 95.8,
    status: 'active',
    cost: '$0.008/1K tokens',
  },
]

// Verification Sources for Hallucination Detection
export const VERIFICATION_SOURCES = [
  { source: 'Wikipedia', icon: '📚', requests: 8234, accuracy: 96.8, latency: '340ms' },
  { source: 'Academic Databases', icon: '🎓', requests: 2145, accuracy: 98.2, latency: '520ms' },
  { source: 'News APIs', icon: '📰', requests: 1892, accuracy: 94.5, latency: '280ms' },
  { source: 'Government Data', icon: '🏛️', requests: 576, accuracy: 99.1, latency: '450ms' },
  { source: 'Scientific Journals', icon: '🔬', requests: 892, accuracy: 97.8, latency: '680ms' },
  { source: 'Financial Data', icon: '💰', requests: 1108, accuracy: 98.9, latency: '390ms' },
]

// Routing Strategies
export const ROUTING_STRATEGIES = [
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Optimal balance of cost, performance, and quality',
    metrics: { cost: 75, performance: 80, quality: 85 },
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Prioritize fastest response times',
    metrics: { cost: 60, performance: 95, quality: 80 },
  },
  {
    id: 'cost',
    name: 'Cost Optimized',
    description: 'Minimize costs while maintaining quality',
    metrics: { cost: 95, performance: 70, quality: 75 },
  },
  {
    id: 'quality',
    name: 'Quality First',
    description: 'Best output quality regardless of cost',
    metrics: { cost: 50, performance: 75, quality: 98 },
  },
  {
    id: 'failover',
    name: 'Failover',
    description: 'Automatic fallback to backup models',
    metrics: { cost: 70, performance: 85, quality: 90 },
  },
]
