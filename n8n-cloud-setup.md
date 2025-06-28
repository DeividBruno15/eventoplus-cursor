# 🚀 Setup n8n Cloud para EventoPlus

## Passo 1: Criar Conta n8n Cloud
1. Acesse: https://n8n.cloud
2. Clique em "Sign up"
3. Use seu e-mail: deividb15r@gmail.com
4. Crie uma senha segura
5. Confirme o e-mail

## Passo 2: Criar Novo Workflow
1. No dashboard, clique em "New Workflow"
2. Nome: "EventoPlus WhatsApp Notifications"
3. Salve o workflow

## Passo 3: Configurar Webhook
1. Adicione nó "Webhook"
2. Configurações:
   - HTTP Method: POST
   - Path: eventoplus-notifications
   - Authentication: None
   - Response Mode: Respond to Webhook

3. Copie a URL do webhook (será algo como):
   `https://seu-workspace.app.n8n.cloud/webhook/eventoplus-notifications`

## Passo 4: Atualizar EventoPlus
Substitua no arquivo .env:
```
N8N_WEBHOOK_URL=https://seu-workspace.app.n8n.cloud/webhook/eventoplus-notifications
```

## Passo 5: Importar Template
1. No n8n, vá em "Templates" → "Import from JSON"
2. Cole o conteúdo do arquivo `n8n-workflow-template.json`
3. Clique em "Import"
4. Ative o workflow

## Verificação
- Teste via: http://localhost:5000/api/diagnostics/n8n
- Status deve mostrar "connected": true