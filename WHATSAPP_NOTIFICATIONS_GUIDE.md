# 📱 Guia Completo: WhatsApp + n8n para EventoPlus

## 🎯 Resumo
Este guia mostra como configurar notificações WhatsApp automáticas usando n8n e Z-API.

## ⚡ Setup Rápido (15 minutos)

### Passo 1: Configurar Evolution API (10 min) - RECOMENDADO ⭐
1. **Criar conta**: https://railway.app → Login com GitHub
2. **Deploy Evolution API**: 
   - New Project → Deploy from GitHub
   - URL: `https://github.com/EvolutionAPI/evolution-api`
   - Aguardar build (5-10 min)
3. **Configurar variáveis** no Railway:
   ```
   AUTHENTICATION_API_KEY=eventoplus2024
   SERVER_URL=https://evolution-api-production.up.railway.app
   STORE_MESSAGES=true
   ```
4. **Acessar painel**: URL-do-deploy/manager
5. **Conectar WhatsApp**: Criar instância → Escanear QR Code

### Passo 2: Configurar n8n Cloud (5 min)  
1. **Criar conta**: https://n8n.cloud → "Sign up"
2. **Novo workflow**: Dashboard → "New Workflow" → Nome: "EventoPlus WhatsApp"
3. **Importar template**: Templates → "Import from JSON" → Cole o conteúdo do arquivo `n8n-workflow-template.json`

### Passo 3: Configurar Integração (5 min)
1. **No n8n**: Copie a URL do webhook (ex: `https://seu-workspace.app.n8n.cloud/webhook/eventoplus-notifications`)
2. **Importar template**: Use o arquivo `n8n-evolution-template.json` (Evolution API)
3. **Configurar nó Evolution**:
   - Substitua `YOUR_EVOLUTION_API_URL` pela URL do Railway
   - Substitua `YOUR_INSTANCE_NAME` pelo nome da instância
   - Substitua `YOUR_API_KEY` pela chave configurada
4. **Ativar workflow**: Botão "Active" → ON
5. **Atualizar EventoPlus**: No arquivo `.env`, adicione:
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

## 💰 Custos Estimados (ATUALIZADO)

### ⚠️ Z-API - CARO DEMAIS
- **Plano atual**: R$ 99/mês (só 2 dias grátis)
- **Não recomendado** para início

### 🏆 ALTERNATIVAS MELHORES:

### 1. Evolution API (GRATUITA) ⭐
- **Custo**: R$ 0/mês (open source)
- **Hospedagem**: Railway/Render (~R$ 25/mês)
- **Total**: ~R$ 25/mês

### 2. WhatsApp Business API Oficial
- **Custo**: R$ 0,039 por conversa
- **Primeiras 1000**: Gratuitas/mês
- **Total**: ~R$ 0-40/mês

### 3. Baileys (GRATUITA)
- **Custo**: R$ 0/mês (biblioteca open source)
- **Hospedagem**: Própria infraestrutura
- **Total**: ~R$ 0-15/mês

### n8n Cloud
- **Plano Starter**: Gratuito (até 5.000 execuções/mês)
- **Plano Pro**: $20/mês (ilimitado)

### 🎯 RECOMENDAÇÃO: Evolution API + n8n = ~R$ 25/mês total

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