import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { storage, STORE_CHANGE_EVENT, ThemePreference } from '../services/storage';

interface RegisterData {
  name: string;
  username: string;
  email: string;
  campus: string;
  course: string;
  semester?: number;
  bio?: string;
}

type Result = { success: boolean; message?: string };

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  /** Preferência salva (pode ser "system"). */
  themePreference: ThemePreference;
  /** Tema efetivamente aplicado. */
  theme: 'light' | 'dark';
  setThemePreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
  login: (identifier: string, pass: string) => Promise<Result>;
  register: (userData: RegisterData) => Promise<Result>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  unreadNotificationsCount: number;
  unreadMessagesTotal: number;
  availableUsers: User[];
  refreshData: () => void;
  /** Muda a cada gravação no storage; útil como dependência de useMemo. */
  dataVersion: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const systemPrefersDark = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return pref;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => storage.getTheme());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => resolveTheme(storage.getTheme()));
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unreadMessagesTotal, setUnreadMessagesTotal] = useState(0);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [dataVersion, setDataVersion] = useState(0);

  const refreshData = useCallback(() => {
    storage.init();
    const user = storage.getCurrentUser() ?? null;
    setCurrentUser(user);
    setAvailableUsers(storage.getUsers());

    if (user) {
      setUnreadNotificationsCount(storage.getUnreadNotificationsCount(user.id));
      const convs = storage.getConversations(user.id);
      setUnreadMessagesTotal(convs.reduce((acc, c) => acc + (c.unreadCount?.[user.id] || 0), 0));
    } else {
      setUnreadNotificationsCount(0);
      setUnreadMessagesTotal(0);
    }
    setDataVersion(v => v + 1);
  }, []);

  useEffect(() => {
    refreshData();
    window.addEventListener(STORE_CHANGE_EVENT, refreshData);
    // Sincroniza entre abas abertas.
    window.addEventListener('storage', refreshData);
    return () => {
      window.removeEventListener(STORE_CHANGE_EVENT, refreshData);
      window.removeEventListener('storage', refreshData);
    };
  }, [refreshData]);

  // Aplica o tema e acompanha mudanças do sistema quando a preferência é "system".
  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(themePreference);
      setTheme(resolved);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };
    apply();
    if (themePreference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [themePreference]);

  const setThemePreference = (pref: ThemePreference) => {
    storage.setTheme(pref);
    setThemePreferenceState(pref);
  };

  const toggleTheme = () => setThemePreference(theme === 'dark' ? 'light' : 'dark');

  const login = async (identifier: string, _pass: string): Promise<Result> => {
    const clean = identifier.trim().toLowerCase().replace(/^@/, '');
    const user = storage.getUsers().find(
      u => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );

    if (!user) return { success: false, message: 'Não encontramos nenhuma conta com esse usuário ou e-mail.' };
    if (user.isSuspended) return { success: false, message: 'Esta conta está suspensa pela moderação.' };

    storage.setCurrentUserId(user.id);
    refreshData();
    return { success: true };
  };

  const register = async (userData: RegisterData): Promise<Result> => {
    const cleanUsername = userData.username.trim().toLowerCase().replace(/^@/, '');
    const cleanEmail = userData.email.trim().toLowerCase();

    if (!/^[a-z0-9._]{3,30}$/.test(cleanUsername)) {
      return { success: false, message: 'O usuário deve ter de 3 a 30 caracteres: letras, números, ponto ou _.' };
    }
    if (storage.getUserByUsername(cleanUsername)) {
      return { success: false, message: 'Esse nome de usuário já está em uso.' };
    }
    if (storage.getUserByEmail(cleanEmail)) {
      return { success: false, message: 'Esse e-mail já foi cadastrado.' };
    }

    const newUser = storage.createUser({
      name: userData.name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      avatarUrl: '',
      bio: userData.bio || '',
      campus: userData.campus,
      course: userData.course,
      semester: userData.semester || 1,
      role: 'student',
      interests: [],
      blockedUsers: []
    });

    storage.setCurrentUserId(newUser.id);
    refreshData();
    return { success: true };
  };

  const logout = () => {
    storage.setCurrentUserId('');
    refreshData();
  };

  const switchUser = (userId: string) => {
    storage.setCurrentUserId(userId);
    refreshData();
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    storage.updateUser(currentUser.id, updates);
    refreshData();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        themePreference,
        theme,
        setThemePreference,
        toggleTheme,
        login,
        register,
        logout,
        switchUser,
        updateProfile,
        unreadNotificationsCount,
        unreadMessagesTotal,
        availableUsers,
        refreshData,
        dataVersion
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
