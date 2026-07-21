import { z } from "zod";

/* ============================================================
 * Schemas de domínio — plataforma de reconstrução contabilística.
 * Fonte única de verdade para tipos e validação.
 * ============================================================ */

export const TenantSchema = z.object({
  id: z.string(),
  nome: z.string(),
  nif: z.string(),
  regimeIva: z.enum(["geral", "simplificado", "nao_sujeito", "exclusao"]),
  certificadoAGT: z.object({
    numero: z.string(),
    validade: z.string(),
    estado: z.enum(["valido", "expira_em_breve", "expirado"]),
  }),
  endereco: z.string(),
  provincia: z.string(),
});
export type Tenant = z.infer<typeof TenantSchema>;

export const UtilizadorSchema = z.object({
  id: z.string(),
  nome: z.string(),
  email: z.string().email(),
  cargo: z.string(),
  perfil: z.enum(["admin", "contabilista", "operador", "gestor", "auditor"]),
  ativo: z.boolean(),
  ultimoAcesso: z.string().nullable(),
});
export type Utilizador = z.infer<typeof UtilizadorSchema>;

export const ClienteSchema = z.object({
  id: z.string(),
  nome: z.string(),
  nif: z.string(),
  tipo: z.enum(["empresa", "particular", "estrangeiro"]),
  email: z.string().email().nullable(),
  telefone: z.string().nullable(),
  endereco: z.string(),
  provincia: z.string(),
  contaCorrente: z.number(),
  estado: z.enum(["ativo", "inativo", "bloqueado"]),
  criadoEm: z.string(),
});
export type Cliente = z.infer<typeof ClienteSchema>;

export const FornecedorSchema = ClienteSchema.extend({
  condicoesPagamento: z.string(),
});
export type Fornecedor = z.infer<typeof FornecedorSchema>;

export const DocumentoTipoSchema = z.enum([
  "FT", // Fatura
  "FR", // Fatura-Recibo
  "FS", // Fatura simplificada
  "NC", // Nota de crédito
  "ND", // Nota de débito
  "RC", // Recibo
  "GT", // Guia de transporte
  "PF", // Proforma
]);
export type DocumentoTipo = z.infer<typeof DocumentoTipoSchema>;

export const DocumentoEstadoSchema = z.enum([
  "rascunho",
  "emitido",
  "comunicado_agt",
  "anulado",
  "erro_comunicacao",
]);
export type DocumentoEstado = z.infer<typeof DocumentoEstadoSchema>;

export const LinhaDocumentoSchema = z.object({
  id: z.string(),
  artigoCodigo: z.string(),
  descricao: z.string(),
  quantidade: z.number().positive(),
  precoUnitario: z.number().nonnegative(),
  taxaIva: z.number().min(0).max(100),
  desconto: z.number().min(0).max(100).default(0),
  total: z.number().nonnegative(),
});
export type LinhaDocumento = z.infer<typeof LinhaDocumentoSchema>;

export const DocumentoSchema = z.object({
  id: z.string(),
  tipo: DocumentoTipoSchema,
  serie: z.string(),
  numero: z.number().int().positive(),
  numeroCompleto: z.string(),
  dataEmissao: z.string(),
  dataVencimento: z.string().nullable(),
  clienteId: z.string(),
  clienteNome: z.string(),
  clienteNif: z.string(),
  linhas: z.array(LinhaDocumentoSchema),
  subtotal: z.number(),
  totalIva: z.number(),
  total: z.number(),
  moeda: z.literal("AOA"),
  estado: DocumentoEstadoSchema,
  hashDocumento: z.string(),
  qrCode: z.string(),
  comunicacaoAGT: z
    .object({
      timestamp: z.string(),
      respostaAGT: z.string(),
    })
    .nullable(),
});
export type Documento = z.infer<typeof DocumentoSchema>;

export const ArtigoSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  descricao: z.string(),
  categoria: z.string(),
  unidade: z.enum(["UN", "KG", "L", "M", "M2", "M3", "H", "SRV"]),
  precoVenda: z.number(),
  precoCusto: z.number(),
  taxaIva: z.number(),
  stockAtual: z.number(),
  stockMinimo: z.number(),
  armazem: z.string(),
  ativo: z.boolean(),
});
export type Artigo = z.infer<typeof ArtigoSchema>;

export const ContaSchema = z.object({
  codigo: z.string(), // PGCA
  descricao: z.string(),
  classe: z.string(),
  natureza: z.enum(["devedora", "credora"]),
  saldo: z.number(),
});
export type Conta = z.infer<typeof ContaSchema>;

export const LancamentoSchema = z.object({
  id: z.string(),
  numero: z.string(),
  data: z.string(),
  diario: z.string(),
  descricao: z.string(),
  totalDebito: z.number(),
  totalCredito: z.number(),
  estado: z.enum(["rascunho", "validado", "publicado"]),
});
export type Lancamento = z.infer<typeof LancamentoSchema>;

