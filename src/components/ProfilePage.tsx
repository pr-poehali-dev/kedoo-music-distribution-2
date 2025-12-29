import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/db';

interface ProfilePageProps {
  user: User;
  onBack: () => void;
}

export function ProfilePage({ user, onBack }: ProfilePageProps) {
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      toast({ title: "Ошибка", description: "Введите новый email", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/9f5c445a-3808-4a16-9b62-149fec4c05bb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_email',
          user_id: user.id,
          current_password: currentPassword,
          new_email: newEmail
        })
      });
      const data = await response.json();

      if (data.success) {
        toast({ title: "Email изменён", description: "Ваш email успешно обновлён" });
        setNewEmail('');
        setCurrentPassword('');
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось изменить email", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось выполнить операцию", variant: "destructive" });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Ошибка", description: "Пароли не совпадают", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/9f5c445a-3808-4a16-9b62-149fec4c05bb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          user_id: user.id,
          current_password: currentPassword,
          new_password: newPassword
        })
      });
      const data = await response.json();

      if (data.success) {
        toast({ title: "Пароль изменён", description: "Ваш пароль успешно обновлён" });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось изменить пароль", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Не удалось выполнить операцию", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <Icon name="ArrowLeft" size={18} className="mr-2" />
          Назад
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Профиль</h1>
            <p className="text-muted-foreground">Управление вашим аккаунтом</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Информация об аккаунте</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Имя</Label>
                <Input value={user.name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Input value={user.role === 'admin' ? 'Модератор' : 'Пользователь'} disabled />
              </div>
              {user.role === 'user' && (
                <div className="space-y-2">
                  <Label>Баланс</Label>
                  <Input value={`${user.balance?.toFixed(2) || '0.00'} ₽`} disabled />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Изменить Email</CardTitle>
              <CardDescription>Привяжите новый email к вашему аккаунту</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-email">Новый Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="new@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-pass-email">Текущий пароль</Label>
                  <Input
                    id="current-pass-email"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Для подтверждения"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Изменить Email
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Изменить пароль</CardTitle>
              <CardDescription>Обновите пароль для входа</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-pass">Текущий пароль</Label>
                  <Input
                    id="current-pass"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="new-pass">Новый пароль</Label>
                  <Input
                    id="new-pass"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pass">Подтвердите новый пароль</Label>
                  <Input
                    id="confirm-pass"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Изменить пароль
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
