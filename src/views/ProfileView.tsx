import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { PostCard } from '../components/PostCard';
import { EventCard } from '../components/EventCard';
import { UserAvatar } from '../components/UserAvatar';
import { IFSP_CAMPUSES } from '../data/campuses';
import { 
  GraduationCap, Calendar, MessageSquare, 
  UserPlus, Check, Edit3, Bookmark, Users, ShieldAlert, X
} from 'lucide-react';

interface ProfileViewProps {
  userId?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  onNavigate
}) => {
  const { currentUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'saved' | 'followers' | 'following'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [, setTick] = useState(0);

  // Form states for edit profile
  const targetId = userId || currentUser?.id || 'user_vitor';
  const targetUser = storage.getUserById(targetId);

  const [editName, setEditName] = useState(targetUser?.name || '');
  const [editBio, setEditBio] = useState(targetUser?.bio || '');
  const [editCourse, setEditCourse] = useState(targetUser?.course || '');
  const [editCampus, setEditCampus] = useState(targetUser?.campus || '');
  const [editSemester, setEditSemester] = useState(targetUser?.semester || 1);
  const [editAvatar, setEditAvatar] = useState(targetUser?.avatarUrl || '');

  if (!targetUser) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-2 max-w-md mx-auto">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Usuário não encontrado
        </h3>
        <p className="text-xs text-slate-500">
          O perfil solicitado não existe ou foi removido.
        </p>
        <button
          onClick={() => onNavigate('feed')}
          className="text-xs text-emerald-600 font-semibold hover:underline"
        >
          Voltar ao feed
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === targetUser.id;
  const isFollowing = currentUser ? storage.isFollowing(currentUser.id, targetUser.id) : false;

  const userPosts = storage.getPosts().filter(p => p.authorId === targetUser.id);
  const userEvents = storage.getEvents().filter(e => e.organizerId === targetUser.id);
  const savedPosts = isOwnProfile && currentUser 
    ? storage.getSavedPosts(currentUser.id).map(s => storage.getPostById(s.postId)).filter(Boolean) as ReturnType<typeof storage.getPosts>
    : [];

  const followers = storage.getFollowers(targetUser.id);
  const following = storage.getFollowing(targetUser.id);

  const handleToggleFollow = () => {
    if (!currentUser) {
      onNavigate('auth');
      return;
    }
    storage.toggleFollow(currentUser.id, targetUser.id);
    setTick(t => t + 1);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile) return;

    updateProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      course: editCourse.trim(),
      campus: editCampus,
      semester: Number(editSemester),
      avatarUrl: editAvatar.trim() || targetUser.avatarUrl
    });

    setIsEditModalOpen(false);
    setTick(t => t + 1);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto w-full">
      
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        
        {/* Banner Area */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 relative">
          {targetUser.bannerUrl && (
            <img
              src={targetUser.bannerUrl}
              alt="Capa de perfil"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-md bg-black/40 backdrop-blur-xs text-white border border-white/20">
              {targetUser.campus}
            </span>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
            {/* Avatar */}
            <div className="ring-4 ring-white dark:ring-slate-900 rounded-full inline-block bg-white dark:bg-slate-900 shadow-md">
              <UserAvatar user={targetUser} size="xl" showRoleBadge />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Perfil</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('chat', targetUser.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Mensagem</span>
                  </button>

                  <button
                    onClick={handleToggleFollow}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-colors shadow-xs ${
                      isFollowing
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Seguindo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {targetUser.name}
                </h1>
                <span className="text-xs text-slate-400">@{targetUser.username}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1 flex-wrap">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {targetUser.course}
                </span>
                {targetUser.semester && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{targetUser.semester}º Semestre</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{targetUser.campus}</span>
              </div>
            </div>

            {/* Bio */}
            {targetUser.bio && (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                {targetUser.bio}
              </p>
            )}

            {/* Interests Tags */}
            {targetUser.interests && targetUser.interests.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400">Interesses:</span>
                {targetUser.interests.map(int => (
                  <span
                    key={int}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                  >
                    {int}
                  </span>
                ))}
              </div>
            )}

            {/* Metrics */}
            <div className="flex items-center gap-4 pt-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('followers')}
                className="hover:text-emerald-600 transition-colors"
              >
                <strong className="text-slate-900 dark:text-white">{targetUser.followersCount}</strong> seguidores
              </button>
              <span>·</span>
              <button
                onClick={() => setActiveTab('following')}
                className="hover:text-emerald-600 transition-colors"
              >
                <strong className="text-slate-900 dark:text-white">{targetUser.followingCount}</strong> seguindo
              </button>
              <span>·</span>
              <span>
                <strong className="text-slate-900 dark:text-white">{userPosts.length}</strong> publicações
              </span>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex items-center gap-1 px-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'posts'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Publicações ({userPosts.length})
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'events'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Eventos ({userEvents.length})
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-1 py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Salvos ({savedPosts.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('followers')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'followers'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Seguidores ({followers.length})
          </button>

          <button
            onClick={() => setActiveTab('following')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'following'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Seguindo ({following.length})
          </button>
        </div>

      </div>

      {/* Tab Content Stream */}
      <div className="space-y-4">
        {activeTab === 'posts' && (
          userPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              Nenhuma publicação feita por este usuário ainda.
            </div>
          ) : (
            userPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onNavigate={onNavigate}
                onPostUpdated={() => setTick(t => t + 1)}
                onPostDeleted={() => setTick(t => t + 1)}
              />
            ))
          )
        )}

        {activeTab === 'events' && (
          userEvents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              Nenhum evento organizado ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onNavigate={onNavigate}
                  onEventUpdated={() => setTick(t => t + 1)}
                  onEventDeleted={() => setTick(t => t + 1)}
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'saved' && isOwnProfile && (
          savedPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
              Você ainda não salvou publicações. Use o ícone de marcador nas postagens para guardar resumos e avisos.
            </div>
          ) : (
            savedPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onNavigate={onNavigate}
                onPostUpdated={() => setTick(t => t + 1)}
                onPostDeleted={() => setTick(t => t + 1)}
              />
            ))
          )
        )}

        {activeTab === 'followers' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 divide-y divide-slate-100 dark:divide-slate-800">
            {followers.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">Nenhum seguidor ainda.</p>
            ) : (
              followers.map(f => (
                <div key={f.id} className="py-2.5 flex items-center justify-between">
                  <div
                    onClick={() => onNavigate('profile', f.id)}
                    className="flex items-center gap-2.5 cursor-pointer hover:opacity-80"
                  >
                    <UserAvatar user={f} size="sm" showRoleBadge />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{f.name}</p>
                      <p className="text-[11px] text-slate-500">{f.campus} · {f.course}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('profile', f.id)}
                    className="text-xs text-emerald-600 font-medium hover:underline"
                  >
                    Ver Perfil
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 divide-y divide-slate-100 dark:divide-slate-800">
            {following.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">Não está seguindo ninguém ainda.</p>
            ) : (
              following.map(f => (
                <div key={f.id} className="py-2.5 flex items-center justify-between">
                  <div
                    onClick={() => onNavigate('profile', f.id)}
                    className="flex items-center gap-2.5 cursor-pointer hover:opacity-80"
                  >
                    <UserAvatar user={f} size="sm" showRoleBadge />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{f.name}</p>
                      <p className="text-[11px] text-slate-500">{f.campus} · {f.course}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('profile', f.id)}
                    className="text-xs text-emerald-600 font-medium hover:underline"
                  >
                    Ver Perfil
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Editar Perfil Acadêmico
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo:
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biografia Acadêmica:
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Campus:
                  </label>
                  <select
                    value={editCampus}
                    onChange={e => setEditCampus(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {IFSP_CAMPUSES.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semestre:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={editSemester}
                    onChange={e => setEditSemester(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Curso:
                </label>
                <input
                  type="text"
                  required
                  value={editCourse}
                  onChange={e => setEditCourse(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Foto de Perfil (URL do Avatar):
                </label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={e => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
