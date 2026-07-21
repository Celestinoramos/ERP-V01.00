# Auditoria Técnica — Plataforma de Reconstrução Contabilística (MVP)

**Projeto:** Kwanza · TEST00-ERP  
**Data:** 21 de Julho de 2026  
**Stack:** React 19 · TanStack Start · Tailwind CSS v4 · TypeScript · Vite  
**Estado:** Frontend-only SPA com dados mock (sem backend)

---

## Resumo Executivo

| Estado | Quantidade | Percentual |
|--------|-----------|------------|
| ✅ Feito | 28 | 48% |
| ⚠️ Parcial | 22 | 38% |
| ❌ Não feito | 8 | 14% |
| ⚠️ Violação de escopo | 5 | — |

**Nível de integração: ~48% funcional / ~38% parcial / ~14% por implementar**

O projeto tem uma UI completa e bem desenhada para o fluxo contabilístico, mas toda a lógica de negócio (motor de conciliação, OCR, parsing, encriptação, autenticação) é simulada com dados estáticos. Não existe backend, base de dados, nem testes.

---

## 1. Visão do Sistema

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 1.1 | Plataforma para escritórios de contabilidade | ✅ Feito | `__root.tsx:88-98` — Meta: "Plataforma para upload, OCR, conciliação assistida" |
| 1.2 | Reconstrução automática a partir de extratos, faturas, recibos | ✅ Feito (UI) | `_app.faturacao.tsx:37,65-78` — Upload com PDF, Excel, CSV, JPG, PNG |
| 1.3 | Sistema apoia, não substitui contabilista | ✅ Feito | `_app.faturacao.tsx:144` — "Validação humana obrigatória — Sem força automática" |

---

## 2. Perfis de Utilizador

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 2.1 | Contabilista (principal utilizador) | ✅ Feito | `fixtures.ts:63` — `perfil: "contabilista"`, cargo "Contabilista Certificado" |
| 2.2 | Assistente contabilístico | ⚠️ Parcial | Perfil "operador" existe (`schemas.ts:28`) mas não é o mesmo conceito. "Assistente" aparece como string em `fixtures.ts:644` |
| 2.3 | Admin do escritório (multi-clientes) | ✅ Feito | `fixtures.ts:51` — `perfil: "admin"`. `_app.settings.tsx:116-161` — Lista de utilizadores |

**Tipos de perfil definidos:** `admin`, `contabilista`, `operador`, `gestor`, `auditor`  
**Falta:** `assistente_contabilistico`

---

## 3. Funcionalidades Essenciais (MVP)

### 3.1 Upload de Documentos

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 3.1.1 | Upload extratos (PDF, Excel, CSV) | ✅ Feito | `_app.faturacao.tsx:62,71,75` — Badge + input accept + checklist |
| 3.1.2 | Upload faturas (PDF, imagem JPG/PNG) | ✅ Feito | `_app.faturacao.tsx:71,76` — Input aceita `.jpg,.jpeg,.png` |
| 3.1.3 | Upload recibos | ✅ Feito | `_app.faturacao.tsx:68-69` — "Extratos bancários, faturas e recibos" |
| 3.1.4 | Bulk upload | ✅ Feito | `_app.faturacao.tsx:71` — `<input multiple type="file">` |
| 3.1.5 | Organização por cliente e período | ✅ Feito | `_app.faturacao.tsx:82-99` + `fixtures.ts:482-509` (`UploadBatch` com `clienteId`, `periodo`) |

### 3.2 Processamento de Dados (IA + Parsing)

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 3.2.1 | Auto-leitura extratos bancários | ⚠️ Só UI | `_app.faturacao.tsx:141` — Texto descritivo. Sem parser real |
| 3.2.2 | Extração: data, valor, descrição, tipo movimento | ⚠️ Só schema | `schemas.ts:184-204` — `BankMovementSchema` com todos os campos. Sem lógica de extração |
| 3.2.3 | OCR para faturas/recibos | ⚠️ Só UI | `_app.faturacao.tsx:142` — "OCR de faturas e recibos". Sem engine OCR |
| 3.2.4 | Normalização de dados | ⚠️ Só schema | `schemas.ts:1-282` — Modelo único. Sem código de transformação |

