# 📱 Sistema de Notificações WhatsApp - EventoPlus

## 📋 Visão Geral

O sistema de notificações WhatsApp permite que prestadores de serviços recebam alertas automáticos via WhatsApp em situações importantes, garantindo que não percam oportunidades de negócio.

## 🎯 Funcionalidades Implementadas

### 1. **Notificação de Novos Eventos Compatíveis**
- Quando um organizador publica um evento compatível com os serviços do prestador
- Inclui título, localização, orçamento e link direto para candidatura
- Enviado apenas para prestadores com serviços compatíveis

### 2. **Notificação de Novas Conversas**
- Quando alguém inicia uma conversa no chat
- Inclui nome do remetente, prévia da mensagem e link direto para responder
- Enviado para o destinatário da mensagem

### 3. **Notificação de Pré-reservas de Espaços**
- Quando um cliente faz pré-reserva em espaço anunciado
- Inclui dados do evento, cliente e link para gerenciar
- Enviado para o anunciante do espaço

### 4. **Notificação de Candidaturas Recebidas**
- Quando um prestador se candidata a um evento
- Inclui dados do prestador, proposta e link para avaliar
- Enviado para o organizador do evento

### 5. **Notificação de Status das Candidaturas**
- Quando candidatura é aprovada ou rejeitada
- Inclui resultado e próximos passos
- Enviado para o prestador candidato

## 🔧 Configuração Técnica

### Variáveis de Ambiente Necessárias

```bash
# Configurações Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # Número sandbox Twilio

# URL da aplicação (para links nas mensagens)
APP_URL=https://seu-dominio.com
```

### Setup do Twilio

