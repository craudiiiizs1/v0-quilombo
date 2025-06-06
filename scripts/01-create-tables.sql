-- Criar tabela de municípios
CREATE TABLE IF NOT EXISTS municipios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  estado VARCHAR(2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de reuniões
CREATE TABLE IF NOT EXISTS reunioes (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  data_reuniao TIMESTAMP NOT NULL,
  municipio_id INTEGER REFERENCES municipios(id),
  secretario_nome VARCHAR(255) NOT NULL,
  secretario_email VARCHAR(255),
  secretario_telefone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'agendada',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de tutores
CREATE TABLE IF NOT EXISTS tutores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  municipio_id INTEGER REFERENCES municipios(id),
  area_atuacao VARCHAR(255),
  formacao VARCHAR(255),
  experiencia_anos INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de supervisores
CREATE TABLE IF NOT EXISTS supervisores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  municipio_id INTEGER REFERENCES municipios(id),
  area_supervisao VARCHAR(255),
  formacao VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de cursistas
CREATE TABLE IF NOT EXISTS cursistas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  municipio_id INTEGER REFERENCES municipios(id),
  escola VARCHAR(255),
  cargo VARCHAR(255),
  curso_interesse VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de formadores
CREATE TABLE IF NOT EXISTS formadores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  municipio_id INTEGER REFERENCES municipios(id),
  especialidade VARCHAR(255),
  formacao VARCHAR(255),
  certificacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
