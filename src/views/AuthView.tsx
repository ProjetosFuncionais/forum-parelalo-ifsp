import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IFSP_CAMPUSES } from '../data/campuses';
import { 
  LogIn, UserPlus, KeyRound, CheckCircle2, 
  AlertCircle, ShieldCheck, ArrowRight
} from 'lucide-react';

interface AuthViewProps {
  onSuccess: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { login, register, availableUsers, switchUser } = useAuth();
  
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCampus, setRegCampus] = useState(IFSP_CAMPUSES[0].name);
  const [regCourse, setRegCourse] = useState(IFSP_CAMPUSES[0].courses[0]);
  const [regSemester, setRegSemester] = useState(1);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(loginIdentifier, loginPassword);
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrorMsg(res.message || 'Falha ao autenticar.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('A senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    const res = await register({
      name: regName,
      username: regUsername,
      email: regEmail,
      campus: regCampus,
      course: regCourse,
      semester: Number(regSemester)
    });
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrorMsg(res.message || 'Erro ao realizar cadastro.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setSuccessMsg(`Instruções de redefinição enviadas para ${forgotEmail}. Verifique sua caixa de entrada institucional.`);
  };

  const handleQuickDemoLogin = (userId: string) => {
    switchUser(userId);
    onSuccess();
  };

  const currentCampusData = IFSP_CAMPUSES.find(c => c.name === regCampus) || IFSP_CAMPUSES[0];

  return (
    <div className="max-w-md mx-auto w-full my-4 space-y-4">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xl mx-auto shadow-md">
          IF
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Fórum Paralelo <span className="text-emerald-600 dark:text-emerald-400">IFSP</span>
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Comunidade acadêmica independente para troca de ideias, eventos, estudos e projetos.
        </p>
      </div>

      {/* Main Auth Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold mb-5">
          <button
            onClick={() => {
              setTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Entrar
          </button>

          <button
            onClick={() => {
              setTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === 'register'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Criar Conta
          </button>

          <button
            onClick={() => {
              setTab('forgot');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              tab === 'forgot'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Recuperar
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-mail institucional ou Usuário (@):
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={e => setLoginIdentifier(e.target.value)}
                placeholder="vitor.dev ou usuario@aluno.ifsp.edu.br"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Senha de Acesso:
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setTab('forgot')}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Entrando...' : 'Entrar no Fórum'}</span>
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo:
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="Ex: Ana Clara Silva"
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome de Usuário (@):
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  placeholder="anaclara.dev"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Semestre Atual:
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={regSemester}
                  onChange={e => setRegSemester(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-mail do IFSP:
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="ana.silva@aluno.ifsp.edu.br"
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campus:
                </label>
                <select
                  value={regCampus}
                  onChange={e => {
                    const newCampus = e.target.value;
                    setRegCampus(newCampus);
                    const cd = IFSP_CAMPUSES.find(c => c.name === newCampus);
                    if (cd && cd.courses.length > 0) {
                      setRegCourse(cd.courses[0]);
                    }
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {IFSP_CAMPUSES.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Curso:
                </label>
                <select
                  value={regCourse}
                  onChange={e => setRegCourse(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {currentCampusData.courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Senha:
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 dígitos"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Senha:
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={e => setRegConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Cadastrando...' : 'Finalizar Cadastro'}</span>
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Digite seu e-mail do IFSP cadastrado:
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="exemplo@aluno.ifsp.edu.br"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Enviar Link de Recuperação</span>
            </button>
          </form>
        )}

      </div>

      {/* Quick Test Demo Logins */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Acesso Imediato com Contas de Teste:</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Clique em qualquer perfil abaixo para testar instantaneamente a navegação e interações:
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {availableUsers.slice(0, 3).map(u => (
            <button
              key={u.id}
              onClick={() => handleQuickDemoLogin(u.id)}
              className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500 text-left flex items-center justify-between transition-colors"
            >
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-slate-100">{u.name}</span>{' '}
                <span className="text-[10px] text-slate-400">(@{u.username} · {u.campus})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
