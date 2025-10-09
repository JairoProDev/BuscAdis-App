/**
 * PREMIUM SYSTEM FOR BUSCADIS
 * 
 * This system provides:
 * 1. Premium publication plans
 * 2. Feature restrictions and unlocks
 * 3. Payment processing integration
 * 4. Analytics for premium users
 * 5. Automatic plan management
 */

import { PremiumPlan, PremiumFeature } from '@/types';

// ============================================================================
// PREMIUM PLANS CONFIGURATION
// ============================================================================

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'basic',
    name: 'Plan Básico',
    price: 15,
    currency: 'PEN',
    duration: 30, // 30 days
    features: [
      {
        id: 'boost',
        name: 'Boost de Publicación',
        description: 'Tu anuncio aparece en las primeras posiciones por 7 días',
        icon: '🚀'
      },
      {
        id: 'analytics',
        name: 'Analytics Básicos',
        description: 'Ve cuántas personas vieron tu anuncio',
        icon: '📊'
      },
      {
        id: 'priority',
        name: 'Soporte Prioritario',
        description: 'Atención más rápida en soporte',
        icon: '⚡'
      }
    ],
    limits: {
      publications: 5,
      images: 10,
      featuredDays: 7,
      boostDays: 7,
      analytics: true,
      priority: true
    }
  },
  {
    id: 'premium',
    name: 'Plan Premium',
    price: 35,
    currency: 'PEN',
    duration: 30,
    popular: true,
    features: [
      {
        id: 'unlimited_boost',
        name: 'Boost Ilimitado',
        description: 'Boost tus anuncios todas las veces que quieras',
        icon: '🚀'
      },
      {
        id: 'advanced_analytics',
        name: 'Analytics Avanzados',
        description: 'Métricas detalladas: vistas, contactos, conversiones',
        icon: '📈'
      },
      {
        id: 'multiple_publications',
        name: 'Publicaciones Múltiples',
        description: 'Hasta 20 publicaciones activas simultáneamente',
        icon: '📝'
      },
      {
        id: 'premium_badge',
        name: 'Badge Premium',
        description: 'Badge especial que aumenta la confianza',
        icon: '⭐'
      },
      {
        id: 'priority_support',
        name: 'Soporte VIP',
        description: 'Atención prioritaria 24/7',
        icon: '👑'
      }
    ],
    limits: {
      publications: 20,
      images: 50,
      featuredDays: 30,
      boostDays: 30,
      analytics: true,
      priority: true
    }
  },
  {
    id: 'business',
    name: 'Plan Empresarial',
    price: 75,
    currency: 'PEN',
    duration: 30,
    features: [
      {
        id: 'unlimited_everything',
        name: 'Todo Ilimitado',
        description: 'Publicaciones, boosts y analytics sin límites',
        icon: '♾️'
      },
      {
        id: 'custom_analytics',
        name: 'Analytics Personalizados',
        description: 'Reportes personalizados y exportación de datos',
        icon: '📊'
      },
      {
        id: 'white_label',
        name: 'Branding Personalizado',
        description: 'Tu logo en tus publicaciones',
        icon: '🎨'
      },
      {
        id: 'api_access',
        name: 'Acceso API',
        description: 'API para gestionar publicaciones automáticamente',
        icon: '🔌'
      },
      {
        id: 'dedicated_support',
        name: 'Soporte Dedicado',
        description: 'Account manager dedicado',
        icon: '🎯'
      }
    ],
    limits: {
      publications: -1, // unlimited
      images: -1,
      featuredDays: -1,
      boostDays: -1,
      analytics: true,
      priority: true
    }
  }
];

// ============================================================================
// FEATURE RESTRICTIONS
// ============================================================================

export interface FeatureRestriction {
  feature: string;
  freeLimit: number;
  premiumLimit: number;
  businessLimit: number;
}

export const FEATURE_RESTRICTIONS: FeatureRestriction[] = [
  {
    feature: 'publications_per_month',
    freeLimit: 3,
    premiumLimit: 20,
    businessLimit: -1
  },
  {
    feature: 'images_per_publication',
    freeLimit: 3,
    premiumLimit: 10,
    businessLimit: 20
  },
  {
    feature: 'boost_duration_days',
    freeLimit: 0,
    premiumLimit: 7,
    businessLimit: 30
  },
  {
    feature: 'analytics_retention_days',
    freeLimit: 7,
    premiumLimit: 90,
    businessLimit: 365
  },
  {
    feature: 'contact_requests_per_day',
    freeLimit: 10,
    premiumLimit: 100,
    businessLimit: -1
  }
];

// ============================================================================
// PREMIUM FEATURE MANAGER
// ============================================================================

class PremiumFeatureManager {
  private userPlan: string = 'free';
  private userLimits: Record<string, number> = {};

  constructor(plan: string = 'free') {
    this.userPlan = plan;
    this.loadUserLimits();
  }

  private loadUserLimits(): void {
    const plan = PREMIUM_PLANS.find(p => p.id === this.userPlan);
    if (!plan) {
      // Free user limits
      this.userLimits = {
        publications_per_month: 3,
        images_per_publication: 3,
        boost_duration_days: 0,
        analytics_retention_days: 7,
        contact_requests_per_day: 10
      };
      return;
    }

    // Premium user limits
    this.userLimits = {
      publications_per_month: plan.limits.publications === -1 ? -1 : plan.limits.publications,
      images_per_publication: plan.limits.images === -1 ? -1 : plan.limits.images,
      boost_duration_days: plan.limits.boostDays,
      analytics_retention_days: 90,
      contact_requests_per_day: plan.limits.publications === -1 ? -1 : 100
    };
  }

