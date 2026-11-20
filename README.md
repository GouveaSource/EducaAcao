# EducaAcao

Sistema de gerenciamento de doações desenvolvido para uma organização social, com o objetivo de facilitar o cadastro de doadores, categorias, itens e o controle das doações recebidas.

Projeto desenvolvido como parte do **Projeto Integrador Extensionista (PIE II)** do curso de Análise e Desenvolvimento de Sistemas.

## Tecnologias utilizadas

- **Frontend:** React, Vite+ e Material UI.
- **Backend:** Node.js e Express.
- **Banco de dados:** MySQL / MariaDB.
- **Conexão com o banco:** mysql2.
- **Variáveis de ambiente:** dotenv.

## Requisitos

Antes de iniciar, é necessário ter instalado:

- Git.
- Node.js.
- Vite+.
- MySQL ou MariaDB.

## Instalação

Clone o repositório:

```bash
git clone https://github.com/GouveaSource/EducaAcao.git
```

Acesse a pasta do projeto:

```bash
cd EducaAcao
```

Instale as dependências:

```bash
vp install
```

Crie o arquivo de configuração a partir do exemplo:

```bash
cp .env.example .env
```

Configure as informações de conexão com o banco de dados no arquivo `.env`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=educacao
DB_PASSWORD=sua_senha
DB_NAME=educacao_solidaria
```

Ajuste os valores conforme a configuração do seu ambiente.

**Importante:** o arquivo `.env` contém informações de conexão e não deve ser compartilhado ou enviado ao repositório.

## Banco de dados

O projeto utiliza o banco de dados `educacao_solidaria`.

Para criar a estrutura do banco, execute:

```bash
mysql -u root -p < database/schema.sql
```

Para inserir os dados fictícios utilizados como exemplo:

```bash
mysql -u root -p < database/seed.sql
```

O banco deve estar em execução e o usuário configurado precisa ter as permissões necessárias.

**Atenção:** o arquivo `schema.sql` recria o banco de dados e contém um comando de exclusão da base existente. Sua execução apaga os dados anteriores. Utilize-o somente na instalação inicial ou em um ambiente de testes.

## Executando o projeto

O frontend e o backend devem ser executados em terminais separados.

**1. Iniciar a API:**

```bash
vp run api
```

A API ficará disponível em:

`http://localhost:3000`

Para verificar a conexão com o banco de dados, acesse:

`http://localhost:3000/api/health`

**2. Iniciar o frontend:**

Em outro terminal, execute:

```bash
vp dev
```

O frontend ficará disponível em:

`http://localhost:5173`

## Funcionalidades

O sistema possui as seguintes funcionalidades:

- Cadastro, consulta, edição e inativação de doadores.
- Cadastro, consulta, edição e gerenciamento de categorias.
- Cadastro, consulta, edição e gerenciamento de itens.
- Associação de itens às respectivas categorias.
- Registro de doações vinculadas aos doadores.
- Associação de vários itens e suas quantidades a uma mesma doação.
- Preservação do histórico de registros por meio de inativação, quando aplicável.

## Estrutura do projeto

```text
EducaAcao/
├── database/
│   ├── migrations/
│   ├── schema.sql
│   └── seed.sql
├── server/
│   ├── routes/
│   ├── db.js
│   ├── index.js
│   └── validation.js
├── src/
│   ├── components/
│   ├── pages/
│   └── ...
├── .env.example
├── package.json
└── README.md
```

## Observações

- Os dados disponibilizados no arquivo `seed.sql` são fictícios e utilizados para demonstração e testes.
- O banco de dados precisa estar em execução para que a API funcione corretamente.
- A API e o frontend são executados separadamente.
- A autenticação de usuários ainda não foi implementada no sistema.
