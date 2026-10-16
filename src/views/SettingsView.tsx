import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { UserAvatar } from '../components/UserAvatar';
import { 
  Settings, Moon, Sun, Shield, 
  RotateCcw, Check, UserX, AlertTriangle
} from 'lucide-react';

interface SettingsViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const { currentUser, theme, toggleTheme, refreshData } = useAuth();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [, setTick] = useState(0);

  const blockedUserIds = currentUser?.blockedUsers || [];
  const blockedUsers = storage.getUsers().filter(u => blockedUserIds.includes(u.id));

  const handleUnblock = (targetId: string) => {
    if (!currentUser) return;
    storage.toggleBlockUser(currentUser.id, targetId);
    refreshData();
    setTick(t => t + 1);
  };

  const handleResetDatabase = () => {
    if (window.confirm('Atenção: Isso restaurará todos os dados originais de demonstração do Fórum Paralelo IFSP (campi, posts, comentários e eventos). Continuar?')) {
      storage.resetToDefaults();
      refreshData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
      setTick(t => t + 1);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto w-full">
      
      {/* Settings Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base mb-1">
          <Settings className="w-5 h-5 text-emerald-600" />
          <h2>Configurações da Conta & Privacidade</h2>
        </div>
        <p className="text-xs text-slate-500">
          Gerencie preferências de interface, bloqueios de usuários e dados locais
        </p>
      </div>

      {/* Theme Preference */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Aparência e Modo de Visualização
        </h3>
        <p className="text-xs text-slate-500">
          Escolha entre o tema claro institucional ou o tema escuro confortável para leitura noturna.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={() => {
              if (theme !== 'light') toggleTheme();
            }}
            className={`flex-1 p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              theme === 'light'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Modo Claro (Verde IFSP)</span>
          </button>

          <button
            onClick={() => {
              if (theme !== 'dark') toggleTheme();
            }}
            className={`flex-1 p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              theme === 'dark'
                ? 'border-emerald-600 bg-emerald-950/80 text-emerald-300 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-4 h-4 text-slate-300" />
            <span>Modo Escuro (Noturno)</span>
          </button>
        </div>
      </div>

      {/* Blocked Users */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <UserX className="w-4 h-4 text-rose-600" />
          <h3>Usuários Bloqueados</h3>
        </div>
        <p className="text-xs text-slate-500">
          Pessoas bloqueadas não podem enviar mensagens diretas ou interagir com suas postagens.
        </p>

        {blockedUsers.length === 0 ? (
          <p className="text-xs text-slate-400 py-2 italic">
            Você não possui nenhum usuário bloqueado.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {blockedUsers.map(u => (
              <div key={u.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserAvatar user={u} size="xs" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{u.name}</p>
                    <p className="text-[11px] text-slate-400">@{u.username} · {u.campus}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnblock(u.id)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Desbloquear
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Database Reset & Testing */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <RotateCcw className="w-4 h-4 text-amber-600" />
          <h3>Ambiente de Dados do Fórum</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          O Fórum Paralelo armazena publicações, comentários, conversas de chat e seguidores localmente de forma reativa e persistente. Se desejar restaurar o estado original de demonstração do IFSP, utilize a opção abaixo:
        </p>

        {resetSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Dados de demonstração do IFSP restaurados com sucesso!</span>
          </div>
        )}

        <button
          onClick={handleResetDatabase}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Dados Iniciais de Demonstração</span>
        </button>
      </div>

    </div>
  );
};
