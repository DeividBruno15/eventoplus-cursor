import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Star,
  Plus,
  Copy,
  Edit,
  Trash2,
  Save,
  Search,
  Filter,
  Heart,
  Download,
  Share2
} from "lucide-react";

interface EventTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedBudget: number;
  estimatedDuration: number;
  estimatedGuests: number;
  services: Array<{
    category: string;
    subcategory: string;
    estimatedCost: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  timeline: Array<{
    phase: string;
    tasks: string[];
    daysBeforeEvent: number;
  }>;
  checklist: string[];
  tags: string[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  rating: number;
  createdAt: string;
}

interface EventTemplatesProps {
  onTemplateSelect?: (template: EventTemplate) => void;
  showCreateButton?: boolean;
  className?: string;
}

export default function EventTemplates({
  onTemplateSelect,
  showCreateButton = true,
  className = ""
}: EventTemplatesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Novo template para criação
  const [newTemplate, setNewTemplate] = useState<Partial<EventTemplate>>({
    name: '',
    description: '',
    category: '',
    estimatedBudget: 0,
    estimatedDuration: 1,
    estimatedGuests: 50,
    services: [],
    timeline: [],
    checklist: [],
    tags: [],
    isPublic: false
  });

  // Buscar templates
  const { data: templates, isLoading } = useQuery<EventTemplate[]>({
    queryKey: ["/api/event-templates", searchTerm, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      
      const response = await apiRequest("GET", `/api/event-templates?${params}`);
      if (!response.ok) throw new Error('Erro ao carregar templates');
      return response.json();
    },
  });

  // Criar template
  const createTemplateMutation = useMutation({
    mutationFn: async (templateData: Partial<EventTemplate>) => {
      const response = await apiRequest("POST", "/api/event-templates", templateData);
      if (!response.ok) throw new Error('Erro ao criar template');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Template criado com sucesso!" });
      setShowCreateModal(false);
      setNewTemplate({
        name: '',
        description: '',
        category: '',
        estimatedBudget: 0,
        estimatedDuration: 1,
        estimatedGuests: 50,
        services: [],
        timeline: [],
        checklist: [],
        tags: [],
        isPublic: false
      });
      queryClient.invalidateQueries({ queryKey: ["/api/event-templates"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar template",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Usar template
  const useTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await apiRequest("POST", `/api/event-templates/${templateId}/use`);
      if (!response.ok) throw new Error('Erro ao usar template');
      return response.json();
    },
    onSuccess: (eventData) => {
      toast({ title: "Evento criado a partir do template!" });
      if (onTemplateSelect) {
        onTemplateSelect(eventData);
      }
    },
  });

  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = Array.from(new Set(templates?.map(t => t.category) || []));

  const addService = () => {
    setNewTemplate(prev => ({
      ...prev,
      services: [
        ...(prev.services || []),
        { category: '', subcategory: '', estimatedCost: 0, priority: 'medium' as const }
      ]
    }));
  };

  const removeService = (index: number) => {
    setNewTemplate(prev => ({
      ...prev,
      services: prev.services?.filter((_, i) => i !== index) || []
    }));
  };

  const updateService = (index: number, field: string, value: any) => {
    setNewTemplate(prev => ({
      ...prev,
      services: prev.services?.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      ) || []
    }));
  };

  const addChecklistItem = () => {
    const newItem = document.getElementById('new-checklist-item') as HTMLInputElement;
    if (newItem?.value.trim()) {
      setNewTemplate(prev => ({
        ...prev,
        checklist: [...(prev.checklist || []), newItem.value.trim()]
      }));
      newItem.value = '';
    }
  };

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates de Eventos</h2>
          <p className="text-gray-600">Acelere a criação de eventos com templates predefinidos</p>
        </div>
        
        {showCreateButton && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-[#3C5BFA] hover:bg-[#3C5BFA]/90">
                <Plus className="h-4 w-4 mr-2" />
                Criar Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Template</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="template-name">Nome do Template</Label>
                    <Input
                      id="template-name"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Casamento Clássico"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template-category">Categoria</Label>
                    <Select
                      value={newTemplate.category}
                      onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="casamento">Casamento</SelectItem>
                        <SelectItem value="aniversario">Aniversário</SelectItem>
                        <SelectItem value="corporativo">Corporativo</SelectItem>
                        <SelectItem value="festa">Festa</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="template-description">Descrição</Label>
                  <Textarea
                    id="template-description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o tipo de evento e suas características..."
                    rows={3}
                  />
                </div>

                {/* Estimativas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="budget">Orçamento Estimado (R$)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newTemplate.estimatedBudget}
                      onChange={(e) => setNewTemplate(prev => ({ 
                        ...prev, 
                        estimatedBudget: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duração (horas)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newTemplate.estimatedDuration}
                      onChange={(e) => setNewTemplate(prev => ({ 
                        ...prev, 
                        estimatedDuration: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="guests">Convidados Estimados</Label>
                    <Input
                      id="guests"
                      type="number"
                      value={newTemplate.estimatedGuests}
                      onChange={(e) => setNewTemplate(prev => ({ 
                        ...prev, 
                        estimatedGuests: parseInt(e.target.value) || 50 
                      }))}
                    />
                  </div>
                </div>

                {/* Serviços Recomendados */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Serviços Recomendados</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addService}>
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {newTemplate.services?.map((service, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 border rounded-lg">
                        <Input
                          placeholder="Categoria"
                          value={service.category}
                          onChange={(e) => updateService(index, 'category', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Subcategoria"
                          value={service.subcategory}
                          onChange={(e) => updateService(index, 'subcategory', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Custo"
                          value={service.estimatedCost}
                          onChange={(e) => updateService(index, 'estimatedCost', parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <Select
                          value={service.priority}
                          onValueChange={(value) => updateService(index, 'priority', value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="low">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeService(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <Label>Checklist</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="new-checklist-item"
                      placeholder="Adicionar item ao checklist..."
                      onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                    />
                    <Button type="button" variant="outline" onClick={addChecklistItem}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {newTemplate.checklist?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setNewTemplate(prev => ({
                            ...prev,
                            checklist: prev.checklist?.filter((_, i) => i !== index) || []
                          }))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => createTemplateMutation.mutate(newTemplate)}
                    disabled={!newTemplate.name || !newTemplate.category || createTemplateMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as categorias</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Templates */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {template.category}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(template.id)}
                    className={favorites.includes(template.id) ? 'text-red-500' : 'text-gray-400'}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(template.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-600" />
                    <span>R$ {template.estimatedBudget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span>{template.estimatedDuration}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-purple-600" />
                    <span>{template.estimatedGuests} pessoas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span>{template.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Usado {template.usageCount} vezes</span>
                  <span>por {template.createdBy}</span>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-[#3C5BFA] hover:bg-[#3C5BFA]/90"
                    onClick={() => useTemplateMutation.mutate(template.id)}
                    disabled={useTemplateMutation.isPending}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Usar Template
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredTemplates.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum template encontrado
          </h3>
          <p className="text-gray-500 mb-4">
            Tente ajustar os filtros ou criar um novo template
          </p>
          {showCreateButton && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Template
            </Button>
          )}
        </div>
      )}
    </div>
  );
}