-- Criar tabela de anotações das reuniões
CREATE TABLE IF NOT EXISTS anotacoes_reunioes (
  id SERIAL PRIMARY KEY,
  reuniao_id INTEGER REFERENCES reunioes(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  autor VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_anotacoes_reuniao_id ON anotacoes_reunioes(reuniao_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_anotacoes_reunioes_updated_at 
    BEFORE UPDATE ON anotacoes_reunioes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
