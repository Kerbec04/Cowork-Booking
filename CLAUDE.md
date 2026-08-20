# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre este projeto

App fullstack de reservas e agendamento para um coworking fictício. Clientes reservam espaços
(salas de reunião, sala de podcast, salas de atendimento individual, estações de trabalho); a
equipe do coworking gerencia espaços, reservas e clientes por um painel admin.

**Fase 0 (setup) e o MVP (Fase 1) estão concluídos e testados de ponta a ponta em navegador**
(cadastro, login, listagem, reserva com prevenção de overbooking, cancelamento, painel admin). O
restante deste documento é o brief de produto original — use-o para entender *por que* as coisas
são como são (personas, regras de negócio, LGPD, roadmap), não como uma lista de tarefas pendentes.

## Comandos

```bash
npm run dev              # dev server (Next.js + Turbopack), http://localhost:3000
npm run build             # build de produção
npm run lint              # ESLint (eslint-config-next)
npx tsc --noEmit           # typecheck

npx prisma format          # formata prisma/schema.prisma
npx prisma validate        # valida o schema
npx prisma generate        # regenera o client em src/generated/prisma (rodar após editar o schema)
npx prisma migrate dev      # cria/aplica migration (requer um Postgres — ver abaixo)
npx prisma db seed         # popula 1 admin + espaços de exemplo (prisma/seed.ts)
npx prisma studio          # explorador de dados
```

Não existe suíte de testes ainda — nenhum test runner foi configurado.

### Banco de dados local

Use o Postgres gerenciado pelo próprio Prisma para desenvolvimento local — não precisa de Docker
nem de instalar Postgres:

```bash
npx prisma dev -d          # sobe um Postgres local em background (uma vez só; fica rodando)
npx prisma dev ls          # ver se está rodando / pegar a connection string
npx prisma dev stop        # parar quando não precisar mais
```

O `.env` já aponta para essa instância local por padrão. Para produção, troque `DATABASE_URL` e
`DIRECT_URL` pelas connection strings do Neon (decisão tomada: hospedagem terceirizada via Vercel +
Neon) — veja `.env.example`. `DIRECT_URL` é a conexão direta/unpooled, usada só pela CLI do Prisma
(`prisma migrate`, `prisma db seed`); o app em runtime usa sempre `DATABASE_URL`.

## Arquitetura

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, com Prisma 7 + PostgreSQL e NextAuth.js v5
(Auth.js). Um único app Next.js, mas com **backend e frontend claramente separados por pasta**
(decisão explícita do usuário — não é um projeto de backend/frontend desacoplados com dois
deploys):

```
src/
  app/                    # FRONTEND — rotas, layouts, páginas (App Router)
    espacos/              # listagem + detalhe/reserva (pública)
    reservas/             # "Minhas reservas" (protegida)
    admin/                # painel admin (protegida, tipo === ADMIN)
    login/, cadastro/
    api/auth/[...nextauth]/route.ts   # exigido pelo Next.js, só delega a backend/auth
  components/              # FRONTEND — componentes de UI (Server e Client Components)
    admin/                  # componentes exclusivos do painel admin
    forms/                  # LoginForm, SignupForm

  backend/                 # BACKEND — tudo que não é UI
    auth/
      config.ts             # config do NextAuth (providers, callbacks)
      index.ts               # instância NextAuth (handlers, auth, signIn, signOut)
      guards.ts              # requireUser/requireAdmin (actions) e ...Page (páginas, redireciona)
    services/                # regras de negócio puras (spaces.ts, bookings.ts, email.ts)
    actions/                 # Server Actions — fronteira que o frontend chama (auth, bookings, admin)
    validations/             # schemas Zod (nunca confiar no frontend)
    db/prisma.ts             # singleton do PrismaClient (driver adapter pg)
    lib/                     # date.ts, constants.ts — utilitários puros
    types/next-auth.d.ts     # augmentation do tipo Session (user.id, user.tipo)

  generated/prisma/         # client Prisma gerado — NÃO editar, NÃO commitar (gitignored)
prisma/
  schema.prisma             # modelo de dados completo (ver "Modelo de dados" abaixo)
  seed.ts                    # admin + espaços de exemplo
```

Regra de dependência: `app/` e `components/` podem importar de `backend/`; o inverso nunca
acontece. Regras de negócio (verificação de disponibilidade, cálculo de preço, política de
cancelamento) vivem em `backend/services/`, nunca em `app/page.tsx` ou em componentes.
Mutações do frontend passam por `backend/actions/` (Server Actions), não por API routes ad hoc —
a única API route é a que o NextAuth exige.

### Pontos específicos da stack (Prisma 7 / Next 16 / NextAuth v5)

