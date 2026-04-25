'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation'; // Tambahkan usePathname

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Ambil URL saat ini

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
          if (mounted) {
            setLoading(false);
            // Hanya redirect jika bukan di halaman publik
            if (pathname !== '/login' && pathname !== '/') router.push('/login');
          }
          return;
        }

        if (session) {
          if (mounted) {
            setUser(session.user);
            await fetchProfile(session.user.id);
          }
        } else {
          if (mounted) {
            setLoading(false);
            // Cegah redirect loop: Jika di / atau /login, biarkan saja.
            if (pathname !== '/login' && pathname !== '/') {
              router.push('/login');
            }
          }
        }
      } catch (err) {
        console.error('Exception in initAuth:', err);
        if (mounted) {
          setLoading(false);
          if (pathname !== '/login' && pathname !== '/') router.push('/login');
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;

        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
          if (pathname !== '/login' && pathname !== '/') {
            router.push('/login');
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router]); // Tambahkan pathname ke dependency

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
      } else if (data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Exception fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          hd: 'webmail.uad.ac.id',
        },
        // Otomatis mengikuti URL Vercel saat di-deploy, dan localhost saat di laptop
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) console.error('Login error:', error.message);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}