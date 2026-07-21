import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/recuperar")({
  head: () => ({ meta: [{ title: "Recuperar acesso · Kwanza" }] }),
  component: RecuperarPage,
});

function RecuperarPage() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-ochre">
          Recuperação de acesso
        </p>
        <h2 className="mt-3 font-display text-3xl tracking-tight">Esqueci-me da palavra-passe</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enviamos um link de recuperação para o email registado.
        </p>
      </div>

      {sent ? (
        <div className="rounded-md border border-success/30 bg-success/5 p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-success">Enviado</p>
          <p className="mt-2 text-sm text-foreground">
            Verifica a tua caixa de entrada. O link é válido por 30 minutos.
          </p>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Link enviado"); setSent(true); }} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required />
          </div>
          <Button type="submit" size="lg" className="w-full">Enviar link</Button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          ← Voltar ao login
        </Link>
      </p>
    </div>
  );
}
