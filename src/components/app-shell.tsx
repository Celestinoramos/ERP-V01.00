import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Upload,
  WandSparkles,
  ShieldCheck,
  Clock3,
  TriangleAlert,
  FileBarChart,
  Layers3,
  Users,
  Settings,
  Search,
  Bell,
  ChevronsUpDown,
  CircleDot,
} from "lucide-react";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const nav: { section: string; items: NavItem[] }[] = [
  {
    section: "Fluxo principal",
    items: [
      { label: "Painel", to: "/dashboard", icon: LayoutDashboard },
      { label: "Upload", to: "/faturacao", icon: Upload, badge: "2" },
      { label: "Revisão", to: "/contabilidade", icon: WandSparkles },
      { label: "Evidências", to: "/inventario", icon: ShieldCheck },
      { label: "Linha do tempo", to: "/rh", icon: Clock3 },
    ],
  },
  {
    section: "Análise",
    items: [
      { label: "Lacunas", to: "/fornecedores", icon: TriangleAlert },
      { label: "Exportação", to: "/clientes", icon: FileBarChart },
      { label: "Lotes", to: "/lotes", icon: Layers3 },
    ],
  },
  {
    section: "Sistema",
    items: [
      { label: "Clientes", to: "/clientes", icon: Users },
      { label: "Definições", to: "/settings", icon: Settings },
    ],
  },
];

export function AppShell({ children, title, subtitle, actions }: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-ochre text-ochre-foreground">
            <span className="font-display text-base font-semibold">K</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-sm tracking-tight text-sidebar-foreground">Reconstrução Contabilística</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-sidebar-foreground/50">v2026.07</div>
          </div>
        </div>

        {/* Tenant switcher */}
        <button className="mx-3 mt-3 flex items-center gap-3 rounded-md border border-sidebar-border bg-sidebar-accent px-3 py-2.5 text-left hover:bg-sidebar-accent/70">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-sidebar-primary/15 text-sidebar-primary">
            <CircleDot className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-sidebar-accent-foreground">
              Mavinga Comércio
            </div>
            <div className="font-mono text-[10px] text-sidebar-foreground/50">Cliente ativo · multi-tenant</div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-sidebar-foreground/50" />
        </button>

        <nav className="mt-6 flex-1 overflow-y-auto px-3 pb-4">
          {nav.map((group) => (
            <div key={group.section} className="mb-6">
              <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/40">
                {group.section}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", active && "text-ochre")} />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-sm bg-ochre/15 px-1.5 py-0.5 font-mono text-[10px] text-ochre">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-ochre/20 text-ochre text-xs">RD</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">REDACTED</div>
              <div className="truncate font-mono text-[10px] text-sidebar-foreground/50">Administradora</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur lg:px-10">
          <div className="hidden flex-1 items-center gap-2 lg:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Procurar movimento, documento, cliente, lacuna…"
              className="w-full max-w-md border-0 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">
              ⌘K
            </kbd>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-ochre" />
            </button>
            <Badge variant="outline" className="hidden border-success/40 text-success lg:inline-flex">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success" />
              IA + revisão humana
            </Badge>
          </div>
        </header>

        <div className="border-b border-border bg-surface px-6 py-7 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl tracking-tight text-foreground">{title}</h1>
              {subtitle && (
                <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>

        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
