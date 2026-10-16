import React, { useState } from 'react';
import { AcademicEvent } from '../types';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { EVENT_CATEGORIES } from '../data/campuses';
import { Navigate, absoluteUrl } from '../lib/router';
import { eventDateParts, eventStatus, plural } from '../lib/format';
import { UserAvatar } from './UserAvatar';
import { ReportModal } from './ReportModal';
import { Button, IconButton, Menu, MenuItem, cx, toast } from './ui';
import { Clock, MapPin, Video, MoreHorizontal, Link2, Trash2, Flag, Check, Star, ArrowUpRight } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { ease, spring } from '../lib/motion';
import { campusColor, campusShort } from '../lib/campus';

interface EventCardProps {
  event: AcademicEvent;
  onNavigate: Navigate;
  highlighted?: boolean;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onNavigate, highlighted, className }) => {
  const { currentUser } = useAuth();
  const [showReport, setShowReport] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const organizer = storage.getUserById(event.organizerId);
  const userStatus = currentUser ? storage.getUserEventParticipation(currentUser.id, event.id) : null;
  const status = eventStatus(event);
  const isPast = status === 'concluded';
  const date = eventDateParts(event.date);

  const isOrganizer = currentUser?.id === event.organizerId;
  const canDelete = isOrganizer || currentUser?.role === 'admin' || currentUser?.role === 'moderator';
  const category = EVENT_CATEGORIES.find(c => c.id === event.category)?.label ?? event.category;

  const handleRSVP = (next: 'attending' | 'interested') => {
    if (!currentUser) {
      onNavigate('auth');
      return;
    }
    const result = storage.toggleEventParticipation(currentUser.id, event.id, next);
    if (result === 'attending') toast('Presença confirmada');
    else if (result === 'interested') toast('Marcado como interesse');
  };

  const handleDelete = () => {
    if (!currentUser) return;
    if (window.confirm('Excluir este evento?')) {
      storage.deleteEvent(event.id, currentUser.id);
      toast('Evento excluído');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl('events', event.id));
      toast('Link do evento copiado');
    } catch {
      /* sem permissão */
    }
  };

  return (
    <m.article
      id={`event-${event.id}`}
      layout="position"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
      transition={{ duration: 0.45, ease: ease.out }}
      className={cx(
        'relative flex gap-4 px-4 sm:px-6 py-5',
        isPast && 'opacity-70',
        className
      )}
    >
      {highlighted && (
        <m.span
          className="absolute inset-0 bg-accent-soft pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.5, 1, 0.35] }}
          transition={{ duration: 2.2, ease: 'easeInOut' }}
        />
      )}
      {/* Data */}
      <div className="relative w-[3.75rem] shrink-0 text-center rounded-2xl overflow-hidden border border-line bg-surface h-fit shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
        <p
          className="text-[10.5px] font-semibold uppercase tracking-wider text-white py-1"
          style={{ background: campusColor(event.campus) }}
        >
          {date.month}
        </p>
        <p className="font-display text-[1.65rem] font-bold leading-none mt-1.5 text-ink">{date.day}</p>
        <p className="text-[11px] text-muted pb-1.5 pt-0.5">{date.weekday}</p>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">
              <span className="text-accent-ink font-medium">{category}</span>
              <span aria-hidden="true"> · </span>
              {campusShort(event.campus)}
              {status === 'ongoing' && <span className="ml-1.5 text-warn font-medium">· Hoje</span>}
              {isPast && <span className="ml-1.5">· Encerrado</span>}
            </p>
            <h3 className="mt-1 font-display text-[1.15rem] font-bold leading-snug tracking-[-0.02em]">{event.title}</h3>
          </div>

          <Menu
            trigger={({ toggle, open }) => (
              <IconButton label="Mais opções" onClick={toggle} aria-expanded={open} className="-mr-2 -mt-1 w-8 h-8">
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </IconButton>
            )}
          >
            {close => (
              <>
                <MenuItem onClick={() => { handleShare(); close(); }}>
                  <Link2 className="w-4 h-4" /> Copiar link
                </MenuItem>
                {canDelete && (
                  <MenuItem danger onClick={() => { close(); handleDelete(); }}>
                    <Trash2 className="w-4 h-4" /> Excluir
                  </MenuItem>
                )}
                {!isOrganizer && (
                  <MenuItem
                    onClick={() => {
                      close();
                      if (!currentUser) onNavigate('auth');
                      else setShowReport(true);
                    }}
                  >
                    <Flag className="w-4 h-4" /> Denunciar
                  </MenuItem>
                )}
              </>
            )}
          </Menu>
        </div>

        <p className={cx('mt-1.5 text-sm text-ink-2 leading-relaxed', !expanded && 'line-clamp-3')}>
          {event.description}
        </p>
        {event.description.length > 180 && (
          <button onClick={() => setExpanded(e => !e)} className="text-[13px] text-muted hover:text-ink mt-0.5">
            {expanded ? 'Mostrar menos' : 'Mostrar mais'}
          </button>
        )}

        <dl className="mt-3 space-y-1.5 text-[13px] text-ink-2">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Horário</dt>
            <Clock className="w-4 h-4 text-muted shrink-0" />
            <dd className="font-mono text-[12.5px]">{event.time}</dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="sr-only">Local</dt>
            {event.isOnline ? (
              <Video className="w-4 h-4 text-muted shrink-0 mt-0.5" />
            ) : (
              <MapPin className="w-4 h-4 text-muted shrink-0 mt-0.5" />
            )}
            <dd className="min-w-0">
              {event.location}
              {event.onlineLink && !isPast && (
                <a
                  href={event.onlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-0.5 text-accent-ink font-medium hover:underline"
                >
                  Abrir sala <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            onClick={() => onNavigate('profile', event.organizerId)}
            className="flex items-center gap-2 text-[13px] text-muted hover:text-ink min-w-0"
          >
            <UserAvatar user={organizer} size="xs" />
            <span className="truncate">{organizer?.name ?? 'Organizador'}</span>
          </button>
          <span className="text-[13px] text-muted">
            {plural(event.attendeesCount, 'confirmado', 'confirmados')}
            {event.interestedCount > 0 && ` · ${event.interestedCount} com interesse`}
          </span>
        </div>

        {!isPast && (
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant={userStatus === 'attending' ? 'primary' : 'secondary'}
              onClick={() => handleRSVP('attending')}
              aria-pressed={userStatus === 'attending'}
              className="rounded-full"
            >
              <AnimatePresence mode="wait" initial={false}>
                <m.span
                  key={userStatus === 'attending' ? 'on' : 'off'}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={spring.bouncy}
                  className="flex"
                >
                  <Check className="w-4 h-4" strokeWidth={userStatus === 'attending' ? 3 : 2} />
                </m.span>
              </AnimatePresence>
              {userStatus === 'attending' ? 'Presença confirmada' : 'Vou participar'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRSVP('interested')}
              aria-pressed={userStatus === 'interested'}
              className={cx('rounded-full', userStatus === 'interested' && 'text-warn bg-warn-soft hover:bg-warn-soft hover:text-warn')}
            >
              <m.span
                key={String(userStatus === 'interested')}
                initial={userStatus === 'interested' ? { scale: 0.3, rotate: -72 } : false}
                animate={{ scale: 1, rotate: 0 }}
                transition={spring.bouncy}
                className="flex"
              >
                <Star className={cx('w-4 h-4', userStatus === 'interested' && 'fill-current')} />
              </m.span>
              Interesse
            </Button>
          </div>
        )}
      </div>

      <ReportModal
        targetId={event.id}
        targetType="event"
        targetTitle={event.title}
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </m.article>
  );
};
