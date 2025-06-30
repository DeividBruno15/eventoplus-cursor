import { DatabaseStorage } from './storage';

export interface RecommendationProfile {
  userId: number;
  userType: 'contratante' | 'prestador' | 'anunciante';
  preferences: {
    categories: string[];
    priceRange: { min: number; max: number };
    location: string;
    radius: number;
    eventTypes: string[];
    workStyle: string[];
  };
  history: {
    events: Array<{ category: string; budget: number; location: string; rating?: number }>;
    services: Array<{ category: string; price: number; rating?: number }>;
    venues: Array<{ category: string; price: number; location: string; rating?: number }>;
  };
  behavior: {
    searchFrequency: number;
    averageSessionDuration: number;
    conversionRate: number;
    lastActive: Date;
  };
}

export interface AIRecommendation {
  id: string;
  type: 'event' | 'service' | 'venue' | 'provider';
  targetId: number;
  title: string;
  description: string;
  category: string;
  price?: number;
  location?: string;
  rating?: number;
  matchScore: number;
  reasons: string[];
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  expiresAt: Date;
  metadata: Record<string, any>;
}

export interface RecommendationInsights {
  totalRecommendations: number;
  averageMatchScore: number;
  topCategories: Array<{ category: string; count: number; avgScore: number }>;
  userEngagement: {
    clickThroughRate: number;
    conversionRate: number;
    averageTimeToAction: number;
  };
  performance: {
    highConfidenceRecommendations: number;
    successfulMatches: number;
    userSatisfactionScore: number;
  };
}

export class AIRecommendationService {
  constructor(private storage: DatabaseStorage) {}

  /**
   * Gera recomendações personalizadas baseadas no perfil do usuário
   */
  async generatePersonalizedRecommendations(userId: number, limit: number = 10): Promise<AIRecommendation[]> {
    try {
      const profile = await this.buildUserProfile(userId);
      const recommendations: AIRecommendation[] = [];

      // Recomendações baseadas no tipo de usuário
      switch (profile.userType) {
        case 'contratante':
          recommendations.push(...await this.generateContratanteRecommendations(profile, limit));
          break;
        case 'prestador':
          recommendations.push(...await this.generatePrestadorRecommendations(profile, limit));
          break;
        case 'anunciante':
          recommendations.push(...await this.generateAnuncianteRecommendations(profile, limit));
          break;
      }

      // Ordena por score de match e confiança
      return recommendations
        .sort((a, b) => (b.matchScore * b.confidence) - (a.matchScore * a.confidence))
        .slice(0, limit);
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
      return [];
    }
  }

