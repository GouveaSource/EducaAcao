USE educacao_solidaria;

-- Senhas fictícias apenas para ambiente de testes: SenhaTeste123! e SenhaVoluntario123!
INSERT IGNORE INTO usuario (nome, email, senha_hash, perfil, ativo, define_senha) VALUES
('Coordenadora de Teste', 'coordenadora@teste.local', '$2b$10$2O2HuUPR2vGhIX9fb.JoM.uvq3qsxRzQYIno9hEq92RadQwVGHg4e', 'coordenador', TRUE, FALSE),
('Voluntário de Teste', 'voluntario@teste.local', '$2b$10$6z4pxzO10FulS.aHsUz0dueyJsAltQdvycnynN6fZcB00EasGr.02', 'voluntario', TRUE, FALSE);

INSERT IGNORE INTO categoria (nome) VALUES
('Alimentos'),
('Roupas'),
('Material escolar'),
('Higiene');

INSERT IGNORE INTO item (id_categoria, nome)
SELECT c.id_categoria, v.nome
FROM categoria c
JOIN (
  SELECT 'Alimentos' categoria, 'Arroz 1kg' nome UNION ALL
  SELECT 'Alimentos', 'Feijão 1kg' UNION ALL
  SELECT 'Roupas', 'Camiseta adulta' UNION ALL
  SELECT 'Roupas', 'Cobertor' UNION ALL
  SELECT 'Material escolar', 'Caderno' UNION ALL
  SELECT 'Material escolar', 'Lápis' UNION ALL
  SELECT 'Higiene', 'Sabonete'
) v ON v.categoria = c.nome
WHERE NOT EXISTS (SELECT 1 FROM item i WHERE i.id_categoria = c.id_categoria AND i.nome = v.nome);

INSERT IGNORE INTO doador (nome, cpf, email, telefone, ativo) VALUES
('Doadora Fictícia Um', '00000000191', 'doadora1@teste.local', '(11) 90000-0001', TRUE),
('Doador Fictício Dois', '00000000272', 'doador2@teste.local', '(11) 90000-0002', TRUE);

INSERT IGNORE INTO doacao (id_doador, data_doacao, descricao)
SELECT d.id_doador, '2026-10-01', 'Doação fictícia de alimentos para testes'
FROM doador d WHERE d.email = 'doadora1@teste.local'
AND NOT EXISTS (SELECT 1 FROM doacao x WHERE x.id_doador = d.id_doador AND x.data_doacao = '2026-10-01' AND x.descricao = 'Doação fictícia de alimentos para testes');

INSERT IGNORE INTO doacao (id_doador, data_doacao, descricao)
SELECT d.id_doador, '2026-10-15', 'Doação fictícia de itens escolares para testes'
FROM doador d WHERE d.email = 'doador2@teste.local'
AND NOT EXISTS (SELECT 1 FROM doacao x WHERE x.id_doador = d.id_doador AND x.data_doacao = '2026-10-15' AND x.descricao = 'Doação fictícia de itens escolares para testes');

INSERT IGNORE INTO doacao_item (id_doacao, id_item, quantidade)
SELECT doacao.id_doacao, item.id_item, v.quantidade
FROM doacao
JOIN doador ON doador.id_doador = doacao.id_doador
JOIN (
  SELECT 'Alimentos' categoria, 'Arroz 1kg' nome, 10 quantidade UNION ALL
  SELECT 'Alimentos', 'Feijão 1kg', 8
) v ON doador.email = 'doadora1@teste.local'
JOIN categoria ON categoria.nome = v.categoria
JOIN item ON item.nome = v.nome AND item.id_categoria = categoria.id_categoria
WHERE doacao.descricao = 'Doação fictícia de alimentos para testes';

INSERT IGNORE INTO doacao_item (id_doacao, id_item, quantidade)
SELECT doacao.id_doacao, item.id_item, v.quantidade
FROM doacao
JOIN doador ON doador.id_doador = doacao.id_doador
JOIN (
  SELECT 'Material escolar' categoria, 'Caderno' nome, 20 quantidade UNION ALL
  SELECT 'Material escolar', 'Lápis', 30
) v ON doador.email = 'doador2@teste.local'
JOIN categoria ON categoria.nome = v.categoria
JOIN item ON item.nome = v.nome AND item.id_categoria = categoria.id_categoria
WHERE doacao.descricao = 'Doação fictícia de itens escolares para testes';
