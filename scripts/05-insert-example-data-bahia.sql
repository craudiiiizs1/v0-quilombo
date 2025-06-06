-- Script opcional: Inserir dados de exemplo baseados na tabela do projeto
-- Este script cria dados fictícios para demonstração

-- Inserir alguns cursistas de exemplo para cada município
INSERT INTO cursistas (nome, email, municipio_id, escola, cargo, curso_interesse) VALUES
-- Antas (20 cursistas)
('Maria Silva Santos', 'maria.santos@antas.ba.gov.br', 1, 'Escola Municipal de Antas', 'Professora', 'Educação Quilombola'),
('João Pedro Oliveira', 'joao.oliveira@antas.ba.gov.br', 1, 'Colégio Estadual de Antas', 'Coordenador', 'Gestão Escolar'),
('Ana Carolina Lima', 'ana.lima@antas.ba.gov.br', 1, 'Escola Rural Quilombola', 'Professora', 'Alfabetização'),

-- Jeremoabo (50 cursistas - maior número)
('Carlos Eduardo Silva', 'carlos.silva@jeremoabo.ba.gov.br', 2, 'Escola Municipal Central', 'Professor', 'História Afro-brasileira'),
('Fernanda Costa Santos', 'fernanda.santos@jeremoabo.ba.gov.br', 2, 'Colégio Quilombola', 'Diretora', 'Liderança Educacional'),
('Roberto Almeida', 'roberto.almeida@jeremoabo.ba.gov.br', 2, 'Escola Comunitária', 'Professor', 'Cultura Quilombola'),

-- Cícero Dantas (25 cursistas)
('Juliana Pereira', 'juliana.pereira@cicero.ba.gov.br', 3, 'Escola Municipal Rural', 'Professora', 'Educação do Campo'),
('Marcos Antonio', 'marcos.antonio@cicero.ba.gov.br', 3, 'Colégio Estadual', 'Vice-diretor', 'Gestão Pedagógica'),

-- Fátima (20 cursistas)
('Patrícia Rodrigues', 'patricia.rodrigues@fatima.ba.gov.br', 4, 'Escola Quilombola de Fátima', 'Professora', 'Educação Inclusiva'),
('Anderson Santos', 'anderson.santos@fatima.ba.gov.br', 4, 'Centro Educacional', 'Coordenador', 'Currículo Escolar');

-- Inserir alguns formadores de exemplo
INSERT INTO formadores (nome, email, municipio_id, especialidade, formacao, certificacoes) VALUES
('Dr. Paulo Freire Junior', 'paulo.freire@ufba.br', 2, 'Educação Quilombola', 'Doutorado em Educação', 'Especialista em Pedagogia Crítica'),
('Profa. Conceição Evaristo', 'conceicao.evaristo@uneb.br', 1, 'Literatura Afro-brasileira', 'Mestrado em Letras', 'Formação em Educação Antirracista'),
('Dr. Abdias Nascimento', 'abdias.nascimento@ifbaiano.edu.br', 3, 'História da África', 'Doutorado em História', 'Pesquisador em Cultura Afro-brasileira');

-- Inserir alguns tutores de exemplo
INSERT INTO tutores (nome, email, municipio_id, area_atuacao, formacao, experiencia_anos) VALUES
('Zumbi dos Palmares Silva', 'zumbi.silva@tutoria.ba.gov.br', 1, 'História e Cultura Quilombola', 'Licenciatura em História', 8),
('Dandara Santos Oliveira', 'dandara.oliveira@tutoria.ba.gov.br', 2, 'Educação Comunitária', 'Pedagogia', 12),
('Luiza Mahin Costa', 'luiza.costa@tutoria.ba.gov.br', 3, 'Alfabetização', 'Letras', 6),
('Tereza de Benguela', 'tereza.benguela@tutoria.ba.gov.br', 4, 'Gestão Escolar', 'Administração Escolar', 10);

-- Inserir alguns supervisores de exemplo
INSERT INTO supervisores (nome, email, municipio_id, area_supervisao, formacao) VALUES
('Carolina Maria de Jesus', 'carolina.jesus@supervisao.ba.gov.br', 1, 'Educação Infantil e Fundamental', 'Pedagogia'),
('Lélia Gonzalez Santos', 'lelia.gonzalez@supervisao.ba.gov.br', 2, 'Ensino Médio', 'Licenciatura em Sociologia'),
('Beatriz Nascimento', 'beatriz.nascimento@supervisao.ba.gov.br', 3, 'Educação de Jovens e Adultos', 'História'),
('Sueli Carneiro Silva', 'sueli.carneiro@supervisao.ba.gov.br', 4, 'Educação Especial', 'Psicopedagogia');
