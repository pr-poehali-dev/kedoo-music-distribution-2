import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';

interface ThemeSelectorProps {
  theme: 'light' | 'dark' | 'crystal' | 'blue-dark';
  onThemeChange: (theme: 'light' | 'dark' | 'crystal' | 'blue-dark') => void;
}

export function ThemeSelector({ theme, onThemeChange }: ThemeSelectorProps) {
  const themes = [
    { value: 'light' as const, label: 'Светлая', icon: 'Sun' },
    { value: 'dark' as const, label: 'Тёмная', icon: 'Moon' },
    { value: 'crystal' as const, label: 'Кристальная', icon: 'Droplet' },
    { value: 'blue-dark' as const, label: 'Сине-тёмная', icon: 'Waves' },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Icon name={currentTheme.icon} size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ value, label, icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onThemeChange(value)}
            className="cursor-pointer"
          >
            <Icon name={icon} size={16} className="mr-2" />
            {label}
            {theme === value && <Icon name="Check" size={16} className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
