import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { Navigate } from '../lib/router';
import { Post, User } from '../types';
import { PostCard } from '../components/PostCard';
import { EventCard } from '../components/EventCard';
import { ReportModal } from '../components/ReportModal';
import { RoleTag, UserAvatar } from '../components/UserAvatar';
import {
  Button, EmptyState, Field, IconButton, Menu, MenuItem, Modal, Panel, Tabs,
  inputClass, textareaClass, toast
} from '../components/ui';
import { IFSP_CAMPUSES } from '../data/campuses';
import { ROLE_LABELS } from '../lib/format';
import { MoreHorizontal, Flag, Ban, Link2, MessageCircle } from 'lucide-react';
import { absoluteUrl } from '../lib/router';
import * as m from 'motion/react-m';
import { ease, spring } from '../lib/motion';
import { campusColor } from '../lib/campus';

type ProfileTab = 'posts' | 'events' | 'saved' | 'followers' | 'following';

interface ProfileViewProps {
  userId?: string;
  initialTab?: ProfileTab;
  onNavigate: Navigate;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userId, initialTab = 'posts', onNavigate }) => {
  const { currentUser, refreshData } = useAuth();
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);

  if (!userId) {
    return (
      <Panel className="max-w-md mx-auto">
        <EmptyState
          title="Entre para ver seu perfil"
          action={<Button variant="primary" size="sm" onClick={() => onNavigate('auth')}>Entrar</Button>}
        />
      </Panel>
    );
  }

  const user = storage.getUserById(userId);

  if (!user) {
    return (
      <Panel className="max-w-md mx-auto">
        <EmptyState
          title="Perfil não encontrado"
          text="Essa conta não existe ou foi removida."
          action={<Button size="sm" onClick={() => onNavigate('feed')}>Ir para o início</Button>}
        />
      </Panel>
    );
  }

  const isOwn = currentUser?.id === user.id;
  const isFollowing = currentUser ? storage.isFollowing(currentUser.id, user.id) : false;
  const isBlocked = !!currentUser?.blockedUsers?.includes(user.id);

  const posts = storage.getPosts()
    .filter(p => p.authorId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const events = storage.getEvents()
    .filter(e => e.organizerId === user.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const saved: Post[] = isOwn
    ? storage.getSavedPosts(user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(s => storage.getPostById(s.postId))
        .filter((p): p is Post => !!p)
    : [];
  const followers = storage.getFollowers(user.id);
  const following = storage.getFollowing(user.id);

  const handleFollow = () => {
    if (!currentUser) return onNavigate('auth');
    storage.toggleFollow(currentUser.id, user.id);
  };

  const handleBlock = () => {
    if (!currentUser) return onNavigate('auth');
    if (!isBlocked && !window.confirm(`Bloquear ${user.name}? Você deixará de ver as publicações e mensagens dessa pessoa.`)) return;
    const nowBlocked = storage.toggleBlockUser(currentUser.id, user.id);
    if (nowBlocked && isFollowing) storage.toggleFollow(currentUser.id, user.id);
    refreshData();
    toast(nowBlocked ? 'Usuário bloqueado' : 'Usuário desbloqueado');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl('profile', user.id));
      toast('Link do perfil copiado');
    } catch {
      /* sem permissão */
    }
  };

  const tabs = [
    { id: 'posts' as const, label: 'Publicações', count: posts.length },
    { id: 'events' as const, label: 'Eventos', count: events.length },
    ...(isOwn ? [{ id: 'saved' as const, label: 'Salvos', count: saved.length }] : []),
    { id: 'followers' as const, label: 'Seguidores', count: followers.length },
    { id: 'following' as const, label: 'Seguindo', count: following.length }
  ];

  return (
    <div className="max-w-2xl mx-auto w-full">
      <Panel className="overflow-hidden">
        <div
          className="relative h-28 sm:h-40 overflow-hidden border-b border-line"
          style={{ background: `linear-gradient(135deg, ${campusColor(user.campus)} 0%, color-mix(in oklab, ${campusColor(user.campus)} 55%, #111) 100%)` }}
        >
          {user.bannerUrl ? (
            <m.img
              src={user.bannerUrl}
              alt=""
              referrerPolicy="no-referrer"
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: ease.out }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute right-8 -top-8 flex gap-6 opacity-25" aria-hidden="true">
              {[0, 1].map(i => (
                <m.span
                  key={i}
                  className="block w-9 h-56 rounded-full bg-white rotate-[24deg]"
                  initial={{ y: -60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.12, duration: 0.8, ease: ease.out }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 sm:px-6 pb-5">
          <div className="flex items-end justify-between gap-3 -mt-10 sm:-mt-12">
            <m.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ ...spring.bouncy, delay: 0.08 }}>
              <UserAvatar user={user} size="xl" className="ring-4 ring-surface shadow-lg" />
            </m.div>

            <div className="flex items-center gap-2 pb-1">
              {isOwn ? (
                <Button size="sm" onClick={() => setIsEditOpen(true)}>Editar perfil</Button>
              ) : (
                <>
                  {!isBlocked && (
                    <IconButton
                      label="Enviar mensagem"
                      className="border border-line-strong w-8 h-8"
                      onClick={() => (currentUser ? onNavigate('chat', user.id) : onNavigate('auth'))}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </IconButton>
                  )}
                  {isBlocked ? (
                    <Button size="sm" variant="secondary" onClick={handleBlock}>Desbloquear</Button>
                  ) : (
                    <Button size="sm" variant={isFollowing ? 'secondary' : 'primary'} onClick={handleFollow}>
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </Button>
                  )}
                </>
              )}
              <Menu
                trigger={({ toggle, open }) => (
                  <IconButton label="Mais opções" onClick={toggle} aria-expanded={open} className="border border-line-strong w-8 h-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </IconButton>
                )}
              >
                {close => (
                  <>
                    <MenuItem onClick={() => { copyLink(); close(); }}>
                      <Link2 className="w-4 h-4" /> Copiar link do perfil
                    </MenuItem>
                    {!isOwn && (
                      <>
                        <MenuItem onClick={() => { close(); handleBlock(); }}>
                          <Ban className="w-4 h-4" /> {isBlocked ? 'Desbloquear' : 'Bloquear'}
                        </MenuItem>
                        <MenuItem onClick={() => { close(); if (!currentUser) onNavigate('auth'); else setShowReport(true); }}>
                          <Flag className="w-4 h-4" /> Denunciar perfil
                        </MenuItem>
                      </>
                    )}
                  </>
                )}
              </Menu>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[1.6rem] font-bold leading-tight">{user.name}</h1>
              <RoleTag role={user.role} />
              {user.isSuspended && (
                <span className="text-xs text-danger font-medium">Conta suspensa</span>
              )}
            </div>
            <p className="text-sm text-muted">@{user.username}</p>
          </div>

          {user.bio && <p className="mt-3 text-[15px] text-ink leading-relaxed whitespace-pre-line">{user.bio}</p>}

          <dl className="mt-3 text-sm text-ink-2 space-y-0.5">
            <div>
              <dt className="sr-only">Curso</dt>
              <dd>
                {user.course}
                {user.semester ? <span className="text-muted"> · {user.semester}º semestre</span> : null}
              </dd>
            </div>
            <div>
              <dt className="sr-only">Campus</dt>
              <dd className="text-muted">{user.campus}</dd>
            </div>
          </dl>

          {user.interests.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Interesses">
              {user.interests.map(i => (
                <li key={i}>
                  <button
                    onClick={() => onNavigate('explore', i)}
                    className="h-7 px-2.5 rounded-md bg-subtle text-[13px] text-ink-2 hover:text-ink"
                  >
                    {i}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 flex gap-4 text-sm">
            <button onClick={() => setTab('followers')} className="hover:underline">
              <span className="font-semibold text-ink">{followers.length}</span>{' '}
              <span className="text-muted">{followers.length === 1 ? 'seguidor' : 'seguidores'}</span>
            </button>
            <button onClick={() => setTab('following')} className="hover:underline">
              <span className="font-semibold text-ink">{following.length}</span>{' '}
              <span className="text-muted">seguindo</span>
            </button>
          </p>
        </div>

        <Tabs items={tabs} value={tab} onChange={setTab} className="border-t" />

        {isBlocked && tab !== 'followers' && tab !== 'following' ? (
          <EmptyState title="Você bloqueou esta pessoa" text="Desbloqueie para ver as publicações dela." />
        ) : (
          <>
            {tab === 'posts' && (
              posts.length === 0 ? (
                <EmptyState title={isOwn ? 'Você ainda não publicou' : 'Nenhuma publicação ainda'} />
              ) : (
                <div className="divide-y divide-line">
                  {posts.map(p => <PostCard key={p.id} post={p} onNavigate={onNavigate} />)}
                </div>
              )
            )}

            {tab === 'events' && (
              events.length === 0 ? (
                <EmptyState title="Nenhum evento organizado" />
              ) : (
                <div className="divide-y divide-line">
                  {events.map(e => <EventCard key={e.id} event={e} onNavigate={onNavigate} />)}
                </div>
              )
            )}

            {tab === 'saved' && isOwn && (
              saved.length === 0 ? (
                <EmptyState
                  title="Nada salvo ainda"
                  text="Toque no marcador de uma publicação para guardar resumos, editais e avisos aqui."
                />
              ) : (
                <div className="divide-y divide-line">
                  {saved.map(p => <PostCard key={p.id} post={p} onNavigate={onNavigate} />)}
                </div>
              )
            )}
          </>
        )}

        {(tab === 'followers' || tab === 'following') && (
          <PeopleList
            users={tab === 'followers' ? followers : following}
            empty={tab === 'followers' ? 'Ninguém segue esta conta ainda.' : 'Não segue ninguém ainda.'}
            onNavigate={onNavigate}
          />
        )}
      </Panel>

      {isOwn && currentUser && (
        <EditProfileModal user={currentUser} open={isEditOpen} onClose={() => setIsEditOpen(false)} />
      )}

      <ReportModal
        targetId={user.id}
        targetType="user"
        targetTitle={`${user.name} (@${user.username})`}
        isOpen={showReport}
        onClose={() => setShowReport(false)}
      />
    </div>
  );
};

const PeopleList: React.FC<{ users: User[]; empty: string; onNavigate: Navigate }> = ({ users, empty, onNavigate }) =>
  users.length === 0 ? (
    <EmptyState title={empty} />
  ) : (
    <ul className="divide-y divide-line">
      {users.map(u => (
        <li key={u.id}>
          <button
            onClick={() => onNavigate('profile', u.id)}
            className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 text-left hover:bg-subtle"
          >
            <UserAvatar user={u} size="md" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="font-medium text-ink truncate">{u.name}</span>
                <RoleTag role={u.role} />
              </span>
              <span className="block text-[13px] text-muted truncate">
                {ROLE_LABELS[u.role]} · {u.campus}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );

const EditProfileModal: React.FC<{ user: User; open: boolean; onClose: () => void }> = ({ user, open, onClose }) => {
  const { updateProfile } = useAuth();
  const [form, setForm] = useState(() => toForm(user));
  const [lastOpen, setLastOpen] = useState(open);

  // Recarrega os dados atuais sempre que o modal é aberto.
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setForm(toForm(user));
  }

  const set = <K extends keyof ReturnType<typeof toForm>>(key: K, value: ReturnType<typeof toForm>[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  const courses = IFSP_CAMPUSES.find(c => c.name === form.campus)?.courses ?? [];

  const save = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.name.trim() || !form.course.trim()) return;
    updateProfile({
      name: form.name.trim(),
      bio: form.bio.trim(),
      course: form.course.trim(),
      campus: form.campus,
      semester: form.semester ? Number(form.semester) : undefined,
      avatarUrl: form.avatarUrl.trim(),
      interests: form.interests.split(',').map(s => s.trim()).filter(Boolean).slice(0, 10)
    });
    onClose();
    toast('Perfil atualizado');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar perfil"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={() => save()} disabled={!form.name.trim() || !form.course.trim()}>
            Salvar
          </Button>
        </>
      }
    >
      <form onSubmit={save} className="space-y-4">
        <div className="flex items-center gap-4">
          <UserAvatar user={{ ...user, name: form.name || user.name, avatarUrl: form.avatarUrl }} size="lg" />
          <Field label="Foto (link da imagem)" className="flex-1">
            {id => (
              <input
                id={id}
                type="url"
                value={form.avatarUrl}
                onChange={e => set('avatarUrl', e.target.value)}
                placeholder="https://… (deixe vazio para usar iniciais)"
                className={inputClass}
              />
            )}
          </Field>
        </div>

        <Field label="Nome">
          {id => <input id={id} type="text" required value={form.name} onChange={e => set('name', e.target.value)} className={inputClass} />}
        </Field>

        <Field label="Bio" hint={`${160 - form.bio.length} caracteres restantes`}>
          {id => (
            <textarea
              id={id}
              rows={3}
              maxLength={160}
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              className={textareaClass}
            />
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Campus" className="sm:col-span-2">
            {id => (
              <select id={id} value={form.campus} onChange={e => set('campus', e.target.value)} className={inputClass}>
                {IFSP_CAMPUSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            )}
          </Field>
          <Field label="Semestre">
            {id => (
              <input
                id={id}
                type="number"
                inputMode="numeric"
                min={1}
                max={12}
                value={form.semester}
                onChange={e => set('semester', e.target.value)}
                className={inputClass}
              />
            )}
          </Field>
        </div>

        <Field label="Curso">
          {id => (
            <>
              <input
                id={id}
                type="text"
                list={`${id}-courses`}
                required
                value={form.course}
                onChange={e => set('course', e.target.value)}
                className={inputClass}
              />
              <datalist id={`${id}-courses`}>
                {courses.map(c => <option key={c} value={c} />)}
              </datalist>
            </>
          )}
        </Field>

        <Field label="Interesses" hint="Separe por vírgula. Ex.: Python, Robótica, Iniciação Científica">
          {id => (
            <input id={id} type="text" value={form.interests} onChange={e => set('interests', e.target.value)} className={inputClass} />
          )}
        </Field>
      </form>
    </Modal>
  );
};

function toForm(user: User) {
  return {
    name: user.name,
    bio: user.bio ?? '',
    course: user.course,
    campus: user.campus,
    semester: user.semester ? String(user.semester) : '',
    avatarUrl: user.avatarUrl ?? '',
    interests: user.interests.join(', ')
  };
}
