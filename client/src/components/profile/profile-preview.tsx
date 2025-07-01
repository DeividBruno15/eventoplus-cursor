import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  MapPin, 
  Calendar, 
  Shield, 
  Eye,
  Edit,
  Share2,
  MessageSquare,
  Phone,
  Mail,
  ExternalLink,
  Award,
  Briefcase,
  Clock,
  Users,
  DollarSign
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfilePreviewProps {
  userId: number;
  viewMode?: 'public' | 'preview';
  onEdit?: () => void;
  className?: string;
}

interface UserProfile {
  id: number;
  username: string;
  userType: 'prestador' | 'contratante' | 'anunciante';
  profileImage?: string;
  location: string;
  joinedAt: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  description?: string;
  services?: Array<{
    id: number;
    title: string;
    category: string;
    price: number;
    rating: number;
  }>;
  venues?: Array<{
    id: number;
    title: string;
    location: string;
    capacity: number;
    price: number;
  }>;
  reviews?: Array<{
    id: number;
    rating: number;
    comment: string;
    reviewerName: string;
    createdAt: string;
  }>;
  portfolio?: Array<{
    id: number;
    title: string;
    image: string;
    description: string;
  }>;
  stats?: {
    totalJobs: number;
    totalEarnings: number;
    averageResponse: string;
    completionRate: number;
  };
}

export default function ProfilePreview({ 
  userId, 
  viewMode = 'public', 
  onEdit,
  className = "" 
}: ProfilePreviewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reviews' | 'portfolio'>('overview');

  // Buscar dados do perfil
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/users/profile", userId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${userId}/profile`);
      if (!response.ok) {
        throw new Error('Erro ao carregar perfil');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Perfil não encontrado</p>
        </CardContent>
      </Card>
    );
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'prestador':
        return { label: 'Prestador de Serviços', color: 'bg-blue-100 text-blue-800' };
      case 'contratante':
        return { label: 'Organizador de Eventos', color: 'bg-green-100 text-green-800' };
      case 'anunciante':
        return { label: 'Proprietário de Espaços', color: 'bg-purple-100 text-purple-800' };
      default:
        return { label: 'Usuário', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const userTypeInfo = getUserTypeLabel(profile.userType);

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Preview Mode Banner */}
      {viewMode === 'preview' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900">Visualização do Perfil Público</h4>
                  <p className="text-sm text-blue-700">É assim que outros usuários veem seu perfil</p>
                </div>
              </div>
              {onEdit && (
                <Button onClick={onEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header do Perfil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.profileImage} />
                  <AvatarFallback className="bg-[#3C5BFA] text-white text-xl">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {profile.verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Shield className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
                  {profile.verified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                
                <Badge className={userTypeInfo.color} variant="outline">
                  {userTypeInfo.label}
                </Badge>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Membro desde {formatDistanceToNow(new Date(profile.joinedAt), { locale: ptBR })}
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(profile.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{profile.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({profile.reviewCount} avaliações)</span>
                </div>
              </div>
            </div>

            {/* Ações */}
            {viewMode === 'public' && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mensagem
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            )}
          </div>

          {/* Descrição */}
          {profile.description && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Sobre</h3>
              <p className="text-gray-700 leading-relaxed">{profile.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas (apenas para prestadores) */}
      {profile.userType === 'prestador' && profile.stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Estatísticas Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#3C5BFA]">{profile.stats.totalJobs}</div>
                <p className="text-sm text-gray-600">Trabalhos Concluídos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  R$ {profile.stats.totalEarnings.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Total Faturado</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{profile.stats.averageResponse}</div>
                <p className="text-sm text-gray-600">Tempo de Resposta</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{profile.stats.completionRate}%</div>
                <p className="text-sm text-gray-600">Taxa de Conclusão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navegação por Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Users },
              ...(profile.services && profile.services.length > 0 ? [{ id: 'services', label: 'Serviços', icon: Briefcase }] : []),
              { id: 'reviews', label: 'Avaliações', icon: Star },
              ...(profile.portfolio && profile.portfolio.length > 0 ? [{ id: 'portfolio', label: 'Portfólio', icon: Award }] : []),
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-[#3C5BFA] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Tab: Visão Geral */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {profile.userType === 'prestador' && profile.services && profile.services.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Principais Serviços</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.services.slice(0, 4).map((service) => (
                      <div key={service.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{service.title}</h4>
                          <Badge variant="outline">{service.category}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-sm">{service.rating}</span>
                          </div>
                          <span className="font-medium text-[#3C5BFA]">
                            R$ {service.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.userType === 'anunciante' && profile.venues && profile.venues.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Espaços Disponíveis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.venues.slice(0, 4).map((venue) => (
                      <div key={venue.id} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{venue.title}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {venue.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Até {venue.capacity} pessoas
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            R$ {venue.price.toLocaleString()}/dia
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Serviços */}
          {activeTab === 'services' && profile.services && (
            <div className="space-y-4">
              {profile.services.map((service) => (
                <div key={service.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-lg font-medium">{service.title}</h4>
                      <Badge variant="outline" className="mt-1">{service.category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#3C5BFA]">
                        R$ {service.price.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{service.rating}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Avaliações */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {profile.reviews && profile.reviews.length > 0 ? (
                profile.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {review.reviewerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{review.reviewerName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(review.createdAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Ainda não há avaliações</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Portfólio */}
          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.portfolio && profile.portfolio.length > 0 ? (
                profile.portfolio.map((item) => (
                  <div key={item.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gray-200">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum item no portfólio</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}