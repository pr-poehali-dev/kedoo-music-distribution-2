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
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);
        setShowAuthDialog(false);
        
        setTimeout(() => {
          setCurrentUser(data.user);
          setCurrentView('dashboard');
          setIsLoading(false);
          toast({
            title: `Добро пожаловать, ${data.user.name}!`,
            description: data.user.role === 'admin' ? 'Панель модератора' : 'Личный кабинет',
          });
        }, 1500);
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
        setIsLoading(true);
        setShowAuthDialog(false);
        
        setTimeout(() => {
          setCurrentUser(data.user);
          setCurrentView('dashboard');
          setIsLoading(false);
          toast({
            title: "Регистрация успешна!",
            description: "Добро пожаловать в kedoo!"
          });
        }, 1500);
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
    mockDb.releases.update(id, { status: 'approved', rejection_reason: undefined });
    toast({ title: "Релиз одобрен" });
  };

  const handleRejectRelease = (id: number, reason: string) => {
    mockDb.releases.update(id, { status: 'rejected', rejection_reason: reason });
    toast({ title: "Релиз отклонён", variant: "destructive" });
  };

  const handleSaveTicket = (data: any) => {
    mockDb.tickets.create({
      ...data,
      user_id: currentUser!.id,
      status: 'open'
    });
    setShowTicketForm(false);
    toast({ title: "Тикет создан" });
  };

  const handleTicketResponse = (ticketId: number, response: string) => {
    mockDb.tickets.update(ticketId, { 
      status: 'answered',
      admin_response: response,
      admin_id: currentUser!.id,
      updated_at: new Date().toISOString()
    });
    setSelectedTicket(null);
    setAdminResponse('');
    toast({ title: "Ответ отправлен" });
  };

  const handleCloseTicket = (ticketId: number) => {
    mockDb.tickets.update(ticketId, { status: 'closed' });
    toast({ title: "Тикет закрыт" });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setActiveTab('releases');
    toast({ title: "Вы вышли из системы" });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10 animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
          {/* Animated Vinyl Record */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            
            {/* Spinning vinyl */}
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/90 to-primary/60 shadow-2xl animate-spin" style={{ animationDuration: '3s' }}>
              {/* Center hole */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-background border-4 border-primary/30" />
              </div>
              {/* Vinyl grooves */}
              <div className="absolute inset-4 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-8 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-12 rounded-full border-2 border-primary/20" />
            </div>
            
            {/* Music note icon in center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Icon name="music" className="w-6 h-6 text-background animate-pulse" />
            </div>
          </div>

          {/* Audio wave visualization */}
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${24 + Math.sin(i) * 12}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>

          {/* Loading text */}
          <div className="text-center space-y-2 animate-in fade-in duration-700 delay-300">
            <p className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Загрузка...
            </p>
            <p className="text-sm text-muted-foreground animate-pulse">
              Подготовка вашего пространства
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view (unchanged)
  if (currentView === 'dashboard') {
    const userReleases = mockDb.releases.getByUserId(currentUser!.id);
    const drafts = userReleases.filter(r => r.status === 'draft');
    const moderation = userReleases.filter(r => r.status === 'moderation');
    const approved = userReleases.filter(r => r.status === 'approved');
    const rejected = userReleases.filter(r => r.status === 'rejected');
    
    const allReleases = currentUser?.role === 'admin' 
      ? mockDb.releases.getAll() 
      : userReleases;

    const filteredReleases = allReleases.filter(release => {
      const matchesSearch = release.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        release.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = genreFilter === 'all' || release.genre === genreFilter;
      return matchesSearch && matchesGenre;
    });

    const userTickets = currentUser?.role === 'admin' 
      ? mockDb.tickets.getAll() 
      : mockDb.tickets.getByUserId(currentUser!.id);

    const filteredTickets = userTickets.filter(ticket => {
      if (ticketFilter === 'all') return true;
      return ticket.status === ticketFilter;
    });

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Icon name="music" className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                kedoo
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSelector currentTheme={theme} onThemeChange={changeTheme} />
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('profile')}>
                <Icon name="user" className="w-4 h-4 mr-2" />
                {currentUser?.name}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <Icon name="log-out" className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="releases" className="flex items-center gap-2">
                <Icon name="disc" className="w-4 h-4" />
                Релизы
              </TabsTrigger>
              <TabsTrigger value="drafts" className="flex items-center gap-2">
                <Icon name="file-text" className="w-4 h-4" />
                Черновики ({drafts.length})
              </TabsTrigger>
              <TabsTrigger value="moderation" className="flex items-center gap-2">
                <Icon name="clock" className="w-4 h-4" />
                На модерации ({moderation.length})
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <Icon name="message-circle" className="w-4 h-4" />
                Поддержка
              </TabsTrigger>
            </TabsList>

            <TabsContent value="releases" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Поиск по названию или исполнителю..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Жанр" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все жанры</SelectItem>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="electronic">Electronic</SelectItem>
                    <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="classical">Classical</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setShowReleaseForm(true)}>
                  <Icon name="plus" className="w-4 h-4 mr-2" />
                  Новый релиз
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredReleases.map(release => (
                  <Card key={release.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {release.cover_url ? (
                        <img src={release.cover_url} alt={release.title} className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="disc" className="w-16 h-16 text-primary/40" />
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-1">{release.title}</CardTitle>
                          <CardDescription>{release.artist}</CardDescription>
                        </div>
                        <div className="flex gap-1">
                          {release.status === 'approved' && (
                            <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded text-xs">
                              Опубликован
                            </div>
                          )}
                          {release.status === 'moderation' && (
                            <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded text-xs">
                              Модерация
                            </div>
                          )}
                          {release.status === 'rejected' && (
                            <div className="bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded text-xs">
                              Отклонён
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{release.genre}</span>
                        <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                          {new Date(release.release_date).getFullYear()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setViewDetailsRelease(release)}
                        >
                          <Icon name="eye" className="w-4 h-4 mr-2" />
                          Подробнее
                        </Button>
                        {(currentUser?.role === 'admin' || release.user_id === currentUser?.id) && (
                          <>
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
                              <Icon name="trash" className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                      {currentUser?.role === 'admin' && release.status === 'moderation' && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveRelease(release.id)}
                          >
                            <Icon name="check" className="w-4 h-4 mr-2" />
                            Одобрить
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => setSelectedRelease(release)}
                          >
                            <Icon name="x" className="w-4 h-4 mr-2" />
                            Отклонить
                          </Button>
                        </div>
                      )}
                      {release.status === 'rejected' && release.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-600 dark:text-red-400">
                          <p className="font-semibold">Причина отклонения:</p>
                          <p className="mt-1">{release.rejection_reason}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredReleases.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="disc" className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Релизы не найдены</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="drafts" className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Черновики</h2>
                <Button onClick={() => setShowReleaseForm(true)}>
                  <Icon name="plus" className="w-4 h-4 mr-2" />
                  Новый релиз
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {drafts.map(release => (
                  <Card key={release.id} className="overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {release.cover_url ? (
                        <img src={release.cover_url} alt={release.title} className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="disc" className="w-16 h-16 text-primary/40" />
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{release.title}</CardTitle>
                      <CardDescription>{release.artist}</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                          <Icon name="trash" className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {drafts.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="file-text" className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">У вас нет черновиков</p>
                  <Button onClick={() => setShowReleaseForm(true)}>
                    <Icon name="plus" className="w-4 h-4 mr-2" />
                    Создать релиз
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="moderation" className="space-y-4">
              <h2 className="text-2xl font-bold mb-6">На модерации</h2>

              <div className="grid gap-4">
                {moderation.map(release => (
                  <Card key={release.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{release.title}</CardTitle>
                          <CardDescription>{release.artist}</CardDescription>
                        </div>
                        <div className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded">
                          На модерации
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Отправлено: {new Date(release.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {approved.map(release => (
                  <Card key={release.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{release.title}</CardTitle>
                          <CardDescription>{release.artist}</CardDescription>
                        </div>
                        <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded">
                          Одобрен
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
                {rejected.map(release => (
                  <Card key={release.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{release.title}</CardTitle>
                          <CardDescription>{release.artist}</CardDescription>
                        </div>
                        <div className="bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1 rounded">
                          Отклонён
                        </div>
                      </div>
                    </CardHeader>
                    {release.rejection_reason && (
                      <CardContent>
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                          <p className="font-semibold text-sm text-red-600 dark:text-red-400">Причина отклонения:</p>
                          <p className="mt-1 text-sm">{release.rejection_reason}</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {moderation.length === 0 && approved.length === 0 && rejected.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="clock" className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Нет релизов на модерации</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="support" className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Поддержка</h2>
                {currentUser?.role !== 'admin' && (
                  <Button onClick={() => setShowTicketForm(true)}>
                    <Icon name="plus" className="w-4 h-4 mr-2" />
                    Новый тикет
                  </Button>
                )}
              </div>

              {currentUser?.role === 'admin' && (
                <div className="mb-4">
                  <Select value={ticketFilter} onValueChange={(value: any) => setTicketFilter(value)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все тикеты</SelectItem>
                      <SelectItem value="open">Открытые</SelectItem>
                      <SelectItem value="answered">Отвеченные</SelectItem>
                      <SelectItem value="closed">Закрытые</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-4">
                {filteredTickets.map(ticket => {
                  const ticketUser = mockDb.users.getById(ticket.user_id);
                  return (
                    <Card key={ticket.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle>{ticket.subject}</CardTitle>
                            <CardDescription>
                              {currentUser?.role === 'admin' && ticketUser && (
                                <span>От: {ticketUser.name} ({ticketUser.email}) • </span>
                              )}
                              {new Date(ticket.created_at).toLocaleString('ru-RU')}
                            </CardDescription>
                          </div>
                          <div className={`px-3 py-1 rounded text-sm ${
                            ticket.status === 'open' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                            ticket.status === 'answered' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                            'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                          }`}>
                            {ticket.status === 'open' ? 'Открыт' : 
                             ticket.status === 'answered' ? 'Отвечен' : 'Закрыт'}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold mb-1">Сообщение:</p>
                          <p className="text-sm">{ticket.message}</p>
                        </div>

                        {ticket.admin_response && (
                          <div className="p-3 bg-primary/5 rounded">
                            <p className="text-sm font-semibold mb-1">Ответ поддержки:</p>
                            <p className="text-sm">{ticket.admin_response}</p>
                          </div>
                        )}

                        {currentUser?.role === 'admin' && ticket.status === 'open' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <Icon name="message-circle" className="w-4 h-4 mr-2" />
                            Ответить
                          </Button>
                        )}

                        {currentUser?.role === 'admin' && ticket.status === 'answered' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCloseTicket(ticket.id)}
                          >
                            <Icon name="check" className="w-4 h-4 mr-2" />
                            Закрыть тикет
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredTickets.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="message-circle" className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {currentUser?.role === 'admin' ? 'Нет тикетов' : 'У вас нет обращений в поддержку'}
                  </p>
                  {currentUser?.role !== 'admin' && (
                    <Button onClick={() => setShowTicketForm(true)}>
                      <Icon name="plus" className="w-4 h-4 mr-2" />
                      Создать тикет
                    </Button>
                  )}
                </div>
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
              <DialogTitle>Новое обращение в поддержку</DialogTitle>
            </DialogHeader>
            <TicketForm
              onSave={handleSaveTicket}
              onCancel={() => setShowTicketForm(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedRelease} onOpenChange={() => setSelectedRelease(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Отклонить релиз</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Причина отклонения</Label>
                <textarea
                  className="w-full mt-2 p-2 border rounded min-h-[100px]"
                  placeholder="Укажите причину отклонения..."
                  id="rejection-reason"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelectedRelease(null)}>
                  Отмена
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const reason = (document.getElementById('rejection-reason') as HTMLTextAreaElement).value;
                    if (reason.trim()) {
                      handleRejectRelease(selectedRelease!.id, reason);
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
              <DialogTitle>Ответить на тикет</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Сообщение пользователя:</p>
                <p className="text-sm p-3 bg-muted rounded">{selectedTicket?.message}</p>
              </div>
              <div>
                <Label>Ваш ответ</Label>
                <textarea
                  className="w-full mt-2 p-2 border rounded min-h-[100px]"
                  placeholder="Введите ответ..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setSelectedTicket(null);
                  setAdminResponse('');
                }}>
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    if (adminResponse.trim()) {
                      handleTicketResponse(selectedTicket!.id, adminResponse);
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
              <AlertDialogAction onClick={() => deleteDialog && handleDeleteRelease(deleteDialog)}>
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={!!viewDetailsRelease} onOpenChange={() => setViewDetailsRelease(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <ReleaseDetails release={viewDetailsRelease!} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Profile view (unchanged)
  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Icon name="music" className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                kedoo
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ThemeSelector currentTheme={theme} onThemeChange={changeTheme} />
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('dashboard')}>
                <Icon name="arrow-left" className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <Icon name="log-out" className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <ProfilePage user={currentUser!} onUpdate={(updates) => {
            const updatedUser = { ...currentUser!, ...updates };
            setCurrentUser(updatedUser);
            mockDb.users.update(currentUser!.id, updates);
          }} />
        </main>
      </div>
    );
  }

  // Landing Page
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Icon name="music" className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                kedoo
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('features')} className="text-sm hover:text-primary transition-colors">
                Возможности
              </button>
              <button onClick={() => scrollToSection('about')} className="text-sm hover:text-primary transition-colors">
                О платформе
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-sm hover:text-primary transition-colors">
                Контакты
              </button>
              <ThemeSelector currentTheme={theme} onThemeChange={changeTheme} />
              <Button onClick={() => setShowAuthDialog(true)} size="sm">
                Войти
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeSelector currentTheme={theme} onThemeChange={changeTheme} />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Icon name={mobileMenuOpen ? 'x' : 'menu'} className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden flex flex-col gap-4 mt-4 pb-4">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left text-sm hover:text-primary transition-colors"
              >
                Возможности
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left text-sm hover:text-primary transition-colors"
              >
                О платформе
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-left text-sm hover:text-primary transition-colors"
              >
                Контакты
              </button>
              <Button onClick={() => {
                setShowAuthDialog(true);
                setMobileMenuOpen(false);
              }} size="sm" className="w-full">
                Войти
              </Button>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Дистрибуция музыки
              </span>
              <br />
              <span className="text-foreground">нового поколения</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Публикуйте свою музыку на всех крупнейших стриминговых платформах мира. 
              Простой интерфейс, быстрая модерация, прозрачная аналитика.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setShowAuthDialog(true)} className="text-lg px-8">
                Начать бесплатно
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollToSection('features')} className="text-lg px-8">
                Узнать больше
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Возможности платформы</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Все инструменты для успешной дистрибуции вашей музыки в одном месте
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon name="globe" className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Глобальная дистрибуция</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Распространяйте вашу музыку на Spotify, Apple Music, YouTube Music, Deezer и другие платформы
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon name="zap" className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Быстрая модерация</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Профессиональная проверка контента в течение 24 часов. Получайте обратную связь и рекомендации
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon name="bar-chart" className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Детальная аналитика</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Следите за статистикой прослушиваний, географией слушателей и доходами в реальном времени
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon name="shield" className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Защита прав</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Автоматическая регистрация авторских прав и защита вашей интеллектуальной собственности
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon name="dollar-sign" className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Прозрачные выплаты</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Никаких скрытых комиссий. Прозрачная система расчетов и своевременные выплаты роялти
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon name="headphones" className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>24/7 Поддержка</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Наша команда всегда готова помочь вам с любыми вопросами по дистрибуции и продвижению
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">О kedoo</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground">
                  kedoo - это современная платформа для дистрибуции музыки, созданная артистами для артистов. 
                  Мы знаем, как важно для музыкантов сосредоточиться на творчестве, а не на технических аспектах публикации.
                </p>
                <p className="text-lg text-muted-foreground">
                  Наша миссия - сделать процесс дистрибуции максимально простым и прозрачным, предоставляя при этом 
                  профессиональные инструменты для управления вашей музыкальной карьерой.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Icon name="check-circle" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Без скрытых платежей</h4>
                      <p className="text-sm text-muted-foreground">Вы платите только за то, что используете</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="check-circle" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">100% ваших прав</h4>
                      <p className="text-sm text-muted-foreground">Вы сохраняете все права на свою музыку</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="check-circle" className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">Неограниченные релизы</h4>
                      <p className="text-sm text-muted-foreground">Публикуйте столько музыки, сколько хотите</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Icon name="music" className="w-32 h-32 text-primary/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Свяжитесь с нами</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Есть вопросы? Наша команда всегда готова помочь
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Icon name="mail" className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-sm text-muted-foreground">support@kedoo.ru</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Icon name="phone" className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">Телефон</h4>
                  <p className="text-sm text-muted-foreground">+7 (495) 123-45-67</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Icon name="message-circle" className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-semibold mb-2">Поддержка</h4>
                  <p className="text-sm text-muted-foreground">24/7 в личном кабинете</p>
                </CardContent>
              </Card>
            </div>

            <Button size="lg" onClick={() => setShowAuthDialog(true)}>
              Начать работу
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="music" className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg">kedoo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Современная платформа для дистрибуции музыки
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Платформа</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">Возможности</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-primary transition-colors">О нас</button></li>
                <li><button onClick={() => setShowAuthDialog(true)} className="hover:text-primary transition-colors">Войти</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-primary transition-colors">Контакты</button></li>
                <li><a href="#" className="hover:text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Документация</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Юридическая информация</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Условия использования</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Политика конфиденциальности</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Лицензионное соглашение</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>2025 kedoo. Все права защищены.</p>
          </div>
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Пароль</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      name="password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      <Icon name={showLoginPassword ? 'eye-off' : 'eye'} className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button type="button" variant="link" className="px-0" onClick={() => {
                  setShowAuthDialog(false);
                  setShowResetForm(true);
                }}>
                  Забыли пароль?
                </Button>
                <Button type="submit" className="w-full">Войти</Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Имя</Label>
                  <Input
                    id="register-name"
                    name="name"
                    placeholder="Ваше имя"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">Пароль</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      name="password"
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    >
                      <Icon name={showRegisterPassword ? 'eye-off' : 'eye'} className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full">Зарегистрироваться</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={showResetForm} onOpenChange={setShowResetForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сброс пароля</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="reset-password">Новый пароль</Label>
              <Input
                id="reset-password"
                name="new_password"
                type="password"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowResetForm(false)}>
                Отмена
              </Button>
              <Button type="submit" className="flex-1">Сбросить пароль</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;