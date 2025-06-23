-- Tornar o campo guest_count opcional na tabela events
ALTER TABLE events ALTER COLUMN guest_count DROP NOT NULL;

-- Atualizar registros que tenham guest_count = 0 para NULL para uma melhor semântica
UPDATE events SET guest_count = NULL WHERE guest_count = 0; 