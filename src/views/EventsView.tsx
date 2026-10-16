import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Navigate } from '../lib/router';
import { eventStatus } from '../lib/format';
import { EventCard } from '../components/EventCard';
import { CreateEventModal } from '../components/CreateEventModal';
import { Button, EmptyState, PageHeader, Panel, Tabs, cx } from '../components/ui';
import { IFSP_CAMPUSES, EVENT_CATEGORIES } from '../data/campuses';
import { Plus } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { spring } from '../lib/motion';

interface EventsViewProps {
  onNavigate: Navigate;
  highlightEventId?: string;
}

type EventsTab = 'upcoming' | 'mine' | 'past';

export const EventsView: React.FC<EventsViewProps> = ({ onNavigate, highlightEventId }) => {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<EventsTab>('upcoming');
  const [campus, setCampus] = useState('all');
  const [category, setCategory] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Leva até o evento vindo de um link ou do painel lateral.
  useEffect(() => {
    if (!highlightEventId) return;
    const target = storage.getEventById(highlightEventId);
    if (target && eventStatus(target) === 'concluded') setTab('past');
    const timer = window.setTimeout(() => {
      document.getElementById(`event-${highlightEventId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [highlightEventId]);

  let events = storage.getEvents();

  if (tab === 'mine' && currentUser) {
    const mine = new Set(
      storage.getEventParticipants().filter(p => p.userId === currentUser.id).map(p => p.eventId)
    );
    events = events.filter(e => mine.has(e.id) || e.organizerId === currentUser.id);
  } else if (tab === 'past') {
    events = events.filter(e => eventStatus(e) === 'concluded');
  } else if (tab === 'upcoming') {
    events = events.filter(e => eventStatus(e) !== 'concluded');
  }

  if (campus !== 'all') events = events.filter(e => e.campus === campus);
  if (category !== 'all') events = events.filter(e => e.category === category);

  events.sort((a, b) => (tab === 'past' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));

  return (
    <div className="max-w-2xl mx-auto w-full">
      <PageHeader
        title="Eventos"
        description="Palestras, oficinas, hackathons e semanas acadêmicas dos campi."
        actions={
          currentUser && (
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Divulgar evento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )
        }
      />

      <Panel className="overflow-hidden">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'upcoming', label: 'Próximos' },
            ...(currentUser ? [{ id: 'mine' as const, label: 'Minha agenda' }] : []),
            { id: 'past', label: 'Anteriores' }
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 sm:px-5 py-3 border-b border-line">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 flex-1">
            {[{ id: 'all', label: 'Todas' }, ...EVENT_CATEGORIES].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                aria-pressed={category === cat.id}
                className={cx(
                  'relative shrink-0 h-8 px-3.5 rounded-full text-[13px] border',
                  category === cat.id ? 'text-bg border-transparent font-medium' : 'border-line text-ink-2 hover:border-line-strong'
                )}
              >
                {category === cat.id && (
                  <m.span layoutId="event-category" transition={spring.snappy} className="absolute inset-0 rounded-full bg-ink" />
                )}
                <span className="relative">{cat.label}</span>
              </button>
            ))}
          </div>
          <select
            value={campus}
            onChange={e => setCampus(e.target.value)}
            aria-label="Filtrar por campus"
            className="h-8 px-2.5 rounded-full border border-line bg-surface text-[13px] text-ink-2 focus:outline-none focus:border-accent sm:w-40"
          >
            <option value="all">Todos os campi</option>
            {IFSP_CAMPUSES.map(c => (
              <option key={c.id} value={c.name}>{c.name.replace('IFSP ', '')}</option>
            ))}
          </select>
        </div>

        {events.length === 0 ? (
          <EmptyState
            title={tab === 'mine' ? 'Sua agenda está vazia' : 'Nenhum evento encontrado'}
            text={
              tab === 'mine'
                ? 'Confirme presença em algum evento e ele aparece aqui.'
                : 'Não há eventos com esses filtros.'
            }
            action={
              currentUser && tab !== 'past' ? (
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>Divulgar um evento</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {events.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onNavigate={onNavigate}
                  highlighted={event.id === highlightEventId}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </Panel>

      <CreateEventModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};
