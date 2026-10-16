import React from 'react';
import { useAuth } from '../context/AuthContext';
import { storage, ThemePreference } from '../services/storage';
import { Navigate } from '../lib/router';
import { UserAvatar } from '../components/UserAvatar';
import { Button, PageHeader, Panel, cx, toast } from '../components/ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import * as m from 'motion/react-m';
import { spring } from '../lib/motion';

const THEMES: { id: ThemePreference; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Escuro', icon: Moon },
  { id: 'system', label: 'Sistema', icon: Monitor }
];

export const SettingsView: React.FC<{ onNavigate: Navigate }> = ({ onNavigate }) => {
  const { currentUser, themePreference, setThemePreference, refreshData } = useAuth();

  const blockedUsers = storage.getUsers().filter(u => currentUser?.blockedUsers?.includes(u.id));

  const unblock = (id: string) => {
    if (!currentUser) return;
    storage.toggleBlockUser(currentUser.id, id);
    refreshData();
    toast('Usuário desbloqueado');
  };

  const reset = () => {
    if (!window.confirm('Apagar tudo o que foi criado neste navegador e voltar aos dados de exemplo?')) return;
    storage.resetToDefaults();
    refreshData();
    toast('Dados de exemplo restaurados');
    onNavigate('feed');
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4">
      <PageHeader title="Configurações" />

      <Section title="Aparência">
        <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-2">
          {THEMES.map(t => {
            const Icon = t.icon;
            const active = themePreference === t.id;
            return (
              <button
                key={t.id}
                role="radio"
                aria-checked={active}
                onClick={() => setThemePreference(t.id)}
                className={cx(
                  'relative flex flex-col items-center gap-2 py-4 rounded-xl border text-sm',
                  active ? 'border-transparent text-accent-ink font-medium' : 'border-line text-ink-2 hover:border-line-strong'
                )}
              >
                {active && (
                  <m.span
                    layoutId="theme-choice"
                    transition={spring.snappy}
                    className="absolute inset-0 rounded-xl bg-accent-soft ring-2 ring-accent"
                  />
                )}
                <Icon className="relative w-5 h-5" />
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {currentUser && (
        <Section
          title="Pessoas bloqueadas"
          description="Quem você bloqueia não aparece no seu feed e não consegue trocar mensagens com você."
        >
          {blockedUsers.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma pessoa bloqueada.</p>
          ) : (
            <ul className="divide-y divide-line -my-2">
              {blockedUsers.map(u => (
                <li key={u.id} className="flex items-center gap-3 py-2.5">
                  <UserAvatar user={u} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink truncate">{u.name}</p>
                    <p className="text-xs text-muted truncate">@{u.username}</p>
                  </div>
                  <Button size="sm" onClick={() => unblock(u.id)}>Desbloquear</Button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      <Section
        title="Dados deste navegador"
        description="Este protótipo não tem servidor: publicações, mensagens e contas ficam salvas só neste navegador."
      >
        <Button variant="danger-ghost" size="sm" onClick={reset} className="border border-danger/30">
          Restaurar dados de exemplo
        </Button>
      </Section>
    </div>
  );
};

const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title,
  description,
  children
}) => (
  <Panel className="px-4 sm:px-5 py-4">
    <h2 className="text-base font-semibold">{title}</h2>
    {description && <p className="text-sm text-muted mt-1 leading-relaxed">{description}</p>}
    <div className="mt-4">{children}</div>
  </Panel>
);
