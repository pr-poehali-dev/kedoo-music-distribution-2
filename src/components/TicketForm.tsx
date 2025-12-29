import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TicketFormProps {
  onSubmit: (data: { subject: string; message: string }) => void;
  onCancel: () => void;
}

export const TicketForm = ({ onSubmit, onCancel }: TicketFormProps) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && message) {
      onSubmit({ subject, message });
      setSubject('');
      setMessage('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создать тикет</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Тема *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Краткое описание проблемы"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Сообщение *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Подробное описание вашего вопроса..."
              rows={6}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" onClick={onCancel} variant="outline">
              Отмена
            </Button>
            <Button type="submit" className="gradient-primary text-white">
              <Icon name="Send" size={18} className="mr-2" />
              Отправить тикет
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
