# 🤖 Guia de Setup n8n para Notificações WhatsApp - EventoPlus

## 📋 Visão Geral

Esta implementação usa **n8n** como plataforma de automação para gerenciar notificações WhatsApp, oferecendo muito mais flexibilidade e facilidade de manutenção que integrações diretas.

## 🎯 Vantagens da Abordagem n8n

### ✅ **Benefícios:**
- **Interface visual** para criar workflows
- **Múltiplas integrações** WhatsApp (Z-API, Evolution API, WhatsApp Business)
- **Facilmente escalável** para email, SMS, Telegram, Discord
- **Logs e debugging** nativos
- **Templates reutilizáveis**
- **Sem dependências** no código da aplicação
- **Configuração sem restart** do servidor

### 🔄 **Arquitetura:**
```
EventoPlus → Webhook → n8n → WhatsApp API → Usuário
```

## 🛠️ Setup do n8n

### 1. Instalação do n8n

#### Opção A - Docker (Recomendado)
```bash
# docker-compose.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=suasenha
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n
volumes:
  n8n_data:
```

```bash
docker-compose up -d
```

#### Opção B - NPM
```bash
npm install n8n -g
n8n start
```

### 2. Configuração do Webhook

1. Acesse n8n em `http://localhost:5678`
2. Crie novo workflow
3. Adicione nó **Webhook**
4. Configure:
   - HTTP Method: `POST`
   - Path: `eventoplus-notifications`
   - Response Mode: `Respond to Webhook`

### 3. Configuração do WhatsApp

