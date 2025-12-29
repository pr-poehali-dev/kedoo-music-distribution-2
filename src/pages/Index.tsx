import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { ReleaseForm } from '@/components/ReleaseForm';
import { TicketForm } from '@/components/TicketForm';
import { ReleaseDetails } from '@/components/ReleaseDetails';
import { ThemeSelector } from '@/components/ThemeSelector';
import { ProfilePage } from '@/components/ProfilePage';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User, Release, Ticket } from '@/lib/db';

const RELEASES_API = 'https://functions.poehali.dev/aab88ae6-4e32-4979-86e9-166b9afe10ef';
const TICKETS_API = 'https://functions.poehali.dev/8554c9f5-b082-4425-86d5-70ceda845616';

const Index = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'crystal' | 'blue-dark'>('light');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'profile'>('landing');
  const [activeTab, setActiveTab] = useState('releases');
  const [showReleaseForm, setShowReleaseForm] = useState(false);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [viewDetailsRelease, setViewDetailsRelease] = useState<Release | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'answered' | 'closed'>('all');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [releases, setReleases] = useState<Release[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'crystal' | 'blue-dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.remove('dark', 'crystal', 'blue-dark');
    if (savedTheme !== 'light') {
      document.documentElement.classList.add(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadReleases();
      loadTickets();
    }
  }, [currentUser]);

  const loadReleases = async (trash = false) => {
    if (!currentUser) return;
    
    try {
      const url = trash ? `${RELEASES_API}/?trash=true` : RELEASES_API;
      const response = await fetch(url, {
        headers: { 'X-User-Id': currentUser.id.toString() }
      });
      const data = await response.json();
      
      if (data.success) {
        setReleases(data.releases || []);
      } else {
        toast({
          title: "Ошибка загрузки релизов",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить релизы",
        variant: "destructive"
      });
    }
  };

  const loadTickets = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(TICKETS_API, {
        headers: { 'X-User-Id': currentUser.id.toString() }
      });
      const data = await response.json();
      
      if (data.success) {
        setTickets(data.tickets || []);
      } else {
        toast({
          title: "Ошибка загрузки тикетов",
          description: data.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить тикеты",
        variant: "destructive"
      });
    }
  };

  const changeTheme = (newTheme: 'light' | 'dark' | 'crystal' | 'blue-dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove('dark', 'crystal', 'blue-dark');
    if (newTheme !== 'light') {
      document.documentElement.classList.add(newTheme);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('https://functions.poehali.dev/9f5c445a-3808-4a16-9b62-149fec4c05bb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        setCurrentView('dashboard');
        toast({
          title: `Добро пожаловать, ${data.user.name}!`,
          description: data.user.role === 'admin' ? 'Панель модератора' : 'Личный кабинет',
        });
      } else {
        toast({
          title: "Ошибка входа",
          description: data.error || "Неверный email или пароль",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить вход",
        variant: "destructive"
      });
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      const response = await fetch('https://functions.poehali.dev/9f5c445a-3808-4a16-9b62-149fec4c05bb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password, name, role: 'user' })
      });
      const data = await response.json();

      if (data.success) {
        setCurrentUser(data.user);
        setCurrentView('dashboard');
        toast({
          title: "Регистрация успешна!",
          description: "Добро пожаловать в kedoo!"
        });
      } else {
        toast({
          title: "Ошибка регистрации",
          description: data.error || "Email уже занят",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить регистрацию",
        variant: "destructive"
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const new_password = formData.get('new_password') as string;

    try {
      const response = await fetch('https://functions.poehali.dev/9f5c445a-3808-4a16-9b62-149fec4c05bb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', email, new_password })
      });
      const data = await response.json();

      if (data.success) {
        setShowResetForm(false);
        toast({
          title: "Пароль обновлён",
          description: "Теперь вы можете войти с новым паролем"
        });
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось сбросить пароль",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить сброс пароля",
        variant: "destructive"
      });
    }
  };

  const handleSaveRelease = async (data: any) => {
    if (!currentUser) return;

    try {
      setLoading(true);
      
      if (editingRelease) {
        const updateData = { ...data, id: editingRelease.id };
        if (data.status === 'moderation') {
          updateData.rejection_reason = undefined;
        }
        
        const response = await fetch(RELEASES_API, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': currentUser.id.toString()
          },
          body: JSON.stringify(updateData)
        });
        const result = await response.json();

        if (result.success) {
          await loadReleases();
          toast({ title: "Релиз обновлён" });
        } else {
          throw new Error(result.error);
        }
      } else {
        const releaseData = {
          ...data,
          user_id: currentUser.id,
          status: data.status || 'draft'
        };

        const response = await fetch(RELEASES_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': currentUser.id.toString()
          },
          body: JSON.stringify(releaseData)
        });
        const result = await response.json();

        if (result.success) {
          await loadReleases();
          toast({
            title: data.status === 'moderation' ? "Релиз отправлен на модерацию" : "Черновик сохранён"
          });
        } else {
          throw new Error(result.error);
        }
      }

      setShowReleaseForm(false);
      setEditingRelease(null);
      if (data.status === 'moderation') {
        setActiveTab('releases');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось сохранить релиз",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRelease = async (id: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${RELEASES_API}/?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': currentUser.id.toString() }
      });
      const result = await response.json();

      if (result.success) {
        await loadReleases();
        toast({ title: "Релиз перемещён в корзину" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить релиз",
        variant: "destructive"
      });
    }
    setDeleteDialog(null);
  };

  const handleRestoreRelease = async (id: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch(RELEASES_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({ action: 'restore', release_id: id })
      });
      const result = await response.json();

      if (result.success) {
        await loadReleases(true);
        toast({ title: "Релиз восстановлен" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось восстановить релиз",
        variant: "destructive"
      });
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${RELEASES_API}/?id=${id}&permanent=true`, {
        method: 'DELETE',
        headers: { 'X-User-Id': currentUser.id.toString() }
      });
      const result = await response.json();

      if (result.success) {
        await loadReleases(true);
        toast({ title: "Релиз удалён навсегда" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить релиз",
        variant: "destructive"
      });
    }
  };

  const handleApproveRelease = async (id: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch(RELEASES_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({ 
          id,
          status: 'approved',
          moderation_date: new Date().toISOString()
        })
      });
      const result = await response.json();

      if (result.success) {
        await loadReleases();
        toast({ title: "Релиз одобрен" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось одобрить релиз",
        variant: "destructive"
      });
    }
    setSelectedRelease(null);
  };

  const handleRejectRelease = async (id: number, reason: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch(RELEASES_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({ 
          id,
          status: 'rejected',
          rejection_reason: reason,
          moderation_date: new Date().toISOString()
        })
      });
      const result = await response.json();

      if (result.success) {
        await loadReleases();
        toast({ title: "Релиз отклонён", variant: "destructive" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отклонить релиз",
        variant: "destructive"
      });
    }
    setSelectedRelease(null);
  };

  const handleSaveTicket = async (data: any) => {
    if (!currentUser) return;

    try {
      const response = await fetch(TICKETS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({
          ...data,
          user_id: currentUser.id,
          status: 'open'
        })
      });
      const result = await response.json();

      if (result.success) {
        await loadTickets();
        toast({ title: "Тикет создан" });
        setShowTicketForm(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать тикет",
        variant: "destructive"
      });
    }
  };

  const handleRespondToTicket = async (ticketId: number) => {
    if (!currentUser || !adminResponse.trim()) return;

    try {
      const response = await fetch(TICKETS_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({
          id: ticketId,
          status: 'answered',
          admin_response: adminResponse,
          admin_id: currentUser.id,
          response_date: new Date().toISOString()
        })
      });
      const result = await response.json();

      if (result.success) {
        await loadTickets();
        toast({ title: "Ответ отправлен" });
        setSelectedTicket(null);
        setAdminResponse('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить ответ",
        variant: "destructive"
      });
    }
  };

  const handleCloseTicket = async (id: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch(TICKETS_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({
          id,
          status: 'closed'
        })
      });
      const result = await response.json();

      if (result.success) {
        await loadTickets();
        toast({ title: "Тикет закрыт" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось закрыть тикет",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setReleases([]);
    setTickets([]);
    toast({ title: "Вы вышли из системы" });
  };

  const getUserReleases = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return releases;
    return releases.filter(r => r.user_id === currentUser.id);
  };

  const getFilteredReleases = () => {
    let filtered = getUserReleases();
    
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (genreFilter !== 'all') {
      filtered = filtered.filter(r => r.genre === genreFilter);
    }
    
    return filtered;
  };

  const getReleasesByStatus = (status: string) => {
    return getFilteredReleases().filter(r => r.status === status);
  };

  const getUserTickets = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return tickets;
    return tickets.filter(t => t.user_id === currentUser.id);
  };

  const getFilteredTickets = () => {
    const userTickets = getUserTickets();
    if (ticketFilter === 'all') return userTickets;
    return userTickets.filter(t => t.status === ticketFilter);
  };

  const genres = Array.from(new Set(releases.map(r => r.genre)));

  if (currentView === 'profile' && currentUser) {
    return (
      <ProfilePage 
        user={currentUser}
        onBack={() => setCurrentView('dashboard')}
        onUpdateUser={setCurrentUser}
        theme={theme}
        onChangeTheme={changeTheme}
      />
    );
  }

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-5xl">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <Icon name="music" className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold mb-2">kedoo</CardTitle>
            <CardDescription className="text-lg">Платформа дистрибуции музыки</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Пароль</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        name="password"
                        type={showLoginPassword ? "text" : "password"}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        <Icon name={showLoginPassword ? "eye-off" : "eye"} className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Войти
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={() => setShowResetForm(true)}
                  >
                    Забыли пароль?
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Имя</Label>
                    <Input
                      id="register-name"
                      name="name"
                      placeholder="Ваше имя"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Пароль</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        name="password"
                        type={showRegisterPassword ? "text" : "password"}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        <Icon name={showRegisterPassword ? "eye-off" : "eye"} className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Зарегистрироваться
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Dialog open={showResetForm} onOpenChange={setShowResetForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Сброс пароля</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Новый пароль</Label>
                <Input
                  id="new-password"
                  name="new_password"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Сбросить пароль
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="music" className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">kedoo</h1>
                {currentUser?.role === 'admin' && (
                  <Badge variant="secondary" className="text-xs">Модератор</Badge>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <ThemeSelector theme={theme} onThemeChange={changeTheme} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('profile')}
              >
                <Icon name="user" className="w-4 h-4 mr-2" />
                {currentUser?.name}
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <Icon name="log-out" className="w-4 h-4 mr-2" />
                Выход
              </Button>
            </div>

            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Icon name="menu" className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-4 mt-8">
                  <ThemeSelector theme={theme} onThemeChange={changeTheme} />
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      setCurrentView('profile');
                      setShowMobileMenu(false);
                    }}
                  >
                    <Icon name="user" className="w-4 h-4 mr-2" />
                    {currentUser?.name}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                  >
                    <Icon name="log-out" className="w-4 h-4 mr-2" />
                    Выход
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="releases">
              <Icon name="disc" className="w-4 h-4 mr-2" />
              Релизы
            </TabsTrigger>
            <TabsTrigger value="drafts">
              <Icon name="file-text" className="w-4 h-4 mr-2" />
              Черновики
            </TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="moderation">
                <Icon name="shield" className="w-4 h-4 mr-2" />
                Модерация
                {getReleasesByStatus('moderation').length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {getReleasesByStatus('moderation').length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger value="trash">
              <Icon name="trash-2" className="w-4 h-4 mr-2" />
              Корзина
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <Icon name="message-square" className="w-4 h-4 mr-2" />
              Тикеты
              {getFilteredTickets().filter(t => t.status === 'open').length > 0 && (
                <Badge variant="default" className="ml-2">
                  {getFilteredTickets().filter(t => t.status === 'open').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="releases">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 w-full sm:max-w-md">
                  <Input
                    placeholder="Поиск по названию или исполнителю..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Select value={genreFilter} onValueChange={setGenreFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Все жанры" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все жанры</SelectItem>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowReleaseForm(true)}>
                    <Icon name="plus" className="w-4 h-4 mr-2" />
                    Новый релиз
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getReleasesByStatus('approved').length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Icon name="disc" className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Нет опубликованных релизов</p>
                    </CardContent>
                  </Card>
                ) : (
                  getReleasesByStatus('approved').map((release) => (
                    <Card key={release.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center">
                        {release.cover_url ? (
                          <img src={release.cover_url} alt={release.title} className="w-full h-full object-cover" />
                        ) : (
                          <Icon name="disc" className="w-16 h-16 text-muted-foreground" />
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="truncate">{release.title}</CardTitle>
                        <CardDescription className="truncate">{release.artist}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <Badge>{release.genre}</Badge>
                          <Badge variant="outline">{release.release_type}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setViewDetailsRelease(release)}
                          >
                            <Icon name="eye" className="w-4 h-4 mr-2" />
                            Просмотр
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingRelease(release);
                              setShowReleaseForm(true);
                            }}
                          >
                            <Icon name="edit" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteDialog(release.id)}
                          >
                            <Icon name="trash-2" className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {getReleasesByStatus('rejected').length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-destructive">Отклонённые релизы</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {getReleasesByStatus('rejected').map((release) => (
                      <Card key={release.id} className="border-destructive">
                        <CardHeader>
                          <CardTitle className="truncate">{release.title}</CardTitle>
                          <CardDescription className="truncate">{release.artist}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Badge variant="destructive" className="mb-2">Отклонён</Badge>
                          {release.rejection_reason && (
                            <p className="text-sm text-muted-foreground mb-4">
                              {release.rejection_reason}
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setEditingRelease(release);
                              setShowReleaseForm(true);
                            }}
                          >
                            <Icon name="edit" className="w-4 h-4 mr-2" />
                            Исправить и отправить снова
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="drafts">
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button onClick={() => setShowReleaseForm(true)}>
                  <Icon name="plus" className="w-4 h-4 mr-2" />
                  Новый черновик
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getReleasesByStatus('draft').length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Icon name="file-text" className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Нет черновиков</p>
                    </CardContent>
                  </Card>
                ) : (
                  getReleasesByStatus('draft').map((release) => (
                    <Card key={release.id}>
                      <CardHeader>
                        <CardTitle className="truncate">{release.title}</CardTitle>
                        <CardDescription className="truncate">{release.artist}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary" className="mb-4">Черновик</Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setEditingRelease(release);
                              setShowReleaseForm(true);
                            }}
                          >
                            <Icon name="edit" className="w-4 h-4 mr-2" />
                            Редактировать
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteDialog(release.id)}
                          >
                            <Icon name="trash-2" className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {currentUser?.role === 'admin' && (
            <TabsContent value="moderation">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getReleasesByStatus('moderation').length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Icon name="shield" className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Нет релизов на модерации</p>
                    </CardContent>
                  </Card>
                ) : (
                  getReleasesByStatus('moderation').map((release) => (
                    <Card key={release.id}>
                      <CardHeader>
                        <CardTitle className="truncate">{release.title}</CardTitle>
                        <CardDescription className="truncate">{release.artist}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge className="mb-4">На модерации</Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setSelectedRelease(release)}
                          >
                            <Icon name="eye" className="w-4 h-4 mr-2" />
                            Проверить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          )}

          <TabsContent value="trash">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Корзина</CardTitle>
                  <CardDescription>
                    Релизы будут храниться в корзине 30 дней, после чего будут удалены навсегда
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getReleasesByStatus('deleted').length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Icon name="trash-2" className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Корзина пуста</p>
                    </CardContent>
                  </Card>
                ) : (
                  getReleasesByStatus('deleted').map((release) => (
                    <Card key={release.id} className="opacity-60">
                      <CardHeader>
                        <CardTitle className="truncate">{release.title}</CardTitle>
                        <CardDescription className="truncate">{release.artist}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleRestoreRelease(release.id)}
                          >
                            <Icon name="rotate-ccw" className="w-4 h-4 mr-2" />
                            Восстановить
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handlePermanentDelete(release.id)}
                          >
                            <Icon name="x" className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tickets">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <Select value={ticketFilter} onValueChange={(v: any) => setTicketFilter(v)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все тикеты</SelectItem>
                    <SelectItem value="open">Открытые</SelectItem>
                    <SelectItem value="answered">Отвеченные</SelectItem>
                    <SelectItem value="closed">Закрытые</SelectItem>
                  </SelectContent>
                </Select>
                {currentUser?.role !== 'admin' && (
                  <Button onClick={() => setShowTicketForm(true)}>
                    <Icon name="plus" className="w-4 h-4 mr-2" />
                    Новый тикет
                  </Button>
                )}
              </div>

              <div className="grid gap-4">
                {getFilteredTickets().length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Icon name="message-square" className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Нет тикетов</p>
                    </CardContent>
                  </Card>
                ) : (
                  getFilteredTickets().map((ticket) => (
                    <Card key={ticket.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="mb-2">{ticket.subject}</CardTitle>
                            <CardDescription>
                              {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              ticket.status === 'open'
                                ? 'default'
                                : ticket.status === 'answered'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {ticket.status === 'open'
                              ? 'Открыт'
                              : ticket.status === 'answered'
                              ? 'Отвечен'
                              : 'Закрыт'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4 whitespace-pre-wrap">{ticket.message}</p>
                        {ticket.admin_response && (
                          <div className="bg-muted p-4 rounded-lg mb-4">
                            <p className="text-sm font-medium mb-2">Ответ администратора:</p>
                            <p className="text-sm whitespace-pre-wrap">{ticket.admin_response}</p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {currentUser?.role === 'admin' && ticket.status === 'open' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTicket(ticket)}
                            >
                              <Icon name="message-square" className="w-4 h-4 mr-2" />
                              Ответить
                            </Button>
                          )}
                          {ticket.status === 'answered' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCloseTicket(ticket.id)}
                            >
                              <Icon name="check" className="w-4 h-4 mr-2" />
                              Закрыть тикет
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showReleaseForm} onOpenChange={setShowReleaseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRelease ? 'Редактировать релиз' : 'Новый релиз'}
            </DialogTitle>
          </DialogHeader>
          <ReleaseForm
            release={editingRelease || undefined}
            onSave={handleSaveRelease}
            onCancel={() => {
              setShowReleaseForm(false);
              setEditingRelease(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showTicketForm} onOpenChange={setShowTicketForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый тикет</DialogTitle>
          </DialogHeader>
          <TicketForm
            onSave={handleSaveTicket}
            onCancel={() => setShowTicketForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewDetailsRelease} onOpenChange={() => setViewDetailsRelease(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ReleaseDetails release={viewDetailsRelease!} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedRelease} onOpenChange={() => setSelectedRelease(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Модерация релиза</DialogTitle>
          </DialogHeader>
          {selectedRelease && (
            <div className="space-y-6">
              <ReleaseDetails release={selectedRelease} />
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => handleApproveRelease(selectedRelease.id)}
                >
                  <Icon name="check" className="w-4 h-4 mr-2" />
                  Одобрить
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    const reason = prompt('Причина отклонения:');
                    if (reason) {
                      handleRejectRelease(selectedRelease.id, reason);
                    }
                  }}
                >
                  <Icon name="x" className="w-4 h-4 mr-2" />
                  Отклонить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ответить на тикет</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{selectedTicket.subject}</h4>
                <p className="text-sm text-muted-foreground mb-4">{selectedTicket.message}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-response">Ваш ответ</Label>
                <Textarea
                  id="admin-response"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={5}
                  placeholder="Введите ответ..."
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handleRespondToTicket(selectedTicket.id)}
              >
                Отправить ответ
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить релиз?</AlertDialogTitle>
            <AlertDialogDescription>
              Релиз будет перемещён в корзину. Вы сможете восстановить его в течение 30 дней.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDialog && handleDeleteRelease(deleteDialog)}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
