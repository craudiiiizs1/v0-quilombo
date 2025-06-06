-- Inserir municípios da Bahia conforme dados do projeto
INSERT INTO municipios (nome, estado) VALUES
('Antas', 'BA'),
('Jeremoabo', 'BA'),
('Cícero Dantas', 'BA'),
('Fátima', 'BA'),
('Banzaê', 'BA'),
('Abaré', 'BA'),
('Curaçá', 'BA'),
('Novo Triunfo', 'BA');

-- Verificar se os municípios foram inseridos corretamente
SELECT id, nome, estado FROM municipios ORDER BY nome;
