import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { CEPInput } from "@/components/ui/cep-input";
import { CPFCNPJInput } from "@/components/ui/cpf-cnpj-input";
import { PasswordStrength } from "@/components/ui/password-strength";

const registerStep2Schema = z.object({
  personType: z.enum(["fisica", "juridica"]),
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres").optional(),
  companyName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres").optional(),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").optional(),
  cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos").optional(),
  birthDate: z.string().optional(),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  confirmPassword: z.string(),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  zipCode: z.string().min(8, "CEP deve ter 8 dígitos"),
  street: z.string().optional(),
  number: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.personType === "fisica") {
    return data.firstName && data.lastName && data.cpf && data.birthDate;
  }
  if (data.personType === "juridica") {
    return data.companyName && data.cnpj;
  }
  // For prestador users who don't have personType selection
  return true;
}, {
  message: "Preencha todos os campos obrigatórios",
  path: ["personType"],
});

type RegisterStep2Form = z.infer<typeof registerStep2Schema>;

export default function RegisterStep2() {
  const [, setLocation] = useLocation();
  const [userType, setUserType] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [addressData, setAddressData] = useState({
    street: "",
    neighborhood: "",
    city: "",
    state: ""
  });

  const form = useForm<RegisterStep2Form>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues: {
      personType: "fisica",
      firstName: "",
      lastName: "",
      companyName: "",
      cpf: "",
      cnpj: "",
      birthDate: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      zipCode: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
    },
  });

  const personType = form.watch("personType");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("userType");
    if (type) {
      setUserType(type);
    }
  }, []);

  const handleCEPFound = (address: any) => {
    setAddressData({
      street: address.street,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state
    });
    
    // Auto-populate form fields
    form.setValue("zipCode", address.cep.replace(/\D/g, ''));
    form.setValue("street", address.street);
    form.setValue("neighborhood", address.neighborhood);
    form.setValue("city", address.city);
    form.setValue("state", address.state);
  };

  const handleContinue = (data: RegisterStep2Form) => {
    console.log("Form submitted with data:", data);
    console.log("User type:", userType);
    console.log("Address data:", addressData);
    
    const registrationData = {
      userType,
      ...data,
      addressData: JSON.stringify(addressData)
    };
    
    localStorage.setItem("registrationData", JSON.stringify(registrationData));
    console.log("Navigating to step 3...");
    setLocation(`/auth/register-step3?userType=${userType}`);
  };

  const handleBack = () => {
    setLocation("/auth/register-step1");
  };

  const showPersonTypeSelection = userType === "contratante" || userType === "anunciante";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Cadastrar conta</h1>
          <p className="text-gray-600">
            Informe seus dados de cadastro
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                ✓
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Tipo de usuário</span>
            </div>
            <div className="w-16 h-0.5 bg-green-500"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Dados de cadastro</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-gray-500">Serviços</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleContinue, (errors) => {
                console.log("Form validation errors:", errors);
              })} className="space-y-6">
                {/* Person Type Selection */}
                {showPersonTypeSelection && (
                  <FormField
                    control={form.control}
                    name="personType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de pessoa</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fisica" id="fisica" />
                              <Label htmlFor="fisica">Pessoa Física</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="juridica" id="juridica" />
                              <Label htmlFor="juridica">Pessoa Jurídica</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Person Type Specific Fields */}
                {(personType === "fisica" || !showPersonTypeSelection) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="João" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome</FormLabel>
                          <FormControl>
                            <Input placeholder="Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {personType === "juridica" && showPersonTypeSelection && (
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome ou Razão Social</FormLabel>
                        <FormControl>
                          <Input placeholder="Empresa LTDA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Document Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(personType === "fisica" || !showPersonTypeSelection) && (
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <CPFCNPJInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          type="cpf"
                          label="CPF"
                        />
                      )}
                    />
                  )}

                  {personType === "juridica" && showPersonTypeSelection && (
                    <FormField
                      control={form.control}
                      name="cnpj"
                      render={({ field }) => (
                        <CPFCNPJInput
                          value={field.value || ""}
                          onChange={field.onChange}
                          type="cnpj"
                          label="CNPJ"
                        />
                      )}
                    />
                  )}

                  {(personType === "fisica" || !showPersonTypeSelection) && (
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Contact Information */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="joao@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(11) 99999-9999" 
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .replace(/(\d{2})(\d)/, "($1) $2")
                              .replace(/(\d{5})(\d)/, "$1-$2")
                              .replace(/(-\d{4})\d+?$/, "$1");
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Fields */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <PasswordStrength 
                        password={field.value || ""} 
                        onStrengthChange={setIsPasswordValid}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmação de Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <div className="space-y-4">
                  <FormLabel className="text-base font-semibold">Endereço</FormLabel>
                  
                  <div>
                    <FormLabel className="text-sm">CEP</FormLabel>
                    <CEPInput onAddressFound={handleCEPFound} initialValue={form.watch("zipCode")} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Rua</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da rua" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da cidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="UF" {...field} maxLength={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <Button variant="outline" onClick={handleBack}>
                    Voltar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={!isPasswordValid}
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      console.log("Continuar button clicked");
                      console.log("Password valid:", isPasswordValid);
                      console.log("Form state:", form.formState);
                      console.log("Form errors:", form.formState.errors);
                    }}
                  >
                    Continuar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}