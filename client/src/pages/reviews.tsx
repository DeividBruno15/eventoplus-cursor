import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, ThumbsUp, Flag, Filter, Search, Plus, MessageSquare, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Schema para criação de review
const createReviewSchema = z.object({
  reviewedId: z.number(),
  eventId: z.number().optional(),
  serviceId: z.number().optional(),
  venueId: z.number().optional(),
  contractId: z.number().optional(),
  rating: z.number().min(1).max(5),
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  comment: z.string().min(20, "Comentário deve ter pelo menos 20 caracteres"),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  wouldRecommend: z.boolean().default(true),
  isAnonymous: z.boolean().default(false)
});

type CreateReviewForm = z.infer<typeof createReviewSchema>;

interface ReviewProps {
  id: number;
  reviewer: {
    id: number;
    username: string;
    profileImage?: string;
  };
  reviewed: {
    id: number;
    username: string;
    userType: string;
  };
  rating: number;
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  wouldRecommend: boolean;
  isAnonymous: boolean;
  helpfulVotes: number;
  createdAt: string;
  event?: {
    id: number;
    title: string;
  };
  service?: {
    id: number;
    title: string;
  };
  venue?: {
    id: number;
    name: string;
  };
}

const StarRating = ({ rating, size = "w-4 h-4", interactive = false, onRatingChange }: {
  rating: number;
  size?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
          onClick={() => interactive && onRatingChange?.(star)}
        />
      ))}
    </div>
  );
};

