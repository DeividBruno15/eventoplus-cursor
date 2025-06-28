-- Migração para adicionar campos de configuração WhatsApp na tabela users
-- Executar antes de testar as funcionalidades de notificação

-- Adicionar campos de WhatsApp na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_notifications_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_new_event_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_new_chat_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_venue_reservation_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_application_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_status_notifications BOOLEAN DEFAULT TRUE;

-- Verificar se as colunas foram criadas
\d users;

-- Mensagem de confirmação
SELECT 'Migração WhatsApp concluída com sucesso!' as status; 