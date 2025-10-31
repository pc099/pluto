# 🚀 Pluto AI Platform

> The Complete Platform for Production AI

[![Status](https://img.shields.io/badge/status-production--ready-brightgreen)]()
[![Version](https://img.shields.io/badge/version-2.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-orange)]()

## 🎯 Overview

**Two Products. One Platform.**

Pluto AI Platform provides enterprise-grade AI infrastructure with two distinct products:

### 🌐 AI Gateway - Organizational Monitoring
Monitor ALL AI API calls going through your organization
- Intercept requests to OpenAI/Anthropic/etc.
- Track costs across teams
- Enforce policies
- Detect PII/security issues

**Target Users:** Engineering teams, DevOps, Security

### 🤖 AI Agent Platform - Agent Development  
Build, deploy, and manage intelligent AI agents
- Multi-agent orchestration
- **Smart Routing** with model fallbacks
- Agent performance tracking
- Hallucination detection

**Target Users:** AI developers, Product teams

---

## ⭐ NEW: Smart Routing

**State-of-the-art per-agent model configuration:**
- Configure routing strategy per agent (Balanced, Performance, Cost, Quality, Failover)
- 3-tier model fallbacks (Primary → Secondary → Tertiary)
- 8 LLM models to choose from (GPT-4, Claude 3.5, Gemini Pro, etc.)
- Visual configuration interface

**See it in action:** `/agents/routing`

---

## 🚀 Key Features

### Gateway Features
- 🌐 **AI Proxy** - Organizational proxy to intercept API calls
- 💰 **Cost Analytics** - Real-time cost tracking and optimization
- 🔍 **PII Detection** - 98.7% accuracy, automatic alerts
- 🛡️ **Security** - Threat detection and monitoring
- 📋 **Compliance** - GDPR, HIPAA, SOC 2 compliance
- 🔒 **Policies** - Budget limits and content filtering

### Agent Features
- 🤖 **Smart Routing** - Per-agent model configuration with fallbacks
- 🎯 **Agent Management** - Create and manage AI agents
- 🧪 **Playground** - Test agents in real-time
- ✅ **Hallucination Detection** - Verify outputs with 6 external sources
- 📊 **Performance Tracking** - Monitor agent success rates

### Shared Features
- 📝 **Request Logging** - Full request/response tracking
- 🔐 **Security Dashboard** - Unified security monitoring
- ✅ **Compliance Tracking** - Cross-product compliance

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- OpenAI API Key
- Anthropic API Key (optional)
- Supabase account

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd pluto/platform

# Install frontend dependencies
npm install

# Install backend dependencies
cd src/python-backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create `src/python-backend/.env`:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

### 3. Start the Platform

```bash
# Terminal 1: Start backend
cd src/python-backend
python main.py

# Terminal 2: Start frontend
npm run dev
```

### 4. Access the Platform

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](QUICK_START.md)** - Complete walkthrough of both products
- **[Final Product Summary](FINAL_PRODUCT_SUMMARY.md)** - Complete feature list
- **[Product Analysis](PRODUCT_ANALYSIS.md)** - Strengths, gaps, and roadmap

### Implementation Details
- **[Product Separation](PRODUCT_SEPARATION_COMPLETE.md)** - Gateway vs Agents architecture
- **[AI Proxy Implementation](AI_PROXY_IMPLEMENTATION.md)** - Proxy setup guide
- **[Smart Routing](SMART_ROUTING_ENHANCEMENT.md)** - Per-agent routing details
- **[Sidebar Structure](SIDEBAR_RESTRUCTURE.md)** - Navigation organization

### Demo & Presentation
- **[Demo Update Checklist](DEMO_UPDATE_CHECKLIST.md)** - Demo preparation guide
- **[YC Presentation Ready](YC_PRESENTATION_READY.md)** - Pitch checklist

## 🎯 For YC Presentation

**Everything is configured and ready!** See [YC_PRESENTATION_READY.md](YC_PRESENTATION_READY.md) for:
- ✅ Pre-demo checklist
- 🎬 Recommended demo flow
- 💡 Key talking points
- 🔥 YC interview prep

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │  Next.js 14 + React + TailwindCSS
│  (Port 3000)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │  FastAPI + Python
│  (Port 8000)│
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────┐   ┌──────────┐
│  OpenAI  │   │Anthropic │
│   API    │   │   API    │
└──────────┘   └──────────┘
       │              │
       └──────┬───────┘
              ▼
       ┌──────────┐
       │ Supabase │
       │ Database │
       └──────────┘
```

## 🎨 Features

### 1. AI Chat Interface
- Unified chat with multiple AI models
- Real-time cost and token tracking
- Model switching (GPT-4, GPT-3.5, Claude)
- Quota monitoring

### 2. Mission Control
- Live request monitoring
- Real-time traffic analysis
- Quality metrics
- Security alerts

### 3. Analytics Dashboard
- Cost breakdown by provider/model
- Usage trends over time
- Request volume charts
- Performance metrics

### 4. Policy Management
- Budget limits (daily/monthly)
- Content filtering
- Access control
- Automatic enforcement

### 5. Security Monitoring
- Threat detection
- Hallucination analysis
- PII detection
- Compliance checks

### 6. Settings & Configuration
- Proxy status monitoring
- API key management
- User preferences
- Billing information

## 🔧 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18
- **Styling:** TailwindCSS + shadcn/ui
- **State:** React Hooks
- **API Client:** Fetch API

### Backend
- **Framework:** FastAPI (Python)
- **Async:** asyncio + httpx
- **Database:** Supabase (PostgreSQL)
- **Auth:** JWT tokens
- **WebSocket:** Native FastAPI WebSocket

### Infrastructure
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database:** Supabase Cloud
- **CDN:** Vercel Edge Network

## 📊 API Endpoints

### Proxy Endpoints
- `POST /proxy/openai/{endpoint}` - Proxy to OpenAI
- `POST /proxy/anthropic/{endpoint}` - Proxy to Anthropic
- `POST /ai/chat` - Unified chat endpoint
- `GET /ai/models` - List available models

### Analytics
- `GET /analytics/costs` - Cost analytics
- `GET /analytics/usage` - Usage statistics
- `GET /analytics/recent-requests` - Recent requests

### Policy Management
- `GET /policies` - List policies
- `POST /policies` - Create policy
- `PUT /policies/{id}` - Update policy
- `DELETE /policies/{id}` - Delete policy

### Quality Analysis
- `GET /quality/statistics` - Quality stats
- `GET /quality/recent` - Recent analyses
- `GET /quality/trends` - Quality trends

## 🧪 Testing

### Run Integration Tests

```bash
cd src/python-backend
python test_integration.py
```

### Manual Testing

1. **Test Chat Interface:**
   - Navigate to `/chat`
   - Send a message
   - Verify cost tracking

2. **Test Analytics:**
   - Navigate to `/analytics`
   - Check cost breakdown
   - Verify charts load

3. **Test Policies:**
   - Navigate to `/policies`
   - Create a budget policy
   - Verify enforcement

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Use different port
uvicorn main:app --port 8001
```

### Frontend won't connect
```bash
# Update API_BASE in src/lib/ai.ts
const API_BASE = 'http://localhost:8000';
```

### No data showing
```bash
# Generate sample data
curl -X POST http://localhost:8000/quality/test
```

## 📈 Roadmap

### Q1 2025
- [ ] Google AI integration
- [ ] Azure OpenAI support
- [ ] Advanced routing algorithms
- [ ] Custom model fine-tuning

### Q2 2025
- [ ] SSO integration
- [ ] Advanced audit logs
- [ ] Multi-region deployment
- [ ] Enterprise SLA

### Q3 2025
- [ ] AI model marketplace
- [ ] Custom policy DSL
- [ ] Advanced analytics
- [ ] Mobile app

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- OpenAI for GPT models
- Anthropic for Claude models
- Supabase for database infrastructure
- Vercel for hosting

## 📞 Contact

- **Website:** https://platform-bice-kappa.vercel.app
- **Email:** support@pluto.ai
- **Twitter:** @PlutoAI
- **Discord:** [Join our community](https://discord.gg/pluto)

---

**Built with ❤️ for YC W25**

*Making AI APIs enterprise-ready, one request at a time.*
