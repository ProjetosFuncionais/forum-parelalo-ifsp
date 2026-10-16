import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Navigate } from '../lib/router';
import { PostCard } from '../components/PostCard';
import { UserAvatar } from '../components/UserAvatar';
import { Button, EmptyState, Panel, Tabs, cx } from '../components/ui';
import { IFSP_CAMPUSES } from '../data/campuses';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { ease } from '../lib/motion';
import { eventDateParts, eventStatus } from '../lib/format';
import { campusColor } from '../lib/campus';
import { ImagePlus, Hash, CalendarPlus } from 'lucide-react';

interface FeedViewProps {
  onNavigate: Navigate;
  onOpenCreatePost: () => void;
}

type FeedTab = 'recent' | 'following' | 'campus';

const ALL_CAMPI = 'Todos os Campi (Geral)';

export const FeedView: React.FC<FeedViewProps> = ({ onNavigate, onOpenCreatePost }) => {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<FeedTab>('recent');
  const [campusFilter, setCampusFilter] = useState('all');

  const blocked = new Set(currentUser?.blockedUsers ?? []);
  let posts = storage.getPosts().filter(p => !blocked.has(p.authorId));

  if (tab === 'following' && currentUser) {
    const following = new Set(storage.getFollowing(currentUser.id).map(u => u.id));
    posts = posts.filter(p => following.has(p.authorId) || p.authorId === currentUser.id);
  } else if (tab === 'campus' && currentUser) {
    posts = posts.filter(p => p.campus === currentUser.campus || p.campus === ALL_CAMPI);
  } else if (campusFilter !== 'all') {
    posts = posts.filter(p => p.campus === campusFilter || p.campus === ALL_CAMPI);
  }

  posts.sort((a, b) => {
    // Fixados primeiro apenas na aba "Recentes".
    if (tab === 'recent' && !!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const tabs = [
    { id: 'recent' as const, label: 'Recentes' },
    ...(currentUser
      ? [
          { id: 'following' as const, label: 'Seguindo' },
          { id: 'campus' as const, label: 'Meu campus' }
        ]
      : [])
  ];

  return (
    <div className="max-w-2xl mx-auto w-full">
      {!currentUser && (
        <Panel className="relative overflow-hidden px-5 sm:px-7 py-7 mb-4">
          <Parallels />
          <h1 className="relative text-[1.9rem] leading-[1.05] font-bold max-w-sm">
            O fórum da comunidade IFSP
          </h1>
          <p className="relative text-[15px] text-ink-2 mt-2 leading-relaxed max-w-md">
            Tire dúvidas de disciplinas, divulgue projetos e acompanhe eventos dos campi.
          </p>
          <div className="relative flex gap-2 mt-5">
            <Button variant="primary" size="sm" onClick={() => onNavigate('auth')}>Criar conta</Button>
            <Button variant="secondary" size="sm" onClick={() => onNavigate('auth')}>Entrar</Button>
          </div>
        </Panel>
      )}

      {currentUser && <Greeting name={currentUser.name} onNavigate={onNavigate} />}

      <Panel className="overflow-hidden">
        {currentUser && (
          <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-line">
            <button onClick={onOpenCreatePost} className="w-full flex items-center gap-3 text-left group active:!scale-100">
              <UserAvatar user={currentUser} size="md" />
              <span className="flex-1 min-w-0 h-11 flex items-center px-4 rounded-full bg-subtle text-[15px] text-muted group-hover:text-ink-2 group-hover:bg-line/60 transition-colors">
                <span className="truncate">
                  <span className="sm:hidden">Compartilhe algo com a turma…</span>
                  <span className="hidden sm:inline">Compartilhe uma dúvida, projeto ou aviso…</span>
                </span>
              </span>
            </button>
            <div className="flex items-center gap-1 mt-2 pl-[52px] text-[13px] text-muted">
              <button onClick={onOpenCreatePost} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full hover:bg-subtle hover:text-ink">
                <ImagePlus className="w-4 h-4 text-[#2563eb]" /> Imagem
              </button>
              <button onClick={onOpenCreatePost} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full hover:bg-subtle hover:text-ink">
                <Hash className="w-4 h-4 text-accent" /> Tópico
              </button>
              <button onClick={() => onNavigate('events')} className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full hover:bg-subtle hover:text-ink">
                <CalendarPlus className="w-4 h-4 text-[#c2410c]" /> Evento
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-line sm:pr-3">
          <Tabs items={tabs} value={tab} onChange={setTab} className="border-b-0 flex-1" />
          {tab === 'recent' && (
            <CampusSelect value={campusFilter} onChange={setCampusFilter} className="hidden sm:block" />
          )}
        </div>
        {tab === 'recent' && (
          <div className="sm:hidden flex items-center gap-2 px-4 py-1.5 border-b border-line text-[13px] text-muted">
            <span>Campus</span>
            <CampusSelect value={campusFilter} onChange={setCampusFilter} className="flex-1 max-w-none" />
          </div>
        )}

        {posts.length === 0 ? (
          <EmptyState
            title={tab === 'following' ? 'Nada por aqui ainda' : 'Nenhuma publicação'}
            text={
              tab === 'following'
                ? 'Siga colegas e professores para ver as publicações deles nesta aba.'
                : 'Ainda não há publicações para esse filtro.'
            }
            action={
              tab === 'following' ? (
                <Button size="sm" onClick={() => onNavigate('explore')}>Encontrar pessoas</Button>
              ) : (
                <Button size="sm" variant="primary" onClick={onOpenCreatePost}>Escrever a primeira</Button>
              )
            }
          />
        ) : (
          <div className="divide-y divide-line">
            <AnimatePresence initial={false}>
              {posts.map(post => (
                <PostCard key={post.id} post={post} onNavigate={onNavigate} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </Panel>
    </div>
  );
};

const CampusSelect: React.FC<{ value: string; onChange: (v: string) => void; className?: string }> = ({
  value,
  onChange,
  className
}) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    aria-label="Filtrar por campus"
    className={cx(
      'shrink-0 max-w-[12rem] h-8 pl-2 pr-1 rounded-md bg-transparent text-[13px] text-ink-2 hover:bg-subtle focus:outline-none cursor-pointer',
      className
    )}
  >
    <option value="all">Todos os campi</option>
    {IFSP_CAMPUSES.map(c => (
      <option key={c.id} value={c.name}>{c.name.replace('IFSP ', '')}</option>
    ))}
  </select>
);

function greetingFor(date: Date) {
  const h = date.getHours();
  if (h < 5) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Saudação com o dia e o próximo evento: dá contexto logo ao abrir o app. */
const Greeting: React.FC<{ name: string; onNavigate: Navigate }> = ({ name, onNavigate }) => {
  const now = new Date();
  const firstName = name.replace(/^(Prof(a)?\.|Dr(a)?\.)\s+/i, '').split(' ')[0];
  const today = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const next = storage
    .getEvents()
    .filter(e => eventStatus(e) !== 'concluded')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <m.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: ease.out }}
      className="px-4 sm:px-1 pb-5 pt-1"
    >
      <p className="text-[13px] text-muted first-letter:uppercase">{today}</p>
      <h1 className="text-[2rem] sm:text-[2.4rem] font-bold leading-[1.05] mt-1">
        {greetingFor(now)}, <span className="text-accent">{firstName}</span>
      </h1>
      {next && (
        <button
          onClick={() => onNavigate('events', next.id)}
          className="group mt-3 inline-flex items-center gap-2 max-w-full h-8 pl-1 pr-3 rounded-full bg-surface border border-line text-[13px] text-ink-2 hover:border-line-strong"
        >
          <span
            className="h-6 px-2 rounded-full text-[11px] font-semibold text-white flex items-center shrink-0"
            style={{ background: campusColor(next.campus) }}
          >
            {Number(eventDateParts(next.date).day)} {eventDateParts(next.date).month}
          </span>
          <span className="truncate">Próximo: {next.title}</span>
          <span className="text-muted transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      )}
    </m.header>
  );
};

/** Duas barras paralelas (o símbolo do fórum) como grafismo de fundo. */
const Parallels: React.FC = () => (
  <div className="absolute -right-6 -top-10 flex gap-5 opacity-[0.08] pointer-events-none" aria-hidden="true">
    {[0, 1].map(i => (
      <m.span
        key={i}
        className="block w-10 h-56 rounded-full bg-accent rotate-[24deg]"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 + i * 0.12, duration: 0.8, ease: ease.out }}
      />
    ))}
  </div>
);
