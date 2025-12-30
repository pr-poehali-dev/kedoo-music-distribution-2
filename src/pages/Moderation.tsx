import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface Track {
  id: number;
  title: string;
  audio_url: string;
  music_author: string;
  lyrics_author: string;
  performers: string;
  producers: string;
  track_order: number;
}

interface Release {
  id: number;
  user_id: number;
  title: string;
  upc: string;
  genre: string;
  cover_url: string;
  status: string;
  rejection_reason: string;
  created_at: string;
  tracks: Track[];
}

const MODERATION_API = 'https://functions.poehali.dev/b17a9038-e545-4a42-b06d-5ec71f4b1e2c';

const Moderation = () => {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  const fetchReleases = async (status: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${MODERATION_API}?status=${status}`, {
        headers: {
          'X-Moderator-Id': '1'
        }
      });
      const data = await response.json();
      setReleases(data.releases || []);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить релизы',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases(activeTab);
  }, [activeTab]);

  const handleApprove = async (releaseId: number) => {
    try {
      const response = await fetch(MODERATION_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Moderator-Id': '1'
        },
        body: JSON.stringify({
          action: 'approve',
          release_id: releaseId
        })
      });

      if (response.ok) {
        toast({
          title: 'Релиз принят',
          description: 'Релиз успешно одобрен'
        });
        fetchReleases(activeTab);
        setSelectedRelease(null);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось принять релиз',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (releaseId: number) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Укажите причину',
        description: 'Необходимо указать причину отклонения',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(MODERATION_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Moderator-Id': '1'
        },
        body: JSON.stringify({
          action: 'reject',
          release_id: releaseId,
          rejection_reason: rejectionReason
        })
      });

      if (response.ok) {
        toast({
          title: 'Релиз отклонён',
          description: 'Релиз отклонён с указанием причины'
        });
        fetchReleases(activeTab);
        setSelectedRelease(null);
        setRejectionReason('');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить релиз',
        variant: 'destructive'
      });
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Icon name="Shield" size={36} />
            Модерация релизов
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending">На проверке</TabsTrigger>
            <TabsTrigger value="approved">Принятые</TabsTrigger>
            <TabsTrigger value="rejected">Отклонённые</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center text-white">Загрузка...</div>
        ) : releases.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-12 text-center">
              <p className="text-white/60">Нет релизов в этой категории</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {releases.map((release) => (
              <Card key={release.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-white">{release.title}</CardTitle>
                    <Badge variant={release.status === 'approved' ? 'default' : release.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {release.status === 'pending' && 'На проверке'}
                      {release.status === 'approved' && 'Принят'}
                      {release.status === 'rejected' && 'Отклонён'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {release.cover_url && (
                    <img src={release.cover_url} alt={release.title} className="w-full h-48 object-cover rounded-lg" />
                  )}
                  
                  <div className="text-sm text-white/80 space-y-1">
                    <p><strong>UPC:</strong> {release.upc}</p>
                    <p><strong>Жанр:</strong> {release.genre}</p>
                    <p><strong>Треков:</strong> {release.tracks?.length || 0}</p>
                    <p><strong>ID пользователя:</strong> {release.user_id}</p>
                  </div>

                  <Button 
                    onClick={() => setSelectedRelease(release)} 
                    className="w-full"
                    variant="outline"
                  >
                    <Icon name="Eye" size={16} className="mr-2" />
                    Подробнее
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedRelease && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="bg-slate-900 border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-white text-2xl">{selectedRelease.title}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedRelease(null)}>
                    <Icon name="X" size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedRelease.cover_url && (
                  <div>
                    <img src={selectedRelease.cover_url} alt={selectedRelease.title} className="w-full max-w-md mx-auto rounded-lg" />
                    <Button 
                      onClick={() => downloadFile(selectedRelease.cover_url, `${selectedRelease.title}-cover.jpg`)}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать обложку
                    </Button>
                  </div>
                )}

                <div className="text-white space-y-2">
                  <p><strong>UPC:</strong> {selectedRelease.upc}</p>
                  <p><strong>Жанр:</strong> {selectedRelease.genre}</p>
                  <p><strong>Статус:</strong> {selectedRelease.status}</p>
                  {selectedRelease.rejection_reason && (
                    <div className="p-4 bg-red-500/20 rounded-lg">
                      <p className="font-semibold text-red-300">Причина отклонения:</p>
                      <p className="text-red-200">{selectedRelease.rejection_reason}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Треклист</h3>
                  <div className="space-y-3">
                    {selectedRelease.tracks?.map((track) => (
                      <Card key={track.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="text-white space-y-1">
                              <p className="font-semibold">{track.track_order}. {track.title}</p>
                              <p className="text-sm text-white/60">Музыка: {track.music_author}</p>
                              <p className="text-sm text-white/60">Слова: {track.lyrics_author}</p>
                              <p className="text-sm text-white/60">Исполнители: {track.performers}</p>
                            </div>
                            <Button 
                              onClick={() => downloadFile(track.audio_url, `${track.title}.mp3`)}
                              size="sm"
                              variant="outline"
                            >
                              <Icon name="Download" size={14} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedRelease.status === 'pending' && (
                  <div className="space-y-4 pt-6 border-t border-white/20">
                    <div>
                      <label className="text-white font-semibold mb-2 block">Причина отклонения (если отклоняете)</label>
                      <Textarea 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Укажите причину отклонения..."
                        className="bg-white/10 border-white/20 text-white"
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => handleApprove(selectedRelease.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Icon name="Check" size={16} className="mr-2" />
                        Принять релиз
                      </Button>
                      <Button 
                        onClick={() => handleReject(selectedRelease.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <Icon name="X" size={16} className="mr-2" />
                        Отклонить
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Moderation;
