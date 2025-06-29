# Standalone ElevenLabs ACK Generation System

A comprehensive, production-ready system for generating and injecting acknowledgment numbers into live conversations using ElevenLabs API, without requiring N8N workflows.

## 🚀 Features

### Core Functionality
- **Direct ElevenLabs Integration**: No N8N dependency required
- **Multiple Trigger Types**: Keyword, time-based, manual, and conversation-end triggers
- **Real-time Processing**: Instant ACK generation and injection
- **Conversation Monitoring**: Advanced state management and tracking
- **Comprehensive Logging**: Full audit trails and database integration

### Trigger Types

1. **Keyword Triggers**
   - "confirmation number", "reference code", "receipt number"
   - Custom keywords: "backfeed", "employee feedback"
   - Intelligent keyword detection in user messages

2. **Time-based Triggers**
   - Automatic ACK generation every X minutes
   - Configurable intervals (default: 5 minutes)
   - Only active for ongoing conversations

3. **Manual Triggers**
   - Admin-initiated ACK generation
   - API endpoint for manual triggering
   - Support for specific conversation targeting

4. **Conversation End Triggers**
   - Automatic ACK when conversation completes
   - Metadata-rich generation with conversation context

## 📋 Requirements

- Node.js 18+ 
- ElevenLabs API key
- ElevenLabs Agent ID
- Database (PostgreSQL recommended)

## 🛠️ Installation

### 1. Environment Setup

Create a `.env` file:

```env
# ElevenLabs Configuration
ELEVENLABS_API_KEY=sk_your_api_key_here
ELEVENLABS_AGENT_ID=agent_01jydtj6avef99c1ne0eavf0ww
ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret

# ACK Configuration
ACK_ENABLE_TIME_BASED=true
ACK_TIME_INTERVAL_MINUTES=5
CUSTOM_KEYWORDS=backfeed,employee feedback,confirmation code

# Server Configuration
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/ackdb
```

### 2. Install Dependencies

```bash
npm install express cors crypto
```

### 3. Basic Implementation

```javascript
// server.js
const express = require('express');
const { createStandaloneACKWebhookHandler } = require('./lib/standalone-ack-generator');

const app = express();
app.use(express.json());

// Initialize ACK handler
const ackHandler = createStandaloneACKWebhookHandler({
  apiKey: process.env.ELEVENLABS_API_KEY,
  agentId: process.env.ELEVENLABS_AGENT_ID,
  enableTimeBasedACK: true,
  timeIntervalMinutes: 5,
  customKeywords: ['backfeed', 'employee feedback', 'confirmation']
});

// Webhook endpoint for ElevenLabs
app.post('/webhook/elevenlabs', async (req, res) => {
  const result = await ackHandler.handleConversationWebhook(req.body);
  res.json(result);
});

// Manual ACK generation
app.post('/api/ack/manual', async (req, res) => {
  const result = await ackHandler.handleManualACKRequest(req.body);
  res.json(result);
});

// Statistics endpoint
app.get('/api/ack/stats', (req, res) => {
  res.json(ackHandler.getStats());
});

app.listen(3001, () => {
  console.log('Standalone ACK Generator running on port 3001');
});
```

## 🔧 Configuration Options

### ACK Generator Config

```javascript
const config = {
  // Required
  apiKey: 'your-elevenlabs-api-key',
  agentId: 'your-agent-id',
  
  // Optional
  voiceId: 'EXAVITQu4vr4xnSDxMaL', // Default voice
  enableTimeBasedACK: true,
  timeIntervalMinutes: 5,
  customKeywords: [
    'backfeed',
    'employee feedback', 
    'confirmation code',
    'reference number'
  ],
  webhookSecret: 'your-webhook-secret'
};
```

### Voice Settings

The system uses optimized voice settings for clear number pronunciation:

```javascript
voiceSettings: {
  stability: 0.8,        // Higher stability for numbers
  similarity_boost: 0.7, // Clear pronunciation
  style: 0.1,           // Neutral style
  use_speaker_boost: true
}
```

## 📡 API Endpoints

### Webhook Endpoint
```
POST /webhook/elevenlabs
Content-Type: application/json

{
  "event_type": "conversation.user_message",
  "conversation_id": "conv_123",
  "user_message": "I need a confirmation number",
  "user_id": "user_456"
}
```

