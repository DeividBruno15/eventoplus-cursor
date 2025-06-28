# 📱 Guia Completo: WhatsApp + n8n para EventoPlus

## 🎯 Resumo
Este guia mostra como configurar notificações WhatsApp automáticas usando n8n e Z-API.

## ⚡ Setup Rápido (15 minutos)

### Passo 1: Configurar Z-API (5 min)
1. **Criar conta**: https://z-api.io → "Criar Conta Grátis"
2. **Confirmar e-mail** recebido
3. **Nova instância**: No painel → "Nova Instância" → Nome: "EventoPlus"
4. **Conectar WhatsApp**: Escanear QR Code com seu WhatsApp
5. **Anotar credenciais**:
   - Instance ID: (ex: 3C4E...)
   - Token: (ex: B6D48A...)

### Passo 2: Configurar n8n Cloud (5 min)  
1. **Criar conta**: https://n8n.cloud → "Sign up"
2. **Novo workflow**: Dashboard → "New Workflow" → Nome: "EventoPlus WhatsApp"
3. **Importar template**: Templates → "Import from JSON" → Cole o conteúdo do arquivo `n8n-workflow-template.json`

### Passo 3: Configurar Integração (5 min)
1. **No n8n**: Copie a URL do webhook (ex: `https://seu-workspace.app.n8n.cloud/webhook/eventoplus-notifications`)
2. **Configurar nó Z-API**: 
   - Substitua `YOUR_INSTANCE_ID` pelo seu Instance ID
   - Substitua `YOUR_TOKEN` pelo seu Token
3. **Ativar workflow**: Botão "Active" → ON
4. **Atualizar EventoPlus**: No arquivo `.env`, adicione:
   ```
   N8N_WEBHOOK_URL=https://seu-workspace.app.n8n.cloud/webhook/eventoplus-notifications
   ```

## ✅ Testar a Integração

### Verificar Status
```bash
curl http://localhost:5000/api/diagnostics/n8n
```

### Testar Notificação
```bash
curl http://localhost:5000/api/notifications/test
```

## 💰 Custos Estimados

### Z-API
- **Plano Starter**: R$ 19/mês
- **Inclui**: 1000 mensagens
- **Adicional**: R$ 0,05 por mensagem extra

### n8n Cloud
- **Plano Starter**: Gratuito (até 5.000 execuções/mês)
- **Plano Pro**: $20/mês (ilimitado)

### Total Mensal: ~R$ 19-119 (dependendo do volume)

## 📋 5 Tipos de Notificação

1. **Novo Evento**: Prestadores recebem sobre eventos compatíveis
2. **Nova Mensagem**: Chat entre organizadores e prestadores  
3. **Nova Candidatura**: Organizadores sobre aplicações recebidas
4. **Status da Candidatura**: Aprovação/rejeição de aplicações
5. **Reserva de Local**: Anunciantes sobre reservas confirmadas

## 🔧 Solução de Problemas

### Connectivity "failed"
- Verificar se n8n workflow está ativo
- Confirmar URL do webhook no .env
- Testar endpoint: `/api/diagnostics/n8n`

### Mensagens não chegam
- Verificar se WhatsApp está conectado no Z-API
- Confirmar credenciais Z-API no n8n
- Testar envio manual no painel Z-API

### Webhook não responde
- Verificar se workflow está salvo e ativo
- Confirmar se URL está correta no EventoPlus
- Testar com Postman/Insomnia

## 📞 Suporte
- **Z-API**: suporte@z-api.io
- **n8n**: https://community.n8n.io
- **EventoPlus**: Verificar logs em `/api/diagnostics/n8n`

## 🚀 Próximos Passos
Após configurar, o sistema enviará notificações automaticamente quando:
- Novos eventos forem criados
- Mensagens forem enviadas no chat
- Candidaturas forem enviadas/aprovadas
- Locais forem reservados

O EventoPlus está 100% preparado - só falta ativar o n8n e Z-API!