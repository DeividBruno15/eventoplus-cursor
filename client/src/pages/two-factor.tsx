import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Smartphone, Key, QrCode, Copy, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TwoFactorStatus {
  enabled: boolean;
  qrCode?: string;
  backupCodes?: string[];
  lastUsed?: string;
}

export default function TwoFactor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<'password' | 'qr' | 'verify' | 'backup'>('password');

  // Buscar status do 2FA
  const { data: twoFactorStatus, isLoading } = useQuery<TwoFactorStatus>({
    queryKey: ["/api/user/2fa/status"],
    enabled: !!user,
  });

  // Mutation para iniciar configuração do 2FA
  const setupMutation = useMutation({
    mutationFn: async (password: string) => {
      return apiRequest("POST", "/api/user/2fa/setup", { password });
    },
    onSuccess: (response) => {
      response.json().then((data) => {
        queryClient.setQueryData(["/api/user/2fa/status"], {
          enabled: false,
          qrCode: data.qrCode,
          backupCodes: data.backupCodes
        });
        setStep('qr');
      });
    },
    onError: () => {
      toast({
        title: "Erro na configuração",
        description: "Senha incorreta ou erro interno",
        variant: "destructive",
      });
    }
  });

  // Mutation para verificar e ativar 2FA
  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      return apiRequest("POST", "/api/user/2fa/verify", { code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/2fa/status"] });
      setStep('backup');
      toast({
        title: "2FA ativado!",
        description: "Autenticação de dois fatores configurada com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Código inválido",
        description: "Verifique o código no seu aplicativo autenticador",
        variant: "destructive",
      });
    }
  });

  // Mutation para desativar 2FA
  const disableMutation = useMutation({
    mutationFn: async ({ password, code }: { password: string; code: string }) => {
      return apiRequest("POST", "/api/user/2fa/disable", { password, code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/2fa/status"] });
      setIsDisableOpen(false);
      setPassword("");
      setVerificationCode("");
      toast({
        title: "2FA desativado",
        description: "Autenticação de dois fatores foi desativada",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao desativar",
        description: "Senha ou código incorreto",
        variant: "destructive",
      });
    }
  });

  // Mutation para gerar novos códigos de backup
  const generateBackupCodesMutation = useMutation({
    mutationFn: async (password: string) => {
      return apiRequest("POST", "/api/user/2fa/backup-codes", { password });
    },
    onSuccess: (response) => {
      response.json().then((data) => {
        queryClient.setQueryData(["/api/user/2fa/status"], (old: any) => ({
          ...old,
          backupCodes: data.backupCodes
        }));
        toast({
          title: "Códigos gerados",
          description: "Novos códigos de backup foram gerados",
        });
      });
    }
  });

  const handleSetupStart = () => {
    if (!password) {
      toast({
        title: "Senha obrigatória",
        description: "Digite sua senha atual para continuar",
        variant: "destructive",
      });
      return;
    }
    setupMutation.mutate(password);
  };

  const handleVerify = () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Digite o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate(verificationCode);
  };

  const handleDisable = () => {
    if (!password || !verificationCode) {
      toast({
        title: "Dados obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    disableMutation.mutate({ password, code: verificationCode });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência",
    });
  };

  const resetSetupDialog = () => {
    setIsSetupOpen(false);
    setStep('password');
    setPassword("");
    setVerificationCode("");
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-[#3C5BFA]" />
        <div>
          <h1 className="text-3xl font-bold text-black">Autenticação de Dois Fatores</h1>
          <p className="text-gray-600">Adicione uma camada extra de segurança à sua conta</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Status do 2FA</span>
              {twoFactorStatus?.enabled ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Ativado
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-4 w-4 mr-1" />
                  Desativado
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {twoFactorStatus?.enabled ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Sua conta está protegida com autenticação de dois fatores.
                  {twoFactorStatus.lastUsed && (
                    <span className="block mt-1">
                      Último uso: {new Date(twoFactorStatus.lastUsed).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        Desativar 2FA
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Desativar Autenticação de Dois Fatores</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Para desativar o 2FA, confirme sua senha e digite um código do seu aplicativo autenticador.
                        </p>
                        <div>
                          <label className="text-sm font-medium">Senha atual</label>
                          <Input
                            type="password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Código do aplicativo</label>
                          <Input
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            maxLength={6}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          onClick={handleDisable}
                          disabled={disableMutation.isPending}
                          variant="destructive"
                          className="w-full"
                        >
                          {disableMutation.isPending ? "Desativando..." : "Desativar 2FA"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        Gerar Novos Códigos de Backup
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Gerar Códigos de Backup</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Digite sua senha para gerar novos códigos de backup. Os códigos anteriores serão invalidados.
                        </p>
                        <div>
                          <label className="text-sm font-medium">Senha atual</label>
                          <Input
                            type="password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          onClick={() => generateBackupCodesMutation.mutate(password)}
                          disabled={generateBackupCodesMutation.isPending}
                          className="w-full"
                        >
                          {generateBackupCodesMutation.isPending ? "Gerando..." : "Gerar Códigos"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Proteja sua conta com autenticação de dois fatores. Você precisará de um aplicativo 
                  autenticador como Google Authenticator ou Authy.
                </p>
                <Dialog open={isSetupOpen} onOpenChange={(open) => {
                  if (!open) resetSetupDialog();
                  setIsSetupOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#3C5BFA] hover:bg-[#3C5BFA]/90">
                      <Shield className="h-4 w-4 mr-2" />
                      Ativar 2FA
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Configurar Autenticação de Dois Fatores</DialogTitle>
                    </DialogHeader>
                    
                    {step === 'password' && (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Para começar, confirme sua senha atual.
                        </p>
                        <div>
                          <label className="text-sm font-medium">Senha atual</label>
                          <Input
                            type="password"
                            placeholder="Digite sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button
                          onClick={handleSetupStart}
                          disabled={setupMutation.isPending}
                          className="w-full"
                        >
                          {setupMutation.isPending ? "Verificando..." : "Continuar"}
                        </Button>
                      </div>
                    )}

                    {step === 'qr' && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <h3 className="font-semibold mb-2">Escaneie o QR Code</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Use seu aplicativo autenticador para escanear o código QR abaixo.
                          </p>
                          {twoFactorStatus?.qrCode && (
                            <div className="bg-white p-4 rounded-lg border inline-block">
                              <img src={twoFactorStatus.qrCode} alt="QR Code 2FA" className="w-48 h-48" />
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Código de verificação</label>
                          <Input
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            maxLength={6}
                            className="mt-1 text-center text-lg tracking-widest"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Digite o código de 6 dígitos do seu aplicativo
                          </p>
                        </div>
                        <Button
                          onClick={handleVerify}
                          disabled={verifyMutation.isPending}
                          className="w-full"
                        >
                          {verifyMutation.isPending ? "Verificando..." : "Verificar e Ativar"}
                        </Button>
                      </div>
                    )}

                    {step === 'backup' && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                          <h3 className="font-semibold text-green-800 mb-2">2FA Ativado com Sucesso!</h3>
                        </div>
                        
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-yellow-800 mb-2">Códigos de Backup</h4>
                          <p className="text-sm text-yellow-700 mb-3">
                            Guarde estes códigos em um local seguro. Você pode usá-los para acessar sua conta se perder o acesso ao aplicativo autenticador.
                          </p>
                          {twoFactorStatus?.backupCodes && (
                            <div className="space-y-2">
                              {twoFactorStatus.backupCodes.map((code, index) => (
                                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                  <code className="text-sm">{code}</code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(code)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <Button
                          onClick={resetSetupDialog}
                          className="w-full"
                        >
                          Concluir
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações sobre 2FA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Aplicativos Recomendados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold">Google Authenticator</div>
                <div className="text-sm text-gray-600">iOS e Android</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold">Authy</div>
                <div className="text-sm text-gray-600">Multiplataforma</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold">Microsoft Authenticator</div>
                <div className="text-sm text-gray-600">iOS e Android</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Códigos de Backup */}
        {twoFactorStatus?.enabled && twoFactorStatus?.backupCodes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Códigos de Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Use estes códigos se você perder o acesso ao seu aplicativo autenticador. 
                Cada código pode ser usado apenas uma vez.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {twoFactorStatus.backupCodes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <code className="text-sm">{code}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}