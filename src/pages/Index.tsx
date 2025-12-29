import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [activeTab, setActiveTab] = useState('releases');
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setCurrentView('dashboard');
    toast({
      title: "Добро пожаловать в kedoo!",
      description: "Вы успешно вошли в систему",
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setCurrentView('dashboard');
    toast({
      title: "Регистрация успешна!",
      description: "Ваш аккаунт создан. Добро пожаловать!",
    });
  };

  if (currentView === 'landing' && !isLoggedIn) {
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
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>
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
                <Button
                  size="lg"
                  className="gradient-primary text-white font-semibold text-lg px-8 py-6 hover:opacity-90 transition-opacity"
                  onClick={() => setCurrentView('landing')}
                >
                  Начать сейчас
                  <Icon name="ArrowRight" className="ml-2" size={20} />
                </Button>
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

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <img
                  src="https://cdn.poehali.dev/projects/7d7646b6-3be9-4719-af6a-6713600b76e2/files/b50b93c7-c7c9-4fcf-a050-3d892ada45bb.jpg"
                  alt="Studio"
                  className="rounded-2xl shadow-xl w-full"
                />
              </div>
              <div className="space-y-6 flex flex-col justify-center">
                <h2 className="text-4xl font-bold">Начните распространять свою музыку</h2>
                <ul className="space-y-4">
                  {[
                    'Загрузите свои треки',
                    'Автоматическая модерация',
                    'Распространение на все площадки',
                    '100% роялти вам',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon name="Check" className="text-primary" size={16} />
                      </div>
                      <span className="text-lg">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
          <div className="container mx-auto max-w-4xl text-center text-white space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">Готовы начать?</h2>
            <p className="text-xl opacity-90">Присоединяйтесь к тысячам артистов, которые уже выбрали kedoo</p>
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
                        <Input id="login-email" type="email" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Пароль</Label>
                        <Input id="login-password" type="password" required />
                      </div>
                      <Button type="submit" className="w-full gradient-primary text-white">
                        Войти
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Имя</Label>
                        <Input id="register-name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input id="register-email" type="email" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Пароль</Label>
                        <Input id="register-password" type="password" required />
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

        <footer className="py-8 px-4 border-t">
          <div className="container mx-auto text-center text-muted-foreground">
            <p>© 2024 kedoo. Дочерняя компания Radish. Все права защищены.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Icon name="Music" className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold gradient-text">kedoo</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={20} />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsLoggedIn(false);
                setCurrentView('landing');
              }}
            >
              <Icon name="LogOut" size={18} className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Личный кабинет</h1>
          <p className="text-muted-foreground">Управляйте своими релизами и отслеживайте статистику</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="releases" className="flex items-center gap-2">
              <Icon name="Disc" size={18} />
              <span className="hidden sm:inline">Мои релизы</span>
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Icon name="PlusCircle" size={18} />
              <span className="hidden sm:inline">Добавить</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Icon name="MessageSquare" size={18} />
              <span className="hidden sm:inline">Тикеты</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Icon name="Wallet" size={18} />
              <span className="hidden sm:inline">Кошелёк</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="releases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Все релизы</CardTitle>
                <CardDescription>Здесь будут отображаться ваши релизы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Icon name="Disc" size={40} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Релизов пока нет</h3>
                  <p className="text-muted-foreground mb-6">Создайте свой первый релиз, чтобы начать</p>
                  <Button onClick={() => setActiveTab('add')} className="gradient-primary text-white">
                    <Icon name="PlusCircle" size={18} className="mr-2" />
                    Добавить релиз
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Добавить новый релиз</CardTitle>
                <CardDescription>Заполните информацию о вашем релизе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-4">
                    <Icon name="Upload" size={40} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Создание релиза</h3>
                  <p className="text-muted-foreground mb-6">Форма создания релиза появится здесь</p>
                  <Button className="gradient-primary text-white">
                    Начать создание
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Поддержка</CardTitle>
                <CardDescription>Создавайте тикеты для связи с модераторами</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Icon name="MessageSquare" size={40} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Тикетов пока нет</h3>
                  <p className="text-muted-foreground mb-6">Создайте тикет, если у вас есть вопросы</p>
                  <Button className="gradient-primary text-white">
                    <Icon name="PlusCircle" size={18} className="mr-2" />
                    Создать тикет
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ваш кошелёк</CardTitle>
                <CardDescription>Управление финансами и вывод средств</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <div className="text-5xl font-bold gradient-text mb-2">0 ₽</div>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
