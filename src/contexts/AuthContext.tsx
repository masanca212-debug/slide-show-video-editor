import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { db, initDB } from '../lib/db';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'video-editor-user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDB().then(() => {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
      setLoading(false);
    });
  }, []);

  const signUp = async (email: string, password: string) => {
    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const newUser = await db.users.create(email, password);
    setUser(newUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
  };

  const signIn = async (email: string, password: string) => {
    const authenticatedUser = await db.users.authenticate(email, password);
    if (!authenticatedUser) {
      throw new Error('Invalid email or password');
    }

    setUser(authenticatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authenticatedUser));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
