import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  FileBarChart,
  FileText,
  TriangleAlert,
  Upload,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/lib/mock/api";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel de reconstrução · Kwanza" },
      { name: "description", content: "Visão executiva de vendas, IVA, tesouraria e obrigações fiscais." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => mockApi.dashboardKpis(),
  });
  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: () => mockApi.listClientes(),
  });
  const { data: fornecedores = [] } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: () => mockApi.listFornecedores(),
  });
  const { data: artigos = [] } = useQuery({
    queryKey: ["artigos"],
    queryFn: () => mockApi.listArtigos(),
  });
  const { data: colaboradores = [] } = useQuery({
    queryKey: ["colaboradores"],
    queryFn: () => mockApi.listColaboradores(),
  });
  const { data: batches = [] } = useQuery({
    queryKey: ["uploadBatches"],
    queryFn: () => mockApi.listUploadBatches(),
  });
  const { data: gaps = [] } = useQuery({
    queryKey: ["gaps"],
    queryFn: () => mockApi.listGaps(),
  });
  const { data: exports = [] } = useQuery({
    queryKey: ["exports"],
    queryFn: () => mockApi.listExportJobs(),
  });
  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => mockApi.listTenants(),
  });

  const kpis = data ?? {
    clientesAtivos: clientes.filter((c) => c.estado === "ativo").length,
    empresasAtivas: tenants.length,
    lotesProcessados: batches.filter((b) => b.status !== "uploaded").length,
    movimentosConciliados: 0,
    movimentosPendentes: 0,
    documentosSemMovimento: gaps.filter((g) => g.tipo === "documento_sem_movimento").length,
    confiancaMedia: 0,
    riscoFiscalPorCliente: [],
    organizacaoPorCliente: [],
    alertasCriticos: [],
  };

  const activeClientCount = clientes.filter((client) => client.estado === "ativo").length;
  const readyBatchCount = batches.filter((batch) => batch.status === "ready_review").length;
  const artigosCriticos = artigos.filter((artigo) => artigo.stockAtual < artigo.stockMinimo).length;
  const colaboradoresAtivos = colaboradores.filter((c) => c.estado === "ativo").length;

  return (
    <AppShell
      title="Painel de reconstrução"
      subtitle="Upload → processamento → revisão → exportação"
      actions={
        <>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-3.5 w-3.5" /> Exportar relatório
          </Button>
          <Button size="sm">
            <Upload className="mr-2 h-3.5 w-3.5" /> Novo upload
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={<Users className="h-4 w-4" />} label="Clientes ativos" value={String(activeClientCount)} delta={12} deltaLabel="vs. mês anterior" loading={isLoading} />
        <KpiCard icon={<CheckCircle2 className="h-4 w-4" />} label="Lotes prontos" value={String(readyBatchCount)} subtitle="Prontos para revisão humana" loading={isLoading} />
        <KpiCard icon={<FileBarChart className="h-4 w-4" />} label="Fornecedores" value={String(fornecedores.length)} subtitle={`${fornecedores.length} registados`} loading={isLoading} />
        <KpiCard icon={<TriangleAlert className="h-4 w-4" />} label="Artigos criticos" value={String(artigosCriticos)} subtitle="Stock abaixo do minimo" tone="warning" loading={isLoading} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Fluxo principal</p>
                <h3 className="mt-1 font-display text-lg">Da entrada ao relatório</h3>
              </div>
              <Badge variant="outline" className="text-muted-foreground">IA + validação humana</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FlowStep step="1" title="Upload" text="Extratos PDF/Excel/CSV, faturas PDF/JPG/PNG e recibos em massa." icon={<Upload className="h-4 w-4" />} />
              <FlowStep step="2" title="Processamento" text="OCR, parsing automático e normalização num formato interno único." icon={<FileText className="h-4 w-4" />} />
              <FlowStep step="3" title="Revisão" text="Sugestões com nível de confiança, validação manual e histórico de alterações." icon={<Download className="h-4 w-4" />} />
              <FlowStep step="4" title="Exportação" text="Excel, CSV e PDF por cliente e período, depois de validar as evidências." icon={<Download className="h-4 w-4" />} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cliente ativo</p>
              <h3 className="mt-1 font-display text-lg">{tenants[0]?.nome ?? "Mavinga Comércio & Indústria, Lda"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {tenants[0] ? `NIF ${fmt.nif(tenants[0].nif)} · ${tenants[0].provincia}` : "Multi-tenant preparado"}
              </p>
            </div>

            <div className="space-y-3">
              {batches.slice(0, 4).map((batch) => (
                <div key={batch.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{batch.clienteNome}</span>
                    <span className="font-mono tabular-nums">{batch.progress}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-ochre" style={{ width: `${batch.progress}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">Lote {batch.periodo} · {batch.fileCount} ficheiros · {batch.status}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Alertas críticos</p>
                <h3 className="mt-1 font-display text-lg">Movimentos sem suporte e documentos órfãos</h3>
              </div>
              <Badge variant="outline">{gaps.length} lacunas</Badge>
            </div>

            <div className="space-y-3">
              {gaps.map((gap) => (
                <div key={gap.id} className="flex items-start gap-3 rounded-md border border-border p-4">
                  <span className={cn(
                    "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full",
                    gap.severidade === "alta" ? "bg-destructive/10 text-destructive" : gap.severidade === "media" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground",
                  )}>
                    <TriangleAlert className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{gap.descricao}</div>
                    <div className="text-sm text-muted-foreground">{gap.clienteNome} · {gap.tipo.replaceAll("_", " ")}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Risco fiscal</p>
              <h3 className="mt-1 font-display text-lg">Organização e risco por cliente</h3>
            </div>

            <div className="space-y-4">
              {(kpis.riscoFiscalPorCliente ?? []).map((item) => (
                <div key={item.cliente}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{item.cliente}</span>
                    <span className="font-mono tabular-nums">{item.percent}% organizado</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className={cn(
                      "h-full",
                      item.risco === "alto" ? "bg-destructive" : item.risco === "medio" ? "bg-amber-500" : "bg-success",
                    )} style={{ width: `${item.percent}%` }} />
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Risco fiscal {item.risco}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Colaboradores</p>
                <h3 className="mt-1 font-display text-lg">Equipa e actividade</h3>
              </div>
              <Badge variant="outline">{colaboradoresAtivos} activos</Badge>
            </div>

            <div className="space-y-3">
              {colaboradores.slice(0, 5).map((colab) => (
                <div key={colab.id} className="flex items-center justify-between rounded-md border border-border p-4">
                  <div>
                    <div className="font-medium">{colab.nome}</div>
                    <div className="text-sm text-muted-foreground">{colab.cargo} · {colab.departamento}</div>
                  </div>
                  <Badge variant="outline" className={cn(
                    colab.estado === "ativo" && "border-success/40 text-success",
                    colab.estado === "suspenso" && "border-amber-400 text-amber-600",
                    colab.estado === "cessado" && "border-destructive/40 text-destructive",
                  )}>
                    {colab.estado}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Exportação e IA</p>
              <h3 className="mt-1 font-display text-lg">Jobs de exportação e logs de sugestão</h3>
            </div>
            <div className="space-y-3">
              {exports.slice(0, 3).map((job) => (
                <div key={job.id} className="rounded-md border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium">{job.clienteNome}</div>
                      <div className="text-sm text-muted-foreground">{job.periodo} · {job.format.toUpperCase()}</div>
                    </div>
                    <Badge variant="outline">{job.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function KpiCard({ icon, label, value, delta, deltaLabel, subtitle, loading, tone = "default" }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  subtitle?: string;
  loading?: boolean;
  tone?: "default" | "warning";
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="bg-card p-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className={cn("flex h-7 w-7 items-center justify-center rounded-sm",
          tone === "warning" ? "bg-warning/15 text-warning" : "bg-accent text-foreground")}>
          {icon}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <div className="mt-5">
        {loading ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          <div className="font-display text-3xl tracking-tight tabular-nums">{value}</div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span className={cn("inline-flex items-center gap-1 font-medium",
            positive ? "text-success" : "text-destructive")}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {fmt.dec(Math.abs(delta))}%
          </span>
        )}
        {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
        {subtitle && !deltaLabel && <span className="text-muted-foreground">{subtitle}</span>}
      </div>
    </div>
  );
}

function FlowStep({ step, title, text, icon }: { step: string; title: string; text: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Passo {step}</div>
        <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent text-foreground">{icon}</span>
      </div>
      <div className="mt-3 font-medium">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
