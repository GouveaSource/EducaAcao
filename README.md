# EducaAcao

Sistema de gestão de doações para a ONG EducaAcao.

Projeto Integrador Extensionista · Análise e Desenvolvimento de Sistemas (ADS).

## Requisitos

- Git
- Vite+ (comando `vp`): https://viteplus.dev

## Como rodar

1. Clone o repositório:
   ```bash
   git clone URL_DO_PROJETO
   ```

2. Entre na pasta do projeto:
   ```bash
   cd EducaAcao
   ```

3. Instale as dependências:
   ```bash
   vp install
   ```

4. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

5. Em um primeiro terminal, inicie a API:
   ```bash
   vp run api
   ```

6. Em um segundo terminal, inicie o frontend:
   ```bash
   vp dev
   ```

7. Abra no navegador:
   http://localhost:5173
