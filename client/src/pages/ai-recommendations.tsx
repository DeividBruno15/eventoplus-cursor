import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain,
  TrendingUp,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Target,
  Sparkles,
  Heart,
  Clock,
  Award,
  RefreshCw,
  Filter,
  Search,
  Eye,
  ThumbsUp,
  BarChart3
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface AIRecommendation {
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
  expiresAt: string;
  metadata: Record<string, any>;
}

interface RecommendationInsights {
  totalRecommendations: number;
  averageMatchScore: number;
  topCategories: Array<{
    category: string;
    count: number;
    avgScore: number;
  }>;
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

export default function AIRecommendations() {
  const [activeTab, setActiveTab] = useState("personalized");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Queries
  const { data: personalizedRecommendations, isLoading: isLoadingPersonalized, refetch: refetchPersonalized } = useQuery<AIRecommendation[]>({
    queryKey: ["/api/ai-recommendations/personalized"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/ai-recommendations/personalized?limit=15");
      return await response.json();
    }
  });

  const { data: trendingRecommendations, isLoading: isLoadingTrending, refetch: refetchTrending } = useQuery<AIRecommendation[]>({
    queryKey: ["/api/ai-recommendations/trending"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/ai-recommendations/trending?limit=12");
      return await response.json();
    }
  });

  const { data: insights, isLoading: isLoadingInsights } = useQuery<RecommendationInsights>({
    queryKey: ["/api/ai-recommendations/insights"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/ai-recommendations/insights");
      return await response.json();
    }
  });

  // Filtros
  const filterRecommendations = (recommendations: AIRecommendation[] | undefined) => {
    if (!recommendations) return [];
    
    return recommendations.filter(rec => {
      const typeMatch = filterType === "all" || rec.type === filterType;
      const priorityMatch = filterPriority === "all" || rec.priority === filterPriority;
      return typeMatch && priorityMatch;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return Calendar;
      case 'service': return Star;
      case 'venue': return MapPin;
      case 'provider': return Users;
      default: return Target;
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Preço sob consulta';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatMatchScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  const refreshRecommendations = async () => {
    await Promise.all([refetchPersonalized(), refetchTrending()]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recomendações IA
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubra oportunidades personalizadas com inteligência artificial avançada
          </p>
          <Button 
            onClick={refreshRecommendations} 
            variant="outline" 
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar Recomendações
          </Button>
        </div>

        {/* Insights Cards */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total de Recomendações</p>
                    <p className="text-3xl font-bold">{insights.totalRecommendations}</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Score Médio</p>
                    <p className="text-3xl font-bold">{formatMatchScore(insights.averageMatchScore)}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Taxa de Conversão</p>
                    <p className="text-3xl font-bold">{(insights.userEngagement.conversionRate * 100).toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">Satisfação</p>
                    <p className="text-3xl font-bold">{insights.performance.userSatisfactionScore}/5</p>
                  </div>
                  <Heart className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Filtros:</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={filterType === "event" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("event")}
                >
                  Eventos
                </Button>
                <Button
                  variant={filterType === "service" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("service")}
                >
                  Serviços
                </Button>
                <Button
                  variant={filterType === "venue" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("venue")}
                >
                  Locais
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterPriority === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPriority("all")}
                >
                  Todas Prioridades
                </Button>
                <Button
                  variant={filterPriority === "high" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPriority("high")}
                >
                  Alta
                </Button>
                <Button
                  variant={filterPriority === "medium" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPriority("medium")}
                >
                  Média
                </Button>
                <Button
                  variant={filterPriority === "low" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPriority("low")}
                >
                  Baixa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personalized" className="gap-2">
              <Target className="w-4 h-4" />
              Personalizadas
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Em Alta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personalized" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Recomendações Personalizadas</h2>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                IA Personalizada
              </Badge>
            </div>

            {isLoadingPersonalized ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterRecommendations(personalizedRecommendations).map((recommendation) => {
                  const IconComponent = getTypeIcon(recommendation.type);
                  return (
                    <Card key={recommendation.id} className="hover:shadow-lg transition-shadow duration-300 group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                            <Badge variant="outline" className="text-xs">
                              {recommendation.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(recommendation.priority)}`}></div>
                            <Badge variant="secondary" className="text-xs">
                              {formatMatchScore(recommendation.matchScore)}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {recommendation.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {recommendation.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Target className="w-4 h-4" />
                            <span className="font-medium">Categoria:</span>
                            <Badge variant="outline">{recommendation.category}</Badge>
                          </div>
                          
                          {recommendation.price && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-medium">Preço:</span>
                              <span className="font-semibold text-green-600">
                                {formatPrice(recommendation.price)}
                              </span>
                            </div>
                          )}
                          
                          {recommendation.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">Local:</span>
                              <span>{recommendation.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">Por que recomendamos:</span>
                          </div>
                          <ul className="space-y-1">
                            {recommendation.reasons.slice(0, 3).map((reason, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                                <div className="w-1 h-1 bg-purple-600 rounded-full"></div>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-orange-500" />
                            <span className="text-xs text-gray-500">
                              Confiança: {formatMatchScore(recommendation.confidence)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              Expira: {new Date(recommendation.expiresAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        <Button className="w-full group-hover:bg-blue-600 transition-colors">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Recomendações em Alta</h2>
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="w-3 h-3" />
                Trending
              </Badge>
            </div>

            {isLoadingTrending ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-20 bg-gray-200 rounded mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterRecommendations(trendingRecommendations).map((recommendation) => {
                  const IconComponent = getTypeIcon(recommendation.type);
                  return (
                    <Card key={recommendation.id} className="hover:shadow-lg transition-shadow duration-300 group relative overflow-hidden">
                      {/* Trending Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          HOT
                        </div>
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-5 h-5 text-orange-600" />
                            <Badge variant="outline" className="text-xs">
                              {recommendation.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {formatMatchScore(recommendation.matchScore)}
                            </Badge>
                          </div>
                        </div>
                        <CardTitle className="text-lg group-hover:text-orange-600 transition-colors pr-16">
                          {recommendation.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {recommendation.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Target className="w-4 h-4" />
                            <span className="font-medium">Categoria:</span>
                            <Badge variant="outline">{recommendation.category}</Badge>
                          </div>
                          
                          {recommendation.price && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-medium">Preço:</span>
                              <span className="font-semibold text-green-600">
                                {formatPrice(recommendation.price)}
                              </span>
                            </div>
                          )}
                          
                          {recommendation.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">Local:</span>
                              <span>{recommendation.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                            <span className="text-sm font-medium">Por que está em alta:</span>
                          </div>
                          <ul className="space-y-1">
                            {recommendation.reasons.slice(0, 3).map((reason, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                                <div className="w-1 h-1 bg-orange-600 rounded-full"></div>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {recommendation.metadata && (
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              <Eye className="w-3 h-3" />
                              <span>{recommendation.metadata.views || 0} visualizações</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{recommendation.metadata.bookings || 0} reservas</span>
                            </div>
                          </div>
                        )}

                        <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Analytics Section */}
        {insights && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics de Performance
              </CardTitle>
              <CardDescription>
                Insights sobre a performance das recomendações IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Categories Chart */}
                <div>
                  <h3 className="font-semibold mb-4">Top Categorias</h3>
                  <div className="space-y-3">
                    {insights.topCategories.map((category, index) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{category.category}</span>
                          <span className="text-gray-500">{category.count} recomendações</span>
                        </div>
                        <Progress value={(category.count / insights.topCategories[0].count) * 100} className="h-2" />
                        <div className="text-xs text-gray-500">
                          Score médio: {formatMatchScore(category.avgScore)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Engagement Metrics */}
                <div>
                  <h3 className="font-semibold mb-4">Métricas de Engajamento</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Taxa de Clique</span>
                      </div>
                      <span className="font-bold text-blue-600">
                        {(insights.userEngagement.clickThroughRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Taxa de Conversão</span>
                      </div>
                      <span className="font-bold text-green-600">
                        {(insights.userEngagement.conversionRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">Tempo Médio para Ação</span>
                      </div>
                      <span className="font-bold text-purple-600">
                        {insights.userEngagement.averageTimeToAction.toFixed(1)}h
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">Matches Bem-sucedidos</span>
                      </div>
                      <span className="font-bold text-orange-600">
                        {insights.performance.successfulMatches}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}