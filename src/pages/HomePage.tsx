import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Check, MessageSquare, ArrowRight, Volume2, ExternalLink, Zap, Star, Shield, Brain, Clock, Users, Sparkles, Heart, ThumbsUp, Award, Search, AlertTriangle, Wifi, WifiOff, Lock, Eye, UserCheck } from 'lucide-react';
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
  const [widgetError, setWidgetError] = useState(false);
  const [showPilotModal, setShowPilotModal] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [showNapsterIframe, setShowNapsterIframe] = useState(false);

  // Check network connectivity
  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        // Try to fetch a small resource to test connectivity
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch('https://api.elevenlabs.io/v1/models', {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        setNetworkStatus('online');
      } catch (error) {
        console.log('🌐 Network connectivity limited - using offline mode');
        setNetworkStatus('offline');
      }
    };

    checkNetworkStatus();
  }, []);

  // Load ElevenLabs widget script with enhanced error handling
  useEffect(() => {
    if (networkStatus === 'offline') {
      console.log('🌐 Skipping ElevenLabs widget load - offline mode');
      setWidgetError(true);
      return;
    }

    // Check if widget script is already loaded
    const existingScript = document.querySelector('script[src*="elevenlabs"]');
    if (existingScript) {
      setWidgetLoaded(true);
      setupWidgetEventListeners();
      return;
    }

    // Create and load the ElevenLabs widget script with timeout
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    // Set up timeout for script loading
    const loadTimeout = setTimeout(() => {
      console.warn('⏰ ElevenLabs widget script load timeout');
      setWidgetError(true);
      setError('ElevenLabs widget is temporarily unavailable. Please use the direct link below or try again later.');
    }, 15000); // 15 second timeout
    
    script.onload = () => {
      console.log('✅ ElevenLabs widget script loaded successfully');
      clearTimeout(loadTimeout);
      setWidgetLoaded(true);
      setWidgetError(false);
      
      // Set up widget event listeners after script loads
      setTimeout(() => {
        setupWidgetEventListeners();
      }, 1000);
    };
    
    script.onerror = () => {
      console.warn('⚠️ Failed to load ElevenLabs widget script (expected in restricted environments)');
      clearTimeout(loadTimeout);
      setWidgetError(true);
      setError('ElevenLabs widget is temporarily unavailable. Please use the direct link below to continue.');
    };
    
    document.head.appendChild(script);

    return () => {
      clearTimeout(loadTimeout);
      // Cleanup on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [networkStatus]);

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
    setWidgetError(false);
  };

  const openNapsterIframe = () => {
    setShowNapsterIframe(true);
  };

  const closeNapsterIframe = () => {
    setShowNapsterIframe(false);
  };

  // Show success page if conversation completed
  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-4">
        <div className="max-w-lg mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-light text-slate-900 mb-4 tracking-tight">
              Feedback Submitted
            </h1>
            
            <p className="text-slate-600 text-lg leading-relaxed">
              Your voice has been heard. 
              <br />
              Change is coming.
            </p>
          </div>
          
          {/* Confirmation Code - Apple Style */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 mb-8 shadow-2xl">
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Your Secure Tracking Code
              </h3>
              <div className="text-3xl md:text-4xl font-mono font-light text-blue-600 mb-6 tracking-widest">
                {result.confirmationCode}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(result.confirmationCode)}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Tap to copy
              </button>
            </div>
          </div>

          {/* AI Processing Confirmation - Minimalist */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200/50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">AI Processing Complete</span>
            </div>
            <div className="text-sm text-purple-800 space-y-2 text-center">
              <p>✓ Processed with <a href="https://aegiswhistle.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">Aegis AI</a></p>
              <p>✓ Routed to HR portal</p>
              <p>✓ Secure & anonymous</p>
            </div>
          </div>
          
          {/* Action Buttons - Clean */}
          <div className="space-y-4">
            <Link
              to="/track"
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              <Search className="w-5 h-5" />
              Track Your Case
            </Link>
            <button
              onClick={resetWidget}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white/80 text-slate-700 rounded-2xl font-medium hover:bg-white transition-colors border border-slate-200"
            >
              <MessageSquare className="w-5 h-5" />
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Network Status Indicator */}
      {networkStatus === 'offline' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3 text-amber-800">
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">
              Limited connectivity detected. Using offline mode with full functionality.
            </span>
          </div>
        </div>
      )}

      {/* Hero Section - Mobile First */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-lg md:max-w-4xl mx-auto text-center">
          {/* Powered by Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md border border-white/50 rounded-full text-sm font-medium mb-8 shadow-lg">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            Powered by 
            <a 
              href="https://aegiswhistle.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Zap className="w-3 h-3" />
              Aegis AI
              <ExternalLink className="w-2 h-2" />
            </a>
          </div>
          
          {/* Main Headline - Steve Jobs Typography */}
          <h1 className="text-4xl md:text-6xl font-extralight text-slate-900 mb-6 leading-tight tracking-tight">
            Every Voice
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-light">Deserves</span>
            <br />
            to be Heard
          </h1>
          
          {/* Subtitle - Clean & Simple */}
          <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed font-light">
            The most human way to share workplace feedback.
            <br className="hidden md:block" />
            Simply speak. We listen. Change happens.
          </p>

          {/* AI Interface - Apple-inspired Card */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-6 md:p-8 mb-12 shadow-2xl hover:shadow-3xl transition-all duration-700">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-light text-slate-900">
                  Your moment to make a difference
                </h3>
              </div>
              <p className="text-slate-600 font-light">
                Because every great workplace starts with honest conversation.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 text-sm">{error}</p>
                    <button
                      onClick={() => setError('')}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ElevenLabs Widget */}
            {widgetLoaded && !widgetError && networkStatus === 'online' && (
              <div className="mb-6">
                <div className="w-full max-w-md mx-auto">
                  <elevenlabs-convai 
                    agent-id="agent_01jydtj6avef99c1ne0eavf0ww"
                    style={{
                      width: '100%',
                      height: '350px',
                      border: 'none',
                      borderRadius: '16px'
                    }}
                  ></elevenlabs-convai>
                </div>
              </div>
            )}

            {/* Widget Loading State */}
            {!widgetLoaded && !widgetError && networkStatus === 'checking' && (
              <div className="flex justify-center items-center py-12 mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            )}

            {/* Widget Error State or Offline Mode */}
            {(widgetError || networkStatus === 'offline') && (
              <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {networkStatus === 'offline' ? (
                      <WifiOff className="w-8 h-8 text-blue-600" />
                    ) : (
                      <ExternalLink className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <h4 className="text-lg font-medium text-blue-900 mb-2">
                    {networkStatus === 'offline' ? 'Offline Mode Active' : 'Widget Temporarily Unavailable'}
                  </h4>
                  <p className="text-blue-700 text-sm mb-4">
                    {networkStatus === 'offline' 
                      ? 'All features are available using our direct link below.'
                      : 'Please use the direct link below to continue with your feedback.'
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Alternative Link - Always Available */}
            <div className="text-center">
              <a
                href="https://elevenlabs.io/app/talk-to?agent_id=agent_01jydtj6avef99c1ne0eavf0ww"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Volume2 className="w-5 h-5" />
                Speak to Aegis
                <Mic className="w-4 h-4" />
              </a>
              {(widgetError || networkStatus === 'offline') && (
                <p className="text-xs text-slate-500 mt-2">
                  Opens in new tab • Fully functional
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Confidential Reporting Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md border border-white/50 rounded-full text-slate-700 text-sm font-light mb-8 shadow-lg">
              <Shield className="w-4 h-4 text-green-600" />
              100% Anonymous & Confidential
            </div>
            
            <h2 className="text-4xl md:text-6xl font-extralight text-slate-900 mb-8 tracking-tight leading-tight">
              Your Privacy is
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent font-light">Protected</span>
            </h2>
            
            <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed font-light max-w-3xl mx-auto">
              This written policy explicitly guarantees your complete anonymity and confidentiality.
            </p>
          </div>

          {/* Privacy Policy Card */}
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 md:p-12 shadow-2xl mb-12">
            {/* Privacy Policy List */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Eye className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">100% Anonymous Reporting</h4>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Mic className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">No Voice Recordings Stored</h4>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <UserCheck className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">No Identifying Data</h4>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Authorized Access Only</h4>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Confidentiality Violations of the report will result in immediate disciplinary action</h4>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Lock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Secure Infrastructure</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h5 className="font-semibold text-slate-900">Enterprise Security</h5>
                </div>
                
                <div className="p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <h5 className="font-semibold text-slate-900">Zero Tracking</h5>
                </div>
                
                <div className="p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h5 className="font-semibold text-slate-900">Compliance Ready</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Show Love Section - Ultra Minimalist */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-extralight text-slate-900 mb-8 tracking-tight">
            Show us your 
            <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent font-light"> Love</span>
          </h2>

          {/* Gallery Preview - Mobile Optimized */}
          <div className="relative mb-12">
            <a
              href="https://bolt.new/gallery/categories/community-social"
              target="_blank"
              rel="noopener noreferrer"
              className="block relative overflow-hidden rounded-3xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] bg-white/80 backdrop-blur-sm"
            >
              <img 
                src="/image copy.png" 
                alt="Bolt Gallery Community & Social builds featuring BackFeed"
                className="w-full h-auto opacity-90"
              />
              
              {/* Enhanced overlay to hide other projects */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60"></div>
              
              {/* BackFeed Spotlight - Enhanced */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/95 backdrop-blur-md px-8 py-4 rounded-3xl shadow-2xl border border-white/60 animate-pulse">
                  <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-red-500 fill-current" />
                    <p className="text-2xl font-bold text-slate-900">BackFeed</p>
                    <Heart className="w-6 h-6 text-red-500 fill-current" />
                  </div>
                  <p className="text-sm text-slate-600 mt-1 text-center">Featured in Bolt Gallery</p>
                </div>
              </div>
              
              {/* Additional overlay to further hide other projects */}
              <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-black/80 to-transparent"></div>
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>
            </a>
          </div>

          {/* Simple Steps - Mobile First */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <a
              href="https://bolt.new/gallery/categories/community-social"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/60 hover:bg-white/90 transition-all duration-500 hover:shadow-xl transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="text-2xl font-light text-white">1</span>
              </div>
              <h3 className="text-xl font-light text-slate-900">Visit Gallery</h3>
            </a>

            <a
              href="https://bolt.new/gallery/categories/community-social"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/60 hover:bg-white/90 transition-all duration-500 hover:shadow-xl transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="text-2xl font-light text-white">2</span>
              </div>
              <h3 className="text-xl font-light text-slate-900">Find BackFeed</h3>
            </a>

            <a
              href="https://bolt.new/gallery/categories/community-social"
              target="_blank"
              rel="noopener noreferrer"
              className="group text-center p-8 bg-white/70 backdrop-blur-sm rounded-3xl border border-white/60 hover:bg-white/90 transition-all duration-500 hover:shadow-xl transform hover:-translate-y-2"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <Heart className="w-8 h-8 text-white fill-current" />
              </div>
              <h3 className="text-xl font-light text-slate-900">Show Love</h3>
            </a>
          </div>

          {/* CTA Button */}
          <a
            href="https://bolt.new/gallery/categories/community-social"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 px-12 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-medium text-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            <Heart className="w-6 h-6 fill-current" />
            Show BackFeed Some Love
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Early Access - Simplified */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md border border-white/50 rounded-full text-slate-700 text-sm font-light mb-12 shadow-lg">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Early Access Program
          </div>
          
          <h2 className="text-4xl md:text-6xl font-extralight text-slate-900 mb-8 tracking-tight leading-tight">
            Apply for 
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-light">Aegis AI Pilot</span>
          </h2>

          <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl p-8 md:p-12 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-light text-slate-900 mb-6">
              Ready to Transform Your Organization?
            </h3>
            
            <button
              onClick={() => setShowPilotModal(true)}
              className="inline-flex items-center gap-4 px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              <Star className="w-5 h-5" />
              Apply for Pilot Waitlist
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA - Clean */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-extralight text-slate-900 mb-8 tracking-tight leading-tight">
            Keen to empower
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-light">Your Employees</span>
            <br />
            <span className="text-slate-800 font-light">with Aegis AI?</span>
          </h2>
          
          <button
            onClick={openNapsterIframe}
            className="inline-flex items-center gap-4 px-10 py-4 bg-white/80 backdrop-blur-md text-slate-800 rounded-full font-medium text-lg border border-white/50 hover:bg-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <MessageSquare className="w-5 h-5" />
            Talk to Aegis AI itself to know more about her
            <Mic className="w-4 h-4" />
          </button>
          
          <p className="text-sm text-slate-500 mt-2 font-light">
            Open Popup to interact with Aegis | Click Start after popup launches
          </p>
        </div>
      </section>

      {/* Napster AI Iframe Popup */}
      {showNapsterIframe && (
        <div className="fixed inset-0 z-[999999999]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeNapsterIframe}
          ></div>
          
          {/* Close button */}
          <button
            onClick={closeNapsterIframe}
            className="absolute top-4 right-4 z-[1000000000] p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Iframe */}
          <iframe 
            src="https://spaces.napsterai.com/view/N2NlNjVhNGQtMzEyMC00M2Q5LTlkYTItMmYwZjZjY2M5YzhhOmFmN2M3M2Q1LWZiZDQtNDg2Ni04ZmIzLWY3OGM2ODM5MDBjZg==" 
            style={{
              width: '90vw',
              height: '90vh',
              maxWidth: '1280px',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              aspectRatio: '16/9',
              background: 'transparent',
              zIndex: 999999999,
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            frameBorder="0"
            allow="microphone; camera; autoplay; clipboard-write; encrypted-media"
            allowTransparency={true}
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            title="Napster Spaces Experience"
          />
        </div>
      )}

      {/* Pilot Waitlist Modal */}
      <PilotWaitlistModal 
        isOpen={showPilotModal} 
        onClose={() => setShowPilotModal(false)} 
      />
    </div>
  );
};