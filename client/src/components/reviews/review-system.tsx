import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, ThumbsUp, MessageCircle, User } from "lucide-react";

interface Review {
  id: number;
  reviewerId: number;
  reviewedId: number;
  rating: number;
  comment: string;
  createdAt: string;
  reviewerName?: string;
  reviewerType?: string;
}

interface ReviewSystemProps {
  reviewedId: number;
  reviewedName: string;
  canReview?: boolean;
}

export default function ReviewSystem({ reviewedId, reviewedName, canReview = false }: ReviewSystemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews", reviewedId],
  });

  const createReviewMutation = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      return apiRequest("POST", "/api/reviews", {
        reviewedId,
        rating,
        comment
      });
    },
    onSuccess: () => {
      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação foi publicada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", reviewedId] });
      setIsReviewDialogOpen(false);
      setRating(0);
      setComment("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar avaliação",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast({
        title: "Avaliação obrigatória",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comentário obrigatório",
        description: "Por favor, escreva um comentário sobre sua experiência",
        variant: "destructive",
      });
      return;
    }

    createReviewMutation.mutate({ rating, comment: comment.trim() });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingStats = () => {
    if (reviews.length === 0) return { average: 0, total: 0, distribution: {} };

    const total = reviews.length;
    const average = reviews.reduce((sum: number, review: Review) => sum + review.rating, 0) / total;
    
    const distribution = reviews.reduce((acc: any, review: Review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {});

    return { average, total, distribution };
  };

  const { average, total, distribution } = getRatingStats();

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onStarClick?.(star)}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution[star] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-2">{star}</span>
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Avaliações ({total})
            </CardTitle>
            {canReview && user && (
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-blue-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Avaliar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Avaliar {reviewedName}</DialogTitle>
                    <DialogDescription>
                      Compartilhe sua experiência para ajudar outros usuários
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Sua avaliação
                      </label>
                      {renderStars(rating, true, setRating)}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Comentário
                      </label>
                      <Textarea
                        placeholder="Conte sobre sua experiência..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmitReview}
                        disabled={createReviewMutation.isPending}
                        className="bg-primary hover:bg-blue-700"
                      >
                        {createReviewMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsReviewDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        
        {total > 0 && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {typeof average === 'number' ? average.toFixed(1) : '0.0'}
                </div>
                {renderStars(Math.round(average))}
                <p className="text-sm text-gray-600 mt-2">
                  Baseado em {total} avaliação{total !== 1 ? 'ões' : ''}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Distribuição das notas</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma avaliação ainda
            </h3>
            <p className="text-gray-600">
              Seja o primeiro a avaliar este prestador
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: Review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {review.reviewerName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {review.reviewerName || 'Usuário'}
                        </span>
                        {review.reviewerType && (
                          <Badge variant="secondary" className="text-xs">
                            {review.reviewerType}
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium">
                        {review.rating}/5
                      </span>
                    </div>
                    
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {review.comment}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                        <ThumbsUp className="h-3 w-3" />
                        Útil
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}