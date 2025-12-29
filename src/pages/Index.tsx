import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { ReleaseForm } from '@/components/ReleaseForm';
import { TicketForm } from '@/components/TicketForm';
import { ReleaseDetails } from '@/components/ReleaseDetails';
import { ThemeSelector } from '@/components/ThemeSelector';
import { ProfilePage } from '@/components/ProfilePage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockDb } from '@/lib/mockData';
import type { User, Release, Ticket } from '@/lib/db';

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
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'crystal' | 'blue-dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.remove('dark', 'crystal', 'blue-dark');
    if (savedTheme !== 'light') {
      document.documentElement.classList.add(savedTheme);
    }
  }, []);

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

  const handleSaveRelease = (data: any) => {
    if (editingRelease) {
      const updateData = { ...data };
      if (data.status === 'moderation') {
        updateData.rejection_reason = undefined;
      }
      mockDb.releases.update(editingRelease.id, updateData);
      mockDb.tracks.deleteByReleaseId(editingRelease.id);
      if (data.tracks) {
        data.tracks.forEach((track: any, index: number) => {
          mockDb.tracks.create({
            ...track,
            release_id: editingRelease.id,
            track_order: index + 1
          });
        });
      }
      toast({ title: "Релиз обновлён" });
    } else {
      const release = mockDb.releases.create({
        ...data,
        user_id: currentUser!.id,
        status: data.status || 'draft'
      });

      if (data.tracks) {
        data.tracks.forEach((track: any, index: number) => {
          mockDb.tracks.create({
            ...track,
            release_id: release.id,
            track_order: index + 1
          });
        });
      }

      toast({
        title: data.status === 'moderation' ? "Релиз отправлен на модерацию" : "Черновик сохранён"
      });
    }

    setShowReleaseForm(false);
    setEditingRelease(null);
    if (data.status === 'moderation') {
      setActiveTab('releases');
    }
  };

  const handleDeleteRelease = (id: number) => {
    mockDb.releases.delete(id);
    mockDb.tracks.deleteByReleaseId(id);
    setDeleteDialog(null);
    toast({ title: "Релиз удалён" });
  };

  const handleApproveRelease = (id: number) => {
    mockDb.releases.update(id, { status: 'approved' });
    toast({ title: "Релиз одобрен" });
  };

  const handleRejectRelease = (id: number, reason: string) => {
    mockDb.releases.update(id, { 
      status: 'rejected',
      rejection_reason: reason
    });
    toast({ title: "Релиз отклонён" });
  };

  const handleSaveTicket = (data: any) => {
    mockDb.tickets.create({
      ...data,
      user_id: currentUser!.id,
      status: 'open'
    });
    setShowTicketForm(false);
    toast({ title: "Обращение отправлено" });
  };

  const handleRespondToTicket = (ticketId: number, response: string) => {
    mockDb.tickets.update(ticketId, {
      status: 'answered',
      admin_response: response
    });
    setSelectedTicket(null);
    setAdminResponse('');
    toast({ title: "Ответ отправлен" });
  };

  const handleCloseTicket = (ticketId: number) => {
    mockDb.tickets.update(ticketId, { status: 'closed' });
    setSelectedTicket(null);
    toast({ title: "Обращение закрыто" });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    toast({ title: "Вы вышли из системы" });
  };

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="music" className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">kedoo</span>
            </div>
            <ThemeSelector currentTheme={theme} onThemeChange={changeTheme} />
          </div>
        </header>

        {/* Centered Auth Section */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Добро пожаловать в{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  kedoo
                </span>
              </h1>
              <p className="text-muted-foreground">
                Платформа цифровой дистрибуции музыки
              </p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Войти в kedoo</CardTitle>
                    <CardDescription>Введите данные для входа в систему</CardDescription>
                  </CardHeader>
                  <CardContent>
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
                            size="icon"
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
                    <CardTitle>Создать аккаунт</CardTitle>
                    <CardDescription>Заполните форму для регистрации</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Имя</Label>
                        <Input
                          id="register-name"
                          name="name"
                          type="text"
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
                            size="icon"
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
        </div>

        {/* Reset Password Dialog */}
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
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-password">Новый пароль</Label>
                <Input
                  id="reset-password"
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

  if (currentView === 'profile') {
    return (
      <ProfilePage
        user={currentUser!}
        onBack={() => setCurrentView('dashboard')}
        onUpdateUser={(updates) => {
          mockDb.users.update(currentUser!.id, updates);
          setCurrentUser({ ...currentUser!, ...updates });
          toast({ title: "Профиль обновлён" });
        }}
        theme={theme}
        onThemeChange={changeTheme}
      />
    );
  }

  const userReleases = mockDb.releases.findByUserId(currentUser!.id);
  const userTickets = mockDb.tickets.findByUserId(currentUser!.id);
  const allReleases = mockDb.releases.getAll();
  const allTickets = mockDb.tickets.getAll();

  const filteredReleases = currentUser!.role === 'admin'
    ? allReleases.filter(r => 
        (genreFilter === 'all' || r.genre === genreFilter) &&
        (r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         r.artist.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : userReleases.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const filteredTickets = currentUser!.role === 'admin'
    ? allTickets.filter(t => ticketFilter === 'all' || t.status === ticketFilter)
    : userTickets.filter(t => ticketFilter === 'all' || t.status === ticketFilter);

  const genres = [...new Set(allReleases.map(r => r.genre))];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="music" className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">kedoo</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSelector currentTheme={theme} onThemeChange={changeTheme} />
            <Button variant="ghost" size="icon" onClick={() => setCurrentView('profile')}>
              <Icon name="user" className="h-5 w-5" />
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <Icon name="log-out" className="mr-2 h-4 w-4" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {currentUser!.role === 'admin' ? 'Панель модератора' : 'Личный кабинет'}
          </h1>
          <p className="text-muted-foreground">
            Добро пожаловать, {currentUser!.name}!
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="releases">
              <Icon name="disc" className="mr-2 h-4 w-4" />
              Релизы
            </TabsTrigger>
            <TabsTrigger value="tickets">
              <Icon name="message-square" className="mr-2 h-4 w-4" />
              Обращения
            </TabsTrigger>
          </TabsList>

          <TabsContent value="releases" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <Input
                  placeholder="Поиск по названию или исполнителю..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="md:max-w-xs"
                />
                {currentUser!.role === 'admin' && (
                  <Select value={genreFilter} onValueChange={setGenreFilter}>
                    <SelectTrigger className="md:w-48">
                      <SelectValue placeholder="Жанр" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все жанры</SelectItem>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {currentUser!.role === 'user' && (
                <Button onClick={() => setShowReleaseForm(true)}>
                  <Icon name="plus" className="mr-2 h-4 w-4" />
                  Новый релиз
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredReleases.map((release) => {
                const tracks = mockDb.tracks.findByReleaseId(release.id);
                const releaseUser = mockDb.users.findById(release.user_id);
                
                return (
                  <Card key={release.id} className="overflow-hidden">
                    <div className="aspect-square relative bg-gradient-to-br from-primary/20 to-primary/5">
                      {release.artwork_url ? (
                        <img 
                          src={release.artwork_url} 
                          alt={release.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon name="disc" className="h-20 w-20 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {release.status === 'draft' && (
                          <span className="px-2 py-1 rounded-full bg-gray-500 text-white text-xs font-medium">
                            Черновик
                          </span>
                        )}
                        {release.status === 'moderation' && (
                          <span className="px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-medium">
                            На модерации
                          </span>
                        )}
                        {release.status === 'approved' && (
                          <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
                            Одобрен
                          </span>
                        )}
                        {release.status === 'rejected' && (
                          <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-medium">
                            Отклонён
                          </span>
                        )}
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{release.title}</CardTitle>
                      <CardDescription>{release.artist}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Жанр:</span>
                          <span>{release.genre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Релиз:</span>
                          <span>{new Date(release.release_date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Треков:</span>
                          <span>{tracks.length}</span>
                        </div>
                        {currentUser!.role === 'admin' && releaseUser && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Автор:</span>
                            <span>{releaseUser.name}</span>
                          </div>
                        )}
                      </div>

                      {release.status === 'rejected' && release.rejection_reason && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                            Причина отклонения:
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            {release.rejection_reason}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setViewDetailsRelease(release)}
                        >
                          <Icon name="eye" className="mr-2 h-4 w-4" />
                          Просмотр
                        </Button>
                        
                        {currentUser!.role === 'user' && release.status !== 'approved' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingRelease(release);
                                setShowReleaseForm(true);
                              }}
                            >
                              <Icon name="edit" className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteDialog(release.id)}
                            >
                              <Icon name="trash-2" className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {currentUser!.role === 'admin' && release.status === 'moderation' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveRelease(release.id)}
                            >
                              <Icon name="check" className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setSelectedRelease(release)}
                            >
                              <Icon name="x" className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredReleases.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="disc" className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Релизы не найдены</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <Select value={ticketFilter} onValueChange={(v: any) => setTicketFilter(v)}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все обращения</SelectItem>
                  <SelectItem value="open">Открытые</SelectItem>
                  <SelectItem value="answered">Отвеченные</SelectItem>
                  <SelectItem value="closed">Закрытые</SelectItem>
                </SelectContent>
              </Select>
              {currentUser!.role === 'user' && (
                <Button onClick={() => setShowTicketForm(true)}>
                  <Icon name="plus" className="mr-2 h-4 w-4" />
                  Новое обращение
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              {filteredTickets.map((ticket) => {
                const ticketUser = mockDb.users.findById(ticket.user_id);
                
                return (
                  <Card key={ticket.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle>{ticket.subject}</CardTitle>
                          <CardDescription>
                            {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
                            {currentUser!.role === 'admin' && ticketUser && (
                              <> • От: {ticketUser.name}</>
                            )}
                          </CardDescription>
                        </div>
                        <div>
                          {ticket.status === 'open' && (
                            <span className="px-2 py-1 rounded-full bg-blue-500 text-white text-xs font-medium">
                              Открыто
                            </span>
                          )}
                          {ticket.status === 'answered' && (
                            <span className="px-2 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
                              Отвечено
                            </span>
                          )}
                          {ticket.status === 'closed' && (
                            <span className="px-2 py-1 rounded-full bg-gray-500 text-white text-xs font-medium">
                              Закрыто
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Сообщение:</p>
                        <p className="text-sm">{ticket.message}</p>
                      </div>

                      {ticket.admin_response && (
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-2">Ответ модератора:</p>
                          <p className="text-sm">{ticket.admin_response}</p>
                        </div>
                      )}

                      {currentUser!.role === 'admin' && ticket.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setAdminResponse('');
                          }}
                        >
                          <Icon name="message-square" className="mr-2 h-4 w-4" />
                          Ответить
                        </Button>
                      )}

                      {currentUser!.role === 'user' && ticket.status === 'answered' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCloseTicket(ticket.id)}
                        >
                          <Icon name="check" className="mr-2 h-4 w-4" />
                          Закрыть обращение
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredTickets.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Icon name="message-square" className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Обращения не найдены</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showReleaseForm} onOpenChange={setShowReleaseForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
            <DialogTitle>Новое обращение</DialogTitle>
          </DialogHeader>
          <TicketForm
            onSave={handleSaveTicket}
            onCancel={() => setShowTicketForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewDetailsRelease} onOpenChange={() => setViewDetailsRelease(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewDetailsRelease && (
            <ReleaseDetails
              release={viewDetailsRelease}
              tracks={mockDb.tracks.findByReleaseId(viewDetailsRelease.id)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedRelease} onOpenChange={() => setSelectedRelease(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить релиз</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Причина отклонения</Label>
              <Input
                id="rejection-reason"
                placeholder="Укажите причину..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    handleRejectRelease(selectedRelease!.id, e.currentTarget.value);
                    setSelectedRelease(null);
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedRelease(null)}>
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const input = document.getElementById('rejection-reason') as HTMLInputElement;
                  if (input.value) {
                    handleRejectRelease(selectedRelease!.id, input.value);
                    setSelectedRelease(null);
                  }
                }}
              >
                Отклонить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ответить на обращение</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-response">Ваш ответ</Label>
              <Input
                id="admin-response"
                placeholder="Введите ответ..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                Отмена
              </Button>
              <Button
                onClick={() => {
                  if (adminResponse) {
                    handleRespondToTicket(selectedTicket!.id, adminResponse);
                  }
                }}
              >
                Отправить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить релиз?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Релиз будет удалён безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteRelease(deleteDialog!)}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
