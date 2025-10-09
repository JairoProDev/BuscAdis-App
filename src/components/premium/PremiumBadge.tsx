/**
 * PREMIUM BADGE COMPONENT FOR BUSCADIS
 * 
 * Features:
 * - Premium plan indicators
 * - Boost status badges
 * - Featured publication badges
 * - Analytics indicators
 * - Trust signals
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  StarIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// ============================================================================
// INTERFACES
// ============================================================================

interface PremiumBadgeProps {
  type: 'plan' | 'boost' | 'featured' | 'analytics' | 'verified' | 'premium';
  plan?: 'basic' | 'premium' | 'business';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
  showText?: boolean;
}

interface BadgeConfig {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  colors: {
    bg: string;
    text: string;
    border: string;
    gradient: string;
  };
  animation?: {
    scale?: number;
    rotate?: number;
    duration?: number;
  };
}

// ============================================================================
// BADGE CONFIGURATIONS
// ============================================================================

const badgeConfigs: Record<string, BadgeConfig> = {
  plan: {
    icon: StarIcon,
    text: 'Premium',
    colors: {
      bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
      text: 'text-white',
      border: 'border-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    },
    animation: {
      scale: 1.1,
      duration: 0.3
    }
  },
  boost: {
    icon: RocketLaunchIcon,
    text: 'Boost',
    colors: {
      bg: 'bg-gradient-to-r from-orange-500 to-red-500',
      text: 'text-white',
      border: 'border-orange-500',
      gradient: 'from-orange-500 to-red-500'
    },
    animation: {
      scale: 1.05,
      rotate: 5,
      duration: 0.5
    }
  },
  featured: {
    icon: StarIcon,
    text: 'Destacado',
    colors: {
      bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      text: 'text-white',
      border: 'border-yellow-500',
      gradient: 'from-yellow-500 to-yellow-600'
    },
    animation: {
      scale: 1.08,
      duration: 0.4
    }
  },
  analytics: {
    icon: ChartBarIcon,
    text: 'Analytics',
    colors: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      text: 'text-white',
      border: 'border-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    }
  },
  verified: {
    icon: ShieldCheckIcon,
    text: 'Verificado',
    colors: {
      bg: 'bg-gradient-to-r from-green-500 to-green-600',
      text: 'text-white',
      border: 'border-green-500',
      gradient: 'from-green-500 to-green-600'
    }
  },
  premium: {
    icon: SparklesIcon,
    text: 'Premium',
    colors: {
      bg: 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600',
      text: 'text-white',
      border: 'border-purple-500',
      gradient: 'from-purple-500 via-pink-500 to-purple-600'
    },
    animation: {
      scale: 1.1,
      duration: 0.6
    }
  }
};

// ============================================================================
// PLAN-SPECIFIC CONFIGURATIONS
// ============================================================================

const planConfigs = {
  basic: {
    icon: StarIcon,
    text: 'Básico',
    colors: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      text: 'text-white',
      border: 'border-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    }
  },
  premium: {
    icon: StarIcon,
    text: 'Premium',
    colors: {
      bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
      text: 'text-white',
      border: 'border-purple-500',
      gradient: 'from-purple-500 to-purple-600'
    }
  },
  business: {
    icon: SparklesIcon,
    text: 'Empresarial',
    colors: {
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      text: 'text-white',
      border: 'border-yellow-500',
      gradient: 'from-yellow-500 to-orange-500'
    }
  }
};

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const sizeConfigs = {
  sm: {
    container: 'px-2 py-1 text-xs',
    icon: 'w-3 h-3',
    spacing: 'mr-1'
  },
  md: {
    container: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
    spacing: 'mr-1.5'
  },
  lg: {
    container: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
    spacing: 'mr-2'
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PremiumBadge({
  type,
  plan,
  size = 'sm',
  animated = true,
  className = '',
  showText = true
}: PremiumBadgeProps) {
  
  // Get configuration based on type and plan
  const config = plan && type === 'plan' 
    ? planConfigs[plan] 
    : badgeConfigs[type];

  if (!config) {
    console.warn(`Unknown badge type: ${type}`);
    return null;
  }

  const sizeConfig = sizeConfigs[size];
  const IconComponent = config.icon;

  const badgeContent = (
    <div className={`
      inline-flex items-center 
      ${config.colors.bg}
      ${config.colors.text}
      border ${config.colors.border}
      rounded-full font-medium
      ${sizeConfig.container}
      ${showText ? '' : 'px-2 py-1'}
      shadow-sm hover:shadow-md
      transition-all duration-200
      ${className}
    `}>
      <IconComponent className={`${sizeConfig.icon} ${showText ? sizeConfig.spacing : ''}`} />
      {showText && (
        <span className="font-semibold">
          {config.text}
        </span>
      )}
    </div>
  );

  if (animated && 'animation' in config && config.animation) {
    return (
      <motion.div
        initial={{ scale: 1, rotate: 0 }}
        animate={{
          scale: config.animation.scale || 1,
          rotate: config.animation.rotate || 0,
          transition: {
            duration: config.animation.duration || 0.3,
            repeat: Infinity,
            repeatType: 'reverse' as const,
            ease: 'easeInOut'
          }
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {badgeContent}
      </motion.div>
    );
  }

  return badgeContent;
}

// ============================================================================
// SPECIALIZED BADGE COMPONENTS
// ============================================================================

export function PlanBadge({ plan, size = 'sm', className = '' }: { 
  plan: 'basic' | 'premium' | 'business'; 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  return (
    <PremiumBadge 
      type="plan" 
      plan={plan} 
      size={size} 
      className={className}
      animated={true}
    />
  );
}

export function BoostBadge({ size = 'sm', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  return (
    <PremiumBadge 
      type="boost" 
      size={size} 
      className={className}
      animated={true}
    />
  );
}

export function FeaturedBadge({ size = 'sm', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  return (
    <PremiumBadge 
      type="featured" 
      size={size} 
      className={className}
      animated={true}
    />
  );
}

export function VerifiedBadge({ size = 'sm', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  return (
    <PremiumBadge 
      type="verified" 
      size={size} 
      className={className}
      animated={false}
    />
  );
}

export function AnalyticsBadge({ size = 'sm', className = '' }: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string; 
}) {
  return (
    <PremiumBadge 
      type="analytics" 
      size={size} 
      className={className}
      animated={false}
    />
  );
}

// ============================================================================
// BADGE STACK COMPONENT
// ============================================================================

interface BadgeStackProps {
  badges: Array<{
    type: PremiumBadgeProps['type'];
    plan?: PremiumBadgeProps['plan'];
  }>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  maxVisible?: number;
}

export function BadgeStack({ 
  badges, 
  size = 'sm', 
  className = '', 
  maxVisible = 3 
}: BadgeStackProps) {
  const visibleBadges = badges.slice(0, maxVisible);
  const remainingCount = badges.length - maxVisible;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {visibleBadges.map((badge) => (
        <PremiumBadge
          key={`${badge.type}-${badge.plan || 'default'}`}
          type={badge.type}
          plan={badge.plan}
          size={size}
          animated={true}
          showText={false}
        />
      ))}
      {remainingCount > 0 && (
        <div className={`
          inline-flex items-center justify-center
          bg-gray-500 text-white rounded-full font-medium
          ${size === 'sm' ? 'w-6 h-6 text-xs' : size === 'md' ? 'w-7 h-7 text-sm' : 'w-8 h-8 text-base'}
        `}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
