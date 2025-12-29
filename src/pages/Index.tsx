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
      const url = trash ? `${RELEASES_API}?trash=true` : RELEASES_API;
      const response = await fetch(url, {
        headers: { 'X-User-Id': currentUser.id.toString() }
      });
      const data = await response.json();
      if (data.success) {
        setReleases(data.releases || []);
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
        const response = await fetch(RELEASES_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': currentUser.id.toString()
          },
          body: JSON.stringify({
            ...data,
            user_id: currentUser.id,
            status: data.status || 'draft'
          })
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
        description: "Не удалось сохранить релиз",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRelease = async (id: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${RELEASES_API}?id=${id}`, {
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

  const handlePermanentDeleteRelease = async (id: number) => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${RELEASES_API}?id=${id}&permanent=true`, {
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

  const handleModerateRelease = async (id: number, status: 'approved' | 'rejected', rejectionReason?: string) => {
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
          status,
          rejection_reason: rejectionReason,
          moderation_date: new Date().toISOString()
        })
      });
      const result = await response.json();
      
      if (result.success) {
        await loadReleases();
        toast({
          title: status === 'approved' ? "Релиз одобрен" : "Релиз отклонён"
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус",
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
        toast({ title: "Обращение отправлено" });
        setShowTicketForm(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить обращение",
        variant: "destructive"
      });
    }
  };

  const handleTicketResponse = async () => {
    if (!currentUser || !selectedTicket || !adminResponse.trim()) return;

    try {
      const response = await fetch(TICKETS_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({
          id: selectedTicket.id,
          status: 'answered',
          admin_response: adminResponse
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
        toast({ title: "Обращение закрыто" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось закрыть обращение",
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

  const userReleases = releases.filter(r => !r.deleted_at && (
    currentUser?.role === 'admin' || r.user_id === currentUser?.id
  ));

  const filteredReleases = userReleases
    .filter(r => {
      if (activeTab === 'drafts') return r.status === 'draft';
      if (activeTab === 'moderation') return r.status === 'moderation';
      if (activeTab === 'approved') return r.status === 'approved';
      if (activeTab === 'rejected') return r.status === 'rejected';
      return true;
    })
    .filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = genreFilter === 'all' || r.genre === genreFilter;
      return matchesSearch && matchesGenre;
    });

  const deletedReleases = releases.filter(r => r.deleted_at);

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = ticketFilter === 'all' || t.status === ticketFilter;
    const matchesUser = currentUser?.role === 'admin' || t.user_id === currentUser?.id;
    return matchesFilter && matchesUser;
  });

  if (currentView === 'profile') {
    return (
      <ProfilePage
        currentUser={currentUser!}
        onBack={() => setCurrentView('dashboard')}
        onLogout={handleLogout}
        theme={theme}
        onThemeChange={changeTheme}
      />
    );
  }

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 crystal:from-white crystal:via-blue-50 crystal:to-purple-50 blue-dark:from-[#0a1628] blue-dark:via-[#0d1f3a] blue-dark:to-[#162744]">
        <div className="absolute top-4 right-4 z-50">
          <ThemeSelector theme={theme} onThemeChange={changeTheme} />
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
              kedoo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Платформа для музыкантов и лейблов
            </p>
          </div>

          <Tabs defaultValue="login" className="max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Вход в систему</CardTitle>
                  <CardDescription>Введите свои учётные данные</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input id="login-email" name="email" type="email" required />
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
                          <Icon name={showLoginPassword ? "eye-off" : "eye"} className="h-4 w-4" />
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Регистрация</CardTitle>
                  <CardDescription>Создайте новый аккаунт</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Имя</Label>
                      <Input id="register-name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input id="register-email" name="email" type="email" required />
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
                          <Icon name={showRegisterPassword ? "eye-off" : "eye"} className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Зарегистрироваться
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={showResetForm} onOpenChange={setShowResetForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Сброс пароля</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Новый пароль</Label>
                <Input id="new-password" name="new_password" type="password" required />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 crystal:bg-gradient-to-br crystal:from-white crystal:via-blue-50/30 crystal:to-purple-50/30 blue-dark:bg-gradient-to-br blue-dark:from-[#0a1628] blue-dark:via-[#0d1f3a] blue-dark:to-[#162744]">
      <header className="bg-white dark:bg-gray-800 crystal:bg-white/80 crystal:backdrop-blur-xl crystal:border-b crystal:border-gray-200/50 blue-dark:bg-[#0f1d30]/95 blue-dark:backdrop-blur-xl blue-dark:border-b blue-dark:border-blue-500/20 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="sm">
                    <Icon name="menu" className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <nav className="flex flex-col gap-2 mt-8">
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        setCurrentView('dashboard');
                        setShowMobileMenu(false);
                      }}
                    >
                      <Icon name="home" className="mr-2 h-4 w-4" />
                      Главная
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        setCurrentView('profile');
                        setShowMobileMenu(false);
                      }}
                    >
                      <Icon name="user" className="mr-2 h-4 w-4" />
                      Профиль
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-red-600 dark:text-red-400"
                      onClick={() => {
                        handleLogout();
                        setShowMobileMenu(false);
                      }}
                    >
                      <Icon name="log-out" className="mr-2 h-4 w-4" />
                      Выход
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>

              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                kedoo
              </h1>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" onClick={() => setCurrentView('dashboard')}>
                <Icon name="home" className="mr-2 h-4 w-4" />
                Главная
              </Button>
              <Button variant="ghost" onClick={() => setCurrentView('profile')}>
                <Icon name="user" className="mr-2 h-4 w-4" />
                Профиль
              </Button>
              <ThemeSelector theme={theme} onThemeChange={changeTheme} />
              <Button variant="ghost" onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <Icon name="log-out" className="mr-2 h-4 w-4" />
                Выход
              </Button>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <ThemeSelector theme={theme} onThemeChange={changeTheme} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold dark:text-white">
            {currentUser?.role === 'admin' ? 'Панель модератора' : 'Мои релизы'}
          </h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="releases">Все</TabsTrigger>
            <TabsTrigger value="drafts">Черновики</TabsTrigger>
            <TabsTrigger value="moderation">Модерация</TabsTrigger>
            <TabsTrigger value="approved">Одобренные</TabsTrigger>
            <TabsTrigger value="rejected">Отклонённые</TabsTrigger>
            {currentUser?.role === 'user' && (
              <TabsTrigger value="trash">Корзина</TabsTrigger>
            )}
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="support">Поддержка</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {activeTab !== 'support' && activeTab !== 'trash' && (
              <>
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative w-full lg:w-96">
                      <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Поиск по названию или артисту..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={genreFilter} onValueChange={setGenreFilter}>
                      <SelectTrigger className="w-full lg:w-48">
                        <SelectValue placeholder="Все жанры" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все жанры</SelectItem>
                        <SelectItem value="Pop">Pop</SelectItem>
                        <SelectItem value="Rock">Rock</SelectItem>
                        <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                        <SelectItem value="Electronic">Electronic</SelectItem>
                        <SelectItem value="Jazz">Jazz</SelectItem>
                        <SelectItem value="Classical">Classical</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 w-full lg:w-auto">
                    {currentUser?.role === 'user' && (
                      <>
                        <Button onClick={() => setShowReleaseForm(true)} className="flex-1 lg:flex-none">
                          <Icon name="plus" className="mr-2 h-4 w-4" />
                          Новый релиз
                        </Button>
                        <Button onClick={() => setShowTicketForm(true)} variant="outline" className="flex-1 lg:flex-none">
                          <Icon name="help-circle" className="mr-2 h-4 w-4" />
                          Поддержка
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {filteredReleases.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Icon name="music" className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {activeTab === 'drafts' ? 'Нет черновиков' :
                         activeTab === 'moderation' ? 'Нет релизов на модерации' :
                         activeTab === 'approved' ? 'Нет одобренных релизов' :
                         activeTab === 'rejected' ? 'Нет отклонённых релизов' :
                         'Нет релизов'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredReleases.map((release) => (
                      <Card key={release.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-4">
                            {release.cover_url && (
                              <img
                                src={release.cover_url}
                                alt={release.title}
                                className="w-full lg:w-32 h-48 lg:h-32 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xl font-semibold mb-1 dark:text-white truncate">
                                    {release.title}
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400 truncate">
                                    {release.artist}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    release.status === 'approved' ? 'default' :
                                    release.status === 'rejected' ? 'destructive' :
                                    release.status === 'moderation' ? 'secondary' :
                                    'outline'
                                  }
                                  className="shrink-0"
                                >
                                  {release.status === 'draft' ? 'Черновик' :
                                   release.status === 'moderation' ? 'На модерации' :
                                   release.status === 'approved' ? 'Одобрен' :
                                   'Отклонён'}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                                <span className="flex items-center">
                                  <Icon name="calendar" className="h-4 w-4 mr-1" />
                                  {new Date(release.release_date).toLocaleDateString('ru-RU')}
                                </span>
                                <span className="flex items-center">
                                  <Icon name="music" className="h-4 w-4 mr-1" />
                                  {release.genre}
                                </span>
                                <span className="flex items-center">
                                  <Icon name="disc" className="h-4 w-4 mr-1" />
                                  {release.format}
                                </span>
                              </div>
                              {release.rejection_reason && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                  <p className="text-sm text-red-600 dark:text-red-400">
                                    <strong>Причина отклонения:</strong> {release.rejection_reason}
                                  </p>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setViewDetailsRelease(release)}
                                >
                                  <Icon name="eye" className="h-4 w-4 mr-2" />
                                  Подробнее
                                </Button>
                                {currentUser?.role === 'user' && (release.status === 'draft' || release.status === 'rejected') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingRelease(release);
                                      setShowReleaseForm(true);
                                    }}
                                  >
                                    <Icon name="edit" className="h-4 w-4 mr-2" />
                                    Редактировать
                                  </Button>
                                )}
                                {currentUser?.role === 'admin' && release.status === 'moderation' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleModerateRelease(release.id, 'approved')}
                                    >
                                      <Icon name="check" className="h-4 w-4 mr-2" />
                                      Одобрить
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => setSelectedRelease(release)}
                                    >
                                      <Icon name="x" className="h-4 w-4 mr-2" />
                                      Отклонить
                                    </Button>
                                  </>
                                )}
                                {currentUser?.role === 'user' && release.status === 'draft' && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setDeleteDialog(release.id)}
                                  >
                                    <Icon name="trash-2" className="h-4 w-4 mr-2" />
                                    Удалить
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'trash' && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Релизы в корзине будут храниться 30 дней, после чего будут удалены автоматически
                  </p>
                </div>
                {deletedReleases.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Icon name="trash-2" className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400">Корзина пуста</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {deletedReleases.map((release) => (
                      <Card key={release.id} className="opacity-75">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row gap-4">
                            {release.cover_url && (
                              <img
                                src={release.cover_url}
                                alt={release.title}
                                className="w-full lg:w-32 h-48 lg:h-32 object-cover rounded grayscale"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-semibold mb-1 dark:text-white truncate">
                                {release.title}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 mb-4 truncate">
                                {release.artist}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestoreRelease(release.id)}
                                >
                                  <Icon name="rotate-ccw" className="h-4 w-4 mr-2" />
                                  Восстановить
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteDialog(release.id)}
                                >
                                  <Icon name="trash-2" className="h-4 w-4 mr-2" />
                                  Удалить навсегда
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'support' && currentUser?.role === 'admin' && (
              <>
                <div className="mb-4">
                  <Select value={ticketFilter} onValueChange={(value: any) => setTicketFilter(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все обращения</SelectItem>
                      <SelectItem value="open">Открытые</SelectItem>
                      <SelectItem value="answered">Отвеченные</SelectItem>
                      <SelectItem value="closed">Закрытые</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredTickets.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Icon name="help-circle" className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400">Нет обращений</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredTickets.map((ticket) => (
                      <Card key={ticket.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold dark:text-white truncate">
                                  {ticket.subject}
                                </h3>
                                <Badge
                                  variant={
                                    ticket.status === 'open' ? 'destructive' :
                                    ticket.status === 'answered' ? 'secondary' :
                                    'outline'
                                  }
                                >
                                  {ticket.status === 'open' ? 'Открыт' :
                                   ticket.status === 'answered' ? 'Отвечен' :
                                   'Закрыт'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Категория: {ticket.category}
                              </p>
                              <p className="text-gray-700 dark:text-gray-300">
                                {ticket.message}
                              </p>
                            </div>
                          </div>
                          {ticket.admin_response && (
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                              <p className="text-sm font-semibold mb-1 text-blue-900 dark:text-blue-100">
                                Ответ поддержки:
                              </p>
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                {ticket.admin_response}
                              </p>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {ticket.status === 'open' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTicket(ticket)}
                              >
                                <Icon name="message-square" className="h-4 w-4 mr-2" />
                                Ответить
                              </Button>
                            )}
                            {ticket.status !== 'closed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCloseTicket(ticket.id)}
                              >
                                <Icon name="check" className="h-4 w-4 mr-2" />
                                Закрыть обращение
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
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
            release={editingRelease}
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
            <DialogTitle>Обращение в поддержку</DialogTitle>
          </DialogHeader>
          <TicketForm
            onSave={handleSaveTicket}
            onCancel={() => setShowTicketForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewDetailsRelease} onOpenChange={(open) => !open && setViewDetailsRelease(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewDetailsRelease && (
            <ReleaseDetails release={viewDetailsRelease} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedRelease} onOpenChange={(open) => !open && setSelectedRelease(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить релиз</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Причина отклонения</Label>
              <Textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Укажите причину отклонения..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setSelectedRelease(null)}>
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedRelease && adminResponse.trim()) {
                    handleModerateRelease(selectedRelease.id, 'rejected', adminResponse);
                    setAdminResponse('');
                  }
                }}
                disabled={!adminResponse.trim()}
              >
                Отклонить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ответить на обращение</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Обращение</Label>
              <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                {selectedTicket?.message}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Ваш ответ</Label>
              <Textarea
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Введите ответ..."
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setSelectedTicket(null);
                setAdminResponse('');
              }}>
                Отмена
              </Button>
              <Button onClick={handleTicketResponse} disabled={!adminResponse.trim()}>
                Отправить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog !== null} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {activeTab === 'trash' ? 'Удалить навсегда?' : 'Удалить релиз?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeTab === 'trash'
                ? 'Это действие нельзя отменить. Релиз будет удалён безвозвратно.'
                : 'Релиз будет перемещён в корзину. Вы сможете восстановить его в течение 30 дней.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog) {
                  if (activeTab === 'trash') {
                    handlePermanentDeleteRelease(deleteDialog);
                  } else {
                    handleDeleteRelease(deleteDialog);
                  }
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
