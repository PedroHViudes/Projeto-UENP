import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Package, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      toast({ title: 'Erro', description: 'Credenciais inválidas.', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
            <Package className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">TrackFlow</h1>
            <p className="text-sm text-muted-foreground">Gestão de Processos</p>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-lg">Acessar Sistema</CardTitle>
            <CardDescription>Entre com suas credenciais</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="usuario@gov.br" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full gap-2">
                <LogIn className="w-4 h-4" /> Entrar
              </Button>
            </form>

            <div className="mt-6 p-3 rounded-lg bg-muted">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Usuários de demonstração (senha: 123456)</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>planejamento@gov.br • almoxarifado@gov.br</p>
                <p>nti@gov.br • patrimonio@gov.br • admin@gov.br</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