### 3.3 Motor de Conciliação (Core)

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 3.3.1 | Matching auto movimentos ↔ faturas | ⚠️ Mock | `fixtures.ts:594-622` — 3 sugestões pré-computadas. Sem algoritmo |
| 3.3.2 | Regras: valor aproximado, data próxima, fornecedor | ⚠️ Só schema | `schemas.ts:210` — `ruleMatch: z.enum(["valor","data","fornecedor","recorrencia","manual"])` |
| 3.3.3 | Sugestão de correspondência | ✅ Feito (UI) | `_app.faturacao.$id.tsx:91-124` — Rationale, score, botões aprovar/rejeitar |
| 3.3.4 | Aprovação manual do contabilista | ✅ Feito (UI) | `_app.faturacao.$id.tsx:118` — "Aprovar", "Marcar para rateio" |

### 3.4 Sistema de Evidência Contabilística

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 3.4.1 | Estado: Verde / Amarelo / Vermelho | ✅ Feito | `schemas.ts:198,229` — `evidenceState: z.enum(["verde","amarelo","vermelho"])` |
| 3.4.2 | Nível de confiança (%) | ✅ Feito | `schemas.ts:197,230` — `confidence: z.number().min(0).max(100)` |
| 3.4.3 | Histórico de alterações | ✅ Feito | `schemas.ts:217-232` — `EvidenceHistoryEntrySchema` com user, action, note, timestamp |

### 3.5 Deteção de Lacunas

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 3.5.1 | Movimentos sem documentos | ✅ Feito | `schemas.ts:240` — `tipo: "movimento_sem_documento"` |
| 3.5.2 | Documentos sem ligação ao extrato | ✅ Feito | `schemas.ts:240` — `tipo: "documento_sem_movimento"` |
| 3.5.3 | Lista de inconsistências por cliente | ✅ Feito | `_app.clientes.tsx:70,107` — Badge com contagem de lacunas por cliente |

**Tipos de lacuna suportados:** `movimento_sem_documento`, `documento_sem_movimento`, `inconsistencia_valor`, `data_inconsistente`

### 3.6 Painel do Contabilista (Dashboard)

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 3.6.1 | Lista de clientes | ✅ Feito | `_app.dashboard.tsx:39-42` + `_app.clientes.tsx:20` |
| 3.6.2 | Status de organização por cliente (%) | ✅ Feito | `api.ts:186-189` — `organizacaoPorCliente` com percentagens |
| 3.6.3 | Alertas críticos | ✅ Feito | `api.ts:190-194` — `alertasCriticos` array |
| 3.6.4 | Risco fiscal por cliente | ✅ Feito | `api.ts:181-185` — `riscoFiscalPorCliente` com alto/médio/baixo |

### 3.7 Linha do Tempo Financeira

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 3.7.1 | Visualização cronológica entradas/saídas/docs | ✅ Feito | `_app.contabilidade.tsx:115-138` — Timeline com ícones coloridos |
| 3.7.2 | Filtro por cliente e período | ⚠️ Parcial | Schema tem `clienteId`/`clienteNome` mas sem controles UI de filtro |

---

## 4. Motor de Inteligência (IA)

### 4.1 Regras Obligatórias da IA

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 4.1.1 | Nunca inventar dados | ✅ Feito | `_app.faturacao.tsx:144` — "Validação humana obrigatória" |
| 4.1.2 | Sempre indicar nível de confiança | ✅ Feito | `schemas.ts:197,230,266` — Campos de confiança em 3 entidades |
| 4.1.3 | Sempre sinalizar falta de documentação | ✅ Feito | `schemas.ts:240` — Tipos de lacuna documental |
| 4.1.4 | Sempre permitir validação humana | ✅ Feito | `schemas.ts:213,268` — `humanApproved` / `humanValidated` |

