import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MapPin, Star, MessageCircle, Eye, Users } from "lucide-react";
import { Link } from "wouter";

const serviceCategories = [
  "Todos",
  "Entretenimento", 
  "Alimentação",
  "Organização",
  "Produção",
  "Limpeza"
];

export default function Providers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedCity, setSelectedCity] = useState("");

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["/api/services", { category: selectedCategory, search: searchTerm, city: selectedCity }],
  });

  const providersArray = Array.isArray(providers) ? providers : [];
  const filteredProviders = providersArray.filter((provider: any) => {
    const matchesSearch = !searchTerm || 
      provider.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Buscar Prestadores</h1>
        <p className="text-muted-foreground">
          Encontre os melhores prestadores de serviços para seu evento
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as cidades</SelectItem>
              <SelectItem value="São Paulo">São Paulo</SelectItem>
              <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
              <SelectItem value="Belo Horizonte">Belo Horizonte</SelectItem>
              <SelectItem value="Brasília">Brasília</SelectItem>
              <SelectItem value="Salvador">Salvador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lista de Prestadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum prestador encontrado com os filtros selecionados.</p>
              <p className="text-sm">Tente ajustar sua busca ou filtros.</p>
            </div>
          </div>
        ) : (
          filteredProviders.map((provider: any) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={provider.avatar} />
                      <AvatarFallback>
                        {provider.name?.charAt(0) || "P"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{provider.name || "Prestador"}</CardTitle>
                      <CardDescription>{provider.category || "Serviços"}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{provider.category}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {provider.description || "Prestador de serviços para eventos"}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{provider.rating || "5.0"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{provider.city || "São Paulo"}</span>
                  </div>
                </div>
                
                <div className="text-lg font-semibold text-primary">
                  A partir de {provider.price ? `R$ ${provider.price}` : "R$ 500,00"}
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1" size="sm" asChild>
                    <Link href={`/services/${provider.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Perfil
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/chat?contact=${provider.id}`}>
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estado vazio personalizado para quando não há prestadores cadastrados */}
      {filteredProviders.length === 0 && providers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhum prestador encontrado</p>
            <p className="text-sm">Parece que ainda não há prestadores cadastrados na plataforma.</p>
          </div>
          <Button asChild className="mt-4">
            <Link href="/services">Ver Todos os Serviços</Link>
          </Button>
        </div>
      )}
    </div>
  );
}