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

  const changeTheme = (newTheme: 'light' | 'dark' | 'crystal' | 'blue-dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove('dark', 'crystal', 'blue-dark');
    if (newTheme !== 'light') {
      document.documentElement.classList.add(newTheme);
    }
  };

  const loadReleases = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch('https://functions.poehali.dev/aab88ae6-4e32-4979-86e9-166b9afe10ef', {
        method: 'GET',
        headers: { 'X-User-Id': currentUser.id.toString() }
      });
      const data = await response.json();
      if (data.releases) {
        setReleases(data.releases);
      }
    } catch (error) {
      console.error('Failed to load releases:', error);
    }
  };

  const loadTickets = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch('https://functions.poehali.dev/8554c9f5-b082-4425-86d5-70ceda845616', {
        method: 'GET',
        headers: { 'X-User-Id': currentUser.id.toString() }
      });
      const data = await response.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Failed to load tickets:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadReleases();
      loadTickets();
    }
  }, [currentUser]);

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
        const updateData = { ...data };
        if (data.status === 'moderation') {
          updateData.rejection_reason = undefined;
        }
        
        await fetch('https://functions.poehali.dev/aab88ae6-4e32-4979-86e9-166b9afe10ef', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': currentUser.id.toString()
          },
          body: JSON.stringify({ id: editingRelease.id, ...updateData })
        });
        
        toast({ title: "Релиз обновлён" });
      } else {
        await fetch('https://functions.poehali.dev/aab88ae6-4e32-4979-86e9-166b9afe10ef', {
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

        toast({
          title: data.status === 'moderation' ? "Релиз отправлен на модерацию" : "Черновик сохранён"
        });
      }

      await loadReleases();
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
      await fetch('https://functions.poehali.dev/aab88ae6-4e32-4979-86e9-166b9afe10ef', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({ id })
      });
      
      await loadReleases();
      toast({ title: "Релиз удалён" });
      setDeleteDialog(null);
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить релиз",
        variant: "destructive"
      });
    }
  };

  const handleRestoreRelease = async (id: number) => {
    if (!currentUser) return;
    
    try {
      await fetch('https://functions.poehali.dev/aab88ae6-4e32-4979-86e9-166b9afe10ef', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({ action: 'restore', release_id: id })
      });
      
      await loadReleases();
      toast({ title: "Релиз восстановлен" });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось восстановить релиз",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFromModeration = async (id: number) => {
    if (!currentUser) return;
    
    try {
      await fetch('https://functions.poehali.dev/aab88ae6-4e32-4979-86e9-166b9afe10ef', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({ id, status: 'draft' })
      });
      
      await loadReleases();
      toast({ title: "Релиз снят с модерации" });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось снять релиз с модерации",
        variant: "destructive"
      });
    }
  };

  const handleApproveRelease = async (id: number) => {
    if (!currentUser) return;
    
    try {
      await fetch('https://functions.poehali.dev/aab88ae6-4e32-4979-86e9-166b9afe10ef', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({ id, status: 'approved', rejection_reason: undefined })
      });
      
      await loadReleases();
      toast({ title: "Релиз принят" });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось принять релиз",
        variant: "destructive"
      });
    }
  };

  const handleRejectRelease = async (id: number, reason: string) => {
    if (!currentUser) return;
    
    try {
      await fetch('https://functions.poehali.dev/aab88ae6-4e32-4979-86e9-166b9afe10ef', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({ id, status: 'rejected', rejection_reason: reason })
      });
      
      await loadReleases();
      setSelectedRelease(null);
      toast({ title: "Релиз отклонён" });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отклонить релиз",
        variant: "destructive"
      });
    }
  };

  const handleCreateTicket = async (data: { subject: string; message: string }) => {
    if (!currentUser) return;
    
    try {
      await fetch('https://functions.poehali.dev/8554c9f5-b082-4425-86d5-70ceda845616', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify(data)
      });
      
      await loadTickets();
      setShowTicketForm(false);
      toast({ title: "Тикет создан" });
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
      await fetch('https://functions.poehali.dev/8554c9f5-b082-4425-86d5-70ceda845616', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({
          id: ticketId,
          status: 'answered',
          admin_response: adminResponse
        })
      });
      
      await loadTickets();
      setSelectedTicket(null);
      setAdminResponse('');
      toast({ title: "Ответ отправлен" });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить ответ",
        variant: "destructive"
      });
    }
  };

  const handleCloseTicket = async (ticketId: number) => {
    if (!currentUser) return;
    
    try {
      await fetch('https://functions.poehali.dev/8554c9f5-b082-4425-86d5-70ceda845616', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString()
        },
        body: JSON.stringify({ id: ticketId, status: 'closed' })
      });
      
      await loadTickets();
      setSelectedTicket(null);
      toast({ title: "Тикет закрыт" });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось закрыть тикет",
        variant: "destructive"
      });
    }
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

  const userReleases = releases.filter(r => !r.trash_status);
  const deletedReleases = releases.filter(r => r.trash_status);
  const userTickets = tickets;
  const moderationReleases = releases.filter(r => r.status === 'moderation');
  const allTickets = tickets;
  
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
    return ticketFilter === 'all' ? true : t.status === ticketFilter;
  });
  
  const filteredAllTickets = allTickets.filter(t => {
    return ticketFilter === 'all' ? true : t.status === ticketFilter;
  });

  const logout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    toast({ title: "Вы вышли из системы" });
  };

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Icon name="music" className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              kedoo
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSelector theme={theme} onThemeChange={changeTheme} />
            <Dialog open={showResetForm} onOpenChange={setShowResetForm}>
              <Button 
                variant="outline"
                onClick={() => setShowResetForm(true)}
              >
                Сброс пароля
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Сброс пароля</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email">Email</Label>
                    <Input id="reset-email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="new_password">Новый пароль</Label>
                    <Input id="new_password" name="new_password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full">Сбросить пароль</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Ваша музыка на всех платформах
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Профессиональный дистрибьютор для артистов. Распространяйте свою музыку на Spotify, Apple Music, YouTube Music и других площадках.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="log-in" className="w-5 h-5" />
                  Вход
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" name="email" type="email" placeholder="your@email.com" required />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Пароль</Label>
                    <div className="relative">
                      <Input 
                        id="login-password" 
                        name="password" 
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        required 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        <Icon name={showLoginPassword ? "eye-off" : "eye"} className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Войти</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="user-plus" className="w-5 h-5" />
                  Регистрация
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="register-name">Имя</Label>
                    <Input id="register-name" name="name" placeholder="Ваше имя" required />
                  </div>
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input id="register-email" name="email" type="email" placeholder="your@email.com" required />
                  </div>
                  <div>
                    <Label htmlFor="register-password">Пароль</Label>
                    <div className="relative">
                      <Input 
                        id="register-password" 
                        name="password" 
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        required 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        <Icon name={showRegisterPassword ? "eye-off" : "eye"} className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Зарегистрироваться</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Icon name="globe" className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Глобальный охват</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Распространяйте музыку на 150+ платформах по всему миру
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icon name="trending-up" className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Аналитика</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Отслеживайте прослушивания и доходы в реальном времени
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Icon name="shield-check" className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Защита прав</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Полный контроль и защита ваших авторских прав
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );

  const renderDashboard = () => {
    if (!currentUser) return null;

    if (currentUser.role === 'admin') {
      return (
        <div className="min-h-screen flex flex-col bg-background">
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Icon name="music" className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">kedoo</h1>
                    <p className="text-sm text-muted-foreground">Панель модератора</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ThemeSelector theme={theme} onThemeChange={changeTheme} />
                  <Button variant="ghost" size="sm" onClick={logout}>
                    <Icon name="log-out" className="w-4 h-4 mr-2" />
                    Выйти
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="moderation">Модерация</TabsTrigger>
                <TabsTrigger value="support">Поддержка</TabsTrigger>
              </TabsList>

              <TabsContent value="moderation" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Релизы на модерации</h2>
                    <p className="text-sm text-muted-foreground">Всего: {filteredModerationReleases.length}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Input
                      placeholder="Поиск..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64"
                    />
                    <Select value={genreFilter} onValueChange={setGenreFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все жанры</SelectItem>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                        <SelectItem value="electronic">Electronic</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredModerationReleases.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Icon name="inbox" className="w-16 h-16 text-muted-foreground/40 mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">Нет релизов на модерации</p>
                      <p className="text-sm text-muted-foreground">Все релизы обработаны</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredModerationReleases.map((release) => (
                      <Card key={release.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {release.cover_url && (
                              <img
                                src={release.cover_url}
                                alt={release.title}
                                className="w-24 h-24 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold truncate">{release.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {release.genre} • UPC: {release.upc}
                                  </p>
                                </div>
                                {getStatusBadge(release.status)}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => setViewDetailsRelease(release)}
                                >
                                  <Icon name="eye" className="w-4 h-4 mr-2" />
                                  Просмотр
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleApproveRelease(release.id)}
                                >
                                  <Icon name="check" className="w-4 h-4 mr-2" />
                                  Принять
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setSelectedRelease(release)}
                                >
                                  <Icon name="x" className="w-4 h-4 mr-2" />
                                  Отклонить
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="support" className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Обращения пользователей</h2>
                    <p className="text-sm text-muted-foreground">Всего: {filteredAllTickets.length}</p>
                  </div>
                  <Select value={ticketFilter} onValueChange={(v: any) => setTicketFilter(v)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="open">Открытые</SelectItem>
                      <SelectItem value="answered">Отвеченные</SelectItem>
                      <SelectItem value="closed">Закрытые</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredAllTickets.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Icon name="inbox" className="w-16 h-16 text-muted-foreground/40 mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">Нет обращений</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {filteredAllTickets.map((ticket) => (
                      <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                              <p className="text-sm text-muted-foreground">ID пользователя: {ticket.user_id}</p>
                            </div>
                            <Badge variant={ticket.status === 'open' ? 'default' : ticket.status === 'answered' ? 'secondary' : 'outline'}>
                              {ticket.status === 'open' ? 'Открыт' : ticket.status === 'answered' ? 'Отвечен' : 'Закрыт'}
                            </Badge>
                          </div>
                          <p className="text-sm mb-4 whitespace-pre-wrap">{ticket.message}</p>
                          {ticket.admin_response && (
                            <div className="bg-muted p-4 rounded-lg mb-4">
                              <p className="text-sm font-medium mb-1">Ответ администратора:</p>
                              <p className="text-sm whitespace-pre-wrap">{ticket.admin_response}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            {ticket.status === 'open' && (
                              <Button size="sm" onClick={() => setSelectedTicket(ticket)}>
                                <Icon name="message-circle" className="w-4 h-4 mr-2" />
                                Ответить
                              </Button>
                            )}
                            {ticket.status !== 'closed' && (
                              <Button size="sm" variant="outline" onClick={() => handleCloseTicket(ticket.id)}>
                                <Icon name="check" className="w-4 h-4 mr-2" />
                                Закрыть
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Icon name="music" className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">kedoo</h1>
                  <p className="text-sm text-muted-foreground">Личный кабинет</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <ThemeSelector theme={theme} onThemeChange={changeTheme} />
                <Button variant="ghost" size="sm" onClick={() => setCurrentView('profile')}>
                  <Icon name="user" className="w-4 h-4 mr-2" />
                  Профиль
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <Icon name="log-out" className="w-4 h-4 mr-2" />
                  Выйти
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
                    <Button variant="ghost" onClick={() => { setCurrentView('profile'); setShowMobileMenu(false); }}>
                      <Icon name="user" className="w-4 h-4 mr-2" />
                      Профиль
                    </Button>
                    <Button variant="ghost" onClick={() => { logout(); setShowMobileMenu(false); }}>
                      <Icon name="log-out" className="w-4 h-4 mr-2" />
                      Выйти
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="releases">Релизы</TabsTrigger>
              <TabsTrigger value="trash">Корзина</TabsTrigger>
              <TabsTrigger value="support">Поддержка</TabsTrigger>
            </TabsList>

            <TabsContent value="releases" className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Мои релизы</h2>
                  <p className="text-sm text-muted-foreground">Всего: {filteredUserReleases.length}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <Input
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Select value={genreFilter} onValueChange={setGenreFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все жанры</SelectItem>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="rock">Rock</SelectItem>
                      <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                      <SelectItem value="electronic">Electronic</SelectItem>
                      <SelectItem value="jazz">Jazz</SelectItem>
                      <SelectItem value="classical">Classical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowReleaseForm(true)} className="w-full sm:w-auto">
                    <Icon name="plus" className="w-4 h-4 mr-2" />
                    Новый релиз
                  </Button>
                </div>
              </div>

              {filteredUserReleases.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Icon name="disc-3" className="w-16 h-16 text-muted-foreground/40 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Нет релизов</p>
                    <p className="text-sm text-muted-foreground mb-4">Создайте свой первый релиз</p>
                    <Button onClick={() => setShowReleaseForm(true)}>
                      <Icon name="plus" className="w-4 h-4 mr-2" />
                      Создать релиз
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredUserReleases.map((release) => (
                    <Card key={release.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          {release.cover_url && (
                            <img
                              src={release.cover_url}
                              alt={release.title}
                              className="w-24 h-24 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold truncate">{release.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {release.genre} • UPC: {release.upc}
                                </p>
                              </div>
                              {getStatusBadge(release.status)}
                            </div>
                            {release.rejection_reason && release.status === 'rejected' && (
                              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-3">
                                <p className="text-sm font-medium text-destructive mb-1">Причина отклонения:</p>
                                <p className="text-sm text-muted-foreground">{release.rejection_reason}</p>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" onClick={() => setViewDetailsRelease(release)}>
                                <Icon name="eye" className="w-4 h-4 mr-2" />
                                Просмотр
                              </Button>
                              {release.status === 'draft' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingRelease(release);
                                      setShowReleaseForm(true);
                                    }}
                                  >
                                    <Icon name="edit" className="w-4 h-4 mr-2" />
                                    Редактировать
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setDeleteDialog(release.id)}
                                  >
                                    <Icon name="trash-2" className="w-4 h-4 mr-2" />
                                    Удалить
                                  </Button>
                                </>
                              )}
                              {release.status === 'moderation' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveFromModeration(release.id)}
                                >
                                  <Icon name="x" className="w-4 h-4 mr-2" />
                                  Снять с модерации
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
            </TabsContent>

            <TabsContent value="trash" className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">Корзина</h2>
                <p className="text-sm text-muted-foreground">Удалённые релизы: {deletedReleases.length}</p>
              </div>

              {deletedReleases.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Icon name="trash-2" className="w-16 h-16 text-muted-foreground/40 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Корзина пуста</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {deletedReleases.map((release) => (
                    <Card key={release.id} className="hover:shadow-md transition-shadow opacity-60">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          {release.cover_url && (
                            <img
                              src={release.cover_url}
                              alt={release.title}
                              className="w-24 h-24 rounded-lg object-cover grayscale"
                            />
                          )}
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold truncate">{release.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {release.genre} • UPC: {release.upc}
                                </p>
                              </div>
                              <Badge variant="outline">Удалён</Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRestoreRelease(release.id)}
                              >
                                <Icon name="rotate-ccw" className="w-4 h-4 mr-2" />
                                Восстановить
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteDialog(release.id)}
                              >
                                <Icon name="trash-2" className="w-4 h-4 mr-2" />
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
            </TabsContent>

            <TabsContent value="support" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Поддержка</h2>
                  <p className="text-sm text-muted-foreground">Мои обращения: {filteredUserTickets.length}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Select value={ticketFilter} onValueChange={(v: any) => setTicketFilter(v)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="open">Открытые</SelectItem>
                      <SelectItem value="answered">Отвеченные</SelectItem>
                      <SelectItem value="closed">Закрытые</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => setShowTicketForm(true)} className="w-full sm:w-auto">
                    <Icon name="plus" className="w-4 h-4 mr-2" />
                    Новое обращение
                  </Button>
                </div>
              </div>

              {filteredUserTickets.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Icon name="message-circle" className="w-16 h-16 text-muted-foreground/40 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">Нет обращений</p>
                    <p className="text-sm text-muted-foreground mb-4">Создайте обращение, если у вас есть вопросы</p>
                    <Button onClick={() => setShowTicketForm(true)}>
                      <Icon name="plus" className="w-4 h-4 mr-2" />
                      Создать обращение
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredUserTickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                          <Badge variant={ticket.status === 'open' ? 'default' : ticket.status === 'answered' ? 'secondary' : 'outline'}>
                            {ticket.status === 'open' ? 'Открыт' : ticket.status === 'answered' ? 'Отвечен' : 'Закрыт'}
                          </Badge>
                        </div>
                        <p className="text-sm mb-4 whitespace-pre-wrap">{ticket.message}</p>
                        {ticket.admin_response && (
                          <div className="bg-muted p-4 rounded-lg mb-4">
                            <p className="text-sm font-medium mb-1">Ответ администратора:</p>
                            <p className="text-sm whitespace-pre-wrap">{ticket.admin_response}</p>
                          </div>
                        )}
                        {ticket.status !== 'closed' && (
                          <Button size="sm" variant="outline" onClick={() => handleCloseTicket(ticket.id)}>
                            <Icon name="check" className="w-4 h-4 mr-2" />
                            Закрыть
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  };

  return (
    <>
      {currentView === 'landing' && renderLanding()}
      {currentView === 'dashboard' && renderDashboard()}
      {currentView === 'profile' && <ProfilePage user={currentUser!} onBack={() => setCurrentView('dashboard')} theme={theme} onThemeChange={changeTheme} />}

      <Dialog open={showReleaseForm} onOpenChange={(open) => {
        setShowReleaseForm(open);
        if (!open) setEditingRelease(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRelease ? 'Редактировать релиз' : 'Новый релиз'}</DialogTitle>
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
            onSubmit={handleCreateTicket}
            onCancel={() => setShowTicketForm(false)}
          />
        </DialogContent>
      </Dialog>

      {viewDetailsRelease && (
        <ReleaseDetails
          release={viewDetailsRelease}
          onClose={() => setViewDetailsRelease(null)}
        />
      )}

      <AlertDialog open={deleteDialog !== null} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот релиз? Это действие нельзя отменить.
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

      <Dialog open={selectedRelease !== null} onOpenChange={(open) => !open && setSelectedRelease(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Отклонить релиз</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Причина отклонения</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Укажите причину отклонения..."
                rows={4}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setSelectedRelease(null);
                setAdminResponse('');
              }}>
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedRelease && adminResponse.trim()) {
                    handleRejectRelease(selectedRelease.id, adminResponse);
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

      <Dialog open={selectedTicket !== null} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ответить на обращение</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Тема:</p>
                <p className="text-sm text-muted-foreground">{selectedTicket.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Сообщение:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTicket.message}</p>
              </div>
              <div>
                <Label htmlFor="admin-response">Ваш ответ</Label>
                <Textarea
                  id="admin-response"
                  placeholder="Введите ответ..."
                  rows={4}
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
                  onClick={() => selectedTicket && handleRespondToTicket(selectedTicket.id)}
                  disabled={!adminResponse.trim()}
                >
                  Отправить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Index;