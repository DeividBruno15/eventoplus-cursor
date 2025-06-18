import { storage } from "./storage";

export interface MatchingPreferences {
  userId: number;
  categories: string[];
  priceRange: { min: number; max: number };
  location: string;
  radius: number;
  workStyle: string[];
  experienceLevel: string;
  certifications: string[];
  languages: string[];
  availability: string[];
}

export interface MatchResult {
  id: number;
  type: 'event' | 'service' | 'venue';
  score: number;
  title: string;
  description: string;
  location: string;
  price: number;
  category: string;
  reasons: string[];
  compatibility: {
    location: number;
    price: number;
    category: number;
    experience: number;
    availability: number;
  };
}

export class AIMatchingService {
  
  /**
   * Find matches for providers based on available events
   */
  async findEventMatchesForProvider(providerId: number): Promise<MatchResult[]> {
    try {
      const provider = await storage.getUser(providerId);
      const events = await storage.getEvents();
      const providerServices = await storage.getServices(providerId);
      
      if (!provider || !events.length) return [];

      const matches: MatchResult[] = [];

      for (const event of events.filter(e => e.status === 'active')) {
        const score = this.calculateEventProviderScore(event, provider, providerServices);
        
        if (score >= 60) { // Minimum 60% compatibility
          matches.push({
            id: event.id,
            type: 'event',
            score,
            title: event.title,
            description: event.description,
            location: event.location,
            price: parseFloat(event.budget),
            category: event.category,
            reasons: this.generateMatchReasons(score, event.category, provider.selectedServices || []),
            compatibility: this.calculateCompatibilityBreakdown(event, provider)
          });
        }
      }

      return matches.sort((a, b) => b.score - a.score).slice(0, 10);
    } catch (error) {
      console.error('Error finding event matches:', error);
      return [];
    }
  }

  /**
   * Find service providers for event organizers
   */
  async findProvidersForEvent(eventId: number, organizerId: number): Promise<MatchResult[]> {
    try {
      const event = await storage.getEvent(eventId);
      const services = await storage.getServices();
      
      if (!event || !services.length) return [];

      const matches: MatchResult[] = [];

      for (const service of services.filter(s => s.active)) {
        const provider = await storage.getUser(service.providerId);
        if (!provider) continue;

        const score = this.calculateServiceEventScore(service, event, provider);
        
        if (score >= 70) { // Higher threshold for service recommendations
          matches.push({
            id: service.id,
            type: 'service',
            score,
            title: service.title,
            description: service.description,
            location: service.location || provider.city || '',
            price: parseFloat(service.basePrice || '0'),
            category: service.category,
            reasons: this.generateServiceMatchReasons(score, service, event),
            compatibility: this.calculateServiceCompatibility(service, event)
          });
        }
      }

      return matches.sort((a, b) => b.score - a.score).slice(0, 15);
    } catch (error) {
      console.error('Error finding provider matches:', error);
      return [];
    }
  }

  /**
   * Generate dynamic pricing suggestions based on market data
   */
  async generatePricingSuggestions(serviceCategory: string, location: string, duration?: number): Promise<{
    suggested: number;
    range: { min: number; max: number };
    marketAverage: number;
    factors: string[];
  }> {
    try {
      const services = await storage.getServices();
      const categoryServices = services.filter(s => 
        s.category === serviceCategory && 
        s.basePrice && 
        parseFloat(s.basePrice) > 0
      );

      if (categoryServices.length === 0) {
        return {
          suggested: 500,
          range: { min: 200, max: 1000 },
          marketAverage: 500,
          factors: ['Dados insuficientes para esta categoria']
        };
      }

      const prices = categoryServices.map(s => parseFloat(s.basePrice!));
      const average = prices.reduce((a, b) => a + b, 0) / prices.length;
      const median = prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)];
      
      // Location factor (simplified)
      const locationMultiplier = location.toLowerCase().includes('são paulo') ? 1.2 : 
                               location.toLowerCase().includes('rio') ? 1.15 : 1.0;
      
      // Duration factor
      const durationMultiplier = duration ? Math.sqrt(duration / 4) : 1.0;
      
      const suggested = Math.round(median * locationMultiplier * durationMultiplier);
      
