import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { 
  Database, 
  Download, 
  Upload, 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  HardDrive,
  Shield,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const createBackupSchema = z.object({
  description: z.string().optional()
});

type CreateBackupForm = z.infer<typeof createBackupSchema>;

const restoreBackupSchema = z.object({
  filename: z.string().min(1, "Selecione um arquivo")
});

type RestoreBackupForm = z.infer<typeof restoreBackupSchema>;

export default function Backup() {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  // Query para status do backup
  const { data: backupStatus, isLoading, refetch } = useQuery({
    queryKey: ['/api/backup/status'],
    enabled: !!user,
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  const createForm = useForm<CreateBackupForm>({
    resolver: zodResolver(createBackupSchema),
    defaultValues: {
      description: ""
    }
  });

  const restoreForm = useForm<RestoreBackupForm>({
    resolver: zodResolver(restoreBackupSchema)
  });

  // Mutation para criar backup
  const createBackupMutation = useMutation({
    mutationFn: async (data: CreateBackupForm) => {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao criar backup');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/backup/status'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      refetch();
    }
  });

  // Mutation para restaurar backup
  const restoreBackupMutation = useMutation({
    mutationFn: async (data: RestoreBackupForm) => {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao restaurar backup');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/backup/status'] });
      setIsRestoreDialogOpen(false);
      restoreForm.reset();
      refetch();
    }
  });

  // Mutation para testar sistema
  const testBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/backup/test');
      if (!response.ok) throw new Error('Erro ao testar backup');
      return response.json();
    },
    onSuccess: () => {
      refetch();
    }
  });

  const onCreateSubmit = (data: CreateBackupForm) => {
    createBackupMutation.mutate(data);
  };

  const onRestoreSubmit = (data: RestoreBackupForm) => {
    restoreBackupMutation.mutate(data);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Necessário</h2>
            <p className="text-gray-600">Você precisa estar logado para acessar o sistema de backup.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Sistema de Backup</h1>
          <p className="text-gray-600">Gerencie backups automáticos e manuais do banco de dados</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => testBackupMutation.mutate()}
            disabled={testBackupMutation.isPending}
          >
            <Settings className="w-4 h-4 mr-2" />
            {testBackupMutation.isPending ? "Testando..." : "Testar Sistema"}
          </Button>
          
          <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Restaurar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Restaurar Backup</DialogTitle>
              </DialogHeader>
              <Form {...restoreForm}>
                <form onSubmit={restoreForm.handleSubmit(onRestoreSubmit)} className="space-y-4">
                  <FormField
                    control={restoreForm.control}
                    name="filename"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arquivo de Backup</FormLabel>
                        <FormControl>
                          <select 
                            className="w-full p-2 border rounded-md" 
                            {...field}
                          >
                            <option value="">Selecione um arquivo</option>
                            {backupStatus?.files?.map((file: any) => (
                              <option key={file.name} value={file.name}>
                                {file.name} ({formatBytes(file.size)})
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                    <div className="flex items-center gap-2 text-yellow-800 mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span className="font-medium">Atenção</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Esta operação irá substituir todos os dados atuais do banco de dados. 
                      Certifique-se de ter um backup recente antes de prosseguir.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={restoreBackupMutation.isPending}>
                      {restoreBackupMutation.isPending ? "Restaurando..." : "Confirmar Restauração"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsRestoreDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3C5BFA] hover:bg-[#2F4DE8]">
                <Download className="w-4 h-4 mr-2" />
                Criar Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Backup Manual</DialogTitle>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o motivo deste backup..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3">
                    <Button type="submit" disabled={createBackupMutation.isPending}>
                      {createBackupMutation.isPending ? "Criando..." : "Criar Backup"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Carregando status do backup...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estatísticas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status atual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#3C5BFA]">
                      {backupStatus?.stats?.totalBackups || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total de Backups</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {backupStatus?.stats?.successRate?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatBytes(backupStatus?.stats?.totalSize || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Tamanho Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {backupStatus?.stats?.lastBackup ? 
                        format(new Date(backupStatus.stats.lastBackup), 'dd/MM', { locale: ptBR }) 
                        : 'N/A'
                      }
                    </div>
                    <div className="text-sm text-gray-600">Último Backup</div>
                  </div>
                </div>

                {backupStatus?.current && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="font-medium text-blue-800">Backup em Andamento</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      {backupStatus.current.filename}
                    </div>
                    <Progress value={75} className="mt-2" />
                  </div>
                )}

                {backupStatus?.healthCheck && (
                  <div className="mt-4 p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      {backupStatus.healthCheck.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`font-medium ${
                        backupStatus.healthCheck.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {backupStatus.healthCheck.message}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Histórico de backups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Histórico Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {backupStatus?.history?.length > 0 ? (
                  <div className="space-y-3">
                    {backupStatus.history.map((backup: any) => (
                      <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(backup.status)}
                          <div>
                            <div className="font-medium">{backup.filename}</div>
                            <div className="text-sm text-gray-600">
                              {format(new Date(backup.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(backup.status)}>
                            {backup.status}
                          </Badge>
                          {backup.size && (
                            <div className="text-sm text-gray-600 mt-1">
                              {formatBytes(backup.size)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum backup encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Arquivos de backup */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Arquivos Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {backupStatus?.files?.length > 0 ? (
                  <div className="space-y-3">
                    {backupStatus.files.map((file: any) => (
                      <div key={file.name} className="p-3 border rounded-lg">
                        <div className="font-medium text-sm mb-1">{file.name}</div>
                        <div className="text-xs text-gray-600 mb-2">
                          {format(new Date(file.created), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatBytes(file.size)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {file.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HardDrive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">Nenhum arquivo disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações do sistema */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Configuração</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Backups Automáticos:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Ativo
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frequência:</span>
                    <span>A cada 6 horas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retenção:</span>
                    <span>10 backups</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compressão:</span>
                    <Badge variant="outline">Ativa</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}