import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Layers3, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { mockApi } from "@/lib/mock/api";
import { fmt } from "@/lib/format";
import { useState } from "react";

export const Route = createFileRoute("/_app/lotes")({
  head: () => ({
    meta: [
      { title: "Lotes · Kwanza" },
      { name: "description", content: "Lista de todos os lotes de upload e o seu estado de processamento." },
    ],
  }),
  component: LotesPage,
});

function LotesPage() {
  const [filtro, setFiltro] = useState("");
  const { data: batches = [], isLoading } = useQuery({ queryKey: ["uploadBatches"], queryFn: () => mockApi.listUploadBatches() });

  const filtrados = batches.filter((batch) => {
    const q = filtro.trim().toLowerCase();
    if (!q) return true;
    return (
      batch.clienteNome.toLowerCase().includes(q) ||
      batch.periodo.toLowerCase().includes(q) ||
      batch.status.toLowerCase().includes(q)
    );
  });

  const totalFiles = batches.reduce((sum, b) => sum + b.fileCount, 0);
  const avgProgress = batches.length
    ? Math.round(batches.reduce((sum, b) => sum + b.progress, 0) / batches.length)
    : 0;

  return (
    <AppShell
      title="Lotes de upload"
      subtitle="Todos os lotes carregados, estado do processamento e progresso"
    >
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
        <Metric icon={<Layers3 className="h-4 w-4" />} label="Total de lotes" value={String(batches.length)} />
        <Metric icon={<Layers3 className="h-4 w-4" />} label="Total de ficheiros" value={String(totalFiles)} />
        <Metric icon={<Layers3 className="h-4 w-4" />} label="Progresso médio" value={`${avgProgress}%`} />
      </div>

      <div className="mt-6 mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Procurar por cliente, período ou estado…"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Período</th>
              <th className="px-5 py-3 text-center">Ficheiros</th>
              <th className="px-5 py-3">Tipos</th>
              <th className="px-5 py-3">Progresso</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">A carregar…</td></tr>
            )}
            {!isLoading && filtrados.length === 0 && (
              <tr><td colSpan={7} className="p-10 text-center text-muted-foreground">Sem lotes.</td></tr>
            )}
            {filtrados.map((batch) => (
              <tr key={batch.id} className="hover:bg-accent/40">
                <td className="px-5 py-3.5">
                  <Link to="/faturacao/$id" params={{ id: batch.id }} className="font-medium hover:text-ochre">
                    {batch.clienteNome}
                  </Link>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs">{batch.periodo}</td>
                <td className="px-5 py-3.5 text-center font-mono tabular-nums">{batch.fileCount}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {batch.fileTypes.map((type) => (
                      <Badge key={type} variant="outline" className="capitalize text-[10px]">{type}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3.5 w-48">
                  <div className="flex items-center gap-3">
                    <Progress value={batch.progress} className="flex-1" />
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{batch.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant="outline" className={batch.status === "ready_review" ? "border-success/40 text-success" : batch.status === "processing" ? "border-amber-400 text-amber-600" : ""}>
                    {batch.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-xs text-muted-foreground max-w-[200px] truncate">{batch.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