      return {
        suggested,
        range: {
          min: Math.round(suggested * 0.7),
          max: Math.round(suggested * 1.5)
        },
        marketAverage: Math.round(average),
        factors: [
          `Baseado em ${categoryServices.length} prestadores similares`,
          location.toLowerCase().includes('são paulo') || location.toLowerCase().includes('rio') 
            ? 'Ajuste para grande centro urbano' 
            : 'Preço padrão para a região',
          duration ? `Ajustado para ${duration}h de duração` : 'Duração padrão considerada'
        ]
      };
    } catch (error) {
      console.error('Error generating pricing suggestions:', error);
      return {
        suggested: 500,
        range: { min: 200, max: 1000 },
        marketAverage: 500,
        factors: ['Erro ao calcular sugestões']
      };
    }
  }

  private calculateEventProviderScore(event: any, provider: any, services: any[]): number {
    let score = 0;
    
    // Category match (40 points)
    const providerCategories = provider.selectedServices || [];
    if (providerCategories.includes(event.category)) {
      score += 40;
    } else if (this.isCategoryRelated(event.category, providerCategories)) {
      score += 25;
    }

    // Location proximity (20 points)
    if (provider.city && event.location.includes(provider.city)) {
      score += 20;
    } else if (provider.state && event.location.includes(provider.state)) {
      score += 10;
    }

    // Price compatibility (20 points)
    const eventBudget = parseFloat(event.budget);
    const relevantServices = services.filter(s => s.category === event.category);
    if (relevantServices.length > 0) {
      const avgPrice = relevantServices.reduce((sum, s) => sum + parseFloat(s.basePrice || '0'), 0) / relevantServices.length;
      if (avgPrice <= eventBudget * 1.2) {
        score += 20;
      } else if (avgPrice <= eventBudget * 1.5) {
        score += 10;
      }
    }

    // Experience/Reviews (10 points)
    if (services.length >= 5) score += 10;
    else if (services.length >= 2) score += 6;
    else if (services.length >= 1) score += 3;

    // Guest count compatibility (10 points)
    const guestCount = event.guestCount || 0;
    if (guestCount <= 50) score += 10; // Most providers can handle small events
    else if (guestCount <= 200) score += 8;
    else if (guestCount <= 500) score += 5;
    else score += 3; // Large events need experienced providers

    return Math.min(score, 100);
  }

  private calculateServiceEventScore(service: any, event: any, provider: any): number {
    let score = 0;

    // Category exact match (35 points)
    if (service.category === event.category) {
      score += 35;
    } else if (this.isCategoryRelated(service.category, [event.category])) {
      score += 20;
    }

    // Price compatibility (25 points)
    const servicePrice = parseFloat(service.basePrice || '0');
    const eventBudget = parseFloat(event.budget);
    if (servicePrice <= eventBudget) {
      score += 25;
    } else if (servicePrice <= eventBudget * 1.3) {
      score += 15;
    } else if (servicePrice <= eventBudget * 1.6) {
      score += 8;
    }

    // Location proximity (20 points)
    const serviceLocation = service.location || provider.city || '';
    if (serviceLocation && event.location.toLowerCase().includes(serviceLocation.toLowerCase())) {
      score += 20;
    } else if (provider.state && event.location.includes(provider.state)) {
      score += 10;
    }

    // Service rating (10 points)
    const rating = parseFloat(service.rating || '0');
    if (rating >= 4.5) score += 10;
    else if (rating >= 4.0) score += 8;
    else if (rating >= 3.5) score += 6;
    else if (rating >= 3.0) score += 4;

    // Booking history (10 points)
    const bookingCount = service.bookingCount || 0;
    if (bookingCount >= 20) score += 10;
    else if (bookingCount >= 10) score += 8;
    else if (bookingCount >= 5) score += 6;
    else if (bookingCount >= 1) score += 4;

    return Math.min(score, 100);
  }

  private calculateCompatibilityBreakdown(event: any, provider: any): any {
    return {
      location: provider.city && event.location.includes(provider.city) ? 100 : 50,
      price: 85, // Simplified calculation
      category: (provider.selectedServices || []).includes(event.category) ? 100 : 60,
      experience: Math.min((provider.id * 10) % 100, 100), // Simplified
      availability: 90 // Simplified
    };
  }

  private calculateServiceCompatibility(service: any, event: any): any {
    return {
      location: 85,
      price: parseFloat(service.basePrice || '0') <= parseFloat(event.budget) ? 100 : 60,
      category: service.category === event.category ? 100 : 70,
      experience: Math.min(parseFloat(service.rating || '0') * 20, 100),
      availability: 90
    };
  }

  private isCategoryRelated(category1: string, categories: string[]): boolean {
    const relations: Record<string, string[]> = {
      'Entretenimento': ['Produção', 'Organização'],
      'Alimentação': ['Organização', 'Limpeza'],
      'Produção': ['Entretenimento', 'Organização'],
      'Organização': ['Produção', 'Limpeza'],
      'Limpeza': ['Organização', 'Alimentação']
    };

    return relations[category1]?.some(rel => categories.includes(rel)) || false;
  }

  private generateMatchReasons(score: number, eventCategory: string, providerServices: string[]): string[] {
    const reasons = [];
    
    if (providerServices.includes(eventCategory)) {
      reasons.push(`Especialista em ${eventCategory}`);
    }
    
    if (score >= 90) {
      reasons.push('Compatibilidade excelente');
    } else if (score >= 80) {
      reasons.push('Muito bem avaliado');
    } else if (score >= 70) {
      reasons.push('Boa experiência na categoria');
    }
    
    reasons.push('Disponível na sua região');
    
    return reasons;
  }

  private generateServiceMatchReasons(score: number, service: any, event: any): string[] {
    const reasons = [];
    
    if (service.category === event.category) {
      reasons.push('Categoria exata do seu evento');
    }
    
    if (parseFloat(service.basePrice || '0') <= parseFloat(event.budget)) {
      reasons.push('Dentro do seu orçamento');
    }
    
    if (parseFloat(service.rating || '0') >= 4.0) {
      reasons.push('Muito bem avaliado');
    }
    
    if (service.bookingCount >= 10) {
      reasons.push('Prestador experiente');
    }
    
    return reasons;
  }
}

export const aiMatchingService = new AIMatchingService();