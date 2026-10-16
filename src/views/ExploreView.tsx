import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Navigate } from '../lib/router';
import { PostCard } from '../components/PostCard';
import { EventCard } from '../components/EventCard';
import { RoleTag, UserAvatar } from '../components/UserAvatar';
import { EmptyState, Panel, Tabs } from '../components/ui';
import { IFSP_CAMPUSES } from '../data/campuses';
import { Search, X } from 'lucide-react';

interface ExploreViewProps {
  onNavigate: Navigate;
  initialQuery?: string;
}

type ExploreTab = 'all' | 'posts' | 'people' | 'events';

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export const ExploreView: React.FC<ExploreViewProps> = ({ onNavigate, initialQuery = '' }) => {
  const { dataVersion } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<ExploreTab>('all');
  const [campus, setCampus] = useState('all');

  const allPosts = storage.getPosts();

  const trendingTags = useMemo(() => {
    const counts = new Map<string, number>();
    storage.getPosts().forEach(p => p.tags.forEach(t => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [dataVersion]);

  const q = normalize(query.trim().replace(/^#/, ''));
  const isTagQuery = query.trim().startsWith('#');

  let posts = allPosts;
  let users = storage.getUsers().filter(u => !u.isSuspended);
  let events = storage.getEvents();

  if (campus !== 'all') {
    posts = posts.filter(p => p.campus === campus);
    users = users.filter(u => u.campus === campus);
    events = events.filter(e => e.campus === campus);
  }

  if (q) {
    if (isTagQuery) {
      posts = posts.filter(p => p.tags.some(t => normalize(t) === q));
    } else {
      posts = posts.filter(p =>
        normalize(p.content).includes(q) || p.tags.some(t => normalize(t).includes(q))
      );
    }
    users = users.filter(u =>
      [u.name, u.username, u.course, u.campus, ...u.interests].some(f => normalize(f).includes(q))
    );
    events = events.filter(e =>
      [e.title, e.description, e.location].some(f => normalize(f).includes(q))
    );
  }

  posts = [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  events = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const hasQuery = !!q || campus !== 'all';
  const showPeople = tab === 'all' || tab === 'people';
  const showEvents = tab === 'all' || tab === 'events';
  const showPosts = tab === 'all' || tab === 'posts';
  const total = posts.length + users.length + events.length;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4">
      <div className="px-4 sm:px-0 space-y-3">
        <h1 className="text-xl sm:text-2xl font-semibold">Explorar</h1>
        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Buscar</span>
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus={!initialQuery && window.matchMedia('(pointer: fine)').matches}
              placeholder="Pessoas, cursos, assuntos ou #tags"
              className="w-full h-11 pl-9 pr-9 rounded-md border border-line-strong bg-surface text-[15px] text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </label>
          <select
            value={campus}
            onChange={e => setCampus(e.target.value)}
            aria-label="Filtrar por campus"
            className="w-28 sm:w-44 h-11 px-2 rounded-md border border-line-strong bg-surface text-sm text-ink-2 focus:outline-none focus:border-accent"
          >
            <option value="all">Todos os campi</option>
            {IFSP_CAMPUSES.map(c => (
              <option key={c.id} value={c.name}>{c.name.replace('IFSP ', '')}</option>
            ))}
          </select>
        </div>
      </div>

      {!hasQuery && trendingTags.length > 0 && (
        <section className="px-4 sm:px-0">
          <h2 className="text-sm font-semibold mb-2">Assuntos frequentes</h2>
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setQuery(`#${tag}`)}
                className="h-8 px-3 rounded-md border border-line bg-surface text-sm text-ink-2 hover:border-line-strong hover:text-ink"
              >
                #{tag} <span className="font-mono text-xs text-muted ml-1">{count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <Panel className="overflow-hidden">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { id: 'all', label: 'Tudo', count: total },
            { id: 'posts', label: 'Publicações', count: posts.length },
            { id: 'people', label: 'Pessoas', count: users.length },
            { id: 'events', label: 'Eventos', count: events.length }
          ]}
        />

        {total === 0 ? (
          <EmptyState
            title={`Nada encontrado para “${query}”`}
            text="Tente outro termo, o nome de um curso ou remova o filtro de campus."
          />
        ) : (
          <div className="divide-y divide-line">
            {showPeople && users.length > 0 && (
              <section className="py-2">
                {tab === 'all' && <SectionLabel>Pessoas</SectionLabel>}
                <ul>
                  {(tab === 'all' ? users.slice(0, 4) : users).map(user => (
                    <li key={user.id}>
                      <button
                        onClick={() => onNavigate('profile', user.id)}
                        className="w-full flex items-center gap-3 px-4 sm:px-5 py-2.5 text-left hover:bg-subtle transition-colors"
                      >
                        <UserAvatar user={user} size="md" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="font-medium text-ink truncate">{user.name}</span>
                            <RoleTag role={user.role} />
                          </span>
                          <span className="block text-[13px] text-muted truncate">
                            {user.course} · {user.campus}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {tab === 'all' && users.length > 4 && (
                  <button onClick={() => setTab('people')} className="px-4 sm:px-5 py-2 text-[13px] text-accent-ink font-medium hover:underline">
                    Ver todas as {users.length} pessoas
                  </button>
                )}
              </section>
            )}

            {showEvents && events.length > 0 && (
              <section className="pt-2">
                {tab === 'all' && <SectionLabel>Eventos</SectionLabel>}
                <div className="divide-y divide-line">
                  {(tab === 'all' ? events.slice(0, 2) : events).map(event => (
                    <EventCard key={event.id} event={event} onNavigate={onNavigate} />
                  ))}
                </div>
                {tab === 'all' && events.length > 2 && (
                  <button onClick={() => setTab('events')} className="px-4 sm:px-5 pb-3 text-[13px] text-accent-ink font-medium hover:underline">
                    Ver todos os {events.length} eventos
                  </button>
                )}
              </section>
            )}

            {showPosts && posts.length > 0 && (
              <section className="pt-2">
                {tab === 'all' && <SectionLabel>Publicações</SectionLabel>}
                <div className="divide-y divide-line">
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onNavigate={onNavigate}
                      onSelectTag={t => setQuery(`#${t}`)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="px-4 sm:px-5 pt-2 pb-1 text-xs font-mono uppercase tracking-wider text-muted">{children}</h2>
);
