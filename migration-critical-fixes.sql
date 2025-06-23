-- =====================================================
-- MIGRAÇÃO CRÍTICA - CORREÇÕES DE COLUNAS FALTANTES
-- Data: Janeiro 2025
-- Descrição: Adiciona colunas faltantes que causam erros 500
-- =====================================================

-- 1. Adicionar colunas faltantes na tabela SERVICES
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS musical_genre VARCHAR(100),
ADD COLUMN IF NOT EXISTS has_equipment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS equipment TEXT,
ADD COLUMN IF NOT EXISTS media_files JSONB DEFAULT '[]'::jsonb;

-- 2. Adicionar coluna faltante na tabela VENUES  
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS address_data JSONB DEFAULT '{}'::jsonb;

-- 3. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_services_musical_genre ON services(musical_genre);
CREATE INDEX IF NOT EXISTS idx_services_has_equipment ON services(has_equipment);
CREATE INDEX IF NOT EXISTS idx_venues_address_data ON venues USING GIN(address_data);

-- 4. Atualizar dados existentes se necessário
UPDATE services 
SET 
    musical_genre = CASE 
        WHEN category LIKE '%cantor%' OR category LIKE '%música%' 
        THEN 'Não especificado'
        ELSE NULL 
    END,
    has_equipment = FALSE,
    equipment = '',
    media_files = '[]'::jsonb
WHERE musical_genre IS NULL;

UPDATE venues 
SET address_data = '{}'::jsonb 
WHERE address_data IS NULL;

-- 5. Comentários para documentação
COMMENT ON COLUMN services.musical_genre IS 'Gênero musical para serviços de música/cantores';
COMMENT ON COLUMN services.has_equipment IS 'Indica se o prestador possui equipamentos próprios';
COMMENT ON COLUMN services.equipment IS 'Descrição dos equipamentos disponíveis';
COMMENT ON COLUMN services.media_files IS 'Array JSON com arquivos de mídia (fotos/vídeos)';
COMMENT ON COLUMN venues.address_data IS 'Dados estruturados do endereço (CEP, rua, etc)';

-- 6. Verificação pós-migração
DO $$
BEGIN
    -- Verificar se as colunas foram criadas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = 'musical_genre'
    ) THEN
        RAISE EXCEPTION 'Migração falhou: coluna musical_genre não foi criada';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'address_data'
    ) THEN
        RAISE EXCEPTION 'Migração falhou: coluna address_data não foi criada';
    END IF;

    RAISE NOTICE 'Migração executada com sucesso! Todas as colunas foram adicionadas.';
END $$; 