export default function Reviews() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Buscar reviews do usuário logado (recebidas)
  const { data: receivedReviews, isLoading: receivedLoading } = useQuery<ReviewProps[]>({
    queryKey: ['/api/reviews/received', user?.id],
    enabled: !!user
  });

  // Buscar reviews feitas pelo usuário (enviadas)
  const { data: sentReviews, isLoading: sentLoading } = useQuery<ReviewProps[]>({
    queryKey: ['/api/reviews/sent', user?.id],
    enabled: !!user
  });

  // Buscar contratos/eventos elegíveis para review
  const { data: eligibleItems, isLoading: eligibleLoading } = useQuery<any[]>({
    queryKey: ['/api/reviews/eligible', user?.id],
    enabled: !!user
  });

  const form = useForm<CreateReviewForm>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: 5,
      wouldRecommend: true,
      isAnonymous: false,
      pros: [],
      cons: []
    }
  });

  // Mutation para criar review
  const createReviewMutation = useMutation({
    mutationFn: (data: CreateReviewForm) => 
      fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      setIsCreateDialogOpen(false);
      form.reset();
    }
  });

  // Mutation para marcar review como útil
  const markHelpfulMutation = useMutation({
    mutationFn: (reviewId: number) => 
      fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
    }
  });

  const onSubmit = (data: CreateReviewForm) => {
    createReviewMutation.mutate(data);
  };

  const addPro = (pro: string) => {
    if (pro.trim()) {
      const currentPros = form.getValues('pros') || [];
      form.setValue('pros', [...currentPros, pro.trim()]);
    }
  };

  const addCon = (con: string) => {
    if (con.trim()) {
      const currentCons = form.getValues('cons') || [];
      form.setValue('cons', [...currentCons, con.trim()]);
    }
  };

  const removePro = (index: number) => {
    const currentPros = form.getValues('pros') || [];
    form.setValue('pros', currentPros.filter((_, i) => i !== index));
  };

  const removeCon = (index: number) => {
    const currentCons = form.getValues('cons') || [];
    form.setValue('cons', currentCons.filter((_, i) => i !== index));
  };

  const renderReviewCard = (review: ReviewProps) => (
    <Card key={review.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={review.isAnonymous ? undefined : review.reviewer.profileImage} />
              <AvatarFallback>
                {review.isAnonymous ? "A" : review.reviewer.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">
                {review.isAnonymous ? "Usuário Anônimo" : review.reviewer.username}
              </h4>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} />
                <span className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {review.wouldRecommend && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <TrendingUp className="w-3 h-3 mr-1" />
                Recomenda
              </Badge>
            )}
            <Badge variant="outline">
              {review.reviewed.userType === 'prestador' ? 'Prestador' :
               review.reviewed.userType === 'contratante' ? 'Contratante' : 'Anunciante'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <h5 className="font-medium mb-2">{review.title}</h5>
        <p className="text-gray-700 mb-4">{review.comment}</p>
        
        {review.pros && review.pros.length > 0 && (
          <div className="mb-3">
            <h6 className="font-medium text-green-700 mb-2">Pontos Positivos:</h6>
            <ul className="list-disc list-inside text-sm text-green-600">
              {review.pros.map((pro, index) => (
                <li key={index}>{pro}</li>
              ))}
            </ul>
          </div>
        )}

        {review.cons && review.cons.length > 0 && (
          <div className="mb-3">
            <h6 className="font-medium text-red-700 mb-2">Pontos de Melhoria:</h6>
            <ul className="list-disc list-inside text-sm text-red-600">
              {review.cons.map((con, index) => (
                <li key={index}>{con}</li>
              ))}
            </ul>
          </div>
        )}

        {(review.event || review.service || review.venue) && (
          <div className="mb-3 p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">
              Relacionado a: {review.event?.title || review.service?.title || review.venue?.name}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markHelpfulMutation.mutate(review.id)}
              className="text-gray-600 hover:text-blue-600"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Útil ({review.helpfulVotes})
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
              <Flag className="w-4 h-4 mr-1" />
              Reportar
            </Button>
          </div>
          <span className="text-xs text-gray-500">
            Para: {review.reviewed.username}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return <div>Você precisa estar logado para ver as avaliações.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sistema de Avaliações</h1>
          <p className="text-gray-600">Gerencie suas avaliações recebidas e enviadas</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#3C5BFA] hover:bg-[#2F4DE8]">
              <Plus className="w-4 h-4 mr-2" />
              Nova Avaliação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Avaliação</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="reviewedId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avaliar</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione quem avaliar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {eligibleItems?.map((item: any) => (
                            <SelectItem key={item.id} value={item.userId.toString()}>
                              {item.username} - {item.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classificação</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <StarRating 
                            rating={field.value} 
                            size="w-8 h-8" 
                            interactive 
                            onRatingChange={field.onChange}
                          />
                          <span className="text-lg font-medium">{field.value}/5</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Avaliação</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Excelente prestador de serviço" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comentário Detalhado</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva sua experiência..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Pontos Positivos</FormLabel>
                    <div className="space-y-2">
                      <Input 
                        placeholder="Adicionar ponto positivo"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addPro(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      {form.watch('pros')?.map((pro, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <span className="text-sm text-green-700 flex-1">{pro}</span>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => removePro(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <FormLabel>Pontos de Melhoria</FormLabel>
                    <div className="space-y-2">
                      <Input 
                        placeholder="Adicionar ponto de melhoria"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCon(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      {form.watch('cons')?.map((con, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded">
                          <span className="text-sm text-red-700 flex-1">{con}</span>
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeCon(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="wouldRecommend"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Eu recomendaria este prestador</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isAnonymous"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Avaliação anônima</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={createReviewMutation.isPending}>
                    {createReviewMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar avaliações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="prestador">Prestadores</SelectItem>
                <SelectItem value="contratante">Contratantes</SelectItem>
                <SelectItem value="anunciante">Anunciantes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4">4+ estrelas</SelectItem>
                <SelectItem value="3">3+ estrelas</SelectItem>
                <SelectItem value="2">2+ estrelas</SelectItem>
                <SelectItem value="1">1+ estrela</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Avaliações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Avaliações Recebidas */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Avaliações Recebidas ({receivedReviews?.length || 0})
          </h2>
          {receivedLoading ? (
            <div>Carregando...</div>
          ) : receivedReviews?.length > 0 ? (
            receivedReviews.map(renderReviewCard)
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Você ainda não recebeu avaliações</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Avaliações Enviadas */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" />
            Avaliações Enviadas ({sentReviews?.length || 0})
          </h2>
          {sentLoading ? (
            <div>Carregando...</div>
          ) : sentReviews?.length > 0 ? (
            sentReviews.map(renderReviewCard)
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Você ainda não enviou avaliações</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}