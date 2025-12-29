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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
    const release = mockDb.releases.findById(id);
    if (release?.status === 'deleted') {
      mockDb.releases.permanentDelete(id);
      setDeleteDialog(null);
      toast({ title: "Релиз удалён навсегда" });
    } else {
      mockDb.releases.delete(id);
      setDeleteDialog(null);
      toast({ title: "Релиз перемещён в корзину" });
    }
  };

  const handleRestoreRelease = (id: number) => {
    const release = mockDb.releases.findById(id);
    if (release && release.rejection_reason?.startsWith('_prev_status:')) {
      const prevStatus = release.rejection_reason.replace('_prev_status:', '') as any;
      mockDb.releases.update(id, { 
        status: prevStatus,
        rejection_reason: undefined
      });
      toast({ title: "Релиз восстановлен" });
    } else if (release) {
      mockDb.releases.update(id, { status: 'approved', rejection_reason: undefined });
      toast({ title: "Релиз восстановлен" });
    }
  };

  const handleRemoveFromModeration = (id: number) => {
    mockDb.releases.update(id, { status: 'draft' });
    toast({ title: "Релиз снят с модерации" });
  };

  const handleApproveRelease = (id: number) => {
    mockDb.releases.update(id, { status: 'approved', rejection_reason: undefined });
    toast({ title: "Релиз принят" });
  };

  const handleRejectRelease = (id: number, reason: string) => {
    mockDb.releases.update(id, { status: 'rejected', rejection_reason: reason });
    setSelectedRelease(null);
    toast({ title: "Релиз отклонён" });
  };

  const handleCreateTicket = (data: { subject: string; message: string }) => {
    mockDb.tickets.create({
      ...data,
      user_id: currentUser!.id,
      status: 'open'
    });
    setShowTicketForm(false);
    toast({ title: "Тикет создан" });
  };

  const handleRespondToTicket = (ticketId: number) => {
    if (adminResponse.trim()) {
      mockDb.tickets.update(ticketId, {
        status: 'answered',
        admin_response: adminResponse
      });
      setSelectedTicket(null);
      setAdminResponse('');
      toast({ title: "Ответ отправлен" });
    }
  };

  const handleCloseTicket = (ticketId: number) => {
    mockDb.tickets.update(ticketId, { status: 'closed' });
    setSelectedTicket(null);
    toast({ title: "Тикет закрыт" });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { label: 'Черновик', variant: 'secondary' },
      moderation: { label: 'На модерации', variant: 'default' },
      approved: { label: 'Принят', variant: 'default' },
      rejected: { label: 'Отклонён', variant: 'destructive' },
      deleted: { label: 'Удалён', variant: 'outline' }
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const userReleases = currentUser ? mockDb.releases.findByUserId(currentUser.id) : [];
  const deletedReleases = currentUser ? mockDb.releases.findDeletedByUserId(currentUser.id) : [];
  const userTickets = currentUser ? mockDb.tickets.findByUserId(currentUser.id) : [];
  const moderationReleases = mockDb.releases.findByStatus('moderation');
  const allTickets = mockDb.tickets.findAll();
  
  const filteredUserReleases = userReleases.filter(r => {
    const matchesSearch = searchQuery ? r.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesGenre = genreFilter === 'all' ? true : r.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });
  
  const filteredModerationReleases = moderationReleases.filter(r => {
    const matchesSearch = searchQuery ? r.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchesGenre = genreFilter === 'all' ? true : r.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const filteredUserTickets = userTickets.filter(t => {
    if (ticketFilter === 'all') return true;
    return t.status === ticketFilter;
  });

  const filteredAllTickets = allTickets.filter(t => {
    if (ticketFilter === 'all') return true;
    return t.status === ticketFilter;
  });

  if (currentView === 'landing' && !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Icon name="Music" className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold gradient-text">kedoo</span>
            </div>
            <ThemeSelector theme={theme} onThemeChange={changeTheme} />
          </div>
        </nav>

        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  Дистрибьюция <span className="gradient-text">музыки</span> для всех
                </h1>
                <p className="text-lg text-muted-foreground">
                  Мы — kedoo, дочерняя компания Radish. Бывший OLPROD, MMUSIC. 
                  Занимаемся продвижением артистов и музыкой с 2021 года.
                </p>
                <p className="text-lg font-medium text-foreground">
                  Мы считаем, что выгрузка доступна всем и роялти тоже, поэтому не берём их.
                </p>
              </div>
              <div className="relative">
                <img
                  src="https://cdn.poehali.dev/projects/7d7646b6-3be9-4719-af6a-6713600b76e2/files/abeca212-8751-4f91-badf-4930bbcfb822.jpg"
                  alt="Music Distribution"
                  className="rounded-2xl shadow-2xl w-full animate-scale-in"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-white/50 dark:bg-black/20">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold text-center mb-12">
              Почему <span className="gradient-text">kedoo</span>?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: 'Zap', title: 'Быстро', desc: 'Загрузите релиз за минуты' },
                { icon: 'DollarSign', title: 'Без комиссий', desc: 'Все роялти остаются вам' },
                { icon: 'Shield', title: 'Надёжно', desc: 'Опыт работы с 2021 года' },
              ].map((item, i) => (
                <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto rounded-full gradient-primary flex items-center justify-center mb-4">
                      <Icon name={item.icon} className="text-white" size={28} />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
          <div className="container mx-auto max-w-4xl text-center text-white space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">Готовы начать?</h2>
            <p className="text-xl opacity-90">Присоединяйтесь к тысячам артистов</p>
            <Card className="max-w-md mx-auto mt-8">
              <CardHeader>
                <CardTitle className="text-2xl">Вход / Регистрация</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Вход</TabsTrigger>
                    <TabsTrigger value="register">Регистрация</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input name="email" id="login-email" type="email" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Пароль</Label>
                        <div className="relative">
                          <Input name="password" id="login-password" type={showLoginPassword ? "text" : "password"} required className="pr-10" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                          >
                            <Icon name={showLoginPassword ? "EyeOff" : "Eye"} size={18} />
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm p-0 h-auto"
                        onClick={() => setShowResetForm(true)}
                      >
                        Забыли пароль?
                      </Button>
                      <Button type="submit" className="w-full gradient-primary text-white">
                        Войти
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Имя</Label>
                        <Input name="name" id="register-name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input name="email" id="register-email" type="email" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Пароль</Label>
                        <div className="relative">
                          <Input name="password" id="register-password" type={showRegisterPassword ? "text" : "password"} required className="pr-10" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                          >
                            <Icon name={showRegisterPassword ? "EyeOff" : "Eye"} size={18} />
                          </Button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full gradient-primary text-white">
                        Зарегистрироваться
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>

        <Dialog open={showResetForm} onOpenChange={setShowResetForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Восстановление пароля</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input name="email" id="reset-email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-password">Новый пароль</Label>
                <Input name="new_password" id="reset-password" type="password" required />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowResetForm(false)}>
                  Отмена
                </Button>
                <Button type="submit" className="gradient-primary text-white">
                  Сбросить пароль
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (currentView === 'profile' && currentUser) {
    return <ProfilePage user={currentUser} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentUser?.role === 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Icon name="Music" className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold gradient-text">kedoo</span>
              <Badge variant="outline" className="ml-2">Модератор</Badge>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSelector theme={theme} onThemeChange={changeTheme} />
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setCurrentView('profile')}
              >
                <Icon name="User" size={20} />
              </Button>
              <Button variant="outline" onClick={() => { setCurrentUser(null); setCurrentView('landing'); }}>
                <Icon name="LogOut" size={18} className="mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Панель модератора</h1>
            <p className="text-muted-foreground">Управление релизами и тикетами</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="moderation">
                <Icon name="AlertCircle" size={18} className="mr-2" />
                На модерации ({moderationReleases.length})
              </TabsTrigger>
              <TabsTrigger value="tickets">
                <Icon name="MessageSquare" size={18} className="mr-2" />
                Тикеты ({allTickets.filter(t => t.status !== 'closed').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="moderation" className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Input
                  placeholder="Поиск по названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="w-[180px]">
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
                    <SelectItem value="Other">Другое</SelectItem>
                  </SelectContent>
                </Select>
                {searchQuery && (
                  <Button variant="ghost" onClick={() => setSearchQuery('')}>
                    <Icon name="X" size={18} />
                  </Button>
                )}
              </div>
              
              {filteredModerationReleases.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Icon name="CheckCircle" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Нет релизов на модерации</p>
                  </CardContent>
                </Card>
              ) : (
                filteredModerationReleases.map(release => {
                  const tracks = mockDb.tracks.findByReleaseId(release.id);
                  const author = mockDb.users.findById(release.user_id);
                  
                  return (
                    <Card key={release.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            {release.cover_url && (
                              <img src={release.cover_url} alt={release.title} className="w-20 h-20 rounded-lg object-cover" />
                            )}
                            <div>
                              <CardTitle>{release.title}</CardTitle>
                              <CardDescription>
                                {release.genre} • {author?.name}
                              </CardDescription>
                              <div className="mt-2">
                                {getStatusBadge(release.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {release.upc && <div><span className="text-muted-foreground">UPC:</span> {release.upc}</div>}
                          <div><span className="text-muted-foreground">Дата релиза:</span> {release.new_release_date}</div>
                          {release.old_release_date && (
                            <div><span className="text-muted-foreground">Старая дата:</span> {release.old_release_date}</div>
                          )}
                          <div><span className="text-muted-foreground">Треков:</span> {tracks.length}</div>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2">Треклист:</h5>
                          <div className="space-y-2">
                            {tracks.map((track, i) => (
                              <div key={track.id} className="text-sm flex items-center gap-2">
                                <span className="text-muted-foreground">{i + 1}.</span>
                                <span>{track.title}</span>
                                {track.has_explicit && <Badge variant="destructive" className="text-xs">E</Badge>}
                                {track.audio_url && (
                                  <a href={track.audio_url} download className="ml-auto">
                                    <Button size="sm" variant="ghost">
                                      <Icon name="Download" size={16} />
                                    </Button>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={() => setViewDetailsRelease(release)} variant="outline">
                            <Icon name="Eye" size={18} className="mr-2" />
                            Детали
                          </Button>
                          {release.cover_url && (
                            <a href={release.cover_url} download>
                              <Button variant="outline">
                                <Icon name="Download" size={18} className="mr-2" />
                                Обложка
                              </Button>
                            </a>
                          )}
                          <Button onClick={() => handleApproveRelease(release.id)} className="gradient-primary text-white ml-auto">
                            <Icon name="Check" size={18} className="mr-2" />
                            Принять
                          </Button>
                          <Button onClick={() => setSelectedRelease(release)} variant="destructive">
                            <Icon name="X" size={18} className="mr-2" />
                            Отклонить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="tickets" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Select value={ticketFilter} onValueChange={(value: any) => setTicketFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Все тикеты" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все тикеты</SelectItem>
                    <SelectItem value="open">Открытые</SelectItem>
                    <SelectItem value="answered">Отвеченные</SelectItem>
                    <SelectItem value="closed">Закрытые</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {filteredAllTickets.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Icon name="Inbox" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Нет тикетов</p>
                  </CardContent>
                </Card>
              ) : (
                filteredAllTickets.map(ticket => {
                  const user = mockDb.users.findById(ticket.user_id);
                  return (
                    <Card key={ticket.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                            <CardDescription>{user?.name} • {new Date(ticket.created_at).toLocaleDateString('ru-RU')}</CardDescription>
                          </div>
                          <Badge variant={ticket.status === 'closed' ? 'outline' : 'default'}>
                            {ticket.status === 'open' ? 'Открыт' : ticket.status === 'answered' ? 'Отвечен' : 'Закрыт'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm">{ticket.message}</p>
                        </div>
                        {ticket.admin_response && (
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-semibold mb-1">Ответ модератора:</p>
                            <p className="text-sm">{ticket.admin_response}</p>
                          </div>
                        )}
                        {ticket.status !== 'closed' && (
                          <div className="flex gap-2">
                            <Button onClick={() => setSelectedTicket(ticket)} variant="outline">
                              <Icon name="Reply" size={18} className="mr-2" />
                              Ответить
                            </Button>
                            <Button onClick={() => handleCloseTicket(ticket.id)} variant="outline">
                              <Icon name="Check" size={18} className="mr-2" />
                              Закрыть
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={!!selectedRelease} onOpenChange={() => setSelectedRelease(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Отклонить релиз</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Причина отклонения</Label>
              <Textarea
                placeholder="Укажите причину отклонения..."
                rows={4}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setSelectedRelease(null)} variant="outline">
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    if (adminResponse.trim() && selectedRelease) {
                      handleRejectRelease(selectedRelease.id, adminResponse);
                      setAdminResponse('');
                    }
                  }}
                  variant="destructive"
                >
                  Отклонить релиз
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ответить на тикет</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Ваш ответ</Label>
              <Textarea
                placeholder="Введите ответ..."
                rows={4}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
              />
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setSelectedTicket(null)} variant="outline">
                  Отмена
                </Button>
                <Button
                  onClick={() => selectedTicket && handleRespondToTicket(selectedTicket.id)}
                  className="gradient-primary text-white"
                >
                  Отправить ответ
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!viewDetailsRelease} onOpenChange={() => setViewDetailsRelease(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {viewDetailsRelease && (
              <ReleaseDetails
                release={viewDetailsRelease}
                tracks={mockDb.tracks.findByReleaseId(viewDetailsRelease.id)}
                onClose={() => setViewDetailsRelease(null)}
                isAdmin={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Icon name="Menu" size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-4 mt-8">
                  <Button
                    variant={activeTab === 'releases' ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => { setActiveTab('releases'); setShowReleaseForm(false); }}
                  >
                    <Icon name="Disc" size={18} className="mr-2" />
                    Релизы
                  </Button>
                  <Button
                    variant={activeTab === 'trash' ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => { setActiveTab('trash'); setShowReleaseForm(false); }}
                  >
                    <Icon name="Trash2" size={18} className="mr-2" />
                    Корзина
                  </Button>
                  <Button
                    variant={showReleaseForm ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => { setShowReleaseForm(true); setEditingRelease(null); }}
                  >
                    <Icon name="PlusCircle" size={18} className="mr-2" />
                    Добавить релиз
                  </Button>
                  <Button
                    variant={activeTab === 'tickets' ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => { setActiveTab('tickets'); setShowReleaseForm(false); }}
                  >
                    <Icon name="MessageSquare" size={18} className="mr-2" />
                    Тикеты
                  </Button>
                  <Button
                    variant={activeTab === 'wallet' ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => { setActiveTab('wallet'); setShowReleaseForm(false); }}
                  >
                    <Icon name="Wallet" size={18} className="mr-2" />
                    Кошелёк
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Icon name="Music" className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold gradient-text">kedoo</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSelector theme={theme} onThemeChange={changeTheme} />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setCurrentView('profile')}
            >
              <Icon name="User" size={20} />
            </Button>
            <Button variant="outline" onClick={() => { setCurrentUser(null); setCurrentView('landing'); }} className="hidden sm:flex">
              <Icon name="LogOut" size={18} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {showReleaseForm ? (
          <ReleaseForm
            initialData={editingRelease}
            onSave={handleSaveRelease}
            onCancel={() => {
              setShowReleaseForm(false);
              setEditingRelease(null);
            }}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-5">
              <TabsTrigger value="releases">
                <Icon name="Disc" size={18} />
                <span className="hidden sm:inline ml-2">Релизы</span>
              </TabsTrigger>
              <TabsTrigger value="trash">
                <Icon name="Trash2" size={18} />
                <span className="hidden sm:inline ml-2">Корзина</span>
              </TabsTrigger>
              <TabsTrigger value="add">
                <Icon name="PlusCircle" size={18} />
                <span className="hidden sm:inline ml-2">Добавить</span>
              </TabsTrigger>
              <TabsTrigger value="tickets">
                <Icon name="MessageSquare" size={18} />
                <span className="hidden sm:inline ml-2">Тикеты</span>
              </TabsTrigger>
              <TabsTrigger value="wallet">
                <Icon name="Wallet" size={18} />
                <span className="hidden sm:inline ml-2">Кошелёк</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="releases" className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Input
                  placeholder="Поиск по названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="w-[180px]">
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
                    <SelectItem value="Other">Другое</SelectItem>
                  </SelectContent>
                </Select>
                {searchQuery && (
                  <Button variant="ghost" onClick={() => setSearchQuery('')}>
                    <Icon name="X" size={18} />
                  </Button>
                )}
              </div>
              
              {filteredUserReleases.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Icon name="Disc" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Релизов пока нет</h3>
                    <p className="text-muted-foreground mb-6">Создайте свой первый релиз</p>
                    <Button onClick={() => setActiveTab('add')} className="gradient-primary text-white">
                      <Icon name="PlusCircle" size={18} className="mr-2" />
                      Добавить релиз
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredUserReleases.map(release => (
                  <Card key={release.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          {release.cover_url && (
                            <img src={release.cover_url} alt={release.title} className="w-20 h-20 rounded-lg object-cover" />
                          )}
                          <div>
                            <CardTitle>{release.title}</CardTitle>
                            <CardDescription>{release.genre}</CardDescription>
                            <div className="mt-2">{getStatusBadge(release.status)}</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {release.rejection_reason && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <p className="text-sm font-semibold mb-1">Причина отклонения:</p>
                          <p className="text-sm">{release.rejection_reason}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button onClick={() => setViewDetailsRelease(release)} variant="outline">
                          <Icon name="Eye" size={18} className="mr-2" />
                          Детали
                        </Button>
                        {(release.status === 'draft' || release.status === 'rejected') && (
                          <>
                            <Button onClick={() => { 
                              const tracks = mockDb.tracks.findByReleaseId(release.id);
                              setEditingRelease({ ...release, tracks }); 
                              setShowReleaseForm(true); 
                            }} variant="outline">
                              <Icon name="Edit" size={18} className="mr-2" />
                              Редактировать
                            </Button>
                            <Button onClick={() => setDeleteDialog(release.id)} variant="outline">
                              <Icon name="Trash2" size={18} className="mr-2" />
                              Удалить
                            </Button>
                          </>
                        )}
                        {release.status === 'moderation' && (
                          <>
                            <Button onClick={() => { 
                              const tracks = mockDb.tracks.findByReleaseId(release.id);
                              setEditingRelease({ ...release, tracks }); 
                              setShowReleaseForm(true); 
                            }} variant="outline">
                              <Icon name="Edit" size={18} className="mr-2" />
                              Редактировать
                            </Button>
                            <Button onClick={() => handleRemoveFromModeration(release.id)} variant="outline">
                              <Icon name="X" size={18} className="mr-2" />
                              Снять с модерации
                            </Button>
                          </>
                        )}
                        {release.status === 'approved' && (
                          <>
                            <Button onClick={() => { 
                              const tracks = mockDb.tracks.findByReleaseId(release.id);
                              setEditingRelease({ ...release, tracks }); 
                              setShowReleaseForm(true); 
                            }} variant="outline">
                              <Icon name="Edit" size={18} className="mr-2" />
                              Редактировать
                            </Button>
                            <Button onClick={() => setDeleteDialog(release.id)} variant="outline">
                              <Icon name="Trash2" size={18} className="mr-2" />
                              Удалить
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="trash" className="space-y-4">
              {deletedReleases.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Icon name="Trash2" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Корзина пуста</h3>
                    <p className="text-muted-foreground">Удалённые релизы появятся здесь</p>
                  </CardContent>
                </Card>
              ) : (
                deletedReleases.map(release => (
                  <Card key={release.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          {release.cover_url && (
                            <img src={release.cover_url} alt={release.title} className="w-20 h-20 rounded-lg object-cover opacity-60" />
                          )}
                          <div>
                            <CardTitle className="text-muted-foreground">{release.title}</CardTitle>
                            <CardDescription>{release.genre}</CardDescription>
                            <div className="mt-2">{getStatusBadge('deleted')}</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button onClick={() => setViewDetailsRelease(release)} variant="outline">
                          <Icon name="Eye" size={18} className="mr-2" />
                          Детали
                        </Button>
                        <Button onClick={() => handleRestoreRelease(release.id)} className="gradient-primary text-white">
                          <Icon name="RotateCcw" size={18} className="mr-2" />
                          Восстановить
                        </Button>
                        <Button onClick={() => setDeleteDialog(release.id)} variant="destructive">
                          <Icon name="Trash" size={18} className="mr-2" />
                          Удалить навсегда
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="add">
              <Card>
                <CardContent className="py-12 text-center">
                  <Icon name="Upload" size={48} className="mx-auto gradient-text mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Создать новый релиз</h3>
                  <p className="text-muted-foreground mb-6">Начните добавлять ваш новый альбом</p>
                  <Button onClick={() => setShowReleaseForm(true)} className="gradient-primary text-white">
                    Начать создание
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets" className="space-y-4">
              <div className="flex gap-2 mb-4">
                {!showTicketForm && (
                  <Button onClick={() => setShowTicketForm(true)} className="gradient-primary text-white">
                    <Icon name="PlusCircle" size={18} className="mr-2" />
                    Создать тикет
                  </Button>
                )}
                <Select value={ticketFilter} onValueChange={(value: any) => setTicketFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Все тикеты" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все тикеты</SelectItem>
                    <SelectItem value="open">Открытые</SelectItem>
                    <SelectItem value="answered">Отвеченные</SelectItem>
                    <SelectItem value="closed">Закрытые</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showTicketForm ? (
                <TicketForm
                  onSubmit={handleCreateTicket}
                  onCancel={() => setShowTicketForm(false)}
                />
              ) : filteredUserTickets.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Icon name="MessageSquare" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Тикетов пока нет</p>
                  </CardContent>
                </Card>
              ) : (
                filteredUserTickets.map(ticket => (
                  <Card key={ticket.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                          <CardDescription>{new Date(ticket.created_at).toLocaleDateString('ru-RU')}</CardDescription>
                        </div>
                        <Badge variant={ticket.status === 'closed' ? 'outline' : 'default'}>
                          {ticket.status === 'open' ? 'Открыт' : ticket.status === 'answered' ? 'Отвечен' : 'Закрыт'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm">{ticket.message}</p>
                      </div>
                      {ticket.admin_response && (
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm font-semibold mb-1">Ответ модератора:</p>
                          <p className="text-sm">{ticket.admin_response}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="wallet">
              <Card>
                <CardHeader>
                  <CardTitle>Ваш кошелёк</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-8">
                    <div className="text-5xl font-bold gradient-text mb-2">{currentUser?.balance.toFixed(2)} ₽</div>
                    <p className="text-muted-foreground">Доступно для вывода</p>
                  </div>
                  <Button className="w-full" variant="outline" disabled>
                    <Icon name="Download" size={18} className="mr-2" />
                    Вывести средства
                  </Button>
                  <div className="pt-6 border-t">
                    <h4 className="font-semibold mb-4">История транзакций</h4>
                    <p className="text-muted-foreground text-center py-8">Транзакций пока нет</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить релиз?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы сможете восстановить релиз позже из списка удалённых.
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

      <Dialog open={!!viewDetailsRelease} onOpenChange={() => setViewDetailsRelease(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {viewDetailsRelease && (
            <ReleaseDetails
              release={viewDetailsRelease}
              tracks={mockDb.tracks.findByReleaseId(viewDetailsRelease.id)}
              onClose={() => setViewDetailsRelease(null)}
              isAdmin={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;