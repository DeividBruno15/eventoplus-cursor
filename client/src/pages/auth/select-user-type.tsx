import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Calendar, Users, Building, Briefcase } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const userTypeSchema = z.object({
  userType: z.enum(["prestador", "contratante", "anunciante"], {
    required_error: "Selecione o tipo de usuário"
  }),
});

type UserTypeForm = z.infer<typeof userTypeSchema>;

export default function SelectUserType() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<UserTypeForm>({
    resolver: zodResolver(userTypeSchema),
  });

  const onSubmit = async (data: UserTypeForm) => {
    setIsLoading(true);
    try {
      await apiRequest("PATCH", "/api/user-type", data);
      toast({
        title: "Perfil configurado com sucesso!",
        description: "Bem-vindo ao Evento+",
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro ao configurar perfil",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-[#3C5BFA] rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-black">Evento+</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurar seu perfil</CardTitle>
            <CardDescription>
              Selecione como você pretende usar o Evento+
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="userType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Usuário</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prestador">
                            <div className="flex items-center space-x-2">
                              <Briefcase className="w-4 h-4" />
                              <span>Prestador de Serviços</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="contratante">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4" />
                              <span>Organizador de Eventos</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="anunciante">
                            <div className="flex items-center space-x-2">
                              <Building className="w-4 h-4" />
                              <span>Proprietário de Espaços</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4 text-sm text-gray-600">
                  <div className="border-l-4 border-[#3C5BFA] pl-4">
                    <p><strong>Prestador de Serviços:</strong> Ofereça seus serviços para eventos (fotografia, decoração, catering, etc.)</p>
                  </div>
                  <div className="border-l-4 border-[#FFA94D] pl-4">
                    <p><strong>Organizador de Eventos:</strong> Crie e gerencie eventos, contrate prestadores e espaços</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p><strong>Proprietário de Espaços:</strong> Anuncie seus espaços para locação em eventos</p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#3C5BFA] hover:bg-blue-700" 
                  disabled={isLoading}
                >
                  {isLoading ? "Configurando..." : "Continuar"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}