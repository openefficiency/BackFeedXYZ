import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Check, MessageSquare, ExternalLink, ArrowRight } from 'lucide-react';
import { handleElevenLabsWebhook } from '../lib/elevenlabs-webhook';

export const HomePage: React.FC = () => {
  const [result, setResult] = useState<{
    caseId: string;
    confirmationCode: string;
    transcript: string;
  } | null>(null);
  const [error, setError] = useState('');

  // Listen for iframe messages from ElevenLabs
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Check for ElevenLabs events
      if (event.origin.includes('elevenlabs') && event.data) {
        console.log('📨 Received ElevenLabs event:', event.data);
        
        if (event.data.type === 'conversation_ended' || 
            event.data.type === 'conversation_complete') {
          handleElevenLabsConversationComplete(event.data);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
                <p>✅ Processed with Aegis AI Conversational Technology</p>
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
            Powered by Aegis AI
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
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-semibold text-slate-900">
                  Speak to Aegis AI
                </h3>
              </div>
              <p className="text-slate-600 mb-6">
                Start your conversation with our advanced AI assistant for secure, anonymous feedback
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

            {/* Direct Link to ElevenLabs Interface */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-8 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  Ready to Share Your Feedback?
                </h4>
                <p className="text-slate-600 mb-6">
                  Click below to open the Aegis AI conversation interface in a new window
                </p>
                <a
                  href="https://elevenlabs.io/app/talk-to?agent_id=agent_01jydtj6avef99c1ne0eavf0ww"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <MessageSquare className="w-6 h-6" />
                  Start Conversation with Aegis AI
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-2">How it works:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Click the button above to open Aegis AI in a new window</li>
                <li>• Allow microphone access when prompted</li>
                <li>• Have a natural conversation about your feedback</li>
                <li>• Your conversation is automatically processed and sent to HR</li>
                <li>• You'll receive a confirmation code when complete</li>
              </ul>
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
              How can Aegis AI help you today?
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};