Este projeto usa versões recentes com mudanças breaking em relação ao que a maioria dos modelos
conhece por treinamento — antes de mexer em Prisma ou Next.js, confira a documentação oficial de
cada um (CLI, client API, driver adapters, config v7 etc.) em vez de confiar só no treinamento.

- **Prisma 7 não usa mais `url` no `datasource` do schema.** A conexão fica em `prisma.config.ts`
  (usado pela CLI, aponta para `DIRECT_URL`) e é passada explicitamente ao `PrismaClient` via
  driver adapter no código (`src/backend/db/prisma.ts`).
- **Driver adapter: `@prisma/adapter-pg` (não `@prisma/adapter-neon`).** O adapter Neon exige um
  proxy WebSocket (só funciona contra endpoints Neon reais, não contra Postgres local). Como este
  app roda como Serverless Functions Node.js normais na Vercel (não edge runtime), `pg` via
  protocolo Postgres padrão funciona igual contra Postgres local e contra a connection string
  pooled do Neon — mais simples e testável localmente. Só reconsidere o adapter Neon se o app for
  rodar em edge runtime.
- **RSC gotcha**: `Decimal` do Prisma (`precoHora`, `valorTotal` etc.) não pode ser passado direto
  de Server Component para Client Component — dá erro em runtime ("Only plain objects..."). Sempre
  converta com `Number(...)` antes de passar como prop (ver `SpaceForm`/`SpaceFormValues` como
  referência).
- **NextAuth v5**: `AUTH_SECRET`/`NEXTAUTH_SECRET` e `AUTH_URL`/`NEXTAUTH_URL` são intercambiáveis
  (v5 aceita os nomes antigos por compatibilidade). Config em `src/backend/auth/config.ts`,
  providers: Google OAuth + Credentials (e-mail/senha com bcrypt). `session.user.tipo` (CLIENTE/
  ADMIN) é injetado via callback `jwt`/`session` para os guards de página não precisarem de round
  trip ao banco.