### Manual ACK Generation
```
POST /api/ack/manual
Content-Type: application/json

{
  "conversationId": "conv_123",
  "userId": "user_456"
}

Response:
{
  "ackNumber": "1234567890",
  "conversationId": "conv_123",
  "timestamp": "2025-01-01T12:00:00Z",
  "status": "injected",
  "triggerType": "manual",
  "spokenText": ["Your confirmation number is: 1, 2, 3, 4, 5, 6, 7, 8, 9, 0..."]
}
```

### Statistics
```
GET /api/ack/stats

Response:
{
  "totalConversations": 45,
  "activeConversations": 12,
  "totalACKsGenerated": 89,
  "averageACKsPerConversation": 1.98
}
```

## 🔄 Event Flow

1. **Conversation Start**: System begins monitoring conversation
2. **Trigger Detection**: Keywords, time intervals, or manual triggers detected
3. **ACK Generation**: Unique 10-digit number generated
4. **Voice Synthesis**: Multiple spoken formats created for clarity
5. **Injection**: Messages injected into live conversation
6. **Logging**: Comprehensive audit trail stored in database

## 📊 Monitoring & Analytics

### Real-time Metrics
- Total conversations tracked
- Active conversation count
- ACK generation success rate
- Average ACKs per conversation
- Trigger type distribution
- Response time monitoring

### Audit & Compliance
- Comprehensive generation logs
- Database audit trails
- Error tracking and reporting
- Performance analytics
- Conversation state history

## 🚀 Deployment Options

### Standalone Server
```bash
npm start
```

### Docker
```bash
docker-compose up
```

### Serverless (Vercel/AWS Lambda)
```bash
vercel deploy
```

## 🔒 Security Features

- Webhook signature verification
- API key authentication
- Rate limiting support
- Secure conversation state management
- Comprehensive audit logging

## 🧪 Testing

The system includes comprehensive testing capabilities:

- Manual ACK generation testing
- Keyword trigger simulation
- Conversation end event testing
- Real-time statistics monitoring
- Error handling validation

## 📈 Performance

- Sub-second ACK generation
- Real-time conversation monitoring
- Automatic cleanup of inactive conversations
- Optimized database queries
- Efficient memory management

## 🤝 Integration Examples

### React Hook
```javascript
import { useACKGenerator } from './hooks/useACKGenerator';

const MyComponent = () => {
  const { ackGenerator, stats, generateManualACK } = useACKGenerator({
    apiKey: process.env.REACT_APP_ELEVENLABS_API_KEY,
    agentId: process.env.REACT_APP_AGENT_ID
  });

  const handleGenerateACK = async () => {
    const result = await generateManualACK('conv_123');
    console.log('ACK generated:', result.ackNumber);
  };

  return (
    <div>
      <button onClick={handleGenerateACK}>Generate ACK</button>
      <p>Total ACKs: {stats?.totalACKsGenerated}</p>
    </div>
  );
};
```

### Express Middleware
```javascript
const ackMiddleware = createStandaloneACKMiddleware({
  apiKey: process.env.ELEVENLABS_API_KEY,
  agentId: process.env.ELEVENLABS_AGENT_ID
});

app.use('/api/ack', ackMiddleware);
```

## 📚 Documentation

- [ElevenLabs Conversational AI API](https://docs.elevenlabs.io/api-reference/conversational-ai)
- [ElevenLabs Text-to-Speech API](https://docs.elevenlabs.io/api-reference/text-to-speech)
- [System Architecture Guide](./docs/architecture.md)
- [Deployment Guide](./docs/deployment.md)

## 🐛 Troubleshooting

### Common Issues

1. **ACK not generating**: Check API key and agent ID configuration
2. **Webhook not triggering**: Verify webhook URL and signature
3. **Time-based ACKs not working**: Ensure `enableTimeBasedACK` is true
4. **Database errors**: Check connection string and permissions

### Debug Mode
```javascript
process.env.DEBUG = "ack:*";
process.env.LOG_LEVEL = "debug";
```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**Built with ❤️ for seamless customer experience and employee feedback systems.**