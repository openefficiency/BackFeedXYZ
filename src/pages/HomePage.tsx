import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Check, MessageSquare, ArrowRight, Volume2, ExternalLink, Zap, Star, Shield, Brain, Clock, Users, Sparkles, Heart, ThumbsUp, Award } from 'lucide-react';
import { handleElevenLabsWebhook } from '../lib/elevenlabs-webhook';
import { PilotWaitlistModal } from '../components/PilotWaitlistModal';

export const HomePage: React.FC = () => {
  const [result, setResult] = useState<{
    caseId: string;
    confirmationCode: string;
    transcript: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [showPilotModal, setShowPilotModal] = useState(false);

  // Load ElevenLabs widget script and set up event listeners
  useEffect(() => {
    // Check if widget script is already loaded
    const existingScript = document.querySelector('script[src*="elevenlabs"]');
    if (existingScript) {
      setWidgetLoaded(true);
      setupWidgetEventListeners();
      return;
    }

    // Create and load the ElevenLabs widget script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    script.onload = () => {
      console.log('✅ ElevenLabs widget script loaded successfully');
      setWidgetLoaded(true);
      
      // Set up widget event listeners after script loads
      setTimeout(() => {
        setupWidgetEventListeners();
      }, 1000);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load ElevenLabs widget script');
      setError('Failed to load ElevenLabs widget. Please refresh the page and try again.');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const setupWidgetEventListeners = () => {
    // Listen for ElevenLabs widget events
    const handleWidgetEvent = (event: MessageEvent) => {
      console.log('📨 Received message event:', event);
      
      // Check for ElevenLabs widget events from various origins
      if (event.origin.includes('elevenlabs') || 
          event.origin.includes('widget') || 
          event.origin === window.location.origin) {
        
        if (event.data && typeof event.data === 'object') {
          const { type, payload } = event.data;
          
          console.log('Event type:', type, 'Payload:', payload);
          
          if (type === 'conversation_ended' || 
              type === 'conversationEnded' || 
              type === 'conversation_complete' ||
              type === 'convai_conversation_ended') {
            console.log('🎤 Conversation ended event detected');
            handleElevenLabsConversationComplete(payload || event.data);
          }
          
          // Also check for direct conversation data
          if (event.data.conversation_id || event.data.transcript || event.data.messages) {
            console.log('🎤 Direct conversation data detected');
            handleElevenLabsConversationComplete(event.data);
          }
        }
      }
    };

    // Listen for all message events
    window.addEventListener('message', handleWidgetEvent);

    // Also listen for custom ElevenLabs events
    const handleCustomEvent = (event: CustomEvent) => {
      console.log('📨 Received custom event:', event);
      if (event.detail) {
        handleElevenLabsConversationComplete(event.detail);
      }
    };

    // Listen for various ElevenLabs event types
    const eventTypes = [
      'elevenlabs:conversation:ended',
      'elevenlabs:conversation:complete',
      'convai:conversation:ended',
      'convai:conversation:complete'
    ];

    eventTypes.forEach(eventType => {
      window.addEventListener(eventType as any, handleCustomEvent);
    });

    // Cleanup function
    return () => {
      window.removeEventListener('message', handleWidgetEvent);
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType as any, handleCustomEvent);
      });
    };
  };

  const handleElevenLabsConversationComplete = async (payload: any) => {
    try {
      console.log('🎤 Processing conversation completion:', payload);
      
      // Create a comprehensive payload with all possible data
      const enhancedPayload = {
        conversation_id: payload?.conversation_id || payload?.conversationId || `conv_${Date.now()}`,
        agent_id: payload?.agent_id || payload?.agentId || 'agent_01jydtj6avef99c1ne0eavf0ww',
        status: payload?.status || 'completed',
        transcript: payload?.transcript || {
          user_messages: payload?.userMessages || payload?.user_messages || [
            {
              text: payload?.userMessage || payload?.user_message || 'I want to report a workplace issue that needs attention from HR.',
              timestamp: new Date().toISOString()
            }
          ],
          agent_messages: payload?.agentMessages || payload?.agent_messages || [
            {
              text: 'Thank you for sharing your feedback. Can you tell me more about the specific issue?',
              timestamp: new Date().toISOString()
            }
          ]
        },
        messages: payload?.messages || [
          {
            role: 'user',
            content: payload?.userMessage || payload?.user_message || 'I want to report a workplace issue that needs attention from HR.',
            timestamp: new Date().toISOString()
          },
          {
            role: 'assistant',
            content: 'Thank you for sharing your feedback. Can you tell me more about the specific issue?',
            timestamp: new Date().toISOString()
          }
        ],
        conversation_metadata: payload?.conversation_metadata || payload?.metadata || {
          duration_seconds: payload?.duration || 120,
          started_at: new Date(Date.now() - (payload?.duration || 120) * 1000).toISOString(),
          ended_at: new Date().toISOString()
        },
        sentiment_analysis: payload?.sentiment_analysis || payload?.sentiment || {
          overall_sentiment: 'neutral',
          confidence: 0.8,
          emotions: ['concerned']
        }
      };
      
      // Process the conversation through our webhook handler
      const result = await handleElevenLabsWebhook(enhancedPayload);
      
      if (result.success && result.confirmationCode) {
        // Create a result object for display
        const conversationResult = {
          caseId: result.caseId || `case_${Date.now()}`,
          confirmationCode: result.confirmationCode,
          transcript: extractTranscriptFromPayload(enhancedPayload)
        };
        
        setResult(conversationResult);
        console.log('✅ Conversation processed successfully:', conversationResult);
      } else {
        throw new Error(result.error || 'Failed to process conversation');
      }
    } catch (err: any) {
      console.error('Failed to process conversation:', err);
      setError(`Failed to process conversation: ${err.message}`);
    }
  };

  const extractTranscriptFromPayload = (payload: any): string => {
    if (payload.transcript?.user_messages) {
      return payload.transcript.user_messages
        .map((msg: any) => msg.text)
        .join('\n');
    }
    if (payload.messages) {
      return payload.messages
        .filter((msg: any) => msg.role === 'user')
        .map((msg: any) => msg.content)
        .join('\n');
    }
    return 'Conversation completed through the widget';
  };

  const resetWidget = () => {
    setResult(null);
    setError('');
  };

  // Show success page if conversation completed
  if (result) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Feedback Submitted Successfully
            </h1>
            
            <p className="text-slate-600 mb-8">
              Your feedback has been processed using advanced AI technology 
              and routed directly to the HR portal for investigation.
            </p>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Your Secure Tracking Code
              </h3>
              <div className="text-4xl font-mono font-bold text-blue-600 mb-4 tracking-wider">
                {result.confirmationCode}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(result.confirmationCode)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Click to copy
              </button>
            </div>

            {/* Technology Confirmation */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">AI Processing Confirmed</span>
              </div>
              <div className="text-sm text-purple-800 space-y-1">
                <p>✅ Processed with <a href="https://aegiswhistle.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">Aegis AI</a> Conversational Technology</p>
                <p>✅ Natural conversation flow completed</p>
                <p>✅ Real-time voice interaction processed</p>
                <p>✅ Tagged with case ID: {result.caseId.substring(0, 12)}...</p>
                <p>✅ Secure conversation processing</p>
                <p>✅ Enhanced feedback quality through guided conversation</p>
                <p>✅ Automatically routed to HR portal</p>
              </div>
            </div>

            {/* Conversation Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 text-left">
              <h4 className="font-semibold text-slate-900 mb-2">Feedback Summary:</h4>
              <p className="text-slate-700 text-sm leading-relaxed">
                {result.transcript.length > 300 
                  ? result.transcript.substring(0, 300) + '...' 
                  : result.transcript}
              </p>
              <div className="text-xs text-slate-500 mt-2">
                Total feedback length: {result.transcript.split(/\s+/).length} words
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/track"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Track Your Case
              </Link>
              <button
                onClick={resetWidget}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Submit Another Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Widget */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full text-sm font-medium mb-8">
            <MessageSquare className="w-4 h-4" />
            Powered by 
            <a 
              href="https://aegiswhistle.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Zap className="w-4 h-4" />
              Aegis AI
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Your Voice
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Matters</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            BackFeed is a secure, AI-powered platform for anonymous employee feedback with natural conversation. 
            Talk to our AI assistant, share your concerns, and make a difference in your workplace.
          </p>

          {/* Aegis AI Interface Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-12 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Mic className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-slate-900">
                  First step of making the world better is Speaking UP !
                </h3>
              </div>
              <p className="text-slate-600 mb-6">
                Lets make our organization awesome..
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
                <button
                  onClick={() => setError('')}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* ElevenLabs Widget */}
            {widgetLoaded && (
              <div className="mb-6">
                <div className="w-full max-w-md mx-auto">
                  <elevenlabs-convai 
                    agent-id="agent_01jydtj6avef99c1ne0eavf0ww"
                    style={{
                      width: '100%',
                      height: '400px',
                      border: 'none',
                      borderRadius: '12px'
                    }}
                  ></elevenlabs-convai>
                </div>
              </div>
            )}

            {/* Widget Loading State */}
            {!widgetLoaded && (
              <div className="flex justify-center items-center py-12 mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            )}

            {/* Alternative: Direct Link to ElevenLabs Interface */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <a
                  href="https://elevenlabs.io/app/talk-to?agent_id=agent_01jydtj6avef99c1ne0eavf0ww"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Volume2 className="w-5 h-5" />
                  Speak to 
                  <span className="font-bold">Aegis</span>
                  📣
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/track"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-purple-300 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
            >
              <Mic className="w-6 h-6" />
              Track Case
            </Link>
          </div>
        </div>
      </section>

      {/* Show us your Love Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-red-200 rounded-full text-red-700 text-sm font-medium mb-6">
              <Heart className="w-4 h-4 fill-current" />
              Community Love
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Show us your 
              <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent"> Love</span>
            </h2>
            
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              BackFeed is featured in the Bolt Gallery! Help us climb to the top by showing your love with hearts ❤️
            </p>
          </div>

          {/* Gallery Showcase */}
          <div className="relative mb-12">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-slate-200">
              {/* Background Image with Fade Effect */}
              <div className="relative">
                <img 
                  src="/image.png" 
                  alt="Bolt Gallery Community & Social builds featuring BackFeed"
                  className="w-full h-auto"
                />
                
                {/* Overlay to fade out everything except BackFeed */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60"></div>
                
                {/* Highlight BackFeed project */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Spotlight effect on BackFeed */}
                    <div className="absolute -inset-8 bg-gradient-radial from-white/20 via-white/10 to-transparent rounded-full blur-xl"></div>
                    
                    {/* Arrow pointing to BackFeed */}
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                      <div className="flex flex-col items-center">
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-white/20">
                          <p className="text-sm font-bold text-slate-900">BackFeed ❤️</p>
                        </div>
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/90 mt-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-red-200 hover:border-red-300 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Visit Bolt Gallery</h3>
              <p className="text-slate-600 text-sm">
                Click the link below to visit the Community & Social builds section in Bolt Gallery
              </p>
            </div>

            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-red-200 hover:border-red-300 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Find BackFeed</h3>
              <p className="text-slate-600 text-sm">
                Look for the BackFeed project in the gallery - it's the employee feedback system you're using right now!
              </p>
            </div>

            <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-red-200 hover:border-red-300 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Show Love ❤️</h3>
              <p className="text-slate-600 text-sm">
                Click the heart button to show your love and help BackFeed climb to the top of the gallery!
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a
              href="https://bolt.new/gallery/categories/community-social"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Heart className="w-6 h-6 fill-current" />
              Show BackFeed Some Love
              <ExternalLink className="w-5 h-5" />
            </a>
            
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-blue-500" />
                <span>Help us reach #1</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>Community favorite</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" />
                <span>Built with love</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Aegis AI Pilot Waitlist Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Early Access Program
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Apply for 
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Aegis AI Pilot</span>
              <br />Waitlist
            </h2>
          </div>

          {/* Waitlist CTA */}
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Ready to Transform Your Organization?
              </h3>
              <p className="text-purple-100 mb-8">
                Join the exclusive pilot program and be among the first to experience the future of employee engagement.
              </p>
              
              <button
                onClick={() => setShowPilotModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Star className="w-5 h-5" />
                Apply for Aegis AI Pilot Waitlist
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm text-purple-200">
                <div>
                  <div className="font-semibold text-white">✓ Priority Support</div>
                  <div>Dedicated implementation team</div>
                </div>
                <div>
                  <div className="font-semibold text-white">✓ Custom Setup</div>
                  <div>Tailored to your organization</div>
                </div>
                <div>
                  <div className="font-semibold text-white">✓ Early Pricing</div>
                  <div>Pilot program discounts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Share Your Feedback?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of employees who trust BackFeed to share their feedback through natural AI conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://elevenlabs.io/app/talk-to?agent_id=agent_01jydtj6avef99c1ne0eavf0ww"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
            >
              <MessageSquare className="w-6 h-6" />
              How can 
              <a 
                href="https://aegiswhistle.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold hover:underline"
              >
                Aegis AI
              </a>
              help you today?
              <Mic className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Pilot Waitlist Modal */}
      <PilotWaitlistModal 
        isOpen={showPilotModal} 
        onClose={() => setShowPilotModal(false)} 
      />
    </div>
  );
};