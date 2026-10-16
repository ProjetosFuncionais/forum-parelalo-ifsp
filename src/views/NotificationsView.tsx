import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Navigate } from '../lib/router';
import { Notification } from '../types';
import { timeAgo } from '../lib/format';
import { UserAvatar } from '../components/UserAvatar';
import { Button, EmptyState, PageHeader, Panel, Tabs, cx } from '../components/ui';
import { Heart, MessageCircle, UserPlus, Mail, CalendarDays, Bell } from 'lucide-react';

const ICONS = {
  like: { icon: Heart, className: 'text-like' },
  comment: { icon: MessageCircle, className: 'text-accent-ink' },
  follow: { icon: UserPlus, className: 'text-accent-ink' },
  message: { icon: Mail, className: 'text-ink-2' },
  event_reminder: { icon: CalendarDays, className: 'text-warn' },
  system: { icon: Bell, className: 'text-muted' }
} as const;

export const NotificationsView: React.FC<{ onNavigate: Navigate }> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!currentUser) {
    return (
      <Panel className="max-w-md mx-auto">
        <EmptyState
          title="Entre para ver suas notificações"
          text="Curtidas, comentários, novos seguidores e mensagens aparecem aqui."
          action={<Button variant="primary" size="sm" onClick={() => onNavigate('auth')}>Entrar</Button>}
        />
      </Panel>
    );
  }

  const all = storage.getNotifications(currentUser.id);
  const unreadCount = all.filter(n => !n.read).length;
  const list = filter === 'unread' ? all.filter(n => !n.read) : all;

  const open = (n: Notification) => {
    storage.markNotificationAsRead(n.id);
    switch (n.type) {
      case 'message':
        return onNavigate('chat', n.actorId);
      case 'follow':
        return onNavigate('profile', n.actorId);
      case 'like':
      case 'comment':
        return n.referenceId ? onNavigate('post', n.referenceId) : onNavigate('feed');
      case 'event_reminder':
        return onNavigate('events', n.referenceId);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <PageHeader
        title="Notificações"
        actions={
          unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => storage.markAllNotificationsAsRead(currentUser.id)}>
              Marcar todas como lidas
            </Button>
          )
        }
      />

      <Panel className="overflow-hidden">
        <Tabs
          value={filter}
          onChange={setFilter}
          items={[
            { id: 'all', label: 'Todas' },
            { id: 'unread', label: 'Não lidas', count: unreadCount }
          ]}
        />

        {list.length === 0 ? (
          <EmptyState
            title={filter === 'unread' ? 'Tudo lido' : 'Nenhuma notificação ainda'}
            text={filter === 'unread' ? undefined : 'Quando alguém curtir, comentar ou seguir você, aparece aqui.'}
          />
        ) : (
          <ul className="divide-y divide-line">
            {list.map(n => {
              const actor = storage.getUserById(n.actorId);
              const { icon: Icon, className } = ICONS[n.type] ?? ICONS.system;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => open(n)}
                    className={cx(
                      'w-full flex items-start gap-3 px-4 sm:px-5 py-3.5 text-left transition-colors hover:bg-subtle',
                      !n.read && 'bg-accent-soft/40'
                    )}
                  >
                    <span className="relative shrink-0">
                      <UserAvatar user={actor} size="md" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface border border-line flex items-center justify-center">
                        <Icon className={cx('w-3 h-3', className, n.type === 'like' && 'fill-current')} />
                      </span>
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm text-ink-2 leading-snug">
                        <span className="font-semibold text-ink">{actor?.name ?? 'Alguém'}</span> {n.content}
                      </span>
                      <span className="block text-xs text-muted mt-1">{timeAgo(n.createdAt)}</span>
                    </span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" aria-label="Não lida" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
};