export const ColaboradorSchema = z.object({
  id: z.string(),
  numeroMecanografico: z.string(),
  nome: z.string(),
  bi: z.string(),
  nif: z.string(),
  inss: z.string(),
  cargo: z.string(),
  departamento: z.string(),
  salarioBase: z.number(),
  dataAdmissao: z.string(),
  tipoContrato: z.enum(["sem_termo", "termo_certo", "termo_incerto", "prestacao_servicos"]),
  estado: z.enum(["ativo", "suspenso", "cessado"]),
  iban: z.string(),
});
export type Colaborador = z.infer<typeof ColaboradorSchema>;

export const UploadBatchSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  clienteNome: z.string(),
  periodo: z.string(),
  fileCount: z.number().int().nonnegative(),
  fileTypes: z.array(z.enum(["pdf", "xlsx", "csv", "jpg", "png"])),
  status: z.enum(["uploaded", "processing", "ready_review", "exported"]),
  progress: z.number().min(0).max(100),
  uploadedAt: z.string(),
  processedAt: z.string().nullable(),
  notes: z.string().nullable(),
});
export type UploadBatch = z.infer<typeof UploadBatchSchema>;

export const BankMovementSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  clienteNome: z.string(),
  empresaId: z.string(),
  data: z.string(),
  valor: z.number(),
  descricao: z.string(),
  tipoMovimento: z.enum(["entrada", "saida", "transferencia", "ajuste"]),
  fornecedorSugerido: z.string().nullable(),
  categoriaSugerida: z.string().nullable(),
  categoriaConfidence: z.number().min(0).max(100),
  matchingStatus: z.enum(["sem_suporte", "parcial", "suportado", "pendente_validacao"]),
  confidence: z.number().min(0).max(100),
  evidenceState: z.enum(["verde", "amarelo", "vermelho"]),
  documentIds: z.array(z.string()),
  suggestedDocumentIds: z.array(z.string()),
  historicalCount: z.number().int().nonnegative(),
  recurrence: z.boolean(),
});
export type BankMovement = z.infer<typeof BankMovementSchema>;

export const ReconciliationSuggestionSchema = z.object({
  id: z.string(),
  movementId: z.string(),
  documentIds: z.array(z.string()),
  ruleMatch: z.enum(["valor", "data", "fornecedor", "recorrencia", "manual"]),
  score: z.number().min(0).max(100),
  rationale: z.string(),
  humanApproved: z.boolean(),
});
export type ReconciliationSuggestion = z.infer<typeof ReconciliationSuggestionSchema>;

export const EvidenceHistoryEntrySchema = z.object({
  id: z.string(),
  at: z.string(),
  user: z.string(),
  action: z.string(),
  note: z.string(),
});
export type EvidenceHistoryEntry = z.infer<typeof EvidenceHistoryEntrySchema>;

export const EvidenceRecordSchema = z.object({
  id: z.string(),
  movementId: z.string(),
  status: z.enum(["verde", "amarelo", "vermelho"]),
  confidence: z.number().min(0).max(100),
  documentIds: z.array(z.string()),
  history: z.array(EvidenceHistoryEntrySchema),
});
export type EvidenceRecord = z.infer<typeof EvidenceRecordSchema>;

export const GapSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  clienteNome: z.string(),
  tipo: z.enum(["movimento_sem_documento", "documento_sem_movimento", "inconsistencia_valor", "data_inconsistente"]),
  severidade: z.enum(["alta", "media", "baixa"]),
  descricao: z.string(),
  referenciaId: z.string(),
});
export type Gap = z.infer<typeof GapSchema>;

export const TimelineEventSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  clienteNome: z.string(),
  at: z.string(),
  direction: z.enum(["entrada", "saida", "documento"]),
  title: z.string(),
  amount: z.number(),
  evidenceState: z.enum(["verde", "amarelo", "vermelho"]),
  refId: z.string(),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const AiLogSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  entityType: z.enum(["movement", "document", "batch"]),
  entityId: z.string(),
  suggestion: z.string(),
  confidence: z.number().min(0).max(100),
  createdAt: z.string(),
  humanValidated: z.boolean(),
  model: z.string(),
});
export type AiLog = z.infer<typeof AiLogSchema>;

export const ExportJobSchema = z.object({
  id: z.string(),
  clienteId: z.string(),
  clienteNome: z.string(),
  periodo: z.string(),
  format: z.enum(["csv", "excel", "pdf"]),
  status: z.enum(["queued", "generating", "done"]),
  createdAt: z.string(),
});
export type ExportJob = z.infer<typeof ExportJobSchema>;
