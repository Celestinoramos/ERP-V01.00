import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calculator, Plus, ShieldCheck, Users } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockApi } from "@/lib/mock/api";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/rh")({
  head: () => ({ meta: [{ title: "Folha e retenções · Kwanza" }] }),
  component: RHPage,
});

function RHPage() {
  const { data: colaboradores = [] } = useQuery({ queryKey: ["colaboradores"], queryFn: () => mockApi.listColaboradores() });
  const massaSalarial = colaboradores.reduce((sum, item) => sum + item.salarioBase, 0);
  const inssPatronal = massaSalarial * 0.08;
  const ativos = colaboradores.filter((item) => item.estado === "ativo").length;

  return (
    <AppShell
      title="Folha e retenções"
      subtitle="Mapa salarial, INSS, IRT e validação para fecho mensal"
      actions={
        <>
          <Button variant="outline" size="sm"><Calculator className="mr-2 h-3.5 w-3.5" /> Processar folha</Button>
          <Button size="sm"><Plus className="mr-2 h-3.5 w-3.5" /> Novo colaborador</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
        <Metric icon={<Users className="h-4 w-4" />} label="Ativos" value={String(ativos)} />
        <Metric icon={<Calculator className="h-4 w-4" />} label="Massa salarial" value={fmt.aoa(massaSalarial)} />
        <Metric icon={<ShieldCheck className="h-4 w-4" />} label="INSS patronal" value={fmt.aoa(inssPatronal)} />
      </div>

      <Card className="mt-6 mb-6 overflow-hidden border-ochre/30 bg-ochre/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-ochre" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ochre">Conformidade mensal</p>
              <p className="mt-2 text-sm">Mapa salarial pronto para validação antes do fecho e exportação contabilística.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Nº mec.</th>
              <th className="px-5 py-3">Colaborador</th>
              <th className="px-5 py-3">Departamento</th>
              <th className="px-5 py-3">Contrato</th>
              <th className="px-5 py-3 text-right">Salário base</th>
              <th className="px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {colaboradores.map((item) => (
              <tr key={item.id} className="hover:bg-accent/40">
                <td className="px-5 py-3.5 font-mono text-xs">{item.numeroMecanografico}</td>
                <td className="px-5 py-3.5">
                  <div className="font-medium">{item.nome}</div>
                  <div className="text-[11px] text-muted-foreground">{item.cargo}</div>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">{item.departamento}</td>
                <td className="px-5 py-3.5 text-muted-foreground capitalize">{item.tipoContrato.replace("_", " ")}</td>
                <td className="px-5 py-3.5 text-right tabular-nums font-medium">{fmt.aoa(item.salarioBase)}</td>
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