  canUseFeature(feature: string, currentUsage?: number): boolean {
    const limit = this.userLimits[feature];
    if (limit === -1) return true; // unlimited
    if (limit === 0) return false; // not allowed
    if (currentUsage === undefined) return true; // no current usage data
    
    return currentUsage < limit;
  }

  getFeatureLimit(feature: string): number {
    return this.userLimits[feature];
  }

  getRemainingUsage(feature: string, currentUsage: number): number {
    const limit = this.userLimits[feature];
    if (limit === -1) return -1; // unlimited
    return Math.max(0, limit - currentUsage);
  }

  isPremium(): boolean {
    return this.userPlan !== 'free';
  }

  getPlan(): string {
    return this.userPlan;
  }

  getPlanFeatures(): PremiumFeature[] {
    const plan = PREMIUM_PLANS.find(p => p.id === this.userPlan);
    return plan?.features || [];
  }

  canBoost(): boolean {
    return this.canUseFeature('boost_duration_days');
  }

  canViewAnalytics(): boolean {
    const plan = PREMIUM_PLANS.find(p => p.id === this.userPlan);
    return plan?.limits.analytics || false;
  }

  canCreatePublication(currentCount: number): boolean {
    return this.canUseFeature('publications_per_month', currentCount);
  }

  canAddImage(currentCount: number): boolean {
    return this.canUseFeature('images_per_publication', currentCount);
  }
}

// ============================================================================
// PAYMENT PROCESSING
// ============================================================================

export interface PaymentRequest {
  planId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'paypal' | 'bank_transfer';
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
}

class PaymentProcessor {
  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // This would integrate with actual payment providers
      // For now, we'll simulate the process
      
      const plan = PREMIUM_PLANS.find(p => p.id === request.planId);
      if (!plan) {
        return {
          success: false,
          error: 'Plan not found'
        };
      }

      // Simulate payment gateway response
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        transactionId,
        paymentUrl: `/payment/process/${transactionId}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  async verifyPayment(/* transactionId: string */): Promise<boolean> {
    try {
      // This would verify with the payment provider
      // For now, we'll simulate verification
      return Math.random() > 0.1; // 90% success rate for simulation
    } catch {
      return false;
    }
  }
}

// ============================================================================
// PREMIUM ANALYTICS
// ============================================================================

export interface PremiumAnalytics {
  planId: string;
  userId: string;
  metrics: {
    publicationsCreated: number;
    boostsUsed: number;
    contactsReceived: number;
    viewsGenerated: number;
    revenueGenerated?: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}

class PremiumAnalyticsManager {
  async trackPremiumUsage(userId: string, action: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      // Store premium usage analytics
      const usage = {
        userId,
        action,
        metadata,
        timestamp: new Date(),
        planId: metadata?.planId || 'unknown'
      };

      // This would store in database
      console.log('Premium usage tracked:', usage);
    } catch (error) {
      console.error('Failed to track premium usage:', error);
    }
  }

  async getPremiumAnalytics(userId: string, period: { start: Date; end: Date }): Promise<PremiumAnalytics | null> {
    try {
      // This would fetch from database
      // For now, return mock data
      return {
        planId: 'premium',
        userId,
        metrics: {
          publicationsCreated: 15,
          boostsUsed: 8,
          contactsReceived: 45,
          viewsGenerated: 1200,
          revenueGenerated: 1500
        },
        period
      };
    } catch (error) {
      console.error('Failed to get premium analytics:', error);
      return null;
    }
  }
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
}

class SubscriptionManager {
  async createSubscription(userId: string, planId: string, paymentMethod: string): Promise<Subscription> {
    const plan = PREMIUM_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      planId,
      status: 'active',
      startDate: now,
      endDate,
      autoRenew: true,
      paymentMethod,
      lastPaymentDate: now,
      nextPaymentDate: endDate
    };

    // Store in database
    console.log('Subscription created:', subscription);
    
    return subscription;
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      // Update subscription status
      console.log('Subscription cancelled:', subscriptionId);
      return true;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  }

  async renewSubscription(subscriptionId: string): Promise<boolean> {
    try {
      // Process renewal
      console.log('Subscription renewed:', subscriptionId);
      return true;
    } catch (error) {
      console.error('Failed to renew subscription:', error);
      return false;
    }
  }

  async getActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      // Fetch from database
      // For now, return mock data
      return {
        id: 'sub_123456789',
        userId,
        planId: 'premium',
        status: 'active',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-01'),
        autoRenew: true,
        paymentMethod: 'card',
        lastPaymentDate: new Date('2024-01-01'),
        nextPaymentDate: new Date('2024-02-01')
      };
    } catch (error) {
      console.error('Failed to get active subscription:', error);
      return null;
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const premiumSystem = {
  plans: PREMIUM_PLANS,
  restrictions: FEATURE_RESTRICTIONS,
  featureManager: PremiumFeatureManager,
  paymentProcessor: new PaymentProcessor(),
  analyticsManager: new PremiumAnalyticsManager(),
  subscriptionManager: new SubscriptionManager(),
};

export default premiumSystem;
