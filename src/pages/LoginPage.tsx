import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserRole, ROLE_LABELS } from '@/types/process';

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('planejamento');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const error = await login(loginEmail, loginPassword);
    if (error) {
      toast({ title: 'Erro', description: error, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 6) {
      toast({ title: 'Erro', description: 'A senha deve ter pelo menos 6 caracteres.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const error = await register(regEmail, regPassword, regName, regRole);
    if (error) {
      toast({ title: 'Erro', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Conta criada!', description: 'Você já está logado no sistema.' });
    }
    setSubmitting(false);
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'planejamento', label: ROLE_LABELS.planejamento },
    { value: 'almoxarifado', label: ROLE_LABELS.almoxarifado },
    { value: 'nti', label: ROLE_LABELS.nti },
    { value: 'patrimonio', label: ROLE_LABELS.patrimonio },
    { value: 'admin', label: ROLE_LABELS.admin },
  ];

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
          <Tabs defaultValue="login">
            <CardHeader className="pb-2">
              <TabsList className="w-full">
                <TabsTrigger value="login" className="flex-1">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="flex-1">Cadastrar</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input id="login-email" type="email" placeholder="usuario@gov.br" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input id="login-password" type="password" placeholder="••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    Entrar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nome Completo</Label>
                    <Input id="reg-name" placeholder="Seu nome" value={regName} onChange={e => setRegName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">E-mail</Label>
                    <Input id="reg-email" type="email" placeholder="usuario@gov.br" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Senha</Label>
                    <Input id="reg-password" type="password" placeholder="Mínimo 6 caracteres" value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Setor</Label>
                    <Select value={regRole} onValueChange={(v) => setRegRole(v as UserRole)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(r => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Criar Conta
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