- **Aviso conhecido, não é bug seu**: o driver `pg` emite um `DeprecationWarning` ("Calling
  client.query() when the client is already executing a query") durante transações interativas do
  Prisma 7 com adapter. É um detalhe interno do compilador de queries do Prisma 7 com driver
  adapters — não vem de código deste projeto (nunca chamamos `pg` diretamente) e não afetou a
  correção dos testes manuais (overbooking, confirmação, cancelamento todos verificados corretos).

### Identidade visual

Paleta de exemplo, definida como tokens Tailwind v4 em `src/app/globals.css` (troque pelos tokens
da sua própria marca):

| Uso | Cor | Hex |
|---|---|---|
| Primária (títulos, ações principais) | vinho | `#690000` |
| Secundária (destaques, CTAs) | laranja | `#FF761F` |
| Acento | verde oliva | `#586B4C` / `#6F885F` |
| Fundo | creme | `#F5EFE9` |
| Fundo alternativo | bege | `#E8D8C8` |
| Texto | marrom escuro | `#3D2B23` |

Tipografia: Montserrat (`--font-heading`, títulos) + Inter (`--font-sans`, corpo), carregadas via
`next/font/google` em `src/app/layout.tsx`. Logo ainda não incorporado — pedir ao usuário.

### Modelo de dados

Implementado em `prisma/schema.prisma`: `User`/`Account`/`Session`/`VerificationToken` (auth),
`Space`, `Availability` (horário recorrente semanal), `SpaceBlock` (bloqueios excepcionais),
`Booking`, `Payment`, `CreditPackage`, `AuditLog`. Nomes de campo em português (`nome`, `precoHora`,
`inicio`, `fim` etc.) para espelhar o domínio do negócio; nomes de tabela em `snake_case` via
`@@map`.

**Prevenção de overbooking**: implementada em `backend/services/bookings.ts::createBooking` — a
checagem de conflito roda dentro de `prisma.$transaction` com isolation level `Serializable`, e foi
verificada manualmente (tentar reservar um horário que sobrepõe uma reserva existente retorna erro
"Esse horário acabou de ser reservado..."). O índice em `Booking(spaceId, inicio, fim)` só acelera
essa consulta. Se o volume de reservas crescer muito, considerar reforçar com uma constraint
`EXCLUDE` do Postgres (`btree_gist`) — não foi necessário para o MVP.

**Pagamento é presencial na recepção (decisão de produto, não online no MVP)** — diferente do que a
seção "Escopo funcional" abaixo sugere para o MVP original. O model `Payment` guarda o registro
(`gateway` default `PRESENCIAL`), mas não há integração de gateway ainda; os campos existem para
permitir adicionar Mercado Pago/Stripe depois sem migration. Não é necessário emitir nota fiscal
automaticamente (logo, não é necessário coletar CPF/CNPJ no MVP).

**Preços e desconto de primeira reserva**: `Space.precoHora` é o preço cheio. O "30% OFF" usado nos
dados de exemplo (`prisma/seed.ts`) é um **desconto de boas-vindas na primeira reserva não
cancelada de cada cliente** (`Space.descontoPrimeiraReserva`, % configurável por espaço,
elegibilidade global — vale para qualquer espaço, não por sala), não uma promoção corrente. A
elegibilidade é calculada em `backend/services/bookings.ts::isElegivelParaDescontoPrimeiraReserva`
e **reavaliada dentro da transação serializable** de `createBooking` (evita dar o desconto duas
vezes em cliques concorrentes). `Booking.descontoAplicado` guarda o % efetivamente usado — histórico
não muda se o desconto do espaço for alterado depois. Helper puro de cálculo:
`backend/lib/pricing.ts::precoComDesconto`.

**Addon de podcast (sala de reunião grande)**: em vez de duas salas separadas ("com" e "sem"
podcast), é um único `Space` com `possuiAddonPodcast` + `precoAddonPodcastHora`
(preço cheio do addon, sujeito ao mesmo desconto de primeira reserva). `Booking.podcastIncluido`
guarda se foi selecionado.

**Erros que chegam à tela do usuário**: só mensagens de `backend/lib/errors.ts::SafeActionError`
(lançadas explicitamente nos services, sempre em português e amigáveis). Qualquer outro erro
(Prisma, rede, bug) é capturado por `toActionErrorMessage()` no catch de cada Server Action —
loga no servidor com `console.error` e retorna uma mensagem genérica. **Nunca** faça
`error instanceof Error ? error.message : ...` direto numa action — isso já vazou um erro interno
do Prisma pra tela uma vez (ver histórico).

---

## Personas

| Persona | Necessidade principal |
| :---- | :---- |
| **Cliente avulso** | Reservar uma sala por 1-2h, pagar na hora, sem burocracia |
| **Cliente com pacote de horas** | Usar horas de um pacote comprado avulso, ver saldo de horas restantes |
| **Recepção/Admin** | Visão geral do dia, check-in manual, resolver conflitos |
| **Dono do negócio** | Relatórios de ocupação, receita, espaços mais usados |

## Escopo funcional

### MVP (fase 1) — ✅ concluído e testado em navegador

- Cadastro/login de cliente (e-mail+senha e Google) com consentimento LGPD no cadastro
- Listagem de espaços com fotos (URL simples — sem upload real, ver decisão abaixo), descrição,
  capacidade e preço/hora
- Grade de disponibilidade por espaço, em blocos fixos de 1h (decisão tomada — ver abaixo)
- Reserva com seleção de data/hora início + duração, pagamento **presencial** (ver "Modelo de dados")
- "Minhas Reservas" (ver, cancelar — bloqueado a menos de 24h do início, decisão tomada)
- Painel admin: CRUD de espaços, tabela com todas as reservas (não é uma grade de calendário visual
  — simplificação deliberada para o MVP), confirmar pagamento / cancelar reservas manualmente
- Overbooking do mesmo espaço no mesmo horário: impedido via transação serializable

**Fora do escopo do MVP, propositalmente**: confirmação por e-mail acontece só quando o admin
confirma o pagamento (não na criação da reserva — ver "Fluxo de reserva"), e requer
`RESEND_API_KEY` configurado (sem isso, `backend/services/email.ts` só loga um aviso e segue,
não quebra o fluxo). Upload real de fotos (R2/S3), rate limiting, 2FA de admin e página de
Política de Privacidade continuam pendentes — ver checklist de segurança abaixo.

**Decisões tomadas durante o MVP (não perguntar de novo):**
- Blocos de reserva de 1h fixo (não 30min, não horário livre).
- Fotos de espaço: campo de URL simples no admin, sem upload de arquivo.
- Cancelamento: livre até 24h antes do início; depois disso, bloqueado (mensagem pede contato com a
  recepção).
- Primeiro admin: via `prisma/seed.ts` (não há fluxo de "virar admin" self-service).
- Desconto de 30% é de primeira reserva (uma vez por cliente, qualquer espaço), não uma promoção
  permanente — e uma reserva cancelada não conta como "já usou o desconto".
- A sala de reunião grande é um único espaço com addon opcional de podcast, não duas salas
  separadas.
- Os 5 espaços do seed (`prisma/seed.ts`) são dados de exemplo, editáveis livremente.

### Fase 2

- Pacotes de horas avulsos (créditos comprados em bloco, sem recorrência automática)
- Notificações via WhatsApp (lembrete 1h antes, confirmação)
- Check-in via QR code na chegada
- Avaliação pós-uso
- Relatórios de ocupação/receita (dashboard admin)
- Política de cancelamento configurável (ex: cancelamento grátis até 24h antes)

### Fase 3 (futuro)

- App mobile nativo (ou PWA)
- Controle de acesso físico integrado (fechadura inteligente)
- Programa de indicação/fidelidade
- Multi-unidade (caso o coworking abra outras filiais)

Não há suporte a assinatura/recorrência mensal — reservas são avulsas ou via pacote de horas
comprado uma vez.

## Segurança e proteção de dados (LGPD)

O app lida com dados pessoais de clientes brasileiros — está sob a LGPD. Regras a seguir em toda
implementação, não só no que já existe:

### Princípios gerais

- Nunca armazenar dados de cartão de crédito diretamente — se um gateway online for adicionado no
  futuro, usar tokenização (o app nunca vê o número do cartão). Hoje o pagamento é presencial, então
  isso ainda não se aplica, mas vale para qualquer integração futura.
- Senha: hash com bcrypt (`bcryptjs`, já em uso em `src/server/auth/config.ts`), nunca texto plano.
- HTTPS obrigatório em produção.
- Segredos sempre via variável de ambiente (`.env`, nunca commitado — já gitignored). `.env.example`
  documenta todas as chaves necessárias.
- Princípio do menor privilégio: admin só acessa o que precisa; cliente não acessa dados de outros
  clientes.

### LGPD específico

- Consentimento explícito no cadastro (checkbox, não pré-marcado), com registro de data/hora —
  campo `User.lgpdConsentAt` já existe no schema; o fluxo de cadastro deve preenchê-lo.
- Política de Privacidade e Termos de Uso acessíveis e versionados (ainda não escritos).
- Direito do titular: endpoints/fluxo para o cliente exportar seus dados e solicitar exclusão da
  conta (direito ao esquecimento) — ainda não implementado.
- Minimização de dados: coletar só o necessário (nome, e-mail, telefone). Evitar CPF — não é
  necessário coletar (nota fiscal não é automática).
- Retenção de dados: definir por quanto tempo manter dados de reservas antigas/canceladas, e
  apagar/anonimizar depois — política ainda não definida.
- Log de auditoria de ações sensíveis — model `AuditLog` já existe no schema; ainda não é
  populado por nenhum fluxo.

### Checklist técnico

- Validação de entrada em todas as rotas com Zod (`src/lib/validations/`), nunca confiar no
  frontend.
- Proteção contra CSRF, XSS (sanitização de inputs), SQL Injection (uso do Prisma, que parametriza
  queries automaticamente).
- Rate limiting em rotas de login e de reserva — ainda não implementado.
- Autenticação de admin com 2FA — recomendado, ainda não implementado.
- Sessões com expiração e cookies httpOnly/secure — padrão do NextAuth v5 com strategy `jwt`.
- Backups automáticos diários do banco (configurar no provedor — Neon) com teste periódico de
  restauração.
- Ambiente de staging separado de produção.
- Dependências com scan de vulnerabilidades (`npm audit`, Dependabot). Nota: há uma vulnerabilidade
  high conhecida em `deepmerge-ts` (dependência de dev do Prisma CLI, exposta só via
  `prisma.config.ts` malicioso) sem fix sem downgrade breaking do Prisma — ver `npm audit`.
- Nunca expor stack traces de erro para o usuário final.
- Restringir CORS ao domínio oficial do app.

## Fluxos principais

**Fluxo de reserva:**

1. Cliente escolhe espaço → escolhe data/hora → sistema verifica disponibilidade em tempo real
   (transação de banco para evitar double-booking).
2. Sistema calcula valor → cliente confirma a reserva → recepção cobra presencialmente (dinheiro,
   cartão ou Pix na maquininha) → admin marca o pagamento como confirmado no painel.
3. E-mail de confirmação disparado quando a reserva é confirmada.

**Fluxo de cancelamento:**

1. Cliente acessa "Minhas Reservas" → cancela.
2. Sistema aplica política de cancelamento (a definir — ex: aviso mínimo de X horas antes).
3. Espaço volta a ficar disponível no calendário.

## Roadmap

| Fase | Entregas | Status |
| :---- | :---- | :---- |
| **0 — Setup** | Next.js + TS + Tailwind, Prisma + schema completo, NextAuth, `.env.example`, estrutura de pastas, identidade visual de exemplo, repositório git | ✅ concluído |
| **1 — MVP** | Cadastro, listagem de espaços, reserva, pagamento presencial, painel admin básico | próximo |
| **2 — Robustez** | Pacotes de horas avulsos, WhatsApp, relatórios, cancelamento/reembolso | — |
| **3 — Escala** | PWA/app, controle de acesso, multi-unidade | — |

## Decisões já tomadas (não perguntar de novo)

- **Pagamento**: presencial na recepção. Sem gateway online no MVP.
- **Nota fiscal**: não emitida automaticamente. Não coletar CPF/CNPJ.
- **Hospedagem**: terceirizada — Vercel (app) + Neon (Postgres gerenciado).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
