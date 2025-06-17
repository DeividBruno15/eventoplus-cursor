import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Book, 
  HelpCircle, 
  MessageSquare, 
  Settings,
  CreditCard,
  Users,
  Calendar,
  MapPin,
  Shield,
  ChevronRight
} from "lucide-react";
import { Link } from "wouter";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  articles: number;
}

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: HelpCategory[] = [
    {
      id: "getting-started",
      title: "Primeiros Passos",
      description: "Aprenda a usar a plataforma do zero",
      icon: Book,
      articles: 8
    },
    {
      id: "events",
      title: "Gerenciar Eventos",
      description: "Criar, editar e gerenciar seus eventos",
      icon: Calendar,
      articles: 12
    },
    {
      id: "services",
      title: "Prestadores de Serviços",
      description: "Como se tornar um prestador ou contratar serviços",
      icon: Users,
      articles: 15
    },
    {
      id: "venues",
      title: "Espaços e Locais",
      description: "Anunciar espaços ou reservar locais",
      icon: MapPin,
      articles: 10
    },
    {
      id: "payments",
      title: "Pagamentos e Assinaturas",
      description: "Gerenciar planos, pagamentos e faturas",
      icon: CreditCard,
      articles: 6
    },
    {
      id: "account",
      title: "Conta e Segurança",
      description: "Configurações da conta e autenticação",
      icon: Shield,
      articles: 9
    }
  ];

  const faqs: FAQItem[] = [
    {
      id: "1",
      question: "Como criar minha primeira conta?",
      answer: "Para criar sua conta, clique em 'Registrar' no topo da página, escolha seu tipo de usuário (Prestador, Contratante ou Anunciante) e preencha os dados solicitados.",
      category: "getting-started",
      tags: ["conta", "registro", "início"]
    },
    {
      id: "2",
      question: "Qual a diferença entre os tipos de usuário?",
      answer: "Prestadores oferecem serviços para eventos, Contratantes organizam eventos e contratam serviços, e Anunciantes disponibilizam espaços para locação.",
      category: "getting-started",
      tags: ["tipos", "usuário", "diferença"]
    },
    {
      id: "3",
      question: "Como criar um evento?",
      answer: "Acesse 'Meus Eventos' no menu lateral, clique em 'Criar Evento', preencha as informações básicas como título, data, orçamento e descrição.",
      category: "events",
      tags: ["evento", "criar", "organizar"]
    },
    {
      id: "4",
      question: "Como adicionar imagens ao meu evento?",
      answer: "Durante a criação do evento, use a seção 'Imagens do Evento' para fazer upload de até 10 fotos que ilustrem seu evento.",
      category: "events",
      tags: ["imagem", "upload", "evento"]
    },
    {
      id: "5",
      question: "Como me candidatar a um evento como prestador?",
      answer: "Navegue pela seção 'Oportunidades', encontre eventos compatíveis com seus serviços e clique em 'Candidatar-se' para enviar sua proposta.",
      category: "services",
      tags: ["candidatura", "prestador", "oportunidades"]
    },
    {
      id: "6",
      question: "Como anunciar meu espaço?",
      answer: "Acesse 'Meus Espaços', clique em 'Adicionar Espaço', preencha as informações e adicione fotos e vídeos para atrair mais clientes.",
      category: "venues",
      tags: ["espaço", "anunciar", "local"]
    },
    {
      id: "7",
      question: "Como funciona o sistema de pré-reservas?",
      answer: "Clientes interessados em seu espaço podem fazer pré-reservas. Você recebe uma notificação e pode aprovar ou rejeitar a solicitação.",
      category: "venues",
      tags: ["reserva", "aprovação", "espaço"]
    },
    {
      id: "8",
      question: "Quais são os planos disponíveis?",
      answer: "Oferecemos planos Essencial (gratuito), Profissional (R$ 29,90/mês) e Premium (R$ 79,90/mês) com diferentes recursos e limites.",
      category: "payments",
      tags: ["planos", "preços", "assinatura"]
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredCategories = categories.filter(category => {
    if (!searchTerm) return true;
    return category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Central de Ajuda</h1>
        <p className="text-xl text-gray-600">
          Encontre respostas para suas dúvidas e aprenda a usar a plataforma
        </p>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Buscar por assunto, palavra-chave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-3 text-lg"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/support">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-12 w-12 text-[#3C5BFA] mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Falar com Suporte</h3>
              <p className="text-gray-600">Precisa de ajuda personalizada? Entre em contato conosco</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/api-docs">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Settings className="h-12 w-12 text-[#3C5BFA] mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Documentação API</h3>
              <p className="text-gray-600">Integre sua aplicação com nossa API</p>
            </CardContent>
          </Card>
        </Link>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <HelpCircle className="h-12 w-12 text-[#3C5BFA] mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Tutoriais em Vídeo</h3>
            <p className="text-gray-600">Assista aos nossos tutoriais passo a passo</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      {!searchTerm && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Categorias de Ajuda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className="h-6 w-6 text-[#3C5BFA]" />
                          <h3 className="font-semibold text-lg">{category.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-3">{category.description}</p>
                        <Badge variant="outline">
                          {category.articles} artigos
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* FAQ Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory ? "Artigos da Categoria" : "Perguntas Frequentes"}
          </h2>
          {selectedCategory && (
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory(null)}
            >
              Ver Todas as Categorias
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <Card key={faq.id}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{faq.answer}</p>
                <div className="flex flex-wrap gap-2">
                  {faq.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredFAQs.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Não encontramos artigos relacionados à sua busca.
                </p>
                <Link href="/support">
                  <Button>
                    Entrar em Contato com Suporte
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}