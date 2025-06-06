-- Deletar municípios de exemplo
-- ATENÇÃO: Este script irá remover todos os municípios existentes e dados relacionados

-- Deletar dados relacionados primeiro (devido às foreign keys)
DELETE FROM reunioes;
DELETE FROM tutores;
DELETE FROM supervisores;
DELETE FROM cursistas;
DELETE FROM formadores;

-- Deletar todos os municípios existentes
DELETE FROM municipios;

-- Resetar a sequência do ID para começar do 1 novamente
ALTER SEQUENCE municipios_id_seq RESTART WITH 1;