### 4.2 Funcionalidades IA

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 4.2.1 | Sugestão categorização contabilística | ✅ Mock | `schemas.ts:194-195` — `categoriaSugerida` + `categoriaConfidence` |
| 4.2.2 | Sugestão fornecedor baseado em histórico | ✅ Mock | `schemas.ts:193` — `fornecedorSugerido` |
| 4.2.3 | Agrupamento automático padrões de despesas | ⚠️ Parcial | `schemas.ts:202` — Flag `recurrence`. Sem UI de agrupamento |
| 4.2.4 | Identificação de transações recorrentes | ✅ Mock | `schemas.ts:202` — `recurrence: z.boolean()` |
| 4.2.5 | Classificação probabilística | ✅ Feito | `schemas.ts:197,211` — Scoring em movimentos e sugestões |

---

## 5. Base de Dados

| # | Entidade | Estado | Schema | Fixtures |
|---|----------|--------|--------|----------|
| 5.1 | Clientes | ✅ | `schemas.ts:34-47` — `ClienteSchema` | 5 clientes |
| 5.2 | Empresas (Tenants) | ✅ | `schemas.ts:8-21` — `TenantSchema` | 2 empresas |
| 5.3 | Movimentos bancários | ✅ | `schemas.ts:184-204` — `BankMovementSchema` | 4 movimentos |
| 5.4 | Documentos | ✅ | `schemas.ts:87-113` — `DocumentoSchema` | 5 documentos |
| 5.5 | Fornecedores | ✅ | `schemas.ts:49-52` — `FornecedorSchema` | 3 fornecedores |
| 5.6 | Categorias contabilísticas | ⚠️ Parcial | `ContaSchema` existe (`schemas.ts:131-138`). Sem FK em movimentos |
| 5.7 | Relação movimento ↔ documento | ✅ | `schemas.ts:199-200,209,231` — Arrays `documentIds` |
| 5.8 | Logs de IA | ✅ | `schemas.ts:260-271` — `AiLogSchema` | 3 logs |

**Estado da infraestrutura:** Sem base de dados real. Sem Prisma, Drizzle, SQL, migrações ou ORM. Todos os dados são arrays hardcoded em `fixtures.ts`.

---

## 6. Regras de Negócio

| # | Regra | Estado | Evidência |
|---|-------|--------|-----------|
| 6.1 | Movimento: 0, 1 ou múltiplos documentos | ✅ Feito | `schemas.ts:199` — `documentIds: z.array(z.string())` |
| 6.2 | Documento: 1 ou mais movimentos (rateio) | ⚠️ Parcial | Botão "Marcar para rateio" existe (`_app.faturacao.$id.tsx:119`). Sem relação reversa em `DocumentoSchema` |
| 6.3 | Nenhuma operação forçada sem validação | ✅ Feito | `_app.faturacao.tsx:144` + `_app.contabilidade.tsx:144-146` — 3 regras explícitas |

---

## 7. Exportação de Dados

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 7.1 | Exportação Excel / CSV / PDF | ⚠️ UI + Mock | `schemas.ts:278` — `format: z.enum(["csv","excel","pdf"])`. `fixtures.ts:772-799` — 3 jobs. Sem geração real de ficheiros |
| 7.2 | Exportação por cliente e período | ✅ Feito | `schemas.ts:275-276` — `clienteId` + `periodo` em `ExportJob` |

---

## 8. Segurança e Compliance

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 8.1 | Encriptação de dados | ❌ Não feito | Zero crypto, bcrypt ou encriptação no código. `hashDocumento: "SHA256:..."` em `fixtures.ts:316` é string mock |
| 8.2 | Controlo de acesso por utilizador | ⚠️ Parcial | Login existe (`_auth.login.tsx`), mas `mockApi.login()` sempre sucesso. Sem session management, sem route guards |
| 8.3 | Separação de dados por empresa (multi-tenant) | ⚠️ Parcial | Schema + UI existe (tenant switcher em `app-shell.tsx:81-92`). Sem isolamento real — dados partilhados |
| 8.4 | Logs de auditoria | ⚠️ Parcial | Evidence history (`schemas.ts:217-224`) + AI logs (`schemas.ts:260-271`). Sem log geral de ações do utilizador |

