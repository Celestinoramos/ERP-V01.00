import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, ShieldCheck, Users, CreditCard, Key } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mockApi } from "@/lib/mock/api";
import { fmt } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Definições · Kwanza" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => mockApi.listTenants(),
  });
  const { data: utilizadores = [] } = useQuery({
    queryKey: ["utilizadores"],
    queryFn: () => mockApi.listUtilizadores(),
  });
  const tenant = tenants[0];

  const nomeEmpresa = tenant?.nome ?? "Mavinga Comércio & Indústria, Lda";
  const nifEmpresa = tenant ? tenant.nif.replace(/(\d{4})(\d{4})(\d+)/, "$1 $2 $3") : "5417 829 301";
  const provincia = tenant?.provincia ?? "Luanda";
  const regimeIva = tenant ? `${tenant.regimeIva.replace("_", " ")} · 14%` : "Geral · 14%";
  const endereco = tenant?.endereco ?? "Rua Comandante Che Guevara, 47, Maianga";
  const certificado = tenant?.certificadoAGT ?? {
    numero: "AGT/2024/00821",
    validade: "2026-09-14",
    estado: "valido" as const,
  };

  return (
    <AppShell
      title="Definições"
      subtitle="Empresa, utilizadores, certificado AGT e plano de subscrição"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Empresa */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <SectionHead icon={<Building2 className="h-4 w-4" />} title="Dados da empresa" />
            <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <Field label="Designação" value={nomeEmpresa} />
              <Field label="NIF" value={nifEmpresa} mono />
              <Field label="Província" value={provincia} />
              <Field label="Regime IVA" value={regimeIva} />
              <Field label="Endereço" value={endereco} full />
            </dl>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" size="sm">Editar dados</Button>
            </div>
          </CardContent>
        </Card>

        {/* Certificado AGT */}
        <Card>
          <CardContent className="p-6">
            <SectionHead icon={<ShieldCheck className="h-4 w-4 text-success" />} title="Certificado AGT" />
            <div className="mt-5 space-y-3 text-sm">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Número</div>
                <div className="mt-1 font-mono">{certificado.numero}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Validade</div>
                <div className="mt-1">{fmt.dateLong(certificado.validade)}</div>
              </div>
              <Badge variant="outline" className="border-success/40 text-success">
                Válido · 80 dias restantes
              </Badge>
            </div>
            <Separator className="my-5" />
            <Button variant="outline" size="sm" className="w-full">
              <Key className="mr-2 h-3.5 w-3.5" /> Carregar novo PKCS#12
            </Button>
          </CardContent>
        </Card>

        {/* Plano */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <SectionHead icon={<CreditCard className="h-4 w-4" />} title="Plano de subscrição" />
            <div className="mt-5 flex items-end justify-between border-b border-border pb-5">
              <div>
                <p className="font-display text-3xl tracking-tight">Pequena Empresa</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Até 15 utilizadores · Faturação ilimitada · SAF-T mensal
                </p>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl tabular-nums">{fmt.aoa(75_000)}</div>
                <div className="text-xs text-muted-foreground">por mês · IVA incluído</div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-6 text-sm">
              <UsageRow label="Utilizadores" used={4} total={15} />
              <UsageRow label="Faturas/mês" used={1027} total={9999} unlimited />
              <UsageRow label="Armazenamento" used={2.4} total={50} unit="GB" />
            </div>
            <div className="mt-6 flex gap-2">
              <Button size="sm">Alterar plano</Button>
              <Button variant="outline" size="sm">Histórico de faturação</Button>
            </div>
          </CardContent>
        </Card>

        {/* Users */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border p-6">
              <SectionHead icon={<Users className="h-4 w-4" />} title="Utilizadores" />
              <Button size="sm">Convidar utilizador</Button>
            </div>
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Cargo</th>
                  <th className="px-6 py-3">Perfil</th>
                  <th className="px-6 py-3">Último acesso</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {utilizadores.map((u) => (
                  <tr key={u.id} className="hover:bg-accent/40">
                    <td className="px-6 py-3.5 font-medium">{u.nome}</td>
                    <td className="px-6 py-3.5 font-mono text-xs text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{u.cargo}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant="outline" className={cn(
                        u.perfil === "admin" && "border-ochre/40 text-ochre",
                      )}>
                        {u.perfil}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      {u.ultimoAcesso ? fmt.date(u.ultimoAcesso.slice(0, 10)) : "—"}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant="outline" className={cn(
                        u.ativo ? "border-success/40 text-success" : "text-muted-foreground",
                      )}>
                        {u.ativo ? "ativo" : "inativo"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent text-foreground">
        {icon}
      </span>
      <h3 className="font-display text-base">{title}</h3>
    </div>
  );
}

function Field({ label, value, mono, full }: { label: string; value: string; mono?: boolean; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1 text-sm", mono && "font-mono")}>{value}</dd>
    </div>
  );
}

function UsageRow({ label, used, total, unit, unlimited }: {
  label: string; used: number; total: number; unit?: string; unlimited?: boolean;
}) {
  const pct = unlimited ? 0 : (used / total) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
        <span className="font-mono text-xs tabular-nums">
          {used}{unit ? ` ${unit}` : ""} <span className="text-muted-foreground">/ {unlimited ? "∞" : `${total}${unit ? ` ${unit}` : ""}`}</span>
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-ochre transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}
