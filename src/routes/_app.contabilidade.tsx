import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Clock3, TriangleAlert, FileWarning } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockApi } from "@/lib/mock/api";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/contabilidade")({
  head: () => ({ meta: [{ title: "Evidência contabilística · Kwanza" }] }),
  component: ContabilidadePage,
});

function ContabilidadePage() {
  const { data: evidence = [] } = useQuery({ queryKey: ["evidenceRecords"], queryFn: () => mockApi.listEvidenceRecords() });
  const { data: gaps = [] } = useQuery({ queryKey: ["gaps"], queryFn: () => mockApi.listGaps() });
  const { data: timeline = [] } = useQuery({ queryKey: ["timelineEvents"], queryFn: () => mockApi.listTimelineEvents() });
  const { data: movements = [] } = useQuery({ queryKey: ["bankMovements"], queryFn: () => mockApi.listBankMovements() });

  const greenCount = evidence.filter((record) => record.status === "verde").length;
  const yellowCount = evidence.filter((record) => record.status === "amarelo").length;
  const redCount = evidence.filter((record) => record.status === "vermelho").length;
  const approvedMovements = movements.filter((movement) => movement.evidenceState === "verde").length;

  return (
    <AppShell
      title="Evidência contabilística"
      subtitle="Conciliação assistida, lacunas e histórico de validação humana"
      actions={<Button size="sm">Exportar evidência</Button>}
    >
      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={<BadgeCheck className="h-4 w-4" />} label="Verde" value={String(greenCount)} subtitle="Evidência validada" />
        <Kpi icon={<Clock3 className="h-4 w-4" />} label="Amarelo" value={String(yellowCount)} subtitle="Pendente revisão" />
        <Kpi icon={<TriangleAlert className="h-4 w-4" />} label="Vermelho" value={String(redCount)} subtitle="Bloqueia exportação" />
        <Kpi icon={<FileWarning className="h-4 w-4" />} label="Movimentos conciliados" value={String(approvedMovements)} subtitle="Ligados a evidência" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Evidência</p>
                <h3 className="mt-1 font-display text-lg">Registos com validação e histórico</h3>
              </div>
              <Badge variant="outline">{evidence.length} registos</Badge>
            </div>

            <div className="space-y-3">
              {evidence.map((record) => (
                <div key={record.id} className="rounded-md border border-border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">Movimento {record.movementId}</div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {record.documentIds.length} documento(s) associado(s) · Confiança {record.confidence}%
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        record.status === "verde" && "border-success/40 text-success",
                        record.status === "amarelo" && "border-warning/40 text-warning",
                        record.status === "vermelho" && "border-destructive/40 text-destructive",
                      )}
                    >
                      {record.status}
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm">Validar</Button>
                    <Button variant="outline" size="sm">Abrir documentos</Button>
                    <Button variant="outline" size="sm">Ver histórico</Button>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
                    {record.history.slice(0, 3).map((entry) => (
                      <div key={`${record.id}-${entry.at}`} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/40" />
                        <div>
                          <span className="font-medium text-foreground">{entry.user}</span> · {entry.action} · {entry.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Lacunas críticas</p>
              <div className="mt-4 space-y-3">
                {gaps.map((gap) => (
                  <div key={gap.id} className="rounded-md border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{gap.descricao}</div>
                      <Badge variant="outline">{gap.severidade}</Badge>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{gap.clienteNome} · {gap.tipo.replaceAll("_", " ")}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Linha do tempo</p>
              <div className="mt-4 space-y-4">
                {timeline.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <span className={cn(
                      "mt-0.5 flex h-8 w-8 items-center justify-center rounded-full",
                      event.evidenceState === "verde" ? "bg-emerald-100 text-emerald-700" : event.evidenceState === "amarelo" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700",
                    )}>
                      <Clock3 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium">{event.title}</div>
                        <div className="font-mono text-xs tabular-nums">{fmt.aoa(event.amount)}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{event.clienteNome} · {event.direction}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Regras operacionais</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Nenhuma exportação sai sem evidência verde ou revisão manual.</li>
                <li>• Lacunas vermelhas bloqueiam o fecho do período.</li>
                <li>• O histórico é mantido para auditoria e responsabilização.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Kpi({ icon, label, value, subtitle }: { icon: ReactNode; label: string; value: string; subtitle: string }) {
  return (
    <div className="bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent text-foreground">{icon}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <div className="mt-4 font-display text-2xl tracking-tight tabular-nums">{value}</div>
      <div className="mt-2 text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}