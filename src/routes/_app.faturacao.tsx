import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Plus, Download, FolderUp, Image as ImageIcon, Sheet, FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mockApi } from "@/lib/mock/api";
import { fmt } from "@/lib/format";

export const Route = createFileRoute("/_app/faturacao")({
  head: () => ({
    meta: [
      { title: "Upload documental · Kwanza" },
      { name: "description", content: "Faturação eletrónica certificada AGT — séries, hash SHA-256, QR Code." },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const { data: batches = [] } = useQuery({ queryKey: ["uploadBatches"], queryFn: () => mockApi.listUploadBatches() });
  const { data: clients = [] } = useQuery({ queryKey: ["clientes"], queryFn: () => mockApi.listClientes() });

  const stats = useMemo(() => {
    const ready = batches.filter((batch) => batch.status === "ready_review").length;
    const processing = batches.filter((batch) => batch.status === "processing").length;
    const uploaded = batches.filter((batch) => batch.status === "uploaded").length;
    return { ready, processing, uploaded };
  }, [batches]);

  return (
    <AppShell
      title="Upload documental"
      subtitle="Extratos bancários, faturas, recibos e outros documentos em massa"
      actions={
        <>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-3.5 w-3.5" /> Exportar lote
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-3.5 w-3.5" /> Novo lote
          </Button>
        </>
      }
    >
      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
        <Metric label="Lotes prontos" value={String(stats.ready)} />
        <Metric label="Em processamento" value={String(stats.processing)} />
        <Metric label="Aguardando upload" value={String(stats.uploaded)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Entrada rápida</p>
              <h3 className="mt-1 font-display text-lg">Carregar documentos em massa</h3>
            </div>
            <Badge variant="outline">PDF, Excel, CSV, JPG, PNG</Badge>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 px-6 py-12 text-center transition-colors hover:border-foreground/40 hover:bg-accent/40">
            <FolderUp className="h-8 w-8 text-muted-foreground" />
            <div className="mt-4 font-medium">Arrastar ficheiros ou selecionar manualmente</div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              O sistema aceita extratos bancários, faturas e recibos. A organização é feita por cliente e período.
            </p>
            <input multiple type="file" className="hidden" accept=".pdf,.xlsx,.csv,.jpg,.jpeg,.png" />
          </label>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Checklist icon={<FileText className="h-4 w-4" />} title="Extratos" text="PDF, Excel ou CSV" />
            <Checklist icon={<ImageIcon className="h-4 w-4" />} title="Faturas e recibos" text="PDF ou imagem" />
            <Checklist icon={<Sheet className="h-4 w-4" />} title="Bulk upload" text="Vários ficheiros por lote" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Organização</p>
            <h3 className="mt-1 font-display text-lg">Por cliente e período</h3>
          </div>
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{client.nome}</div>
                    <div className="text-sm text-muted-foreground">{client.provincia} · NIF {fmt.nif(client.nif)}</div>
                  </div>
                  <Badge variant="outline">{client.estado}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Lotes recentes</p>
            <h3 className="mt-1 font-display text-lg">Estado do processamento</h3>
          </div>
          <div className="divide-y divide-border">
            {batches.map((batch) => (
              <Link key={batch.id} to="/faturacao/$id" params={{ id: batch.id }} className="block p-5 transition-colors hover:bg-accent/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{batch.clienteNome}</div>
                    <div className="text-sm text-muted-foreground">Período {batch.periodo} · {batch.fileCount} ficheiros</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {batch.fileTypes.map((type) => (
                        <Badge key={type} variant="outline" className="capitalize">{type}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="w-48 shrink-0 text-right">
                    <Badge variant="outline">{batch.status}</Badge>
                    <div className="mt-2 text-xs text-muted-foreground">{batch.notes}</div>
                    <Progress value={batch.progress} className="mt-3" />
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {batch.progress}% · {batch.processedAt ? "processado" : "em fila"}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Processamento automático</p>
            <h3 className="mt-1 font-display text-lg">OCR, parsing e normalização</h3>
          </div>
          <div className="space-y-4">
            <ProcessLine label="Leitura automática de extratos" value="Data, valor, descrição, tipo de movimento" />
            <ProcessLine label="OCR de faturas e recibos" value="Texto e metadados normalizados" />
            <ProcessLine label="Normalização interna" value="Modelo único para movimentos e documentos" />
            <ProcessLine label="Validação humana obrigatória" value="Sem força automática na conciliação" />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-xl tracking-tight tabular-nums">{value}</div>
    </div>
  );
}

function Checklist({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent">{icon}</span>
        <div className="font-medium">{title}</div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function ProcessLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="font-medium">{label}</div>
      <div className="mt-1 text-sm text-muted-foreground">{value}</div>
    </div>
  );
}

