import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'officer' | 'head' | 'admin';

export type AuthUser = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type AuthSession = Omit<AuthUser, 'password'>;

type SignupInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

type AuthContextValue = {
  user: AuthSession | null;
  signup: (input: SignupInput) => { ok: boolean; message?: string };
  login: (email: string, password: string, role: UserRole) => { ok: boolean; message?: string };
  logout: () => void;
  isPdfReady: boolean;
  markPdfReady: (value: boolean) => void;
};

const USERS_KEY = 'judgeai_users';
const SESSION_KEY = 'judgeai_session';
const PDF_READY_KEY = 'judgeai_pdf_ready';

const seedUsers: AuthUser[] = [
  { name: 'Review Officer', email: 'officer@karnataka.gov.in', password: 'Officer@123', role: 'officer' },
  { name: 'Department Head', email: 'head@karnataka.gov.in', password: 'Head@123', role: 'head' },
  { name: 'System Admin', email: 'admin@karnataka.gov.in', password: 'Admin@123', role: 'admin' },
];

const AuthContext = createContext<AuthContextValue | null>(null);

function readUsers(): AuthUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }

  try {
    return JSON.parse(raw) as AuthUser[];
  } catch {
    localStorage.setItem(USERS_KEY, JSON.stringify(seedUsers));
    return seedUsers;
  }
}

function writeUsers(users: AuthUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isPdfReady, setIsPdfReady] = useState(false);

  useEffect(() => {
    setUser(readSession());
    setIsPdfReady(localStorage.getItem(PDF_READY_KEY) === 'true');
    readUsers();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isPdfReady,
    signup: ({ name, email, password, role }) => {
      const users = readUsers();
      const normalizedEmail = email.trim().toLowerCase();
      const exists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
      if (exists) return { ok: false, message: 'Account already exists for this email.' };

      const newUser: AuthUser = { name: name.trim(), email: normalizedEmail, password, role };
      users.push(newUser);
      writeUsers(users);
      return { ok: true };
    },
    login: (email, password, role) => {
      const users = readUsers();
      const normalizedEmail = email.trim().toLowerCase();
      const found = users.find((u) => u.email.toLowerCase() === normalizedEmail && u.role === role);
      if (!found || found.password !== password) {
        return { ok: false, message: 'Invalid credentials for the selected role.' };
      }

      const nextSession: AuthSession = {
        name: found.name,
        email: found.email,
        role: found.role,
      };
      setUser(nextSession);
      localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
      return { ok: true };
    },
    logout: () => {
      setUser(null);
      setIsPdfReady(false);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(PDF_READY_KEY);
    },
    markPdfReady: (value) => {
      setIsPdfReady(value);
      localStorage.setItem(PDF_READY_KEY, String(value));
    },
  }), [user, isPdfReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
