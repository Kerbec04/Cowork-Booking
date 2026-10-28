# 🏢 Cowork Booking

[English](README.md) · **Português**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)]()
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

Sistema de reservas para um coworking fictício: clientes reservam salas em tempo real, e a equipe
gerencia espaços, reservas e pagamentos por um painel administrativo.

![Listagem de espaços](docs/screenshots/espacos.jpg)

## 🚀 Funcionalidades

- **Cadastro e login** por e-mail e senha ou Google, com consentimento LGPD explícito no cadastro
- **Reserva em tempo real** por espaço, data e horário, com cálculo automático de preço e desconto
  de boas-vindas na primeira reserva
- **Prevenção de overbooking:** duas pessoas nunca reservam o mesmo horário, porque a checagem de
  conflito roda dentro de uma transação `SERIALIZABLE` do Postgres
- **Minhas reservas:** histórico do cliente, com cancelamento livre até 24 horas antes do início
- **Painel administrativo:** CRUD de espaços, confirmação de pagamento presencial e gestão de todas
  as reservas

<img src="docs/screenshots/reserva.jpg" width="49%" alt="Tela de reserva" />
<img src="docs/screenshots/admin.jpg" width="49%" alt="Painel administrativo, lista de reservas" />

## 🧠 Destaques de Arquitetura

- **Backend e frontend separados por pasta** num único app Next.js: `src/app/` e `src/components/`
  só cuidam de interface; toda regra de negócio, autenticação e acesso a dados fica em
  `src/backend/` (`services/`, `actions/`, `validations/`, `db/`). O frontend nunca acessa o banco
  diretamente, só via Server Actions.
- **Erros nunca vazam para o usuário:** exceções não tratadas são capturadas, registradas no
  servidor e viram uma mensagem genérica; só mensagens de negócio explícitas (`SafeActionError`)
  chegam à tela.
- **Desconto da primeira reserva** recalculado dentro da mesma transação que cria a reserva, então
  cliques simultâneos não concedem o desconto duas vezes.
- **Validação em tudo:** toda entrada de Server Action passa por um schema Zod.

## 🛠️ Stack Técnica

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilo | Tailwind CSS v4 |
| Banco de dados | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`) |
| Autenticação | NextAuth.js v5 (Auth.js): credenciais com bcrypt + Google OAuth |
| Validação | Zod |
| E-mail | Resend |
| Hospedagem | Vercel (app) + Neon (Postgres gerenciado) |

## ⚙️ Como Rodar Localmente

```bash
cp .env.example .env       # preencha os valores
npm install
npx prisma dev -d          # sobe um Postgres local gerenciado pelo Prisma (uma vez só)
npx prisma migrate dev     # aplica o schema
npx prisma db seed         # cria o admin e espaços de exemplo
npm run dev                # http://localhost:3000
```

Login de admin criado pelo seed: `admin@example.com` / `admin123` (só para uso local).

## 📂 Estrutura do Projeto

```text
├── prisma/               # schema, migrações e seed
└── src/
    ├── app/              # páginas (App Router): espaços, reservas, perfil, admin
    ├── components/       # componentes de interface e formulários
    └── backend/
        ├── actions/      # Server Actions (única porta de entrada a partir da interface)
        ├── services/     # regras de negócio (reservas, espaços, e-mail)
        ├── validations/  # schemas Zod
        ├── auth/         # configuração do Auth.js e guards
        └── db/           # cliente Prisma
```

## 🗺️ Próximos Passos

- Pacotes de horas avulsos e notificações via WhatsApp
- Relatórios de ocupação e receita no painel admin
- Upload real de fotos dos espaços e 2FA para administradores
- Gateway de pagamento online (Pix e cartão)

## 📄 Licença

[MIT](LICENSE)
