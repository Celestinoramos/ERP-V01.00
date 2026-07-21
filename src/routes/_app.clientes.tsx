import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, ShieldCheck, TriangleAlert, Users } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockApi } from "@/lib/mock/api";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/clientes")({
  head: () => ({ meta: [{ title: "Clientes · Kwanza" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  const { data: clientes = [], isLoading } = useQuery({ queryKey: ["clientes"], queryFn: () => mockApi.listClientes() });
  const { data: batches = [] } = useQuery({ queryKey: ["uploadBatches"], queryFn: () => mockApi.listUploadBatches() });
  const { data: gaps = [] } = useQuery({ queryKey: ["gaps"], queryFn: () => mockApi.listGaps() });

  const activeClients = clientes.filter((client) => client.estado === "ativo").length;
  const readyClients = batches.filter((batch) => batch.progress >= 80).length;
  const highRiskClients = gaps.filter((gap) => gap.severidade === "alta").length;

  return (
    <AppShell
      title="Clientes e prontidão"
      subtitle="Estado documental, lacunas abertas e nível de organização por cliente"
      actions={
        <>
          <Button variant="outline" size="sm"><ShieldCheck className="mr-2 h-3.5 w-3.5" /> Revisar lote</Button>
          <Button size="sm"><Plus className="mr-2 h-3.5 w-3.5" /> Novo cliente</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
        <Metric icon={<Users className="h-4 w-4" />} label="Clientes ativos" value={String(activeClients)} />
        <Metric icon={<ShieldCheck className="h-4 w-4" />} label="Clientes prontos" value={String(readyClients)} />
        <Metric icon={<TriangleAlert className="h-4 w-4" />} label="Risco alto" value={String(highRiskClients)} />
      </div>

      <div className="mt-6 mb-4 flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Procurar cliente, NIF ou província…" className="pl-9" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">NIF</th>
              <th className="px-5 py-3">Província</th>
              <th className="px-5 py-3 text-right">Conta corrente</th>
              <th className="px-5 py-3">Prontidão</th>
              <th className="px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">A carregar…</td></tr>
            )}
            {clientes.map((client) => {
              const batch = batches.find((item) => item.clienteId === client.id);
              const clientGaps = gaps.filter((gap) => gap.clienteId === client.id);
              const readiness = batch?.progress ?? 0;
              return (
                <tr key={client.id} className="hover:bg-accent/40">
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{client.nome}</div>
                    <div className="text-[11px] text-muted-foreground">{client.email ?? "—"}</div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs">{fmt.nif(client.nif)}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{client.provincia}</td>
                  <td className={cn(
                    "px-5 py-3.5 text-right tabular-nums font-medium",
                    client.contaCorrente < 0 && "text-destructive",
                    client.contaCorrente > 0 && "text-success",
                  )}>
                    {fmt.aoa(client.contaCorrente)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-ochre" style={{ width: `${readiness}%` }} />
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{readiness}%</span>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {batch ? `${batch.fileCount} ficheiros · ${batch.status}` : "Sem lote ativo"}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={cn(
                        client.estado === "ativo" && "border-success/40 text-success",
                        client.estado === "bloqueado" && "border-destructive/40 text-destructive",
                        client.estado === "inativo" && "text-muted-foreground",
                      )}>
                        {client.estado}
                      </Badge>
                      {clientGaps.length > 0 ? <Badge variant="outline">{clientGaps.length} lacunas</Badge> : null}
                    </div>
                  </td>
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