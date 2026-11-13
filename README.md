# EducaAcao

Sistema de gestão de doações para a ONG EducaAcao.

Projeto Integrador Extensionista — Análise e Desenvolvimento de Sistemas (ADS).

## Tecnologias utilizadas

- **Frontend:** Vite+
- **Backend:** Node.js e Express
- **Banco de dados:** MySQL ou MariaDB
- **Conexão com banco:** mysql2
- **Variáveis de ambiente:** dotenv

## Requisitos

Antes de iniciar, instale:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [Vite+](https://viteplus.dev/)
- MySQL ou MariaDB

## Como instalar e executar

### 1. Clonar o repositório

```bash
git clone https://github.com/GouveaSource/EducaAcao.git
```

### 2. Entrar na pasta do projeto

```bash
cd EducaAcao
```

### 3. Instalar as dependências

```bash
vp install
```

### 4. Configurar as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configurações do seu ambiente:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=educacao
DB_PASSWORD=sua_senha
DB_NAME=educacao_solidaria
```

Ajuste os valores conforme a configuração do seu banco de dados.

**Importante:** o arquivo `.env` contém informações locais e não deve ser enviado ao repositório.

### 5. Configurar o banco de dados

Os arquivos SQL estão disponíveis na pasta `database/`.

Primeiro, execute o esquema para criar o banco e as tabelas:

```bash
mysql -u root -p < database/schema.sql
```

Opcionalmente, carregue os dados fictícios para testes:

```bash
mysql -u root -p < database/seed.sql
```

O banco utilizado pelo projeto é `educacao_solidaria`.

O usuário e a senha utilizados na execução da aplicação devem ter permissão de acesso a esse banco.

### 6. Iniciar a API

Em um terminal, execute:

```bash
vp run api
```

A API ficará disponível em:

```text
http://localhost:3000
```

Para verificar se a API e o banco estão funcionando, acesse:

```text
http://localhost:3000/api/health
```

A resposta esperada é semelhante a:

```json
{
  "status": "ok",
  "app": "EducaAcao",
  "hora": "2026-11-13T03:00:00.000Z",
  "database": "connected"
}
```

### 7. Iniciar o frontend

Em outro terminal, na pasta do projeto, execute:

```bash
vp dev
```

O frontend ficará disponível em:

```text
http://localhost:5173
```

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `vp install` | Instala as dependências |
| `vp dev` | Inicia o frontend em desenvolvimento |
| `vp run api` | Inicia a API |
| `vp build` | Gera o build de produção do frontend |
| `vp preview` | Executa uma prévia do build |

## Estrutura do projeto

```text
EducaAcao/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── server/
│   ├── db.js
│   └── index.js
├── src/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Comportamento de exclusão

A rota `DELETE /api/doadores/:id` realiza uma exclusão lógica.

Nesse processo, o campo `ativo` do doador é definido como `FALSE`. O registro permanece armazenado no banco de dados, assim como seu histórico de doações.

Essa abordagem evita a perda de informações históricas e mantém a integridade dos relacionamentos.

## Autenticação

A autenticação ainda não está implementada nesta etapa do projeto.

Os usuários cadastrados no arquivo `seed.sql` são dados fictícios destinados a uma futura implementação. Atualmente, não existem rotas protegidas por autenticação.

## Observações

- Os dados presentes no arquivo `seed.sql` são fictícios e destinados exclusivamente a testes.
- O banco de dados deve estar em execução antes de iniciar a API.
- A API e o frontend devem ser iniciados em terminais separados.
- As configurações locais devem ser feitas no arquivo `.env`, sem modificar ou compartilhar credenciais reais no repositório.