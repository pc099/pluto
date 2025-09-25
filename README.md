# 🚀 Pluto - The Unified Interface For AI Models

> **Better prices, better uptime, no subscription.**

Pluto is a futuristic, enterprise-grade AI platform that provides intelligent orchestration, monitoring, and management of AI models across multiple providers.

## ✨ Features

### 🧠 AI Intelligence
- **Unified Interface**: Manage all major AI models from one platform
- **Intelligent Routing**: Automatic failover and load balancing
- **Cost Optimization**: Route requests to the most cost-effective models
- **Performance Monitoring**: Real-time analytics and insights

### 🛡️ Enterprise Security
- **Compliance Monitoring**: Built-in support for NIST, EU AI Act, HIPAA, and more
- **Security Scanning**: Detect prompt injection, jailbreak attempts, and data exfiltration
- **Quality Detection**: Real-time hallucination and bias detection
- **Audit Trails**: Comprehensive logging and monitoring

### 📊 Advanced Analytics
- **Real-time Monitoring**: Live performance tracking and alerts
- **Cost Analytics**: Detailed usage and cost breakdowns
- **Quality Metrics**: AI response quality scoring and analysis
- **Business Impact**: ROI measurement and business outcome tracking

### 🔄 Multi-Agent Management
- **Agent Orchestration**: Intelligent routing and load balancing
- **Performance Optimization**: Automatic scaling and failover
- **Cost Management**: Smart routing based on cost and performance
- **Real-time Monitoring**: Live agent status and performance metrics

## 🎨 Design Philosophy

Pluto features a **futuristic and minimalist design** inspired by modern AI platforms:

- **Clean Interface**: Minimalist design with focus on functionality
- **Gradient Accents**: Purple-to-blue gradients for visual appeal
- **Glass Morphism**: Modern backdrop blur effects
- **Responsive Design**: Works seamlessly across all devices
- **Dark/Light Themes**: Adaptive theming for user preference

## 🏗️ Architecture

### Frontend (Next.js 15)
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and better developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Radix UI**: Accessible, unstyled UI components
- **Lucide Icons**: Beautiful, customizable icons

### Backend (FastAPI)
- **Python 3.12**: Modern Python with async/await support
- **FastAPI**: High-performance web framework
- **Pydantic**: Data validation and serialization
- **WebSockets**: Real-time communication
- **Supabase**: PostgreSQL database with real-time features

### Key Components

#### 🎯 Core Services
- **Multi-Agent Manager**: Intelligent agent routing and orchestration
- **AI Quality Analyzer**: Real-time quality scoring and analysis
- **Compliance Monitor**: Regulatory framework compliance
- **Security Scanner**: AI security vulnerability detection
- **Cross-Provider Intelligence**: Unified AI provider management

#### 🎨 UI Components
- **PlutoLogo**: Animated logo with dog in rocket around planet
- **Navigation**: Modern navigation with search and user menu
- **DashboardLayout**: Collapsible sidebar with modern design
- **AuthModal**: Beautiful authentication with glass morphism
- **UserProfile**: Comprehensive user profile management
- **LandingPage**: Modern landing page with features and testimonials

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- Supabase account (optional, works with mock data)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/pluto.git
   cd pluto
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd src/python-backend
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file in src/python-backend/
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_key
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start backend
   cd src/python-backend
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

   # Terminal 2: Start frontend
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🎯 Usage

### Landing Page
- Modern, futuristic design with animated logo
- Feature showcase with testimonials
- Call-to-action for getting started

### Authentication
- Beautiful modal with glass morphism effects
- Sign up and sign in functionality
- Guest mode for exploration

### Dashboard
- Collapsible sidebar navigation
- Real-time monitoring and analytics
- Multi-agent management interface
- Compliance and security monitoring

### User Profile
- Comprehensive profile management
- Billing and usage analytics
- Security settings and preferences
- Plan management and upgrades

## 🔧 Configuration

### Environment Variables
```bash
# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

### Customization
- **Colors**: Modify gradient colors in `globals.css`
- **Logo**: Customize the Pluto logo in `PlutoLogo.tsx`
- **Features**: Add new dashboard sections in `DashboardLayout.tsx`
- **API**: Extend backend services in `services/` directory

## 📱 Responsive Design

Pluto is fully responsive and works seamlessly across:
- **Desktop**: Full sidebar and multi-column layouts
- **Tablet**: Collapsible sidebar with touch-friendly interface
- **Mobile**: Stacked layout with mobile-optimized navigation

## 🎨 Design System

### Colors
- **Primary**: Purple (#8B5CF6) to Blue (#3B82F6) gradients
- **Background**: White with subtle gray tones
- **Text**: Dark gray (#1F2937) for readability
- **Accents**: Purple and blue for interactive elements

### Typography
- **Headings**: Bold, modern sans-serif
- **Body**: Clean, readable text
- **Code**: Monospace for technical content

### Components
- **Cards**: Subtle shadows with rounded corners
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Minimalist with clear hierarchy

## 🔒 Security Features

- **Authentication**: Secure user authentication and session management
- **Authorization**: Role-based access control
- **Data Protection**: Encrypted data transmission and storage
- **Compliance**: Built-in regulatory compliance monitoring
- **Audit Logs**: Comprehensive activity logging

## 📊 Monitoring & Analytics

- **Real-time Metrics**: Live performance and usage tracking
- **Cost Analysis**: Detailed cost breakdowns and optimization
- **Quality Scoring**: AI response quality assessment
- **Business Impact**: ROI measurement and outcome tracking
- **Alerting**: Proactive notifications for issues

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

see the [LICENSE](LICENSE) file for details.

## 📞 Support


- **Issues**: [GitHub Issues](https://github.com/your-org/pluto/issues)

---

**Made with ❤️ by the Pluto Team**