#### Opção A - Z-API (Recomendado para Brasil)
1. Acesse [z-api.io](https://z-api.io)
2. Crie conta e instância WhatsApp
3. Obtenha `token` e `instance_id`
4. No n8n, adicione nó **HTTP Request**:
   ```
   URL: https://api.z-api.io/instances/{{$json.instance_id}}/token/{{$json.token}}/send-text
   Method: POST
   Headers:
     Content-Type: application/json
   Body:
     {
       "phone": "{{$json.userPhone}}",
       "message": "{{$json.message}}"
     }
   ```

#### Opção B - Evolution API
1. Configure Evolution API
2. No n8n, adicione nó **HTTP Request**:
   ```
   URL: https://your-evolution-api.com/message/sendText/instance
   Method: POST
   Headers:
     Content-Type: application/json
     apikey: your-api-key
   Body:
     {
       "number": "{{$json.userPhone}}",
       "text": "{{$json.message}}"
     }
   ```

## 🎨 Templates de Workflow n8n

### Workflow Principal: EventoPlus Notifications

```json
{
  "nodes": [
    {
      "name": "Webhook EventoPlus",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "eventoplus-notifications",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Buscar Dados do Usuário",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT whatsapp_number, whatsapp_notifications_enabled, first_name, company_name FROM users WHERE id = {{ $json.userId }}"
      }
    },
    {
      "name": "Verificar Configurações",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "{{ $json.whatsapp_notifications_enabled }}",
              "value2": true
            }
          ]
        }
      }
    },
    {
      "name": "Processar Tipo de Notificação",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "options": {
          "string": [
            { "value": "new_event" },
            { "value": "new_chat" },
            { "value": "venue_reservation" },
            { "value": "event_application" },
            { "value": "application_status" }
          ]
        },
        "value": "{{ $json.type }}"
      }
    }
  ]
}
```

### Templates de Mensagem

#### 1. Novo Evento Compatível
```javascript
const data = $input.first().json;
const message = `🎉 *Novo evento compatível!*

📅 *${data.data.eventTitle}*
📍 ${data.data.eventLocation}
💰 Orçamento: R$ ${data.data.budget}
📋 Categoria: ${data.data.category}

Ver detalhes: ${data.data.eventUrl}`;

return [{ json: { 
  userPhone: $('Buscar Dados do Usuário').first().json.whatsapp_number,
  message: message
}}];
```

#### 2. Nova Conversa
```javascript
const data = $input.first().json;
const message = `💬 *Nova conversa iniciada!*

👤 *${data.data.senderName}* iniciou uma conversa
📝 "${data.data.firstMessage}"

Responder: ${data.data.chatUrl}`;

return [{ json: { 
  userPhone: $('Buscar Dados do Usuário').first().json.whatsapp_number,
  message: message
}}];
```

#### 3. Nova Candidatura
```javascript
const data = $input.first().json;
const message = `📋 *Nova candidatura recebida!*

🎉 *${data.data.eventTitle}*
👤 Prestador: ${data.data.providerName}
🎯 Serviço: ${data.data.serviceCategory}
💰 Proposta: R$ ${data.data.proposedPrice}

Avaliar: ${data.data.eventUrl}`;

return [{ json: { 
  userPhone: $('Buscar Dados do Usuário').first().json.whatsapp_number,
  message: message
}}];
```

#### 4. Status da Candidatura
```javascript
const data = $input.first().json;
const status = data.data.status;
const emoji = status === 'approved' ? '✅' : '❌';
const title = status === 'approved' ? 'Aprovada' : 'Reprovada';

const message = `${emoji} *Candidatura ${title}!*

🎉 *${data.data.eventTitle}*
📍 ${data.data.eventLocation}
📅 ${data.data.eventDate}

${status === 'approved' ? '🎊 Parabéns! Você foi selecionado!' : '😔 Não foi desta vez, mas continue tentando!'}

Próximos passos: ${data.data.targetUrl}`;

return [{ json: { 
  userPhone: $('Buscar Dados do Usuário').first().json.whatsapp_number,
  message: message
}}];
```

## ⚙️ Configuração no EventoPlus

### 1. Variável de Ambiente
```bash
# .env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/eventoplus-notifications
```

### 2. Interface Simplificada no Perfil

A nova interface no perfil será muito mais simples:
- ✅ Ativar notificações
- 📱 Número do WhatsApp
- 🧪 Testar conectividade

## 🔄 Workflows Avançados

### Notificação Multicanal
```
Webhook → Verificar Preferências → [WhatsApp, Email, SMS] → Logs
```

### Notificação com Delay
```
Webhook → Delay (5min) → Verificar se ainda relevante → Enviar
```

### Notificação com Fallback
```
WhatsApp → [Falhou?] → Email → [Falhou?] → SMS → Log Error
```

## 📊 Monitoramento

### Logs no n8n
- Todos os envios são logados automaticamente
- Interface visual para debugging
- Histórico de execuções
- Métricas de sucesso/falha

### Dashboard de Métricas
- Total de notificações enviadas
- Taxa de entrega por canal
- Usuários mais ativos
- Tipos de notificação mais enviados

## 🚀 Vantagens Práticas

### Para Desenvolvedores:
1. **Código mais limpo** - sem lógica de WhatsApp no backend
2. **Flexibilidade** - mudanças via interface, sem deploys
3. **Testabilidade** - workflows isolados e testáveis
4. **Escalabilidade** - adicionar novos canais facilmente

### Para Usuários:
1. **Reliability** - n8n tem retry automático
2. **Customização** - mensagens podem ser personalizadas
3. **Múltiplos canais** - WhatsApp, email, SMS, etc.
4. **Configuração granular** - controle fino das preferências

## 🛡️ Segurança

### Autenticação
- Basic Auth no n8n
- Webhook URLs com tokens seguros
- Rate limiting nativo

### Validações
- Verificar origem dos webhooks
- Validar dados antes de processar
- Logs de auditoria completos

## 📝 Exemplo de Uso Completo

1. **Usuário cria evento** no EventoPlus
2. **Sistema envia webhook** para n8n com dados do evento
3. **n8n processa** e identifica prestadores compatíveis
4. **Para cada prestador** qualificado:
   - Busca configurações de notificação
   - Verifica se WhatsApp está ativo
   - Monta mensagem personalizada
   - Envia via Z-API/Evolution
   - Loga resultado

## ✅ Checklist de Implementação

- [ ] Instalar e configurar n8n
- [ ] Criar workflow principal
- [ ] Configurar integração WhatsApp
- [ ] Testar todos os tipos de notificação
- [ ] Criar dashboards de monitoramento
- [ ] Documentar workflows para a equipe
- [ ] Configurar backups dos workflows

Esta abordagem com n8n é **infinitamente mais flexível e robusta** que a implementação direta! 🎉 