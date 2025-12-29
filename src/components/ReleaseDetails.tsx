import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import type { Release, Track } from '@/lib/db';

interface ReleaseDetailsProps {
  release: Release;
  tracks: Track[];
  onClose: () => void;
  isAdmin?: boolean;
}

export const ReleaseDetails = ({ release, tracks, onClose, isAdmin }: ReleaseDetailsProps) => {
  const tracksList = tracks || [];
  
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">{release.title}</h2>
          <p className="text-muted-foreground text-lg">{release.genre}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <Icon name="X" size={24} />
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {release.cover_url ? (
            <img 
              src={release.cover_url} 
              alt={release.title} 
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
              <Icon name="Image" size={64} className="text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Информация об альбоме</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {release.upc && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">UPC</p>
                  <p className="font-medium">{release.upc}</p>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Жанр</p>
                <p className="font-medium">{release.genre}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Дата релиза</p>
                <p className="font-medium">
                  {release.new_release_date ? new Date(release.new_release_date).toLocaleDateString('ru-RU') : 'Не указана'}
                </p>
              </div>
              {release.old_release_date && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Старая дата релиза</p>
                    <p className="font-medium">
                      {new Date(release.old_release_date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Статус</p>
                <div className="mt-1">
                  <Badge variant={
                    release.status === 'approved' ? 'default' : 
                    release.status === 'rejected' ? 'destructive' : 
                    'secondary'
                  }>
                    {release.status === 'draft' ? 'Черновик' : 
                     release.status === 'moderation' ? 'На модерации' : 
                     release.status === 'approved' ? 'Принят' : 
                     release.status === 'rejected' ? 'Отклонён' : 'Удалён'}
                  </Badge>
                </div>
              </div>
              {release.rejection_reason && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Причина отклонения</p>
                    <p className="text-sm bg-destructive/10 p-2 rounded">{release.rejection_reason}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {isAdmin && release.cover_url && (
            <a href={release.cover_url} download className="block">
              <Button variant="outline" className="w-full">
                <Icon name="Download" size={18} className="mr-2" />
                Скачать обложку
              </Button>
            </a>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Треклист ({tracksList.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tracksList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Треков пока нет</p>
          ) : (
            tracksList.map((track, index) => (
              <Card key={track.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                      <h4 className="font-semibold text-lg">{track.title}</h4>
                      {track.has_explicit && (
                        <Badge variant="destructive" className="text-xs">E</Badge>
                      )}
                    </div>
                    {track.performers && (
                      <p className="text-sm text-muted-foreground">{track.performers}</p>
                    )}
                  </div>
                  {isAdmin && track.audio_url && (
                    <a href={track.audio_url} download>
                      <Button size="sm" variant="ghost">
                        <Icon name="Download" size={18} />
                      </Button>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {track.music_author && (
                    <div>
                      <p className="text-xs text-muted-foreground">Автор музыки</p>
                      <p className="font-medium">{track.music_author}</p>
                    </div>
                  )}
                  {track.lyrics_author && (
                    <div>
                      <p className="text-xs text-muted-foreground">Автор слов</p>
                      <p className="font-medium">{track.lyrics_author}</p>
                    </div>
                  )}
                  {track.producers && (
                    <div>
                      <p className="text-xs text-muted-foreground">Продюсеры</p>
                      <p className="font-medium">{track.producers}</p>
                    </div>
                  )}
                  {track.language && (
                    <div>
                      <p className="text-xs text-muted-foreground">Язык</p>
                      <p className="font-medium">{track.language}</p>
                    </div>
                  )}
                  {track.tiktok_moment && (
                    <div>
                      <p className="text-xs text-muted-foreground">Момент TikTok</p>
                      <p className="font-medium">{track.tiktok_moment}</p>
                    </div>
                  )}
                  {track.isrc && (
                    <div>
                      <p className="text-xs text-muted-foreground">ISRC</p>
                      <p className="font-medium">{track.isrc}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};