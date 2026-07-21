import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Download, Mail, MoreHorizontal, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockApi } from "@/lib/mock/api";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/faturacao/$id")({
  head: ({ params }) => ({
    meta: [{ title: `${params.id} · Revisão de lote · Kwanza` }],
  }),
  component: ReviewBatchPage,
});

function ReviewBatchPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: batches = [] } = useQuery({ queryKey: ["uploadBatches"], queryFn: () => mockApi.listUploadBatches() });
  const { data: movements = [] } = useQuery({ queryKey: ["bankMovements"], queryFn: () => mockApi.listBankMovements() });
  const { data: suggestions = [] } = useQuery({ queryKey: ["reconciliationSuggestions"], queryFn: () => mockApi.listReconciliationSuggestions() });
  const { data: aiLogs = [] } = useQuery({ queryKey: ["aiLogs"], queryFn: () => mockApi.listAiLogs() });

  const batch = batches.find((item) => item.id === id) ?? batches[0];
  const relatedMovements = batch ? movements.filter((movement) => movement.clienteId === batch.clienteId) : [];
  const relatedSuggestions = suggestions.filter((suggestion) => relatedMovements.some((movement) => movement.id === suggestion.movementId));
  const relatedLogs = batch ? aiLogs.filter((log) => log.clienteId === batch.clienteId) : [];

  if (!batch) {
    return (
      <AppShell title="Lote não encontrado" subtitle="Não foi possível carregar o lote solicitado.">
        <Button variant="outline" onClick={() => navigate({ to: "/faturacao" })}>
          <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Voltar
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Revisão do lote ${batch.id}`}
      subtitle={`${batch.clienteNome} · período ${batch.periodo} · ${batch.fileCount} ficheiros`}
      actions={
        <>
          <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/faturacao" })}>
            <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Voltar
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-3.5 w-3.5" /> Notificar cliente
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-3.5 w-3.5" /> Exportar revisão
          </Button>
          <Button size="sm" variant="outline">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Estado do processamento</p>
                <h2 className="mt-2 font-display text-2xl tracking-tight">{batch.status}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{batch.notes}</p>
              </div>
              <Badge variant="outline">{batch.progress}%</Badge>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <MiniStat label="Ficheiros" value={String(batch.fileCount)} />
              <MiniStat label="Tipos" value={batch.fileTypes.join(", ")} />
              <MiniStat label="Processado" value={batch.processedAt ? fmt.dateLong(batch.processedAt) : "Em curso"} />
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-mono uppercase tracking-[0.18em] text-muted-foreground">Progresso</span>
                <span className="font-mono tabular-nums">{batch.progress}%</span>
              </div>
              <Progress value={batch.progress} />
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success" />
                <h3 className="font-display text-lg">Sugestões de conciliação</h3>
              </div>
              {relatedSuggestions.length === 0 ? (
                <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
                  Ainda não existem sugestões para este lote.
                </div>
              ) : (
                relatedSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="rounded-md border border-border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{suggestion.rationale}</div>
                        <div className="mt-1 text-sm text-muted-foreground">Regra: {suggestion.ruleMatch} · Confiança {suggestion.score}%</div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          suggestion.humanApproved ? "border-success/40 text-success" : "border-warning/40 text-warning",
                        )}
                      >
                        {suggestion.humanApproved ? "validado" : "aguarda revisão"}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm"><CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Aprovar</Button>
                      <Button variant="outline" size="sm">Marcar para rateio</Button>
                      <Button variant="outline" size="sm">Ver documento</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Lacunas associadas</p>
              <div className="mt-4 space-y-3">
                {relatedMovements.filter((movement) => movement.evidenceState !== "verde").map((movement) => (
                  <div key={movement.id} className="rounded-md border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{movement.descricao}</div>
                      <Badge variant="outline">{movement.evidenceState}</Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{fmt.aoa(movement.valor)} · {movement.data}</div>
                  </div>
                ))}
                {relatedMovements.filter((movement) => movement.evidenceState !== "verde").length === 0 ? (
                  <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
                    Nenhuma lacuna crítica associada.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Logs de IA</p>
              <div className="mt-4 space-y-3">
                {relatedLogs.map((log) => (
                  <div key={log.id} className="rounded-md border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{log.model}</div>
                      <Badge variant="outline">{log.confidence}%</Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{log.suggestion}</div>
                  </div>
                ))}
                {relatedLogs.length === 0 ? (
                  <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
                    Sem logs de sugestão para este lote.
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Validação humana</p>
              <div className="mt-3 rounded-md border border-border p-4 text-sm text-muted-foreground">
                Cada conciliação deve ser revista manualmente antes da exportação final.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-medium">{value}</div>
    </div>
  );
}