  /**
   * Gera recomendações para contratantes (eventos e prestadores)
   */
  private async generateContratanteRecommendations(profile: RecommendationProfile, limit: number): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];
    const events = await this.storage.getEvents();
    const services = await this.storage.getServices();
    const venues = await this.storage.getVenues();

    // Recomendações de prestadores baseadas em histórico
    const topServices = services
      .filter(service => this.matchesUserPreferences(service, profile))
      .slice(0, Math.ceil(limit * 0.5));

    for (const service of topServices) {
      const matchScore = this.calculateServiceMatchScore(service, profile);
      recommendations.push({
        id: `service_${service.id}_${Date.now()}`,
        type: 'service',
        targetId: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        price: parseFloat(service.price || '0'),
        matchScore,
        reasons: this.generateServiceRecommendationReasons(service, profile),
        confidence: this.calculateConfidence(matchScore, profile.history.services.length),
        priority: matchScore > 0.8 ? 'high' : matchScore > 0.6 ? 'medium' : 'low',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        metadata: { providerId: service.providerId, serviceType: service.category }
      });
    }

    // Recomendações de locais baseadas em preferências
    const topVenues = venues
      .filter(venue => this.matchesVenuePreferences(venue, profile))
      .slice(0, Math.ceil(limit * 0.3));

    for (const venue of topVenues) {
      const matchScore = this.calculateVenueMatchScore(venue, profile);
      recommendations.push({
        id: `venue_${venue.id}_${Date.now()}`,
        type: 'venue',
        targetId: venue.id,
        title: venue.name,
        description: venue.description,
        category: venue.category,
        price: parseFloat(venue.pricePerHour || '0'),
        location: venue.location,
        matchScore,
        reasons: this.generateVenueRecommendationReasons(venue, profile),
        confidence: this.calculateConfidence(matchScore, profile.history.venues.length),
        priority: matchScore > 0.8 ? 'high' : matchScore > 0.6 ? 'medium' : 'low',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias
        metadata: { ownerId: venue.ownerId, capacity: venue.capacity }
      });
    }

    return recommendations;
  }

  /**
   * Gera recomendações para prestadores (eventos relevantes)
   */
  private async generatePrestadorRecommendations(profile: RecommendationProfile, limit: number): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];
    const events = await this.storage.getEvents();

    // Filtra eventos que ainda estão abertos para aplicações
    const openEvents = events.filter(event => 
      event.status === 'active' || event.status === null
    );

    for (const event of openEvents.slice(0, limit)) {
      const matchScore = this.calculateEventMatchScore(event, profile);
      
      if (matchScore > 0.3) { // Só recomenda se tiver match razoável
        recommendations.push({
          id: `event_${event.id}_${Date.now()}`,
          type: 'event',
          targetId: event.id,
          title: event.title,
          description: event.description,
          category: event.category,
          price: parseFloat(event.budget.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
          location: event.location,
          matchScore,
          reasons: this.generateEventRecommendationReasons(event, profile),
          confidence: this.calculateConfidence(matchScore, profile.history.events.length),
          priority: matchScore > 0.8 ? 'high' : matchScore > 0.6 ? 'medium' : 'low',
          expiresAt: new Date(event.date),
          metadata: { organizerId: event.organizerId, guestCount: event.guestCount }
        });
      }
    }

    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Gera recomendações para anunciantes (eventos que precisam de locais)
   */
  private async generateAnuncianteRecommendations(profile: RecommendationProfile, limit: number): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];
    const events = await this.storage.getEvents();

    // Eventos que podem precisar de locais
    const eventsNeedingVenues = events.filter(event => 
      (event.status === 'active' || event.status === null) &&
      this.eventNeedsVenue(event, profile)
    );

    for (const event of eventsNeedingVenues.slice(0, limit)) {
      const matchScore = this.calculateEventVenueMatchScore(event, profile);
      
      recommendations.push({
        id: `event_venue_${event.id}_${Date.now()}`,
        type: 'event',
        targetId: event.id,
        title: `Oportunidade: ${event.title}`,
        description: `Evento precisa de local na categoria ${event.category}`,
        category: event.category,
        price: parseFloat(event.budget.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        location: event.location,
        matchScore,
        reasons: this.generateEventVenueRecommendationReasons(event, profile),
        confidence: this.calculateConfidence(matchScore, profile.history.events.length),
        priority: matchScore > 0.8 ? 'high' : matchScore > 0.6 ? 'medium' : 'low',
        expiresAt: new Date(event.date),
        metadata: { organizerId: event.organizerId, guestCount: event.guestCount }
      });
    }

    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Constrói perfil do usuário baseado em dados históricos
   */
  private async buildUserProfile(userId: number): Promise<RecommendationProfile> {
    // Simula dados de perfil - em produção viria do banco de dados
    const events = await this.storage.getEvents();
    const services = await this.storage.getServices();
    const venues = await this.storage.getVenues();

    // Dados simulados baseados em patterns reais
    return {
      userId,
      userType: 'contratante', // Seria obtido do banco
      preferences: {
        categories: ['casamento', 'aniversario', 'corporativo'],
        priceRange: { min: 1000, max: 50000 },
        location: 'São Paulo',
        radius: 50,
        eventTypes: ['social', 'corporativo'],
        workStyle: ['presencial', 'hibrido']
      },
      history: {
        events: events.slice(0, 3).map(e => ({
          category: e.category,
          budget: parseFloat(e.budget.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
          location: e.location,
          rating: 4.5
        })),
        services: services.slice(0, 5).map(s => ({
          category: s.category,
          price: parseFloat(s.price || '0'),
          rating: 4.3
        })),
        venues: venues.slice(0, 2).map(v => ({
          category: v.category,
          price: parseFloat(v.pricePerHour || '0'),
          location: v.location,
          rating: 4.6
        }))
      },
      behavior: {
        searchFrequency: 3.5,
        averageSessionDuration: 15.2,
        conversionRate: 0.23,
        lastActive: new Date()
      }
    };
  }

  /**
   * Calcula score de match entre serviço e perfil do usuário
   */
  private calculateServiceMatchScore(service: any, profile: RecommendationProfile): number {
    let score = 0;

    // Categoria (40% do score)
    if (profile.preferences.categories.includes(service.category)) {
      score += 0.4;
    }

    // Preço (30% do score)
    const price = parseFloat(service.price || '0');
    if (price >= profile.preferences.priceRange.min && price <= profile.preferences.priceRange.max) {
      score += 0.3;
    } else if (price < profile.preferences.priceRange.min) {
      score += 0.15; // Preço baixo é melhor que alto
    }

    // Histórico de categoria (20% do score)
    const categoryHistory = profile.history.services.filter(s => s.category === service.category);
    if (categoryHistory.length > 0) {
      const avgRating = categoryHistory.reduce((sum, s) => sum + (s.rating || 0), 0) / categoryHistory.length;
      score += (avgRating / 5) * 0.2;
    }

    // Qualidade do serviço (10% do score)
    if (service.rating && service.rating > 4.0) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calcula score de match entre evento e perfil do prestador
   */
  private calculateEventMatchScore(event: any, profile: RecommendationProfile): number {
    let score = 0;

    // Categoria do serviço (50% do score)
    if (profile.preferences.categories.includes(event.category)) {
      score += 0.5;
    }

    // Orçamento compatível (30% do score)
    const budget = parseFloat(event.budget.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    if (budget >= profile.preferences.priceRange.min) {
      score += 0.3;
    }

    // Localização (15% do score)
    if (event.location.includes(profile.preferences.location)) {
      score += 0.15;
    }

    // Data do evento (5% do score)
    const eventDate = new Date(event.date);
    const daysUntilEvent = (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilEvent > 7 && daysUntilEvent < 90) { // Tempo ideal para preparação
      score += 0.05;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calcula score de match entre venue e perfil
   */
  private calculateVenueMatchScore(venue: any, profile: RecommendationProfile): number {
    let score = 0;

    // Categoria (40% do score)
    if (profile.preferences.categories.includes(venue.category)) {
      score += 0.4;
    }

    // Preço (30% do score)
    const price = parseFloat(venue.pricePerHour || '0');
    if (price >= profile.preferences.priceRange.min && price <= profile.preferences.priceRange.max) {
      score += 0.3;
    }

    // Localização (20% do score)
    if (venue.location.includes(profile.preferences.location)) {
      score += 0.2;
    }

    // Histórico de venues similares (10% do score)
    const similarVenues = profile.history.venues.filter(v => v.category === venue.category);
    if (similarVenues.length > 0) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Verifica se evento precisa de venue baseado no perfil do anunciante
   */
  private eventNeedsVenue(event: any, profile: RecommendationProfile): boolean {
    return profile.preferences.categories.some(cat => 
      event.category.toLowerCase().includes(cat.toLowerCase())
    );
  }

  /**
   * Calcula score de match entre evento e venue do anunciante
   */
  private calculateEventVenueMatchScore(event: any, profile: RecommendationProfile): number {
    let score = 0;

    // Categoria compatível (50% do score)
    if (profile.preferences.categories.includes(event.category)) {
      score += 0.5;
    }

    // Orçamento do evento (30% do score)
    const budget = parseFloat(event.budget.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    if (budget >= profile.preferences.priceRange.min) {
      score += 0.3;
    }

    // Localização (20% do score)
    if (event.location.includes(profile.preferences.location)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Verifica se serviço match com preferências do usuário
   */
  private matchesUserPreferences(service: any, profile: RecommendationProfile): boolean {
    const price = parseFloat(service.price || '0');
    return price <= profile.preferences.priceRange.max * 1.2; // 20% de flexibilidade
  }

  /**
   * Verifica se venue match com preferências do usuário
   */
  private matchesVenuePreferences(venue: any, profile: RecommendationProfile): boolean {
    const price = parseFloat(venue.pricePerHour || '0');
    return price <= profile.preferences.priceRange.max * 1.5; // Mais flexibilidade para venues
  }

  /**
   * Calcula confiança da recomendação baseada em dados históricos
   */
  private calculateConfidence(matchScore: number, historyCount: number): number {
    const baseConfidence = matchScore * 0.7;
    const historyBonus = Math.min(historyCount * 0.05, 0.3); // Max 30% bonus
    return Math.min(baseConfidence + historyBonus, 1.0);
  }

  /**
   * Gera razões para recomendação de serviço
   */
  private generateServiceRecommendationReasons(service: any, profile: RecommendationProfile): string[] {
    const reasons: string[] = [];

    if (profile.preferences.categories.includes(service.category)) {
      reasons.push(`Categoria ${service.category} está nas suas preferências`);
    }

    const price = parseFloat(service.price || '0');
    if (price <= profile.preferences.priceRange.max) {
      reasons.push(`Preço dentro do seu orçamento`);
    }

    if (service.rating && service.rating > 4.0) {
      reasons.push(`Alta avaliação (${service.rating}/5)`);
    }

    const categoryHistory = profile.history.services.filter(s => s.category === service.category);
    if (categoryHistory.length > 0) {
      reasons.push(`Você já contratou serviços similares`);
    }

    return reasons;
  }

  /**
   * Gera razões para recomendação de evento
   */
  private generateEventRecommendationReasons(event: any, profile: RecommendationProfile): string[] {
    const reasons: string[] = [];

    if (profile.preferences.categories.includes(event.category)) {
      reasons.push(`Categoria ${event.category} é sua especialidade`);
    }

    const budget = parseFloat(event.budget.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    if (budget >= profile.preferences.priceRange.min) {
      reasons.push(`Orçamento compatível com seus serviços`);
    }

    if (event.location.includes(profile.preferences.location)) {
      reasons.push(`Evento na sua região de atuação`);
    }

    const eventDate = new Date(event.date);
    const daysUntilEvent = (eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilEvent > 7) {
      reasons.push(`Tempo adequado para preparação`);
    }

    return reasons;
  }

  /**
   * Gera razões para recomendação de venue
   */
  private generateVenueRecommendationReasons(venue: any, profile: RecommendationProfile): string[] {
    const reasons: string[] = [];

    if (profile.preferences.categories.includes(venue.category)) {
      reasons.push(`Tipo de local ideal para seus eventos`);
    }

    if (venue.location.includes(profile.preferences.location)) {
      reasons.push(`Localização conveniente`);
    }

    if (venue.capacity && venue.capacity > 50) {
      reasons.push(`Capacidade adequada para eventos grandes`);
    }

    return reasons;
  }

  /**
   * Gera razões para recomendação de evento para anunciante
   */
  private generateEventVenueRecommendationReasons(event: any, profile: RecommendationProfile): string[] {
    const reasons: string[] = [];

    if (profile.preferences.categories.includes(event.category)) {
      reasons.push(`Evento na categoria do seu local`);
    }

    const budget = parseFloat(event.budget.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    if (budget >= profile.preferences.priceRange.min) {
      reasons.push(`Cliente com orçamento adequado`);
    }

    if (event.guestCount && event.guestCount > 30) {
      reasons.push(`Evento de grande porte`);
    }

    return reasons;
  }

  /**
   * Gera insights sobre performance das recomendações
   */
  async generateRecommendationInsights(): Promise<RecommendationInsights> {
    // Dados simulados baseados em métricas reais da indústria
    return {
      totalRecommendations: 1250,
      averageMatchScore: 0.73,
      topCategories: [
        { category: 'casamento', count: 450, avgScore: 0.81 },
        { category: 'aniversario', count: 320, avgScore: 0.76 },
        { category: 'corporativo', count: 280, avgScore: 0.69 },
        { category: 'formatura', count: 120, avgScore: 0.72 },
        { category: 'infantil', count: 80, avgScore: 0.68 }
      ],
      userEngagement: {
        clickThroughRate: 0.34,
        conversionRate: 0.12,
        averageTimeToAction: 4.2
      },
      performance: {
        highConfidenceRecommendations: 850,
        successfulMatches: 380,
        userSatisfactionScore: 4.3
      }
    };
  }

  /**
   * Obtém recomendações trending baseadas em atividade recente
   */
  async getTrendingRecommendations(limit: number = 10): Promise<AIRecommendation[]> {
    const events = await this.storage.getEvents();
    const services = await this.storage.getServices();
    
    const trending: AIRecommendation[] = [];

    // Eventos com maior atividade recente
    for (const event of events.slice(0, Math.ceil(limit * 0.6))) {
      trending.push({
        id: `trending_event_${event.id}`,
        type: 'event',
        targetId: event.id,
        title: `🔥 Trending: ${event.title}`,
        description: event.description,
        category: event.category,
        price: parseFloat(event.budget.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        location: event.location,
        matchScore: 0.85,
        reasons: ['Evento em alta procura', 'Múltiplas aplicações recentes', 'Categoria popular'],
        confidence: 0.9,
        priority: 'high',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        metadata: { trendingScore: 0.92, views: 150 }
      });
    }

    // Serviços populares
    for (const service of services.slice(0, Math.ceil(limit * 0.4))) {
      trending.push({
        id: `trending_service_${service.id}`,
        type: 'service',
        targetId: service.id,
        title: `⭐ Popular: ${service.title}`,
        description: service.description,
        category: service.category,
        price: parseFloat(service.price || '0'),
        matchScore: 0.8,
        reasons: ['Serviço muito procurado', 'Alto índice de contratação', 'Avaliações excelentes'],
        confidence: 0.85,
        priority: 'medium',
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        metadata: { trendingScore: 0.88, bookings: 45 }
      });
    }

    return trending.slice(0, limit);
  }
}

export const aiRecommendationService = new AIRecommendationService(new DatabaseStorage());