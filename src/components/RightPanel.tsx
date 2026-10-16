import React from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Navigate } from '../lib/router';
import { eventDateParts, eventStatus } from '../lib/format';
import { RoleTag, UserAvatar } from './UserAvatar';

interface RightPanelProps {
  onNavigate: Navigate;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();

  const events = storage
    .getEvents()
    .filter(e => eventStatus(e) !== 'concluded')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const blocked = currentUser?.blockedUsers ?? [];
  const suggestions = storage
    .getUsers()
    .filter(u =>
      !u.isSuspended &&
      (!currentUser || (u.id !== currentUser.id && !blocked.includes(u.id) && !storage.isFollowing(currentUser.id, u.id)))
    )
    .slice(0, 3);

  const handleFollow = (targetId: string) => {
    if (!currentUser) {
      onNavigate('auth');
      return;
    }
    storage.toggleFollow(currentUser.id, targetId);
  };

  return (
    <aside className="hidden xl:block w-72 shrink-0">
      <div className="sticky top-[calc(var(--header-h)+1.5rem)] space-y-8">
        <section>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="text-sm font-semibold">Próximos eventos</h2>
            <button onClick={() => onNavigate('events')} className="text-[13px] text-muted hover:text-ink">
              Ver agenda
            </button>
          </div>
          {events.length === 0 ? (
            <p className="text-sm text-muted">Nenhum evento marcado.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {events.map(event => {
                const d = eventDateParts(event.date);
                return (
                  <li key={event.id}>
                    <button
                      onClick={() => onNavigate('events', event.id)}
                      className="w-full flex gap-3 py-3 text-left group"
                    >
                      <span className="w-9 shrink-0 text-center leading-none pt-0.5">
                        <span className="block text-lg font-semibold text-ink">{d.day}</span>
                        <span className="block text-[10.5px] font-mono uppercase text-muted mt-0.5">{d.month}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-ink leading-snug group-hover:underline line-clamp-2">
                          {event.title}
                        </span>
                        <span className="block text-xs text-muted mt-0.5 truncate">{event.campus}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {suggestions.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-3">Quem seguir</h2>
            <ul className="space-y-3">
              {suggestions.map(user => (
                <li key={user.id} className="flex items-center gap-2.5">
                  <button onClick={() => onNavigate('profile', user.id)} className="shrink-0 rounded-full">
                    <UserAvatar user={user} size="sm" />
                  </button>
                  <button onClick={() => onNavigate('profile', user.id)} className="min-w-0 flex-1 text-left">
                    <span className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-ink truncate hover:underline">{user.name}</span>
                      <RoleTag role={user.role} />
                    </span>
                    <span className="block text-xs text-muted truncate">{user.campus}</span>
                  </button>
                  <button
                    onClick={() => handleFollow(user.id)}
                    className="shrink-0 h-7 px-2.5 rounded-md border border-line-strong text-[13px] font-medium text-ink hover:bg-subtle"
                  >
                    Seguir
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="text-xs text-muted leading-relaxed">
          Projeto independente feito por estudantes. Não é um canal oficial do IFSP.
          <span className="block mt-2">
            <button onClick={() => onNavigate('settings')} className="hover:text-ink hover:underline">
              Configurações
            </button>
          </span>
        </footer>
      </div>
    </aside>
  );
};
