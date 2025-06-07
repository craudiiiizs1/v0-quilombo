-- Criar tabelas de anotações para todas as entidades

-- Anotações para Tutores
CREATE TABLE IF NOT EXISTS anotacoes_tutores (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES tutores(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  autor VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anotações para Supervisores
CREATE TABLE IF NOT EXISTS anotacoes_supervisores (
  id SERIAL PRIMARY KEY,
  supervisor_id INTEGER REFERENCES supervisores(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  autor VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anotações para Cursistas
CREATE TABLE IF NOT EXISTS anotacoes_cursistas (
  id SERIAL PRIMARY KEY,
  cursista_id INTEGER REFERENCES cursistas(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  autor VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Anotações para Formadores
CREATE TABLE IF NOT EXISTS anotacoes_formadores (
  id SERIAL PRIMARY KEY,
  formador_id INTEGER REFERENCES formadores(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  conteudo TEXT NOT NULL,
  autor VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_anotacoes_tutor_id ON anotacoes_tutores(tutor_id);
CREATE INDEX IF NOT EXISTS idx_anotacoes_supervisor_id ON anotacoes_supervisores(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_anotacoes_cursista_id ON anotacoes_cursistas(cursista_id);
CREATE INDEX IF NOT EXISTS idx_anotacoes_formador_id ON anotacoes_formadores(formador_id);

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_anotacoes_tutores_updated_at 
    BEFORE UPDATE ON anotacoes_tutores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anotacoes_supervisores_updated_at 
    BEFORE UPDATE ON anotacoes_supervisores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anotacoes_cursistas_updated_at 
    BEFORE UPDATE ON anotacoes_cursistas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anotacoes_formadores_updated_at 
    BEFORE UPDATE ON anotacoes_formadores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