1. **Criar conta no Twilio**
   - Acesse [twilio.com](https://twilio.com)
   - Crie uma conta e acesse o console

2. **Configurar WhatsApp Sandbox**
   - No console, vá para "Messaging" > "Try it out" > "Send a WhatsApp message"
   - Siga as instruções para ativar o sandbox
   - Anote o número `whatsapp:+14155238886`

3. **Obter credenciais**
   - Account SID: encontrado no dashboard principal
   - Auth Token: encontrado no dashboard principal (clique no ícone de olho para revelar)

## 🎨 Interface do Usuário

### Configurações no Perfil

A seção "Notificações WhatsApp" foi adicionada ao perfil do usuário com:

#### Campos de Configuração:
- **Número WhatsApp**: Campo para inserir número no formato internacional
- **Ativar Notificações**: Switch principal para habilitar/desabilitar
- **Tipos Específicos**: Switches individuais para cada tipo de notificação

#### Validações:
- Formato do número: `+5511999999999` (código país + DDD + número)
- Validação automática de números brasileiros válidos

#### Botões de Ação:
- **Salvar Configurações**: Persiste as configurações no banco
- **Testar WhatsApp**: Envia mensagem de teste para validar funcionamento

## 📊 Banco de Dados

### Campos Adicionados à Tabela `users`:

```sql
ALTER TABLE users ADD COLUMN whatsapp_number TEXT;
ALTER TABLE users ADD COLUMN whatsapp_notifications_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN whatsapp_new_event_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN whatsapp_new_chat_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN whatsapp_venue_reservation_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN whatsapp_application_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN whatsapp_status_notifications BOOLEAN DEFAULT TRUE;
```

## 🔗 Endpoints da API

### Configurações de WhatsApp
```
PUT /api/profile/whatsapp-settings
```
**Body:**
```json
{
  "whatsappNumber": "+5511999999999",
  "whatsappNotificationsEnabled": true,
  "whatsappNewEventNotifications": true,
  "whatsappNewChatNotifications": true,
  "whatsappVenueReservationNotifications": true,
  "whatsappApplicationNotifications": true,
  "whatsappStatusNotifications": true
}
```

### Teste de Notificação
```
POST /api/whatsapp/test
```
Envia mensagem de teste para o número configurado do usuário autenticado.

### Gestão de Candidaturas
```
PUT /api/events/{eventId}/applications/{applicationId}/approve
PUT /api/events/{eventId}/applications/{applicationId}/reject
```
Aprova/rejeita candidaturas e envia notificações WhatsApp automaticamente.

## 🎭 Templates de Mensagens

### 1. Novo Evento Compatível
```
🎉 *Novo evento compatível!*

📅 *{eventTitle}*
📍 {eventLocation}
💰 Orçamento: R$ {budget}
📋 Categoria: {category}

Ver detalhes e candidatar-se: {link}
```

### 2. Nova Conversa
```
💬 *Nova conversa iniciada!*

👤 *{senderName}* iniciou uma conversa com você
📝 "{firstMessage}"

Responder agora: {link}
```

### 3. Pré-reserva de Espaço
```
🏢 *Nova pré-reserva no seu espaço!*

📍 *{venueName}*
👤 Solicitante: {clientName}
📅 Data: {reservationDate}
👥 Convidados: {guestCount} pessoas

Gerenciar reserva: {link}
```

### 4. Nova Candidatura
```
📋 *Nova candidatura no seu evento!*

🎉 *{eventTitle}*
👤 Prestador: {providerName}
🎯 Serviço: {serviceCategory}
💰 Proposta: R$ {proposedPrice}

Ver candidatura: {link}
```

### 5. Status da Candidatura
**Aprovada:**
```
✅ *Candidatura Aprovada!*

🎉 *{eventTitle}*
📍 {eventLocation}
📅 {eventDate}

🎊 Parabéns! Sua candidatura foi aprovada!

Acessar contrato: {link}
```

**Rejeitada:**
```
❌ *Candidatura Reprovada!*

🎉 *{eventTitle}*
📍 {eventLocation}
📅 {eventDate}

😔 Infelizmente sua candidatura não foi selecionada desta vez.

Ver outros eventos: {link}
```

## 🔒 Segurança e Privacidade

### Validações Implementadas:
- **Formato de número**: Validação rigorosa do formato brasileiro
- **Autenticação**: Todas as rotas exigem login
- **Autorização**: Usuários só podem configurar suas próprias notificações
- **Rate limiting**: Proteção contra spam nas APIs

### Tratamento de Erros:
- **Falhas de API**: Erros de WhatsApp não interrompem funcionalidades principais
- **Logs detalhados**: Todos os erros são logados para debugging
- **Fallback gracioso**: Sistema continua funcionando mesmo com WhatsApp indisponível

## 🚀 Como Usar

### Para Prestadores:
1. Acesse **Perfil** → **Notificações WhatsApp**
2. Configure seu número no formato `+5511999999999`
3. Ative as notificações e escolha os tipos desejados
4. Clique em **Salvar Configurações**
5. Use **Testar WhatsApp** para validar

### Para Organizadores:
1. Configure WhatsApp no perfil (mesmo processo)
2. Receba notificações quando prestadores se candidatarem
3. Use botões de aprovar/rejeitar nas candidaturas
4. Sistema notifica automaticamente os prestadores

### Para Anunciantes:
1. Configure WhatsApp no perfil
2. Receba notificações de pré-reservas automaticamente
3. Gerencie reservas através dos links recebidos

## 📈 Monitoramento

### Logs Disponíveis:
- **Envios bem-sucedidos**: Log com ID da mensagem Twilio
- **Falhas de envio**: Log detalhado do erro
- **Números inválidos**: Log de tentativas com números incorretos
- **Configurações alteradas**: Log de mudanças nas preferências

### Métricas Sugeridas:
- Taxa de entrega de mensagens
- Engajamento através dos links
- Conversões (candidaturas via notificação)
- Usuários ativos com WhatsApp configurado

## 🛠️ Manutenção

### Tarefas Regulares:
- Monitorar logs de erro
- Verificar limites de uso do Twilio
- Atualizar templates conforme feedback
- Otimizar filtros de compatibilidade

### Atualizações Futuras:
- Suporte a outros provedores de WhatsApp (Z-API, etc.)
- Templates personalizáveis por usuário
- Notificações agendadas
- Integração com analytics avançado

## ✅ Critérios de Aceite Atendidos

- ✅ **Mensagem chega corretamente no WhatsApp** com templates bem formatados
- ✅ **Links funcionais** que levam diretamente às telas específicas
- ✅ **Sem duplicação** através de validações e controles
- ✅ **Ativar/desativar notificações** com interface intuitiva
- ✅ **Redirecionamento via link** para todas as situações
- ✅ **Gatilhos automáticos** em todos os 5 cenários solicitados

O sistema está completo e pronto para uso! 🎉 