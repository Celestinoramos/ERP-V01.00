import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROVINCIAS } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/registar")({
  head: () => ({ meta: [{ title: "Registar empresa · Kwanza" }] }),
  component: RegistarPage,
});

const schema = z.object({
  empresa: z.string().min(3),
  nif: z.string().regex(/^\d{10}$/, "NIF deve ter 10 dígitos"),
  provincia: z.string().min(1),
  nome: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(10, "Mínimo 10 caracteres para palavra-passe"),
});

function RegistarPage() {
  const nav = useNavigate();
  const [data, setData] = useState({
    empresa: "", nif: "", provincia: "Luanda", nome: "", email: "", password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function field<K extends keyof typeof data>(k: K, v: string) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(data);
    if (!r.success) {
      const flat: Record<string, string> = {};
      r.error.issues.forEach((i) => (flat[String(i.path[0])] = i.message));
      setErrors(flat);
      return;
    }
    toast.success("Empresa registada — falta carregar certificado AGT");
    nav({ to: "/empresa" });
  }

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ochre">
          Novo tenant
        </p>
        <h2 className="mt-3 font-display text-3xl tracking-tight">Registar empresa</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cria a tua organização em Kwanza. Depois carregas o certificado PKCS#12 emitido pela AGT.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="empresa">Designação social</Label>
          <Input id="empresa" value={data.empresa} onChange={(e) => field("empresa", e.target.value)} />
          {errors.empresa && <p className="text-xs text-destructive">{errors.empresa}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nif">NIF</Label>
            <Input id="nif" inputMode="numeric" maxLength={10} value={data.nif}
              onChange={(e) => field("nif", e.target.value.replace(/\D/g, ""))} />
            {errors.nif && <p className="text-xs text-destructive">{errors.nif}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="provincia">Província</Label>
            <Select value={data.provincia} onValueChange={(v) => field("provincia", v)}>
              <SelectTrigger id="provincia"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROVINCIAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="section-rule pt-5 space-y-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Administrador principal
          </p>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" value={data.nome} onChange={(e) => field("nome", e.target.value)} />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={data.email} onChange={(e) => field("email", e.target.value)} />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Palavra-passe</Label>
            <Input id="password" type="password" value={data.password} onChange={(e) => field("password", e.target.value)} />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            <p className="text-[11px] text-muted-foreground">Mínimo 10 caracteres. Usa maiúsculas, números e símbolos.</p>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">Criar conta</Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Já tens conta?{" "}
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
