import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import {
  Trophy,
  Star,
  Target,
  Award,
  Zap,
  Crown,
  Medal,
  Gift,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle,
  Lock,
  Flame,
  Sparkles,
  ShoppingBag,
  MessageSquare
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'events' | 'social' | 'quality' | 'milestone' | 'special';
  type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'legendary';
  points: number;
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: number; // 0-100, menor = mais raro
}

interface UserLevel {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  levelName: string;
  levelBenefits: string[];
}

interface LeaderboardEntry {
  userId: number;
  username: string;
  profileImage?: string;
  totalPoints: number;
  level: number;
  achievementCount: number;
  monthlyPoints: number;
  rank: number;
  userType: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  points: number;
  timeLimit?: number; // em horas
  requirements: Array<{
    type: string;
    target: number;
    current: number;
  }>;
  isActive: boolean;
  completedAt?: string;
  expiresAt?: string;
}

interface GamificationSystemProps {
  userId?: number;
  compact?: boolean;
  className?: string;
}

export default function GamificationSystem({
  userId,
  compact = false,
  className = ""
}: GamificationSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [filter, setFilter] = useState<string>("all");

  const currentUserId = userId || user?.id;

  // Buscar dados do usuário
  const { data: userLevel } = useQuery<UserLevel>({
    queryKey: ["/api/gamification/level", currentUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/gamification/level/${currentUserId}`);
      if (!response.ok) throw new Error('Erro ao carregar nível');
      return response.json();
    },
    enabled: !!currentUserId,
  });

  // Buscar conquistas
  const { data: achievements } = useQuery<Achievement[]>({
    queryKey: ["/api/gamification/achievements", currentUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/gamification/achievements/${currentUserId}`);
      if (!response.ok) throw new Error('Erro ao carregar conquistas');
      return response.json();
    },
    enabled: !!currentUserId,
  });

  // Buscar missões ativas
  const { data: quests } = useQuery<Quest[]>({
    queryKey: ["/api/gamification/quests", currentUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/gamification/quests/${currentUserId}`);
      if (!response.ok) throw new Error('Erro ao carregar missões');
      return response.json();
    },
    enabled: !!currentUserId,
  });

  // Buscar leaderboard
  const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/gamification/leaderboard"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/gamification/leaderboard");
      if (!response.ok) throw new Error('Erro ao carregar ranking');
      return response.json();
    },
  });

  // Reivindicar recompensa
  const claimRewardMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      const response = await apiRequest("POST", `/api/gamification/achievements/${achievementId}/claim`);
      if (!response.ok) throw new Error('Erro ao reivindicar recompensa');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Recompensa recebida! 🎉",
        description: `Você ganhou ${data.points} pontos!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification"] });
    },
  });

  const getAchievementIcon = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      trophy: Trophy,
      star: Star,
      target: Target,
      award: Award,
      crown: Crown,
      medal: Medal,
      flame: Flame,
      sparkles: Sparkles,
      users: Users,
      calendar: Calendar,
      message: MessageSquare,
      shopping: ShoppingBag,
    };
    
    return icons[iconName] || Trophy;
  };

  const getTypeColor = (type: Achievement['type']) => {
    switch (type) {
      case 'bronze': return 'bg-amber-600';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      case 'platinum': return 'bg-purple-500';
      case 'legendary': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      default: return 'bg-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: Quest['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAchievements = achievements?.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return achievement.category === filter;
  }) || [];

  const unlockedAchievements = achievements?.filter(a => a.unlocked) || [];
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full ${getTypeColor('gold')} flex items-center justify-center`}>
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#3C5BFA] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{userLevel?.currentLevel || 1}</span>
                </div>
              </div>
              
              <div>
                <p className="font-medium">{userLevel?.levelName || 'Iniciante'}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Trophy className="h-3 w-3" />
                  <span>{totalPoints} pontos</span>
                  <Award className="h-3 w-3" />
                  <span>{unlockedAchievements.length} conquistas</span>
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              Ver Detalhes
            </Button>
          </div>
          
          {userLevel && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>XP: {userLevel.currentXP}</span>
                <span>Próximo nível: {userLevel.xpToNextLevel}</span>
              </div>
              <Progress 
                value={(userLevel.currentXP / (userLevel.currentXP + userLevel.xpToNextLevel)) * 100} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com nível e progresso */}
      <Card className="bg-gradient-to-r from-[#3C5BFA] to-[#FFA94D] text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-[#3C5BFA]">{userLevel?.currentLevel || 1}</span>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold">{userLevel?.levelName || 'Iniciante'}</h2>
                <p className="text-white text-opacity-90">Total: {totalPoints} pontos</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
              <p className="text-white text-opacity-90">Conquistas</p>
            </div>
          </div>
          
          {userLevel && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Nível {userLevel.currentLevel}</span>
                <span>Nível {userLevel.currentLevel + 1}</span>
              </div>
              <Progress 
                value={(userLevel.currentXP / (userLevel.currentXP + userLevel.xpToNextLevel)) * 100} 
                className="h-3 bg-white bg-opacity-20"
              />
              <p className="text-xs text-white text-opacity-75 mt-1">
                {userLevel.currentXP} / {userLevel.currentXP + userLevel.xpToNextLevel} XP
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="quests">Missões</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{totalPoints}</div>
                <p className="text-sm text-gray-600">Total de Pontos</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
                <p className="text-sm text-gray-600">Conquistas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{quests?.filter(q => q.isActive).length || 0}</div>
                <p className="text-sm text-gray-600">Missões Ativas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Crown className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{userLevel?.currentLevel || 1}</div>
                <p className="text-sm text-gray-600">Nível Atual</p>
              </CardContent>
            </Card>
          </div>

          {/* Conquistas recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Conquistas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unlockedAchievements.slice(0, 3).map((achievement) => {
                  const IconComponent = getAchievementIcon(achievement.icon);
                  return (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full ${getTypeColor(achievement.type)} flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        +{achievement.points} pts
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conquistas */}
        <TabsContent value="achievements" className="space-y-6">
          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'unlocked', label: 'Desbloqueadas' },
              { value: 'locked', label: 'Bloqueadas' },
              { value: 'events', label: 'Eventos' },
              { value: 'social', label: 'Social' },
              { value: 'quality', label: 'Qualidade' },
              { value: 'milestone', label: 'Marco' },
              { value: 'special', label: 'Especial' },
            ].map((filterOption) => (
              <Button
                key={filterOption.value}
                variant={filter === filterOption.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption.value)}
              >
                {filterOption.label}
              </Button>
            ))}
          </div>

          {/* Lista de conquistas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => {
              const IconComponent = getAchievementIcon(achievement.icon);
              const progress = (achievement.currentProgress / achievement.requirement) * 100;
              
              return (
                <Card 
                  key={achievement.id} 
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    achievement.unlocked ? 'border-green-200 bg-green-50' : 'opacity-75'
                  }`}
                  onClick={() => {
                    setSelectedAchievement(achievement);
                    setShowAchievementModal(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-full ${getTypeColor(achievement.type)} flex items-center justify-center relative`}>
                        <IconComponent className="h-6 w-6 text-white" />
                        {achievement.unlocked && (
                          <CheckCircle className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-white rounded-full" />
                        )}
                        {!achievement.unlocked && (
                          <Lock className="absolute -top-1 -right-1 h-4 w-4 text-gray-400 bg-white rounded-full" />
                        )}
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {achievement.type}
                      </Badge>
                    </div>
                    
                    <h4 className="font-medium mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {achievement.description}
                    </p>
                    
                    {!achievement.unlocked && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>{achievement.currentProgress}</span>
                          <span>{achievement.requirement}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge className="bg-[#3C5BFA] text-white">
                        +{achievement.points} pts
                      </Badge>
                      
                      {achievement.rarity < 20 && (
                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Raro
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Missões */}
        <TabsContent value="quests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quests?.filter(q => q.isActive).map((quest) => (
              <Card key={quest.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{quest.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{quest.description}</p>
                    </div>
                    <Badge className={getDifficultyColor(quest.difficulty)}>
                      {quest.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {quest.requirements.map((req, index) => {
                      const progress = (req.current / req.target) * 100;
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{req.type}</span>
                            <span>{req.current} / {req.target}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{quest.points} pontos</span>
                    </div>
                    
                    {quest.timeLimit && quest.expiresAt && (
                      <Badge variant="outline" className="text-orange-600">
                        Expira em breve
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Ranking */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ranking Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard?.slice(0, 10).map((entry, index) => (
                  <div 
                    key={entry.userId} 
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      entry.userId === currentUserId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">
                      {index < 3 ? (
                        <Medal className={`h-6 w-6 ${
                          index === 0 ? 'text-yellow-500' : 
                          index === 1 ? 'text-gray-400' : 'text-amber-600'
                        }`} />
                      ) : (
                        <span className="font-bold text-gray-600">#{entry.rank}</span>
                      )}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.profileImage} />
                      <AvatarFallback>
                        {entry.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.username}</span>
                        {entry.userId === currentUserId && (
                          <Badge variant="outline" className="text-xs">Você</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Nível {entry.level} • {entry.achievementCount} conquistas
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-[#3C5BFA]">
                        {entry.totalPoints.toLocaleString()} pts
                      </div>
                      <div className="text-xs text-gray-500">
                        +{entry.monthlyPoints} este mês
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes da conquista */}
      <Dialog open={showAchievementModal} onOpenChange={setShowAchievementModal}>
        <DialogContent>
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${getTypeColor(selectedAchievement.type)} flex items-center justify-center`}>
                    {(() => {
                      const IconComponent = getAchievementIcon(selectedAchievement.icon);
                      return <IconComponent className="h-6 w-6 text-white" />;
                    })()}
                  </div>
                  {selectedAchievement.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-gray-600">{selectedAchievement.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-[#3C5BFA]">{selectedAchievement.points}</div>
                    <div className="text-sm text-gray-600">Pontos</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-purple-600">{selectedAchievement.rarity}%</div>
                    <div className="text-sm text-gray-600">Raridade</div>
                  </div>
                </div>
                
                {!selectedAchievement.unlocked && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progresso</span>
                      <span>{selectedAchievement.currentProgress} / {selectedAchievement.requirement}</span>
                    </div>
                    <Progress 
                      value={(selectedAchievement.currentProgress / selectedAchievement.requirement) * 100} 
                      className="h-3"
                    />
                  </div>
                )}
                
                {selectedAchievement.unlocked && selectedAchievement.unlockedAt && (
                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium text-green-900">Conquista Desbloqueada!</p>
                    <p className="text-sm text-green-700">
                      Desbloqueada em {new Date(selectedAchievement.unlockedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}