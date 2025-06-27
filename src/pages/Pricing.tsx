import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SubscriptionPlans } from '../components/SubscriptionPlans';

export const Pricing: React.FC = () => {
  const handlePlanSelect = (planId: string) => {
    console.log('Selected plan:', planId);
    // Handle plan selection - could redirect to dashboard or show success message
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <SubscriptionPlans onPlanSelect={handlePlanSelect} />

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  What's included in the voice transcription?
                </h4>
                <p className="text-slate-600 text-sm">
                  All plans include real-time transcription powered by Deepgram Nova-2, 
                  the most advanced speech-to-text model available.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Can I change my plan anytime?
                </h4>
                <p className="text-slate-600 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. 
                  Changes take effect at the next billing cycle.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Is my data secure?
                </h4>
                <p className="text-slate-600 text-sm">
                  Absolutely. We use end-to-end encryption and don't store audio files. 
                  Only text transcriptions are processed and stored securely.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  What payment methods do you accept?
                </h4>
                <p className="text-slate-600 text-sm">
                  We accept all major credit cards through Stripe, 
                  including Visa, Mastercard, American Express, and Discover.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Do you offer refunds?
                </h4>
                <p className="text-slate-600 text-sm">
                  Yes, we offer a 30-day money-back guarantee for all plans. 
                  Contact support if you're not satisfied.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">
                  Can I get a custom enterprise plan?
                </h4>
                <p className="text-slate-600 text-sm">
                  Yes, we offer custom enterprise solutions with dedicated support, 
                  SSO integration, and custom features. Contact us for pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};