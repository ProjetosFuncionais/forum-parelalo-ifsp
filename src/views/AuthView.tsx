import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IFSP_CAMPUSES } from '../data/campuses';
import { UserAvatar } from '../components/UserAvatar';
import { Button, Field, Panel, cx, inputClass } from '../components/ui';
import { ROLE_LABELS } from '../lib/format';

interface AuthViewProps {
  onSuccess: () => void;
}

type Mode = 'login' | 'register' | 'forgot';

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login, register, availableUsers, switchUser } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [campus, setCampus] = useState(IFSP_CAMPUSES[0].name);
  const [course, setCourse] = useState(IFSP_CAMPUSES[0].courses[0]);
  const [semester, setSemester] = useState('1');
  const [regPassword, setRegPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setNotice('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);
    if (res.success) onSuccess();
    else setError(res.message || 'Não foi possível entrar.');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPassword.length < 6) return setError('A senha precisa ter pelo menos 6 caracteres.');
    if (regPassword !== confirm) return setError('As senhas não são iguais.');

    setLoading(true);
    const res = await register({ name, username, email, campus, course, semester: Number(semester) || 1 });
    setLoading(false);
    if (res.success) onSuccess();
    else setError(res.message || 'Não foi possível criar a conta.');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(
      'Este protótipo não envia e-mails. Use uma das contas de demonstração abaixo ou crie uma conta nova.'
    );
  };

  const courses = IFSP_CAMPUSES.find(c => c.name === campus)?.courses ?? [];
  const demoUsers = availableUsers.filter(u => !u.isSuspended).slice(0, 5);

  return (
    <div className="max-w-[26rem] mx-auto w-full px-4 sm:px-0 py-4 sm:py-8">
      <Panel className="!border sm:!rounded-lg rounded-lg px-5 py-6">
        <h1 className="text-xl font-semibold">
          {mode === 'login' && 'Entrar'}
          {mode === 'register' && 'Criar conta'}
          {mode === 'forgot' && 'Recuperar acesso'}
        </h1>
        <p className="text-sm text-muted mt-1">
          {mode === 'login' && 'Use seu usuário ou e-mail institucional.'}
          {mode === 'register' && 'Leva menos de um minuto.'}
          {mode === 'forgot' && 'Informe o e-mail usado no cadastro.'}
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger bg-danger-soft rounded-md px-3 py-2">{error}</p>
        )}
        {notice && (
          <p role="status" className="mt-4 text-sm text-ink-2 bg-subtle rounded-md px-3 py-2">{notice}</p>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <Field label="Usuário ou e-mail">
              {id => (
                <input
                  id={id}
                  type="text"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="vitor.dev"
                  className={inputClass}
                />
              )}
            </Field>
            <Field label="Senha">
              {id => (
                <input
                  id={id}
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputClass}
                />
              )}
            </Field>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => switchMode('forgot')} className="text-sm text-muted hover:text-ink">
                Esqueci a senha
              </button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </Button>
            </div>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="mt-5 space-y-4">
            <Field label="Nome completo">
              {id => (
                <input id={id} type="text" required autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
              )}
            </Field>
            <Field label="Nome de usuário" hint="Letras, números, ponto ou _">
              {id => (
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
                  <input
                    id={id}
                    type="text"
                    required
                    autoCapitalize="none"
                    autoComplete="username"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                    className={cx(inputClass, 'pl-7')}
                  />
                </div>
              )}
            </Field>
            <Field label="E-mail">
              {id => (
                <input
                  id={id}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nome@aluno.ifsp.edu.br"
                  className={inputClass}
                />
              )}
            </Field>
            <Field label="Campus">
              {id => (
                <select
                  id={id}
                  value={campus}
                  onChange={e => {
                    setCampus(e.target.value);
                    setCourse(IFSP_CAMPUSES.find(c => c.name === e.target.value)?.courses[0] ?? '');
                  }}
                  className={inputClass}
                >
                  {IFSP_CAMPUSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              )}
            </Field>
            <div className="grid grid-cols-[1fr_6rem] gap-3">
              <Field label="Curso">
                {id => (
                  <select id={id} value={course} onChange={e => setCourse(e.target.value)} className={inputClass}>
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
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
                    value={semester}
                    onChange={e => setSemester(e.target.value)}
                    className={inputClass}
                  />
                )}
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Senha">
                {id => (
                  <input
                    id={id}
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    className={inputClass}
                  />
                )}
              </Field>
              <Field label="Repita a senha">
                {id => (
                  <input
                    id={id}
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className={inputClass}
                  />
                )}
              </Field>
            </div>
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Criando…' : 'Criar conta'}
            </Button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="mt-5 space-y-4">
            <Field label="E-mail">
              {id => (
                <input id={id} type="email" required autoComplete="email" className={inputClass} />
              )}
            </Field>
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => switchMode('login')} className="text-sm text-muted hover:text-ink">
                Voltar
              </button>
              <Button type="submit" variant="primary">Continuar</Button>
            </div>
          </form>
        )}
      </Panel>

      <p className="text-sm text-center text-muted mt-4">
        {mode === 'register' ? (
          <>Já tem conta? <button onClick={() => switchMode('login')} className="text-accent-ink font-medium hover:underline">Entrar</button></>
        ) : (
          <>Primeira vez aqui? <button onClick={() => switchMode('register')} className="text-accent-ink font-medium hover:underline">Criar conta</button></>
        )}
      </p>

      {demoUsers.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-mono uppercase tracking-wider text-muted mb-2 text-center">
            Ou entre com uma conta de demonstração
          </h2>
          <ul className="border border-line rounded-lg divide-y divide-line bg-surface overflow-hidden">
            {demoUsers.map(u => (
              <li key={u.id}>
                <button
                  onClick={() => {
                    switchUser(u.id);
                    onSuccess();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-subtle"
                >
                  <UserAvatar user={u} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink truncate">{u.name}</span>
                    <span className="block text-xs text-muted truncate">{ROLE_LABELS[u.role]} · {u.campus}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
