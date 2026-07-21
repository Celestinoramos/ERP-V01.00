import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { mockApi } from "@/lib/mock/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2 } from "lucide-react";
import { fmt } from "@/lib/format";

export const Route = createFileRoute("/_auth/empresa")({
  head: () => ({ meta: [{ title: "Selecionar empresa · Kwanza" }] }),
  component: EmpresaPage,
});

function EmpresaPage() {
  const nav = useNavigate();
  const { data: tenants = [] } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => mockApi.listTenants(),
  });

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ochre">
          Multi-tenant
        </p>
        <h2 className="mt-3 font-display text-3xl tracking-tight">Selecionar empresa</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tens acesso às seguintes organizações. Cada uma opera no seu próprio schema.
        </p>
      </div>

      <div className="space-y-3">
        {tenants.map((t) => (
          <button
            key={t.id}
            onClick={() => nav({ to: "/dashboard" })}
            className="group flex w-full items-start gap-4 rounded-md border border-border bg-card p-5 text-left transition-colors hover:border-border-strong hover:bg-accent"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-display text-base text-foreground">{t.nome}</h3>
                {t.certificadoAGT.estado === "expira_em_breve" && (
                  <Badge variant="outline" className="border-warning/40 text-warning">
                    Certificado expira em breve
                  </Badge>
                )}
              </div>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                NIF {fmt.nif(t.nif)} · {t.provincia} · AGT {t.certificadoAGT.numero}
              </p>
            </div>
            <span className="self-center text-muted-foreground transition-transform group-hover:translate-x-1">→</span>
          </button>
        ))}

        <button className="flex w-full items-center gap-3 rounded-md border border-dashed border-border p-5 text-left text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
          <Plus className="h-4 w-4" />
          <span className="text-sm">Adicionar nova empresa</span>
        </button>
      </div>

      <Button
        variant="ghost"
        className="mt-8 w-full"
        onClick={() => nav({ to: "/login" })}
      >
        Sair desta conta
      </Button>
    </div>
  );
}