---

## 9. Performance e Escala

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 9.1 | Processamento de múltiplos ficheiros em batch | ⚠️ Parcial | `UploadBatch` (`schemas.ts:169-182`) com status e progress. Sem queue, worker ou job system |
| 9.2 | Suporte a grandes volumes | ❌ Não feito | Sem paginação em nenhuma lista. Sem virtualização. Sem lazy loading. Todos os queries retornam arrays completos |
| 9.3 | <30s por upload médio | ❌ Não feito | Upload é `<input type="file">` sem handler. Sem pipeline de processamento. Delay mock de 80-220ms |

---

## 10. UX Essencial

| # | Requisito | Estado | Evidência |
|---|-----------|--------|-----------|
| 10.1 | Interface contabilista-first | ✅ Feito | `app-shell.tsx:30-56` — Nav organizada por fluxo contabilístico |
| 10.2 | Redução máxima de cliques | ✅ Feito | Busca global CmdK (`app-shell.tsx:148-157`), navegação direta batch→revisão |
| 10.3 | Fluxo: Upload → Processamento → Revisão → Exportação | ✅ Feito | `_app.dashboard.tsx:123-128` — 4 passos explícitos. Subtitle: "Upload → processamento → revisão → exportação" |

---

## 11. Critérios de Sucesso do MVP

| # | Critério | Estado | Observação |
|---|----------|--------|------------|
| 11.1 | 50% redução tempo de reconciliação manual | ❌ Não mensurável | Sem métricas, sem instrumentação, sem baseline |
| 11.2 | 70% matching automático em casos simples | ⚠️ Só mock | 3 sugestões pré-computadas com scores 98%, 89%, 42%. Sem algoritmo real |
| 11.3 | 100% identificação de lacunas documentais | ✅ Mock | 4 tipos de lacuna definidos no schema. Dados populados nos fixtures |
| 11.4 | Aceitação do contabilista no fluxo de revisão | ✅ Feito (UI) | Flow completo de revisão/aprovação em `_app.faturacao.$id.tsx` |

---

## 12. Fora do Escopo (Verificação)

| # | Item fora do escopo | Estado | Observação |
|---|---------------------|--------|------------|
| 12.1 | Emissão de faturas | ⚠️ VIOLAÇÃO | `DocumentoSchema` com `hashDocumento`, `qrCode`, `comunicacaoAGT`. `geraDocumento()` em `fixtures.ts:275-346` |
| 12.2 | Gestão de stocks | ⚠️ VIOLAÇÃO | `ArtigoSchema` com `stockAtual`, `stockMinimo`, `armazem`. 5 artigos nos fixtures |
| 12.3 | RH / Payroll completo | ⚠️ VIOLAÇÃO | `_app.rh.tsx` — Página completa com INSS, salários, colaboradores |
| 12.4 | CRM empresarial | ⚠️ Aceitável | Clientes/fornecedores com contactos e saldos — aceitável para plataforma contabilística |
| 12.5 | ERP completo tradicional | ⚠️ VIOLAÇÃO | Plano PGCA (`ContaSchema`), lançamentos (`LancamentoSchema`), faturação, stocks, payroll |

---

## 🚨 Problemas Críticos Identificados

### 1. Zero Backend
Todas as chamadas vão para `mockApi` com dados hardcoded em `fixtures.ts`. Não existe:
- Base de dados (SQL, ORM, migrações)
- Server-side logic
- Autenticação real
- File upload real
- Processamento de documentos

### 2. Zero Testes
Nenhum ficheiro de teste encontrado no projeto. Sem testes unitários, de integração ou E2E.

### 3. Labels da Nav ≠ Rotas (Bug de UX)
A sidebar de navegação tem labels que não correspondem ao conteúdo das rotas:

| Label na Nav | Rota Apontada | Conteúdo Real da Rota |
|-------------|---------------|----------------------|
| "Linha do tempo" | `_app.rh.tsx` | Folha de pagamento / RH |
| "Lacunas" | `_app.fornecedores.tsx` | Fornecedores e pendências |
| "Exportação" | `_app.clientes.tsx` | Clientes e prontidão |

