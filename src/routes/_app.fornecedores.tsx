import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, AlertTriangle, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { mockApi } from "@/lib/mock/api";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/fornecedores")({
  head: () => ({ meta: [{ title: "Fornecedores · Kwanza" }] }),
  component: FornecedoresPage,
});

function FornecedoresPage() {
  const { data: fornecedores = [], isLoading } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: () => mockApi.listFornecedores(),
  });

  const totalAbertos = fornecedores.reduce((sum, item) => sum + (item.contaCorrente < 0 ? Math.abs(item.contaCorrente) : 0), 0);
  const atrasados = fornecedores.filter((item) => item.contaCorrente < 0).length;
  const emRevisao = fornecedores.filter((item) => item.estado !== "ativo").length;

  return (
    <AppShell
      title="Fornecedores e pendências"
      subtitle="Contas correntes, vencimentos e documentos por validar"
      actions={<Button size="sm"><Plus className="mr-2 h-3.5 w-3.5" /> Novo fornecedor</Button>}
    >
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
        <Metric icon={<Clock3 className="h-4 w-4" />} label="A pagar" value={fmt.aoa(totalAbertos)} />
        <Metric icon={<AlertTriangle className="h-4 w-4" />} label="Em atraso" value={String(atrasados)} />
        <Metric icon={<Search className="h-4 w-4" />} label="Em revisão" value={String(emRevisao)} />
      </div>

      <div className="mt-6 mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Procurar fornecedor…" className="pl-9" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Fornecedor</th>
              <th className="px-5 py-3">NIF</th>
              <th className="px-5 py-3">Condição</th>
              <th className="px-5 py-3 text-right">Saldo</th>
              <th className="px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">A carregar…</td></tr>
            )}
            {fornecedores.map((item) => (
              <tr key={item.id} className="hover:bg-accent/40">
                <td className="px-5 py-3.5">
                  <div className="font-medium">{item.nome}</div>
                  <div className="text-[11px] text-muted-foreground">{item.provincia}</div>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs">{fmt.nif(item.nif)}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{item.condicoesPagamento}</td>
                <td className={cn("px-5 py-3.5 text-right tabular-nums font-medium", item.contaCorrente < 0 && "text-destructive")}>
                  {fmt.aoa(item.contaCorrente)}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant="outline" className={cn(item.estado === "ativo" && "border-success/40 text-success")}>{item.estado}</Badge>
                </td>
              </tr>
            ))}
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