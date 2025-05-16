'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  institutionId: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const fetchUserAndAdminStatus = useCallback(async () => {
    try {
      // Only set loading state if this is the initial load
      if (!isInitialized) {
        setIsLoading(true);
      }
      
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('[AuthContext] Error fetching user:', userError);
        setUser(null);
        setIsAdmin(false);
        setInstitutionId(null);
        return;
      }
      
      setUser(supabaseUser);

      if (supabaseUser) {
        // Check if user is admin
        try {
          const response = await fetch('/api/auth/user-info');
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.isAdmin);
            
            // If user is admin, fetch institution ID
            if (data.isAdmin) {
              try {
                const adminResponse = await fetch('/api/admin/validate', {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
                if (adminResponse.ok) {
                  const adminData = await adminResponse.json();
                  setInstitutionId(adminData.institution_id);
                } else {
                  console.error('[AuthContext] Error fetching institution ID:', adminResponse.statusText);
                  setInstitutionId(null);
                }
              } catch (error) {
                console.error('[AuthContext] Exception fetching institution ID:', error);
                setInstitutionId(null);
              }
            }
          } else {
            console.error('[AuthContext] Error fetching admin status:', response.statusText);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('[AuthContext] Exception fetching admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setInstitutionId(null);
      }
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [supabase, isInitialized]);

  useEffect(() => {
    // Only fetch user data once when component mounts
    if (!isInitialized) {
      fetchUserAndAdminStatus();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setInstitutionId(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        fetchUserAndAdminStatus();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchUserAndAdminStatus, isInitialized]);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthContext] Error signing out:', error);
      }
    } catch (error) {
      console.error('[AuthContext] Unexpected error during logout:', error);
    }
  }, [supabase]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isAdmin,
    institutionId,
    isLoading,
    logout
  }), [user, isAdmin, institutionId, isLoading, logout]);

  return (
    <AuthContext.Provider value={contextValue}>
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