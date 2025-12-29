import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { GENRES, LANGUAGES } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  title: string;
  audio_url?: string;
  tiktok_moment?: string;
  music_author?: string;
  lyrics_author?: string;
  has_explicit: boolean;
  performers?: string;
  producers?: string;
  isrc?: string;
  language?: string;
}

interface ReleaseFormProps {
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const ReleaseForm = ({ initialData, onSave, onCancel }: ReleaseFormProps) => {
  const [step, setStep] = useState<'album' | 'tracks' | 'preview'>('album');
  const { toast } = useToast();
  
  const [albumData, setAlbumData] = useState({
    title: initialData?.title || '',
    upc: initialData?.upc || '',
    genre: initialData?.genre || '',
    cover_url: initialData?.cover_url || '',
    old_release_date: initialData?.old_release_date || '',
    new_release_date: initialData?.new_release_date || '',
  });

  const [tracks, setTracks] = useState<Track[]>(
    initialData?.tracks || []
  );

  const addTrack = () => {
    setTracks([
      ...tracks,
      {
        id: `temp-${Date.now()}`,
        title: '',
        has_explicit: false,
        language: 'Русский'
      }
    ]);
  };

  const updateTrack = (id: string, field: string, value: any) => {
    setTracks(tracks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTrack = (id: string) => {
    setTracks(tracks.filter(t => t.id !== id));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAlbumData({ ...albumData, cover_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (trackId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateTrack(trackId, 'audio_url', URL.createObjectURL(file));
      toast({
        title: "Трек загружен",
        description: file.name
      });
    }
  };

  const canProceedToTracks = () => {
    return albumData.title && albumData.genre && albumData.new_release_date && albumData.cover_url;
  };

  const canSubmit = () => {
    return canProceedToTracks() && tracks.length > 0 && tracks.every(t => 
      t.title && t.music_author && t.lyrics_author && t.performers && t.language
    );
  };

  const handleSubmit = () => {
    if (!canSubmit()) {
      toast({
        title: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    onSave({
      ...albumData,
      tracks,
      status: 'moderation'
    });
  };

  const handleSaveDraft = () => {
    onSave({
      ...albumData,
      tracks,
      status: 'draft'
    });
  };

  if (step === 'album') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Данные об альбоме</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название релиза *</Label>
              <Input
                id="title"
                value={albumData.title}
                onChange={(e) => setAlbumData({ ...albumData, title: e.target.value })}
                placeholder="Название альбома"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upc">UPC</Label>
              <Input
                id="upc"
                value={albumData.upc}
                onChange={(e) => setAlbumData({ ...albumData, upc: e.target.value })}
                placeholder="Универсальный код продукта"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Жанр *</Label>
            <Select value={albumData.genre} onValueChange={(value) => setAlbumData({ ...albumData, genre: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите жанр" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Обложка релиза (3000×3000) *</Label>
            <Input
              id="cover"
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
            />
            {albumData.cover_url && (
              <img src={albumData.cover_url} alt="Cover" className="w-32 h-32 object-cover rounded-lg mt-2" />
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="old_date">Старая дата релиза (если был выпущен ранее)</Label>
              <Input
                id="old_date"
                type="date"
                value={albumData.old_release_date}
                onChange={(e) => setAlbumData({ ...albumData, old_release_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_date">Новая дата релиза *</Label>
              <Input
                id="new_date"
                type="date"
                value={albumData.new_release_date}
                onChange={(e) => setAlbumData({ ...albumData, new_release_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onCancel} variant="outline">
              Отмена
            </Button>
            <Button onClick={handleSaveDraft} variant="outline">
              Сохранить черновик
            </Button>
            <Button
              onClick={() => setStep('tracks')}
              disabled={!canProceedToTracks()}
              className="gradient-primary text-white"
            >
              Далее: Треки
              <Icon name="ArrowRight" className="ml-2" size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'tracks') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Треклист</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {tracks.map((track, index) => (
            <Card key={track.id} className="p-4 border-2">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Трек #{index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTrack(track.id)}
                >
                  <Icon name="Trash2" size={18} className="text-destructive" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Название трека *</Label>
                  <Input
                    value={track.title}
                    onChange={(e) => updateTrack(track.id, 'title', e.target.value)}
                    placeholder="Название"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Аудиофайл</Label>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleAudioUpload(track.id, e)}
                  />
                  {track.audio_url && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Music" size={16} />
                      Загружено
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Момент TikTok</Label>
                    <Input
                      value={track.tiktok_moment || ''}
                      onChange={(e) => updateTrack(track.id, 'tiktok_moment', e.target.value)}
                      placeholder="00:30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ISRC (необязательно)</Label>
                    <Input
                      value={track.isrc || ''}
                      onChange={(e) => updateTrack(track.id, 'isrc', e.target.value)}
                      placeholder="ISRC код"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ФИО автора музыки *</Label>
                    <Input
                      value={track.music_author || ''}
                      onChange={(e) => updateTrack(track.id, 'music_author', e.target.value)}
                      placeholder="Иванов Иван Иванович"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ФИО автора слов *</Label>
                    <Input
                      value={track.lyrics_author || ''}
                      onChange={(e) => updateTrack(track.id, 'lyrics_author', e.target.value)}
                      placeholder="Петров Петр Петрович"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Исполнители трека *</Label>
                  <Input
                    value={track.performers || ''}
                    onChange={(e) => updateTrack(track.id, 'performers', e.target.value)}
                    placeholder="Имена исполнителей через запятую"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Продюсеры</Label>
                  <Input
                    value={track.producers || ''}
                    onChange={(e) => updateTrack(track.id, 'producers', e.target.value)}
                    placeholder="Имена продюсеров через запятую"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Язык песни *</Label>
                  <Select
                    value={track.language}
                    onValueChange={(value) => updateTrack(track.id, 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={track.has_explicit}
                    onCheckedChange={(checked) => updateTrack(track.id, 'has_explicit', checked)}
                  />
                  <Label>В треке есть мат</Label>
                </div>
              </div>
            </Card>
          ))}

          <Button onClick={addTrack} variant="outline" className="w-full">
            <Icon name="Plus" size={18} className="mr-2" />
            Добавить трек
          </Button>

          <div className="flex gap-2 pt-4">
            <Button onClick={() => setStep('album')} variant="outline">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад
            </Button>
            <Button onClick={handleSaveDraft} variant="outline">
              Сохранить черновик
            </Button>
            <Button
              onClick={() => setStep('preview')}
              disabled={tracks.length === 0}
              className="gradient-primary text-white"
            >
              Предпросмотр
              <Icon name="ArrowRight" className="ml-2" size={18} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Предпросмотр релиза</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {albumData.cover_url && (
              <img src={albumData.cover_url} alt="Cover" className="w-full rounded-lg shadow-lg" />
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold">{albumData.title}</h3>
              <p className="text-muted-foreground">{albumData.genre}</p>
            </div>
            {albumData.upc && (
              <div>
                <Label className="text-xs text-muted-foreground">UPC</Label>
                <p>{albumData.upc}</p>
              </div>
            )}
            <div>
              <Label className="text-xs text-muted-foreground">Дата релиза</Label>
              <p>{new Date(albumData.new_release_date).toLocaleDateString('ru-RU')}</p>
            </div>
            {albumData.old_release_date && (
              <div>
                <Label className="text-xs text-muted-foreground">Старая дата релиза</Label>
                <p>{new Date(albumData.old_release_date).toLocaleDateString('ru-RU')}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Треклист ({tracks.length})</h4>
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <span className="text-muted-foreground w-8">{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium">{track.title}</p>
                  <p className="text-sm text-muted-foreground">{track.performers}</p>
                </div>
                {track.has_explicit && (
                  <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded">E</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={() => setStep('tracks')} variant="outline">
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Назад
          </Button>
          <Button onClick={handleSaveDraft} variant="outline">
            Сохранить черновик
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="gradient-primary text-white"
          >
            <Icon name="Send" size={18} className="mr-2" />
            Отправить на модерацию
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
