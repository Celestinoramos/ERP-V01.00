import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { mockApi } from "@/lib/mock/api";

export const Route = createFileRoute("/_auth/login")({
  head: () => ({
    meta: [
      { title: "Entrar · Kwanza" },
      { name: "description", content: "Acesso à plataforma Kwanza para reconstrução contabilística." },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse({ email, password });
    if (!r.success) {
      const flat: Record<string, string> = {};
      r.error.issues.forEach((i) => (flat[String(i.path[0])] = i.message));
      setErrors(flat);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await mockApi.login(email, password);
      toast.success("Sessão iniciada");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ochre">
          Acesso restrito
        </p>
        <h2 className="mt-3 font-display text-4xl tracking-tight">Entrar na plataforma</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Usa o email associado ao teu NIF empresarial.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email profissional</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nome@empresa.ao"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Palavra-passe</Label>
            <Link to="/recuperar" className="text-xs text-muted-foreground hover:text-foreground">
              Esqueci-me
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Checkbox id="lembrar" />
          <Label htmlFor="lembrar" className="text-xs font-normal text-muted-foreground">
            Manter sessão iniciada neste dispositivo
          </Label>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "A autenticar…" : "Entrar"}
        </Button>
      </form>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Ainda não tens conta?{" "}
        <Link to="/registar" className="font-medium text-foreground underline-offset-4 hover:underline">
          Registar empresa
        </Link>
      </p>
    </div>
  );
}
