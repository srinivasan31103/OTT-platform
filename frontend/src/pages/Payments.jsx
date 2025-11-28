import { useEffect, useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { paymentApi } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';

const Payments = () => {
  const { user } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch plans
        const plansRes = await paymentApi.getSubscriptionPlans();
        setPlans(plansRes.data || []);

        // Fetch current subscription
        const subRes = await paymentApi.getSubscriptionStatus();
        setSubscription(subRes.data);
      } catch (error) {
        console.error('Failed to fetch payment data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async (planId) => {
    try {
      setIsProcessing(true);
      setSelectedPlan(planId);

      const response = await paymentApi.initiatePurchase(planId);

      // Redirect to payment gateway
      if (response.data?.redirectUrl) {
        window.location.href = response.data.redirectUrl;
      }
    } catch (error) {
      console.error('Failed to initiate purchase:', error);
      setSelectedPlan(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      setIsProcessing(true);
      await paymentApi.cancelSubscription();
      setSubscription(null);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center particles-bg relative overflow-hidden">
        <div className="absolute inset-0 overlay-glow" />
        <div className="relative z-10 text-center">
          <div className="animate-spin mb-4 inline-block">
            <div className="w-12 h-12 border-4 border-transparent border-t-neon-purple rounded-full"
              style={{
                boxShadow: '0 0 20px rgba(168, 85, 247, 0.6)'
              }}
            />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark pb-12 particles-bg relative overflow-hidden">
      <div className="absolute inset-0 overlay-glow" />

      {/* Header */}
      <div className="px-4 lg:px-8 py-8 border-b border-neon-purple/30 glass-neon sticky top-20 z-40 animate-slide-down">
        <h1 className="heading-section mb-2">Subscription</h1>
        <p className="text-gray-400">
          Manage your Streamverse subscription and billing
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12 relative z-10">
        {/* Current Subscription */}
        {subscription && (
          <div className="mb-12 p-6 glass-neon rounded-2xl border-l-4 border-neon-purple animate-slide-up"
            style={{
              boxShadow: '0 4px 30px rgba(168, 85, 247, 0.3)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-neon-purple bg-clip-text text-transparent mb-2">
                  {subscription.planName}
                </h2>
                <p className={`font-semibold ${
                  subscription.status === 'active'
                    ? 'text-neon-green'
                    : 'text-red-400'
                }`}>
                  {subscription.status === 'active'
                    ? '✓ Your subscription is active'
                    : '✗ Subscription inactive'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-neon-pink mb-2">
                  ${subscription.price}
                  <span className="text-lg text-gray-400">/month</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Renews on{' '}
                  <span className="text-neon-cyan font-semibold">
                    {new Date(subscription.renewalDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-red-500/20 border-2 border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50 font-semibold"
            >
              Cancel Subscription
            </button>
          </div>
        )}

        {/* Plans */}
        <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="heading-section mb-8">
            {subscription ? 'Upgrade or Downgrade' : 'Choose Your Plan'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, idx) => {
              const isCurrentPlan =
                subscription?.planId === plan._id &&
                subscription?.status === 'active';

              return (
                <div
                  key={plan._id}
                  className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${
                    isCurrentPlan
                      ? 'glass-neon border-2 border-neon-purple'
                      : 'glass-neon border-2 border-neon-purple/30 hover:border-neon-purple'
                  }`}
                  style={{
                    animationDelay: `${idx * 0.1}s`,
                    boxShadow: isCurrentPlan
                      ? '0 0 30px rgba(168, 85, 247, 0.5)'
                      : '0 4px 20px rgba(168, 85, 247, 0.2)'
                  }}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-4 right-6 badge-neon px-4 py-1 text-sm">
                      Current Plan
                    </div>
                  )}

                  {plan.isPopular && !isCurrentPlan && (
                    <div className="absolute -top-4 right-6 bg-gradient-to-r from-neon-orange to-neon-pink px-4 py-1 rounded-full text-white text-sm font-bold"
                      style={{
                        boxShadow: '0 0 15px rgba(249, 115, 22, 0.5)'
                      }}
                    >
                      Popular
                    </div>
                  )}

                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-neon-purple bg-clip-text text-transparent mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <div className="text-4xl font-bold text-neon-pink mb-1">
                      ${plan.price}
                      <span className="text-lg text-gray-400">/month</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features?.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 text-gray-300"
                      >
                        <FiCheck className="text-neon-green flex-shrink-0 mt-1" size={18} />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full py-3 glass-neon border-2 border-neon-cyan text-neon-cyan font-bold rounded-xl cursor-default"
                      style={{
                        boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
                      }}
                    >
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan._id)}
                      disabled={isProcessing && selectedPlan === plan._id}
                      className="w-full py-3 btn-neon font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing && selectedPlan === plan._id
                        ? 'Processing...'
                        : subscription
                        ? 'Upgrade'
                        : 'Subscribe Now'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing History */}
        {subscription && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="heading-card mb-6">
              Billing History
            </h2>
            <div className="glass-neon rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.2)'
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neon-purple/30">
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-neon-cyan font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscription.transactions?.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="border-b border-neon-purple/20 hover:bg-neon-purple/10 transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-semibold">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 text-neon-pink font-bold">
                          ${transaction.amount}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              transaction.status === 'completed'
                                ? 'badge-neon'
                                : 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-400'
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
