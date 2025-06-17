import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { QrCode, Shield, Copy, Eye, EyeOff } from "lucide-react";

interface TwoFactorSetupProps {
  userId: number;
}

export function TwoFactorAuth({ userId }: TwoFactorSetupProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Get 2FA status
  const { data: twoFactorData, isLoading } = useQuery({
    queryKey: ['/api/user/2fa-status', userId],
    queryFn: () => apiRequest("GET", '/api/user/2fa-status').then(res => res.json()),
  });

  // Setup 2FA mutation
  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/2fa-setup");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/2fa-status'] });
      toast({
        title: "2FA Configurado",
        description: "Use seu aplicativo autenticador para escanear o QR code",
      });
    },
  });

  // Verify 2FA mutation
  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/user/2fa-verify", { code });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/2fa-status'] });
      setVerificationCode("");
      toast({
        title: "2FA Ativado",
        description: "Autenticação de dois fatores ativada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Código Inválido",
        description: "O código inserido não é válido. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Disable 2FA mutation
  const disableMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/user/2fa-disable", { code });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/2fa-status'] });
      toast({
        title: "2FA Desativado",
        description: "Autenticação de dois fatores foi desativada",
      });
    },
  });

  // Generate backup codes mutation
  const generateBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/2fa-backup-codes");
      return response.json();
    },
    onSuccess: (data) => {
      setShowBackupCodes(true);
      toast({
        title: "Códigos de Backup Gerados",
        description: "Salve estes códigos em local seguro",
      });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado",
        description: "Texto copiado para a área de transferência",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o texto",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isEnabled = twoFactorData?.enabled;
  const qrCodeUrl = twoFactorData?.qrCode;
  const secret = twoFactorData?.secret;
  const backupCodes = twoFactorData?.backupCodes || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-[#3C5BFA]" />
            <CardTitle>Autenticação de Dois Fatores (2FA)</CardTitle>
          </div>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Ativado" : "Desativado"}
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">
            A autenticação de dois fatores adiciona uma camada extra de segurança 
            à sua conta, exigindo um código do seu dispositivo móvel além da senha.
          </p>

          {!isEnabled ? (
            <div className="space-y-4">
              <Button 
                onClick={() => setupMutation.mutate()}
                disabled={setupMutation.isPending}
                className="w-full"
              >
                {setupMutation.isPending ? "Configurando..." : "Configurar 2FA"}
              </Button>

              {qrCodeUrl && (
                <div className="space-y-4">
                  <Separator />
                  
                  <div className="text-center space-y-4">
                    <h3 className="font-medium">1. Escaneie o QR Code</h3>
                    <div className="flex justify-center">
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code para 2FA" 
                        className="border rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Ou insira manualmente esta chave no seu aplicativo:
                      </p>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={secret}
                          readOnly
                          type={showSecret ? "text" : "password"}
                          className="font-mono text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(secret)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">2. Digite o código de verificação</h3>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        className="text-center font-mono"
                      />
                      <Button
                        onClick={() => verifyMutation.mutate(verificationCode)}
                        disabled={verificationCode.length !== 6 || verifyMutation.isPending}
                      >
                        {verifyMutation.isPending ? "Verificando..." : "Verificar"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">2FA está ativo</span>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Protegido
                </Badge>
              </div>

              <div className="grid gap-4">
                <Button
                  variant="outline"
                  onClick={() => generateBackupMutation.mutate()}
                  disabled={generateBackupMutation.isPending}
                >
                  {generateBackupMutation.isPending ? "Gerando..." : "Gerar Códigos de Backup"}
                </Button>

                <div className="flex space-x-2">
                  <Input
                    placeholder="Código para desativar 2FA"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    maxLength={6}
                    className="text-center font-mono"
                  />
                  <Button
                    variant="destructive"
                    onClick={() => disableMutation.mutate(backupCode)}
                    disabled={backupCode.length !== 6 || disableMutation.isPending}
                  >
                    {disableMutation.isPending ? "Desativando..." : "Desativar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showBackupCodes && backupCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Códigos de Backup</CardTitle>
            <p className="text-sm text-gray-600">
              Salve estes códigos em um local seguro. Cada código só pode ser usado uma vez.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded font-mono text-sm"
                >
                  <span>{code}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => copyToClipboard(backupCodes.join('\n'))}
            >
              Copiar Todos os Códigos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}