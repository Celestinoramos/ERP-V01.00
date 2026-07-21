/**
 * Camada de mock API — substitui chamadas HTTP enquanto o backend NestJS não existe.
 * Cada função simula latência (80–220ms) e devolve dados validados pelos schemas Zod
 * do domínio. Migração para API real = trocar implementação destas funções.
 *
 * NOTA: Em produção, dados sensíveis (BI, NIF, IBAN) nunca seriam logged nem
 * embebidos em fixtures. Este módulo existe apenas para desenvolvimento local.
 */

import {
  aiLogsFixture,
  artigosFixture,
  clientesFixture,
  colaboradoresFixture,
  contasFixture,
  evidenceRecordsFixture,
  exportJobsFixture,
  gapsFixture,
  bankMovementsFixture,
  documentosFixture,
  fornecedoresFixture,
  lancamentosFixture,
  reconciliationSuggestionsFixture,
  timelineEventsFixture,
  tenantsFixture,
  uploadBatchesFixture,
  utilizadoresFixture,
} from "./fixtures";
import type {
  AiLog,
  Artigo,
  Cliente,
  Colaborador,
  Conta,
  BankMovement,
  EvidenceRecord,
  ExportJob,
  Gap,
  Documento,
  Fornecedor,
  Lancamento,
  ReconciliationSuggestion,
  TimelineEvent,
  Tenant,
  UploadBatch,
  Utilizador,
} from "../domain/schemas";

const latency = () => new Promise<void>((r) => setTimeout(r, 80 + Math.random() * 140));

export const mockApi = {
  // Auth
  async login(email: string, _password: string): Promise<{ utilizador: Utilizador; tenant: Tenant }> {
    await latency();
    const utilizador = utilizadoresFixture[0]!;
    return { utilizador: { ...utilizador, email }, tenant: tenantsFixture[0]! };
  },

  // Tenants
  async listTenants(): Promise<Tenant[]> {
    await latency();
    return tenantsFixture;
  },
  async getTenant(id: string): Promise<Tenant | null> {
    await latency();
    return tenantsFixture.find((t) => t.id === id) ?? null;
  },

  // Utilizadores
  async listUtilizadores(): Promise<Utilizador[]> {
    await latency();
    return utilizadoresFixture;
  },

  // Clientes
  async listClientes(): Promise<Cliente[]> {
    await latency();
    return clientesFixture;
  },
  async getCliente(id: string): Promise<Cliente | null> {
    await latency();
    return clientesFixture.find((c) => c.id === id) ?? null;
  },

  // Fornecedores
  async listFornecedores(): Promise<Fornecedor[]> {
    await latency();
    return fornecedoresFixture;
  },

  // Upload / processamento
  async listUploadBatches(): Promise<UploadBatch[]> {
    await latency();
    return uploadBatchesFixture;
  },
  async listBankMovements(): Promise<BankMovement[]> {
    await latency();
    return bankMovementsFixture;
  },
  async listReconciliationSuggestions(): Promise<ReconciliationSuggestion[]> {
    await latency();
    return reconciliationSuggestionsFixture;
  },
  async listEvidenceRecords(): Promise<EvidenceRecord[]> {
    await latency();
    return evidenceRecordsFixture;
  },
  async listGaps(): Promise<Gap[]> {
    await latency();
    return gapsFixture;
  },
  async listTimelineEvents(): Promise<TimelineEvent[]> {
    await latency();
    return timelineEventsFixture;
  },
  async listAiLogs(): Promise<AiLog[]> {
    await latency();
    return aiLogsFixture;
  },
  async listExportJobs(): Promise<ExportJob[]> {
    await latency();
    return exportJobsFixture;
  },

  // Faturação
  async listDocumentos(): Promise<Documento[]> {
    await latency();
    return [...documentosFixture].sort((a, b) => b.dataEmissao.localeCompare(a.dataEmissao));
  },
  async getDocumento(id: string): Promise<Documento | null> {
    await latency();
    return documentosFixture.find((d) => d.id === id) ?? null;
  },

  // Inventário
  async listArtigos(): Promise<Artigo[]> {
    await latency();
    return artigosFixture;
  },

  // Contabilidade
  async listContas(): Promise<Conta[]> {
    await latency();
    return contasFixture;
  },
  async listLancamentos(): Promise<Lancamento[]> {
    await latency();
    return lancamentosFixture;
  },

  // RH
  async listColaboradores(): Promise<Colaborador[]> {
    await latency();
    return colaboradoresFixture;
  },

  // Dashboard agregados
  async dashboardKpis(): Promise<{
    clientesAtivos: number;
    empresasAtivas: number;
    lotesProcessados: number;
    movimentosConciliados: number;
    movimentosPendentes: number;
    documentosSemMovimento: number;
    confiancaMedia: number;
    riscoFiscalPorCliente: Array<{ cliente: string; risco: "alto" | "medio" | "baixo"; percent: number }>;
    organizacaoPorCliente: Array<{ cliente: string; percent: number }>;
    alertasCriticos: Array<{ titulo: string; detalhe: string; severidade: "alta" | "media" | "baixa" }>;
  }> {
    await latency();
    return {
      clientesAtivos: clientesFixture.filter((cliente) => cliente.estado === "ativo").length,
      empresasAtivas: tenantsFixture.length,
      lotesProcessados: uploadBatchesFixture.filter((batch) => batch.status !== "uploaded").length,
      movimentosConciliados: bankMovementsFixture.filter((movement) => movement.evidenceState === "verde").length,
      movimentosPendentes: bankMovementsFixture.filter((movement) => movement.evidenceState !== "verde").length,
      documentosSemMovimento: gapsFixture.filter((gap) => gap.tipo === "documento_sem_movimento").length,
      confiancaMedia: Math.round(
        bankMovementsFixture.reduce((sum, movement) => sum + movement.confidence, 0) / bankMovementsFixture.length,
      ),
      riscoFiscalPorCliente: [
        { cliente: clientesFixture[0]!.nome, risco: "baixo", percent: 18 },
        { cliente: clientesFixture[1]!.nome, risco: "medio", percent: 41 },
        { cliente: clientesFixture[3]!.nome, risco: "alto", percent: 78 },
      ],
      organizacaoPorCliente: uploadBatchesFixture.map((batch) => ({
        cliente: batch.clienteNome,
        percent: batch.progress,
      })),
      alertasCriticos: [
        { titulo: "Movimento sem documento", detalhe: bankMovementsFixture[2]!.descricao, severidade: "alta" },
        { titulo: "Documento sem movimento", detalhe: documentosFixture[1]!.numeroCompleto, severidade: "media" },
        { titulo: "OCR em processamento", detalhe: uploadBatchesFixture[1]!.clienteNome, severidade: "baixa" },
      ],
    };
  },
};
