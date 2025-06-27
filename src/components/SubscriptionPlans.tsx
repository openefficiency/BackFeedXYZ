import React, { useState } from 'react';
import { Check, Zap, Crown, Building, CreditCard, Loader2 } from 'lucide-react';
import { subscriptionPlans, stripeClient } from '../lib/stripe-client';

interface SubscriptionPlansProps {
  onPlanSelect?: (planId: string) => void;
  currentPlan?: string;
  className?: string;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onPlanSelect,
  currentPlan,
  className = ''
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return <Zap className="w-6 h-6" />;
      case 'pro': return <Crown className="w-6 h-6" />;
      case 'enterprise': return <Building className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic': return 'from-blue-500 to-blue-600';
      case 'pro': return 'from-purple-500 to-purple-600';
      case 'enterprise': return 'from-emerald-500 to-emerald-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    setError('');

    try {
      // Create checkout session
      const checkoutUrl = await stripeClient.createCheckoutSession(planId);
      
      // In a real implementation, redirect to Stripe checkout
      // For demo purposes, we'll simulate the process
      console.log('Redirecting to checkout:', checkoutUrl);
      
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const result = await stripeClient.handlePaymentSuccess('demo_session_id');
      
      if (result.success) {
        if (onPlanSelect) {
          onPlanSelect(planId);
        }
        alert(`Successfully subscribed to ${subscriptionPlans.find(p => p.id === planId)?.name} plan!`);
      } else {
        throw new Error('Payment processing failed');
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to process subscription');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Select the perfect plan for your organization's feedback needs. 
          All plans include Deepgram Nova-2 real-time transcription.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {subscriptionPlans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isLoading = loading === plan.id;
          const isPro = plan.id === 'pro';

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                isPro 
                  ? 'border-purple-300 transform scale-105' 
                  : isCurrentPlan
                    ? 'border-green-300'
                    : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getPlanColor(plan.id)} text-white mb-4`}>
                    {getPlanIcon(plan.id)}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-slate-900 mb-1">
                    ${plan.price}
                    <span className="text-lg font-normal text-slate-500">/{plan.interval}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan || isLoading}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isCurrentPlan
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : isPro
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="w-4 h-4" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Subscribe Now
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Security Notice */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
          <CreditCard className="w-4 h-4 text-slate-600" />
          <span className="text-sm text-slate-600">
            Secure payments powered by Stripe
          </span>
        </div>
      </div>
    </div>
  );
};