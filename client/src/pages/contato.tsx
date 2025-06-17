import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import eventoLogo from "@assets/logo evennto_1750165135991.png";

export default function Contato() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular envio do formulário (implementar endpoint real posteriormente)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Mensagem enviada!",
        description: "Obrigado pelo contato. Responderemos em breve.",
      });
      
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou entre em contato por email.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <img 
                    src={eventoLogo} 
                    alt="Evento+"
                    className="h-8 object-contain"
                  />
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/#pricing">
                <span className="text-gray-600 hover:text-black cursor-pointer">Preços</span>
              </Link>
              <Link href="/como-funciona">
                <span className="text-gray-600 hover:text-black cursor-pointer">Como funciona</span>
              </Link>
              <Link href="/quem-somos">
                <span className="text-gray-600 hover:text-black cursor-pointer">Quem somos</span>
              </Link>
              <Link href="/contato">
                <span className="text-[#3C5BFA] font-medium cursor-pointer">Contato</span>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="border-gray-300">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#3C5BFA] hover:bg-[#2C46E8]">
                  Cadastrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#3C5BFA] to-[#2C46E8]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Entre em contato
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Estamos aqui para ajudar. Entre em contato conosco e responderemos o mais rápido possível.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-black">
                    Envie sua mensagem
                  </CardTitle>
                  <p className="text-gray-600">
                    Preencha o formulário abaixo e entraremos em contato em breve.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                          Nome completo
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Seu nome"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                          E-mail
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-black mb-2">
                        Assunto
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Como podemos ajudar?"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-black mb-2">
                        Mensagem
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Descreva sua dúvida ou sugestão..."
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#3C5BFA] hover:bg-[#2C46E8]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        "Enviando..."
                      ) : (
                        <>
                          Enviar mensagem
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-black mb-6">
                  Outras formas de contato
                </h3>
                <p className="text-gray-600 mb-8">
                  Escolha a forma mais conveniente para entrar em contato conosco.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#3C5BFA] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">E-mail</h4>
                    <p className="text-gray-600 mb-1">contato@eventoplus.com.br</p>
                    <p className="text-gray-500 text-sm">Resposta em até 24 horas</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#FFA94D] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Telefone</h4>
                    <p className="text-gray-600 mb-1">(11) 99999-9999</p>
                    <p className="text-gray-500 text-sm">Segunda a sexta, 9h às 18h</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Endereço</h4>
                    <p className="text-gray-600 mb-1">São Paulo, SP</p>
                    <p className="text-gray-500 text-sm">Atendimento online</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black mb-1">Horário de atendimento</h4>
                    <p className="text-gray-600 mb-1">Segunda a sexta: 9h às 18h</p>
                    <p className="text-gray-500 text-sm">Sábados: 9h às 14h</p>
                  </div>
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="font-semibold text-black mb-4">Perguntas frequentes</h4>
                <div className="space-y-3">
                  <Link href="/#pricing">
                    <div className="text-[#3C5BFA] hover:underline cursor-pointer text-sm">
                      → Como funcionam os planos de assinatura?
                    </div>
                  </Link>
                  <Link href="/como-funciona">
                    <div className="text-[#3C5BFA] hover:underline cursor-pointer text-sm">
                      → Como me cadastrar como prestador?
                    </div>
                  </Link>
                  <Link href="/como-funciona">
                    <div className="text-[#3C5BFA] hover:underline cursor-pointer text-sm">
                      → Como encontrar prestadores de serviços?
                    </div>
                  </Link>
                  <div className="text-[#3C5BFA] hover:underline cursor-pointer text-sm">
                    → Política de cancelamento e reembolso
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src={eventoLogo} 
                  alt="Evento+"
                  className="h-8 object-contain"
                />
              </div>
              <p className="text-gray-600">
                A plataforma completa para eventos únicos e memoráveis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/#pricing"><span className="hover:text-black cursor-pointer">Preços</span></Link></li>
                <li><Link href="/como-funciona"><span className="hover:text-black cursor-pointer">Como funciona</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/quem-somos"><span className="hover:text-black cursor-pointer">Quem somos</span></Link></li>
                <li><Link href="/contato"><span className="hover:text-black cursor-pointer">Contato</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-black mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="/contato"><span className="hover:text-black cursor-pointer">Ajuda</span></Link></li>
                <li><Link href="/contato"><span className="hover:text-black cursor-pointer">Contato</span></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2025 Evento+. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}