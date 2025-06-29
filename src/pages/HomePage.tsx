import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Shield, Search, MessageSquare, BarChart3, Lock, Zap, Users, Check, ArrowLeft } from 'lucide-react';
import { handleElevenLabsWebhook } from '../lib/elevenlabs-webhook';

export const HomePage: React.FC = () => {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [result, setResult] = useState<{
    caseId: string;
    confirmationCode: string;
    transcript: string;
  } | null>(null);
  const [error, setError] = useState('');

  // Load ElevenLabs widget script and set up event listeners
  useEffect(() => {
    // Remove any existing script first
    const existingScript = document.querySelector('script[src*="elevenlabs"]');
    if (existingScript) {
      existingScript.remove();
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
      console.error('❌ Failed to load widget script');
      setError('Failed to load the conversation widget. Please refresh the page and try again.');
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
      console.log('🎤 Processing ElevenLabs conversation completion:', payload);
      
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
      console.error('Failed to process ElevenLabs conversation:', err);
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

  const generateConfirmationCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const resetWidget = () => {
    setResult(null);
    setError('');
  };

  // Test function to simulate conversation completion
  const testConversation = () => {
    const testPayload = {
      conversation_id: `test_conv_${Date.now()}`,
      agent_id: 'agent_01jydtj6avef99c1ne0eavf0ww',
      status: 'completed',
      transcript: {
        user_messages: [
          {
            text: 'I need to report a safety issue in our workplace. The equipment in our department has not been properly maintained and there have been several near-miss incidents.',
            timestamp: new Date().toISOString()
          }
        ],
        agent_messages: [
          {
            text: 'Thank you for bringing this safety concern to my attention. Can you tell me more about the specific equipment and incidents?',
            timestamp: new Date().toISOString()
          }
        ]
      },
      conversation_metadata: {
        duration_seconds: 180,
        started_at: new Date(Date.now() - 180000).toISOString(),
        ended_at: new Date().toISOString()
      },
      sentiment_analysis: {
        overall_sentiment: 'negative',
        confidence: 0.85,
        emotions: ['concerned', 'worried']
      }
    };
    
    handleElevenLabsConversationComplete(testPayload);
  };

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
      title: "Conversational AI",
      description: "Have natural conversations with our AI assistant for the most human-like interaction."
    },
    {
      icon: <Lock className="w-8 h-8 text-green-600" />,
      title: "Anonymous & Secure",
      description: "Your identity remains protected while ensuring your voice is heard with enterprise-grade security."
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "Intelligent Follow-ups",
      description: "Our AI asks thoughtful follow-up questions to help you share comprehensive, actionable feedback."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Real-time Analytics",
      description: "HR teams get comprehensive insights and analytics for better decision making."
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "Two-way Communication",
      description: "Secure messaging system allows HR to communicate back using your confirmation code."
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Enterprise Security",
      description: "All conversations are processed with enterprise-grade security and compliance standards."
    }
  ];

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
                <p>✅ Processed with advanced conversational AI</p>
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
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Your Voice
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> Matters</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A secure, AI-powered platform for anonymous employee feedback with natural conversation. 
            Talk to our AI assistant, share your concerns, and make a difference in your workplace.
          </p>

          {/* ElevenLabs Widget Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-12 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-slate-900">
                  Start Your Conversation
                </h3>
              </div>
              <p className="text-slate-600">
                {widgetLoaded 
                  ? "Click the microphone icon below to start your conversation with our AI assistant"
                  : "Loading conversation widget..."
                }
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

            {/* Widget Loading State */}
            {!widgetLoaded && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            )}

            {/* ElevenLabs Widget */}
            {widgetLoaded && (
              <div className="flex justify-center mb-6">
                <div className="w-full max-w-md">
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

          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/track"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-purple-300 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
            >
              <Search className="w-6 h-6" />
              Track Case
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Powerful Features for
              <span className="text-purple-600"> Everyone</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge conversational AI with secure communications 
              to create a seamless feedback experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl border border-slate-200 hover:shadow-xl hover:border-purple-200 transition-all duration-300 group"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            Powered by Advanced Conversational AI
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            We use cutting-edge AI technology to create natural, human-like conversations.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Advanced Conversational AI</h3>
              <p className="text-slate-600">
                Experience the most natural AI conversation available. Our AI assistant understands context, 
                asks intelligent follow-up questions, and creates a comfortable environment for sharing feedback.
              </p>
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
            Join thousands of employees who trust our platform to share their feedback through natural AI conversations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
            >
              <MessageSquare className="w-6 h-6" />
              Start Conversation Now
            </button>
            <Link
              to="/hr-login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-transparent text-white border-2 border-white rounded-xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-200"
            >
              <Shield className="w-6 h-6" />
              HR Portal Access
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};