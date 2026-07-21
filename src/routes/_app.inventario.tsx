import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, FileWarning, Layers3 } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockApi } from "@/lib/mock/api";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/inventario")({
  head: () => ({ meta: [{ title: "Movimentos e evidência · Kwanza" }] }),
  component: InventarioPage,
});

function InventarioPage() {
  const { data: movements = [] } = useQuery({ queryKey: ["bankMovements"], queryFn: () => mockApi.listBankMovements() });
  const { data: evidence = [] } = useQuery({ queryKey: ["evidenceRecords"], queryFn: () => mockApi.listEvidenceRecords() });

  const green = evidence.filter((item) => item.status === "verde").length;
  const yellow = evidence.filter((item) => item.status === "amarelo").length;
  const red = evidence.filter((item) => item.status === "vermelho").length;

  return (
    <AppShell
      title="Movimentos e evidência"
      subtitle="Extratos, estados de conciliação e suporte documental"
      actions={<Button size="sm">Exportar análise</Button>}
    >
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
        <Metric icon={<Activity className="h-4 w-4" />} label="Verde" value={String(green)} />
        <Metric icon={<Layers3 className="h-4 w-4" />} label="Amarelo" value={String(yellow)} />
        <Metric icon={<FileWarning className="h-4 w-4" />} label="Vermelho" value={String(red)} />
      </div>

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Data</th>
              <th className="px-5 py-3">Descrição</th>
              <th className="px-5 py-3 text-right">Valor</th>
              <th className="px-5 py-3">Evidência</th>
              <th className="px-5 py-3">Confiança</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {movements.map((movement) => {
              const record = evidence.find((item) => item.movementId === movement.id);
              return (
                <tr key={movement.id} className="hover:bg-accent/40">
                  <td className="px-5 py-3.5 text-muted-foreground">{fmt.date(movement.data)}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{movement.descricao}</div>
                    <div className="text-[11px] text-muted-foreground">{movement.clienteNome}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right tabular-nums font-medium">{fmt.aoa(movement.valor)}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant="outline" className={cn(
                      movement.evidenceState === "verde" && "border-success/40 text-success",
                      movement.evidenceState === "amarelo" && "border-warning/40 text-warning",
                      movement.evidenceState === "vermelho" && "border-destructive/40 text-destructive",
                    )}>{movement.evidenceState}</Badge>
                  </td>
                  <td className="px-5 py-3.5">{record ? `${record.confidence}%` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent text-foreground">{icon}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span>
      </div>
      <div className="mt-4 font-display text-2xl tracking-tight tabular-nums">{value}</div>
    </div>
  );
}