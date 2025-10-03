/**
 * PREMIUM PLANS COMPONENT FOR BUSCADIS
 * 
 * Features:
 * - Responsive pricing cards
 * - Feature comparison
 * - Payment integration
 * - Plan selection
 * - Upgrade prompts
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon, StarIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { premiumSystem } from '@/lib/premium';

// ============================================================================
// INTERFACES
// ============================================================================

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number;
  features: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
  limits: {
    publications: number;
    images: number;
    featuredDays: number;
    boostDays: number;
    analytics: boolean;
    priority: boolean;
  };
  popular?: boolean;
}

interface PremiumPlansProps {
  currentPlan?: string;
  onPlanSelect?: (planId: string) => void;
  showUpgradePrompt?: boolean;
  variant?: 'full' | 'compact' | 'modal';
  className?: string;
}

interface PlanCardProps {
  plan: PremiumPlan;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onSelect: (planId: string) => void;
  variant?: 'full' | 'compact';
}

// ============================================================================
// PLAN CARD COMPONENT
// ============================================================================

function PlanCard({ plan, isCurrentPlan, isPopular, onSelect, variant = 'full' }: PlanCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    initial: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -5 },
    tap: { scale: 0.98 }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic':
        return <RocketLaunchIcon className="w-8 h-8" />;
      case 'premium':
        return <StarIcon className="w-8 h-8" />;
      case 'business':
        return <StarIcon className="w-8 h-8" />;
      default:
        return <RocketLaunchIcon className="w-8 h-8" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic':
        return 'from-blue-500 to-blue-600';
      case 'premium':
        return 'from-purple-500 to-purple-600';
      case 'business':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        className={`relative bg-white dark:bg-gray-800 rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
          isCurrentPlan 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
            : isPopular 
            ? 'border-purple-500 shadow-lg' 
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        onClick={() => onSelect(plan.id)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Más Popular
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${getPlanColor(plan.id)} text-white`}>
            {getPlanIcon(plan.id)}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              S/ {plan.price}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              por mes
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h3>

        {isCurrentPlan && (
          <div className="flex items-center text-green-600 dark:text-green-400 text-sm mb-3">
            <CheckIcon className="w-4 h-4 mr-1" />
            Plan Actual
          </div>
        )}

        <div className="space-y-2 mb-4">
          {plan.features.slice(0, 3).map((feature) => (
            <div key={feature.id} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <CheckIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
              <span>{feature.name}</span>
            </div>
          ))}
          {plan.features.length > 3 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              +{plan.features.length - 3} características más
            </div>
          )}
        </div>

        <motion.button
          className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
            isCurrentPlan
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed'
              : isPopular
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          whileHover={!isCurrentPlan ? { scale: 1.02 } : {}}
          whileTap={!isCurrentPlan ? { scale: 0.98 } : {}}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Plan Actual' : 'Seleccionar Plan'}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 ${
        isCurrentPlan 
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
          : isPopular 
          ? 'border-purple-500 shadow-xl' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={() => onSelect(plan.id)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
            ⭐ Más Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${getPlanColor(plan.id)} text-white mb-4`}>
          {getPlanIcon(plan.id)}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {plan.name}
        </h3>
        
        <div className="mb-4">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            S/ {plan.price}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-2">
            /mes
          </span>
        </div>

        {isCurrentPlan && (
          <div className="flex items-center justify-center text-green-600 dark:text-green-400 text-sm mb-4">
            <CheckIcon className="w-5 h-5 mr-2" />
            <span className="font-medium">Tu Plan Actual</span>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {plan.features.map((feature) => (
          <div key={feature.id} className="flex items-start">
            <CheckIcon className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {feature.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {feature.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <motion.button
        className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
          isCurrentPlan
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed'
            : isPopular
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-lg'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        whileHover={!isCurrentPlan ? { scale: 1.02 } : {}}
        whileTap={!isCurrentPlan ? { scale: 0.98 } : {}}
        disabled={isCurrentPlan}
      >
        {isCurrentPlan ? 'Plan Actual' : 'Seleccionar Plan'}
      </motion.button>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PremiumPlans({
  currentPlan = 'free',
  onPlanSelect,
  showUpgradePrompt = false,
  variant = 'full',
  className = ''
}: PremiumPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlan) return;
    
    setSelectedPlan(planId);
    onPlanSelect?.(planId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (variant === 'compact') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {premiumSystem.plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlan}
            isPopular={plan.popular}
            onSelect={handlePlanSelect}
            variant="compact"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Elige tu Plan Premium
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Desbloquea el potencial completo de BuscaDis con nuestros planes premium. 
          Más contactos, más vistas y mejores resultados.
        </p>
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && currentPlan === 'free' && (
        <motion.div
          className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🚀 ¡Mejora tus resultados ahora!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Los usuarios premium reciben 3x más contactos que los usuarios gratuitos
              </p>
            </div>
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Planes
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Plans Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {premiumSystem.plans.map((plan) => (
          <motion.div key={plan.id} variants={itemVariants}>
            <PlanCard
              plan={plan}
              isCurrentPlan={plan.id === currentPlan}
              isPopular={plan.popular}
              onSelect={handlePlanSelect}
              variant="full"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Features Comparison */}
      <motion.div
        className="mt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Comparación de Características
        </h3>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                    Características
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                    Gratuito
                  </th>
                  {premiumSystem.plans.map((plan) => (
                    <th key={plan.id} className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {premiumSystem.restrictions.map((restriction) => (
                  <tr key={restriction.feature} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {restriction.feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {restriction.freeLimit === -1 ? '∞' : restriction.freeLimit}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {restriction.premiumLimit === -1 ? '∞' : restriction.premiumLimit}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {restriction.businessLimit === -1 ? '∞' : restriction.businessLimit}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      {restriction.businessLimit === -1 ? '∞' : restriction.businessLimit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
