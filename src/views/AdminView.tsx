import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { UserAvatar } from '../components/UserAvatar';
import { 
  Shield, AlertTriangle, Users, FileText, 
  Calendar, Check, X, Ban, Trash2, Search
} from 'lucide-react';

interface AdminViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate }) => {
  const { currentUser, refreshData } = useAuth();
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');
  const [userSearch, setUserSearch] = useState('');
  const [, setTick] = useState(0);

  const isAuthorized = currentUser?.role === 'admin' || currentUser?.role === 'moderator';

  if (!currentUser || !isAuthorized) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3 max-w-md mx-auto">
        <Shield className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Acesso Restrito
        </h3>
        <p className="text-xs text-slate-500">
          Esta área é reservada para moderadores e administradores da comunidade acadêmica do IFSP.
        </p>
        <button
          onClick={() => onNavigate('feed')}
          className="text-xs text-emerald-600 font-semibold hover:underline"
        >
          Voltar ao feed principal
        </button>
      </div>
    );
  }

  const reports = storage.getReports();
  const pendingReports = reports.filter(r => r.status === 'pending');
  const allUsers = storage.getUsers();
  const allPosts = storage.getPosts();
  const allEvents = storage.getEvents();

  const handleDismissReport = (reportId: string) => {
    storage.updateReportStatus(reportId, 'dismissed');
    setTick(t => t + 1);
  };

  const handleDeleteContent = (reportId: string, targetId: string, targetType: string) => {
    if (window.confirm('Confirmar exclusão deste conteúdo denunciado?')) {
      if (targetType === 'post') {
        storage.deletePost(targetId, currentUser.id);
      } else if (targetType === 'comment') {
        storage.deleteComment(targetId, currentUser.id);
      } else if (targetType === 'event') {
        storage.deleteEvent(targetId, currentUser.id);
      }
      storage.updateReportStatus(reportId, 'resolved');
      refreshData();
      setTick(t => t + 1);
    }
  };

  const handleToggleSuspend = (userId: string, currentSuspended: boolean) => {
    const action = currentSuspended ? 'reativar' : 'suspender';
    if (window.confirm(`Deseja realmente ${action} esta conta de usuário?`)) {
      storage.suspendUser(userId, !currentSuspended);
      refreshData();
      setTick(t => t + 1);
    }
  };

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.campus.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-4xl mx-auto w-full">
      
      {/* Admin Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Painel de Moderação Comunitária IFSP</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Supervisão e Integridade da Rede
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analise denúncias de conteúdos, gerencie permissões e preserve o ambiente acadêmico
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold text-xs border border-emerald-200 dark:border-emerald-800">
            {currentUser.role === 'admin' ? 'Administrador Chefe' : 'Moderador Ativo'}
          </span>
        </div>
      </div>

      {/* Metrics Row (Quantitative Rigor) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Denúncias Pendentes</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {pendingReports.length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Estudantes & Servidores</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {allUsers.length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Publicações Ativas</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {allPosts.length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Eventos Registrados</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {allEvents.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'reports'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Fila de Denúncias ({pendingReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>Gestão de Usuários ({allUsers.length})</span>
        </button>
      </div>

      {/* Reports Queue Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-3">
          {pendingReports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-2">
              <Check className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Fila Limpa!
              </h3>
              <p className="text-xs text-slate-500">
                Não há denúncias pendentes no momento. A comunidade está em conformidade com as diretrizes acadêmicas.
              </p>
            </div>
          ) : (
            pendingReports.map(rep => {
              const reporter = storage.getUserById(rep.reporterId);
              let previewSnippet = '';

              if (rep.targetType === 'post') {
                const p = storage.getPostById(rep.targetId);
                previewSnippet = p ? p.content.slice(0, 140) : 'Publicação já removida';
              } else if (rep.targetType === 'event') {
                const ev = storage.getEventById(rep.targetId);
                previewSnippet = ev ? ev.title : 'Evento já removido';
              }

              return (
                <div
                  key={rep.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <span className="px-2 py-0.5 rounded-sm bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold uppercase text-[10px]">
                        Denúncia: {rep.targetType}
                      </span>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-1.5">
                        Motivo: <span className="font-normal text-rose-600 dark:text-rose-400">{rep.reason}</span>
                      </p>
                      {rep.details && (
                        <p className="text-slate-500 italic mt-0.5">
                          Detalhes do relator: "{rep.details}"
                        </p>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {new Date(rep.createdAt).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(rep.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {previewSnippet && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      <strong>Conteúdo denunciado:</strong>
                      <p className="mt-1 line-clamp-2">{previewSnippet}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      Denunciado por: <strong>{reporter?.name || 'Estudante'}</strong> (@{reporter?.username})
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDismissReport(rep.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                      >
                        Descartar
                      </button>

                      <button
                        onClick={() => handleDeleteContent(rep.id, rep.targetId, rep.targetType)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remover Conteúdo</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden space-y-3 p-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Buscar estudante ou docente por nome, campus ou usuário..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Usuário</th>
                  <th className="py-2.5 px-3 font-semibold">Campus & Curso</th>
                  <th className="py-2.5 px-3 font-semibold">Papel</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <UserAvatar user={u} size="xs" />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      <p className="truncate font-medium">{u.campus}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.course}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {u.isSuspended ? (
                        <span className="px-2 py-0.5 rounded-sm bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-bold text-[10px]">
                          Suspenso
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                          Ativo
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => handleToggleSuspend(u.id, !!u.isSuspended)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            u.isSuspended
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-100'
                          }`}
                        >
                          {u.isSuspended ? 'Reativar' : 'Suspender'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
