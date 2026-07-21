import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      {/* Painel narrativo — lado esquerdo, sóbrio, tipograficamente denso. */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-ochre text-ochre-foreground">
            <span className="font-display text-lg font-semibold">K</span>
          </div>
          <span className="font-display text-lg tracking-tight">Kwanza</span>
        </div>

        <div className="relative z-10 space-y-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ochre">
            Certificado AGT · DP 312/18
          </p>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight">
            Gestão fiscal séria para empresas{" "}
            <span className="italic text-ochre">angolanas</span>.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-sidebar-foreground/70">
            Faturação eletrónica em tempo real com a AGT, SAF-T (AO), contabilidade
            PGCA e processamento salarial — num só sistema, em conformidade.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 border-t border-sidebar-border pt-8 font-mono text-[11px] uppercase tracking-wider text-sidebar-foreground/60">
          <div>
            <div className="text-2xl font-display text-sidebar-foreground">14%</div>
            <div className="mt-1">IVA Angola</div>
          </div>
          <div>
            <div className="text-2xl font-display text-sidebar-foreground">SHA-256</div>
            <div className="mt-1">Hash documento</div>
          </div>
          <div>
            <div className="text-2xl font-display text-sidebar-foreground">PKCS#12</div>
            <div className="mt-1">Assinatura</div>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 14px)",
          }}
        />
      </aside>

      {/* Form pane */}
      <main className="flex flex-col bg-background">
        <header className="flex items-center justify-between border-b border-border px-8 py-5 lg:px-12">
          <Link to="/login" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <span className="font-display text-sm font-semibold">K</span>
            </div>
            <span className="font-display text-base">Kwanza</span>
          </Link>
          <p className="ml-auto font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Versão 2026.06 · pt-AO
          </p>
        </header>

        <div className="flex flex-1 items-center justify-center px-8 py-12 lg:px-16">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        <footer className="border-t border-border px-8 py-5 text-xs text-muted-foreground lg:px-12">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>© 2026 Kwanza · Luanda, Angola</span>
            <div className="flex gap-5">
              <a href="#" className="hover:text-foreground">Termos</a>
              <a href="#" className="hover:text-foreground">Privacidade</a>
              <a href="#" className="hover:text-foreground">Suporte</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