### 4. Scope Creep Grave
O projeto inclui funcionalidades explicitamente fora de escopo:
- Emissão de faturas eletrónicas com comunicação AGT
- Gestão de stocks com níveis mínimos/máximos
- Processamento salarial com cálculo INSS
- Plano contabilístico PGCA com lançamentos

Enquanto isso, o **motor de reconciliação bancária** (core do sistema) não existe.

### 5. IA Totalmente Estática
Todos os dados "de IA" são fixtures pré-computados:
- Sem OCR real
- Sem parsing de PDF/Excel/CSV
- Sem algoritmo de matching
- Sem engine de regras
- Sem modelo de classificação

---

## Mapa de Ficheiros

```
src/
├── routes/
│   ├── __root.tsx              ← Root layout (HTML shell, QueryClient)
│   ├── index.tsx               ← Redirect / → /login
│   ├── _auth.tsx               ← Auth layout (sidebar + form pane)
│   ├── _auth.login.tsx         ← Login page
│   ├── _auth.registar.tsx      ← Registration
│   ├── _auth.recuperar.tsx     ← Password recovery
│   ├── _auth.empresa.tsx       ← Company selection
│   ├── _app.tsx                ← App layout (Outlet)
│   ├── _app.dashboard.tsx      ← Dashboard principal
│   ├── _app.faturacao.tsx      ← Upload de documentos
│   ├── _app.faturacao.$id.tsx  ← Revisão de lote
│   ├── _app.lotes.tsx          ← Lista de lotes
│   ├── _app.contabilidade.tsx  ← Evidência contabilística
│   ├── _app.inventario.tsx     ← Movimentos e evidência
│   ├── _app.rh.tsx             ← Folha e retenções (payroll)
│   ├── _app.fornecedores.tsx   ← Fornecedores e pendências
│   ├── _app.clientes.tsx       ← Clientes e prontidão
│   └── _app.settings.tsx       ← Definições
├── components/
│   ├── app-shell.tsx           ← Shell de navegação
│   └── ui/                     ← 46 componentes shadcn/ui
├── lib/
│   ├── domain/schemas.ts       ← Schemas Zod (fonte de verdade)
│   ├── mock/api.ts             ← Mock API layer
│   ├── mock/fixtures.ts        ← Dados hardcoded (~800 linhas)
│   ├── format.ts               ← Formatadores pt-AO, AOA
│   ├── utils.ts                ← cn() utility
│   ├── error-capture.ts
│   ├── error-page.ts
│   └── lovable-error-reporting.ts
├── hooks/
│   └── use-mobile.tsx
├── router.tsx                  ← Router config
├── start.ts                    ← TanStack Start + middleware
├── server.ts                   ← Cloudflare SSR entry
└── styles.css                  ← Design system (199 linhas)
```

---

## Recomendações Próximos Passos

### Prioridade Alta
1. **Corrigir labels da nav** — Alinhar sidebar com o conteúdo real das rotas
2. **Remover ou mover funcionalidades fora de escopo** — Payroll, stocks e emissão de faturas devem ser módulos separados ou removidos
3. **Implementar backend** — Node.js/NestJS com Prisma + PostgreSQL
4. **Implementar autenticação real** — JWT, session management, route guards

### Prioridade Média
5. **Motor de parsing** — Integrar parser de extratos bancários (PDF/Excel/CSV)
6. **Motor de conciliação** — Algoritmo de matching por valor, data e fornecedor
7. **OCR** — Integrar engine OCR para faturas/recibos (Tesseract ou API)
8. **Paginação** — Adicionar em todas as listagens

### Prioridade Baixa
9. **Testes** — Unit tests (Vitest), E2E (Playwright)
10. **Exportação real** — Gerar ficheiros Excel/CSV/PDF
11. **Métricas de performance** — Instrumentar tempos de processamento
12. **Encriptação** — Dados em repouso e em trânsito
