# 🚀 Netlify Edge Function Deployment Guide

## Overview
Your Voice AI Agent System includes a sophisticated real-time tracking code generation system using Netlify Edge Functions. This guide will help you deploy it to production.

## 📋 Pre-Deployment Checklist

### 1. ElevenLabs Setup
- [ ] ElevenLabs account with API access
- [ ] Conversational AI agent created and configured
- [ ] API key generated (`sk_...`)
- [ ] Test conversation working locally

### 2. Netlify Account Setup
- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Custom domain configured (optional)

### 3. Database Setup (Optional)
- [ ] Supabase project active
- [ ] Database migrations applied
- [ ] Service role key available

## 🛠️ Step-by-Step Deployment

### Step 1: Repository Setup
Your code is already configured! Just ensure your repository includes:
```
├── netlify/
│   └── edge-functions/
│       └── elevenlabs-webhook.ts ✅
├── netlify.toml ✅
├── src/
│   ├── components/NetlifyTrackingDemo.tsx ✅
│   └── pages/NetlifyTrackingDemo.tsx ✅
└── package.json ✅
```

### Step 2: Environment Variables
Set these in your Netlify dashboard (Site settings → Environment variables):

**Required:**
```bash
ELEVENLABS_API_KEY=sk_your_actual_api_key_here
ELEVENLABS_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Optional (for database integration):**
```bash
SUPABASE_URL=https://tnvyzdmgyvpzwxbravrx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NODE_ENV=production
```

### Step 3: Deploy via Git
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect repository to Netlify
3. Netlify automatically detects `netlify.toml` and deploys
4. Edge Function will be available at: `https://your-site.netlify.app/api/elevenlabs-webhook`

### Step 4: Configure ElevenLabs Webhook
1. Go to ElevenLabs Conversational AI settings
2. Navigate to your agent settings
3. Add "Post-call webhook" or "Event webhook"
4. Enter URL: `https://your-site.netlify.app/api/elevenlabs-webhook`
5. Copy the generated webhook secret
6. Update your Netlify environment variables with this secret

## 🧪 Testing Your Deployment

### Manual Testing
```bash
# Test the deployed function
curl -X POST https://your-site.netlify.app/api/elevenlabs-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "manual_tracking_request",
    "conversation_id": "test_123",
    "agent_id": "agent_01jydtj6avef99c1ne0eavf0ww"
  }'
```

### Expected Response
```json
{
  "success": true,
  "tracking_data": {
    "trackingCode": "2501274589",
    "conversationId": "test_123",
    "timestamp": "2025-01-27T12:00:00Z",
    "status": "generated",
    "triggerType": "manual",
    "spokenText": [
      "Your tracking code is: 2, 5, 0, 1, 2, 7, 4, 5, 8, 9. Please write this down.",
      "I'll repeat that in groups: 250127, 4589.",
      "Let me spell that out slowly: 2 pause 5 pause 0 pause 1 pause 2 pause 7 pause 4 pause 5 pause 8 pause 9.",
      "To confirm, your tracking code is 2501274589. Please keep this for your records."
    ]
  }
}
```

### Live Testing with ElevenLabs
1. Start a conversation with your ElevenLabs agent
2. Say one of the trigger phrases:
   - "I need a tracking code"
   - "Can I get a confirmation number"
   - "Please provide a reference number"
3. The agent should respond with a 10-digit tracking code
4. Check Netlify function logs for successful webhook processing

## 📊 Monitoring & Analytics

### Netlify Dashboard Monitoring
- **Function Invocations:** Track usage and performance
- **Error Rates:** Monitor function failures
- **Response Times:** Ensure sub-100ms performance
- **Logs:** Debug issues in real-time

### Access Monitoring:
1. Go to your Netlify site dashboard
2. Navigate to "Functions" → "Edge Functions"
3. Click "elevenlabs-webhook" to view metrics
4. Monitor invocations, errors, and performance

### Real-time Logs
```bash
# Install Netlify CLI
npm install -g netlify-cli

# View live logs
netlify logs --live --functions
```

## 🔧 Production Optimizations

### Performance Enhancements
Your Edge Function is already optimized with:
- ✅ Global CDN distribution (100+ edge locations)
- ✅ Sub-100ms response times
- ✅ Zero cold starts
- ✅ Automatic retry logic
- ✅ Comprehensive error handling

### Security Features
- ✅ Webhook signature verification
- ✅ CORS headers properly configured
- ✅ Environment variable security
- ✅ Input validation and sanitization

### Scalability
- ✅ Automatic scaling to handle any traffic volume
- ✅ Rate limiting protection
- ✅ Database connection pooling (when enabled)

## 🚨 Troubleshooting

### Common Issues & Solutions

**Function not deploying:**
```bash
# Check netlify.toml configuration
# Ensure edge_functions path is correct
# Verify TypeScript syntax
```

**Environment variables not working:**
```bash
# Verify variables in Netlify dashboard
# Check variable names match exactly
# Redeploy after setting variables
```

**Webhook signature verification failing:**
```bash
# Ensure webhook secret matches ElevenLabs
# Check Content-Type headers
# Verify request body format
```

**ElevenLabs not triggering webhook:**
```bash
# Verify webhook URL is correct
# Check ElevenLabs agent configuration
# Test with manual trigger first
# Check ElevenLabs logs for webhook attempts
```

### Debug Steps
1. **Check Function Logs:**
   - Netlify Dashboard → Functions → elevenlabs-webhook → Logs
   
2. **Test Locally:**
   ```bash
   netlify dev
   # Function available at http://localhost:8888/api/elevenlabs-webhook
   ```

3. **Verify Configuration:**
   ```bash
   netlify env:list  # Check environment variables
   netlify status    # Check deployment status
   ```

## 📈 Performance Metrics

### Expected Performance
- **Response Time:** < 100ms globally
- **Uptime:** 99.9% SLA
- **Cold Start:** ~0ms (Edge Functions)
- **Throughput:** Unlimited concurrent requests

### Monitoring Alerts
Set up monitoring for:
- Function error rate > 1%
- Response time > 200ms
- Failed webhook deliveries
- Database connection issues

## 🔄 Continuous Deployment

### Automatic Deployment
Your setup supports automatic deployment:
1. Push code to main branch
2. Netlify automatically builds and deploys
3. Edge Function updates immediately
4. Zero downtime deployment

### Deployment Hooks
Configure deployment notifications:
```bash
# Slack/Discord webhook for deployment notifications
# Email alerts for failed deployments
# Status page updates
```

## 📞 Support & Resources

### Documentation Links
- [Netlify Edge Functions Docs](https://docs.netlify.com/edge-functions/overview/)
- [ElevenLabs Webhook API](https://docs.elevenlabs.io/api-reference/conversational-ai)
- [Your Demo Page](/netlify-tracking) - Test the integration

### Need Help?
1. Check function logs in Netlify dashboard
2. Test with the built-in demo page
3. Verify ElevenLabs agent configuration
4. Use manual testing endpoints

---

🎉 **Congratulations!** Your real-time tracking code generation system is now deployed and ready for production use with global edge computing power!