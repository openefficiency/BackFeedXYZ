# Voice AI Agent System with Netlify Edge Function Tracking

A comprehensive, production-ready employee feedback system using ElevenLabs Conversational AI with direct webhook integration via Netlify Edge Functions for real-time tracking code generation.

## 🚀 Features

### Core Functionality
- **ElevenLabs Conversational AI Integration**: Natural voice conversations for employee feedback
- **Netlify Edge Function Webhooks**: Direct webhook processing without external dependencies
- **Real-time Tracking Code Generation**: Instant 10-digit tracking codes during conversations
- **Global CDN Distribution**: Ultra-low latency with 100+ edge locations worldwide
- **Comprehensive Database Integration**: Full audit trails and case management

### Tracking Code System

#### Format: YYMMDDXXXX
- **YY**: Year (e.g., 25 for 2025)
- **MM**: Month (e.g., 01 for January)
- **DD**: Day (e.g., 27 for 27th)
- **XXXX**: Random 4-digit number

Example: `2501274589` = January 27, 2025 + random 4589

#### Automatic Triggers
- **Keyword Detection**: "tracking code", "confirmation number", "receipt"
- **Request Phrases**: "can I get", "please provide", "I need"
- **Completion Words**: "completed", "finished", "successful"
- **Conversation Events**: Start, end, or manual triggers

## 📋 Requirements

- Node.js 18+
- ElevenLabs API key and Agent ID
- Netlify account for Edge Function deployment
- Optional: Supabase for database integration

## 🛠️ Quick Setup

### 1. Clone and Install
```bash
git clone <your-repo>
cd voice-ai-agent-system
npm install
```

### 2. Environment Configuration
Create `.env` file:
```env
ELEVENLABS_API_KEY=sk_your_api_key_here
ELEVENLABS_WEBHOOK_SECRET=whsec_your_webhook_secret_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Deploy to Netlify

#### Option A: Git-based Deployment (Recommended)
1. Push code to GitHub/GitLab/Bitbucket
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard
4. Automatic deployment with `netlify.toml`

#### Option B: Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

### 4. Configure ElevenLabs Webhook
1. Go to ElevenLabs Conversational AI settings
2. Add Post-call webhook
3. URL: `https://your-site.netlify.app/api/elevenlabs-webhook`
4. Copy webhook secret to Netlify environment variables

### 5. Test Integration
```bash
# Test locally
netlify dev

# Test deployed function
curl -X POST https://your-site.netlify.app/api/elevenlabs-webhook \
  -H "Content-Type: application/json" \
  -d '{"event_type":"manual_tracking_request","conversation_id":"test_123"}'
```

## 🏗️ Architecture

### Simple & Efficient
```
ElevenLabs → Netlify Edge Function → Database (optional)
```

### Previous Complex Architecture (Removed)
```
ElevenLabs → N8N → Supabase Edge Function → Database
```

## 📡 API Endpoints

### Webhook Endpoint
```
POST /api/elevenlabs-webhook
Content-Type: application/json

{
  "event_type": "conversation.user_message",
  "conversation_id": "conv_123",
  "user_message": "I need a tracking code",
  "agent_id": "agent_456"
}
```

### Response Format
```json
{
  "success": true,
  "tracking_data": {
    "trackingCode": "2501274589",
    "conversationId": "conv_123",
    "timestamp": "2025-01-27T12:00:00Z",
    "status": "injected",
    "triggerType": "keyword",
    "spokenText": [
      "Your tracking code is: 2, 5, 0, 1, 2, 7, 4, 5, 8, 9. Please write this down.",
      "I'll repeat that in groups: 250127, 4589.",
      "Let me spell that out slowly: 2 pause 5 pause 0 pause 1 pause 2 pause 7 pause 4 pause 5 pause 8 pause 9.",
      "To confirm, your tracking code is 2501274589. Please keep this for your records."
    ]
  }
}
```

## 🎯 Key Benefits

### Performance
- **Sub-100ms Response Time**: Edge computing for ultra-low latency
- **Zero Cold Starts**: Always-ready edge functions
- **Global Distribution**: 100+ edge locations worldwide
- **99.9% Uptime SLA**: Enterprise-grade reliability

### Simplicity
- **No Dependencies**: Direct ElevenLabs integration
- **Git-based Deployment**: Automatic builds and deployments
- **Built-in Monitoring**: Comprehensive logs and analytics
- **Environment Management**: Secure secret handling

### Cost Effectiveness
- **Generous Free Tier**: 100,000 requests/month free
- **Pay-per-Request**: No idle server costs
- **No Infrastructure Management**: Fully serverless
- **Automatic Scaling**: Handle any traffic volume

## 🔧 Configuration Options

### Netlify Edge Function
```typescript
// netlify/edge-functions/elevenlabs-webhook.ts
export default async function handler(request: Request): Promise<Response> {
  // Webhook processing logic
  // Tracking code generation
  // ElevenLabs integration
}
```

### Environment Variables
```bash
# Required
ELEVENLABS_API_KEY=sk_your_key
ELEVENLABS_WEBHOOK_SECRET=whsec_secret

# Optional
SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_key
```

### Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  edge_functions = "netlify/edge-functions"

[[edge_functions]]
  function = "elevenlabs-webhook"
  path = "/api/elevenlabs-webhook"
```

## 🧪 Testing

### Local Development
```bash
# Run Netlify dev server
netlify dev

# Function available at:
# http://localhost:8888/api/elevenlabs-webhook
```

### Production Testing
```bash
# Test keyword trigger
curl -X POST https://your-site.netlify.app/api/elevenlabs-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "conversation.user_message",
    "conversation_id": "test_conv",
    "user_message": "I need a tracking code",
    "agent_id": "agent_123"
  }'

# Test conversation end
curl -X POST https://your-site.netlify.app/api/elevenlabs-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "conversation.ended",
    "conversation_id": "test_conv",
    "agent_id": "agent_123"
  }'
```

## 📊 Monitoring

### Netlify Dashboard
- Function invocations and performance
- Real-time logs and errors
- Traffic analytics and metrics
- Environment variable management

### ElevenLabs Integration
- Conversation completion rates
- Tracking code injection success
- Voice synthesis quality metrics
- User interaction patterns

## 🔒 Security

### Webhook Verification
- Signature validation with secret key
- Request origin verification
- Rate limiting and DDoS protection
- Secure environment variable storage

### Data Protection
- No sensitive data in logs
- Encrypted data transmission
- Minimal data retention
- GDPR compliance ready

## 🚀 Deployment Options

### Netlify (Recommended)
- Git-based automatic deployment
- Global edge function distribution
- Built-in monitoring and analytics
- Generous free tier

### Alternative Platforms
- Vercel Edge Functions
- Cloudflare Workers
- AWS Lambda@Edge
- Azure Static Web Apps

## 📚 Documentation

- [Netlify Edge Functions](https://docs.netlify.com/edge-functions/overview/)
- [ElevenLabs Conversational AI](https://docs.elevenlabs.io/api-reference/conversational-ai)
- [ElevenLabs Webhooks](https://docs.elevenlabs.io/api-reference/webhooks)
- [Voice AI Agent System Guide](./docs/system-guide.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for seamless voice AI integration and real-time tracking code generation.**