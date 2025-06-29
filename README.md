# BackFeed - Employee Feedback System
*Powered by Aegis AI*

A comprehensive, production-ready employee feedback system using advanced conversational AI with real-time processing and HR management capabilities.

## 🚀 Features

### Core Functionality
- **Aegis AI Conversational Technology**: Natural voice conversations for employee feedback
- **Real-time Processing**: Instant feedback processing and case creation
- **Comprehensive Database Integration**: Full audit trails and case management
- **HR Dashboard**: Complete case management and analytics
- **Two-way Communication**: Secure messaging between employees and HR
- **AI Insights**: Advanced analytics and sentiment analysis

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase with Row Level Security
- **Voice AI**: Advanced Conversational AI Technology
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React

## 📋 Requirements

- Node.js 18+
- Conversational AI agent configuration
- Supabase project (configured automatically)

## 🛠️ Quick Setup

### 1. Clone and Install
```bash
git clone <your-repo>
cd backfeed-system
npm install
```

### 2. Environment Configuration
Create `.env` file:
```env
VITE_SUPABASE_URL=https://tnvyzdmgyvpzwxbravrx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Configure Conversational Widget
Update the agent ID in `src/pages/HomePage.tsx`:
```typescript
<elevenlabs-convai agent-id="your-agent-id-here" />
```

## 🏗️ Architecture

### Database Schema
- **cases**: Main feedback cases with confirmation codes
- **transcripts**: Voice transcription data with sentiment analysis
- **hr_interactions**: Two-way communication system
- **ai_insights**: AI analysis results and recommendations
- **hr_users**: HR team member authentication

### Key Components
- **HomePage**: Main landing page with conversational AI widget
- **HRDashboard**: Comprehensive case management interface
- **TrackCase**: Public case tracking with confirmation codes
- **DatabaseStatus**: System health monitoring and testing

## 🎯 Key Features

### Employee Experience
- Natural voice conversations with AI
- Anonymous feedback submission
- Secure case tracking with confirmation codes
- Real-time processing and immediate confirmation

### HR Management
- Comprehensive dashboard with analytics
- Case prioritization and status management
- Two-way secure communication
- AI-powered insights and recommendations
- Advanced filtering and search capabilities

### AI Processing
- Real-time sentiment analysis
- Automatic categorization and priority assignment
- Risk assessment and next steps recommendations
- Pattern detection across cases

## 📊 Analytics & Insights

BackFeed provides comprehensive analytics including:
- Case volume trends and patterns
- Category distribution and severity analysis
- Response time tracking
- AI confidence scores and accuracy metrics
- Employee satisfaction indicators

## 🔒 Security Features

- Row Level Security (RLS) with Supabase
- Anonymous feedback submission
- Secure confirmation code system
- Encrypted data transmission
- Audit trails for all actions

## 🧪 Testing

### Database Testing
Access `/database-status` to run comprehensive tests:
- Connection and authentication verification
- Table structure and constraint validation
- RLS policy testing
- Performance benchmarking

### Sample Data
The system includes realistic test data:
- **Test Confirmation Codes**: AB7X9K2M4P, CD8Y5N3Q1R, GH1A7R5U3V
- **HR Login**: hr@company.com / demo123

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## 📚 Documentation

### API Integration
The system integrates with:
- Advanced Conversational AI for voice processing
- Supabase for database operations
- Custom webhook handlers for real-time processing

### Component Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── lib/                # Utilities and services
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests when applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**BackFeed - Powered by Aegis AI**  
*Built with ❤️ for seamless voice AI integration and comprehensive employee feedback management.*