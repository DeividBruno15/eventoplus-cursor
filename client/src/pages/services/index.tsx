import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Star, MapPin, Clock, Users, DollarSign, FileText, Tag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Service {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: string;
  duration: number;
  location: string;
  rating: number;
  reviewCount: number;
  provider: {
    name: string;
    avatar: string;
  };
  images: string[];
}

export default function ServicesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/services", searchTerm, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      
      const response = await fetch(`/api/services?${params}`);
      if (!response.ok) throw new Error("Falha ao carregar serviços");
      return response.json();
    },
  });

  const categories = [
    { value: "all", label: "Todos os Serviços" },
    { value: "entretenimento", label: "Entretenimento" },
    { value: "alimentacao", label: "Alimentação" },
    { value: "organizacao", label: "Organização" },
    { value: "producao", label: "Produção" },
    { value: "limpeza", label: "Limpeza" },
  ];

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numPrice);
  };

  const handleViewDetails = (service: Service) => {
    setSelectedService(service);
    setIsDetailsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serviços Disponíveis</h1>
          <p className="text-gray-600 mt-1">
            Encontre os melhores prestadores para seu evento
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              style={selectedCategory === category.value ? { backgroundColor: '#3C5BFA' } : {}}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service: Service) => (
          <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-100">
              {service.images?.[0] ? (
                <img
                  src={service.images[0]}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Users className="h-12 w-12" />
                </div>
              )}
              <Badge className="absolute top-2 left-2" variant="secondary">
                {service.category}
              </Badge>
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Provider Info */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">{service.provider?.name || "Prestador"}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium ml-1">
                      {service.rating || 5.0}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({service.reviewCount || 0} avaliações)
                  </span>
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {service.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration}h</span>
                    </div>
                  )}
                  {service.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{service.location}</span>
                    </div>
                  )}
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-lg font-bold" style={{ color: '#3C5BFA' }}>
                    {formatPrice(service.price || "0")}
                  </div>
                  <Button size="sm" style={{ backgroundColor: '#3C5BFA' }} onClick={() => handleViewDetails(service)}>
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum serviço encontrado
          </h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== "all" 
              ? "Tente ajustar os filtros de busca"
              : "Nenhum serviço disponível no momento"
            }
          </p>
        </div>
      )}

      {/* Service Details Modal */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedService?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedService && (
            <div className="space-y-6">
              {/* Service Image */}
              {selectedService.images?.[0] && (
                <div className="relative h-64 rounded-lg overflow-hidden">
                  <img
                    src={selectedService.images[0]}
                    alt={selectedService.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4" variant="secondary">
                    {selectedService.category}
                  </Badge>
                </div>
              )}

              {/* Provider Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedService.provider?.name || "Prestador"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">
                      {selectedService.rating || 5.0} ({selectedService.reviewCount || 0} avaliações)
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descrição
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {selectedService.description}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Preço:</span>
                    <span className="text-lg font-bold" style={{ color: '#3C5BFA' }}>
                      {formatPrice(selectedService.price || "0")}
                    </span>
                  </div>
                  
                  {selectedService.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Duração:</span>
                      <span>{selectedService.duration} horas</span>
                    </div>
                  )}
                  
                  {selectedService.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Localização:</span>
                      <span>{selectedService.location}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Categoria:</span>
                    <Badge variant="outline">{selectedService.category}</Badge>
                  </div>
                  
                  {selectedService.subcategory && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Subcategoria:</span>
                      <Badge variant="outline">{selectedService.subcategory}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                  Fechar
                </Button>
                <Button style={{ backgroundColor: '#3C5BFA' }}>
                  Contratar Serviço
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}