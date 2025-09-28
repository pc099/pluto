# Browser Proxy Setup for AI Traffic Monitoring

This guide shows you how to configure your browser to route AI traffic through the monitoring system.

## 🚀 Quick Start

### 1. Start the Proxy Server

```bash
cd platform/src/python-backend
python proxy_server.py
```

The proxy server will start on `http://localhost:8080`

### 2. Configure Browser Proxy

#### Chrome/Edge:
1. Go to Settings → Advanced → System → Open proxy settings
2. Click "LAN settings"
3. Check "Use a proxy server for your LAN"
4. Set HTTP Proxy: `localhost:8080`
5. Click OK and restart browser

#### Firefox:
1. Go to Settings → General → Network Settings
2. Select "Manual proxy configuration"
3. Set HTTP Proxy: `localhost` Port: `8080`
4. Check "Use this proxy server for all protocols"
5. Click OK

#### Safari (macOS):
1. Go to System Preferences → Network
2. Select your connection → Advanced → Proxies
3. Check "Web Proxy (HTTP)"
4. Set Server: `localhost` Port: `8080`
5. Click OK

## 🎯 What Gets Monitored

The proxy automatically detects and monitors traffic to:

- **OpenAI**: `api.openai.com`
- **Anthropic**: `api.anthropic.com` 
- **Google AI**: `generativelanguage.googleapis.com`
- **Cohere**: `api.cohere.ai`
- **Hugging Face**: `api.huggingface.co`

## 📊 Monitoring Features

When you use AI services through the proxy, the system tracks:

- ✅ **Request/Response Logging**: All AI API calls
- ✅ **Performance Metrics**: Response times, success rates
- ✅ **Cost Tracking**: Token usage and costs
- ✅ **Device Tracking**: MAC address and device info
- ✅ **PII Detection**: Automatic sensitive data detection
- ✅ **Security Analysis**: Threat detection and blocking
- ✅ **Real-time Alerts**: Security and performance alerts

## 🧪 Testing the Setup

### Test with ChatGPT:
1. Configure browser proxy as above
2. Go to https://chat.openai.com
3. Start asking questions
4. Check the Mission Control dashboard at `/mission-control`
5. You should see traffic being logged in real-time!

### Test with API Calls:
```bash
# This will be monitored if proxy is configured
curl -x localhost:8080 https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 🔧 Advanced Configuration

### Custom AI Providers

To monitor additional AI providers, edit `proxy_server.py`:

```python
self.target_domains = [
    'api.openai.com',
    'api.anthropic.com',
    'your-custom-ai-provider.com',  # Add here
    # ... other providers
]
```

### Integration with Main System

The proxy can be integrated with the main monitoring system by updating the `log_to_monitoring_system` method:

```python
async def log_to_monitoring_system(self, data):
    async with ClientSession() as session:
        async with session.post(
            'http://localhost:8000/mission-control/log-traffic',
            json=data,
            headers={'Authorization': 'Bearer YOUR_TOKEN'}
        ) as response:
            pass
```

## 🚨 Important Notes

### Security:
- The proxy runs locally and doesn't expose your data externally
- All traffic is logged locally first
- API keys are handled securely

### Performance:
- Minimal latency overhead (~1-5ms)
- Non-AI traffic is forwarded directly
- Only AI traffic is processed for monitoring

### Limitations:
- Only works for HTTP/HTTPS traffic
- Some apps may not respect system proxy settings
- Mobile apps typically don't use system proxy

## 🛠️ Troubleshooting

### Proxy Not Working:
1. Check if proxy server is running: `curl -x localhost:8080 http://httpbin.org/ip`
2. Verify browser proxy settings
3. Check firewall settings
4. Try different port if 8080 is blocked

### No Traffic Detected:
1. Ensure you're using monitored AI services
2. Check browser developer tools for network requests
3. Verify proxy is intercepting requests
4. Check proxy server logs

### Performance Issues:
1. Monitor proxy server CPU/memory usage
2. Check network latency
3. Consider running proxy on different machine
4. Optimize logging frequency

## 📱 Mobile Setup

For mobile devices, you'll need to:

1. **Set up a network proxy** on your router
2. **Use a VPN** that routes through the monitoring system
3. **Use mobile-specific proxy apps** like Proxyman or Charles Proxy

## 🔄 Production Deployment

For production use:

1. **Deploy proxy server** on a dedicated machine
2. **Use enterprise proxy solutions** like Squid or HAProxy
3. **Implement authentication** for proxy access
4. **Add SSL termination** for HTTPS traffic
5. **Scale horizontally** for high traffic volumes

## 📈 Monitoring Dashboard

Once configured, visit the Mission Control dashboard to see:

- Real-time traffic metrics
- Device tracking information
- PII detection alerts
- Security incident reports
- Performance analytics
- Cost tracking

The dashboard updates every 30 seconds with live data from your AI usage!
