'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: string;
  birthday: string;
  institution_id: number;
  institution_name: string;
  career_name: string;
  career_id: number;
  authId: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  institutionId: string | null;
  isLoading: boolean;
  userProfile: UserProfile | null;
  loadingProfile: boolean;
  profileError: string | null;
  fetchUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
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

  // Función para cargar los datos del perfil del usuario
  const fetchUserProfile = useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    
    setLoadingProfile(true);
    setProfileError(null);
    
    try {
      const profileResponse = await fetch('/api/profile');
      if (!profileResponse.ok) {
        throw new Error('Error al cargar el perfil');
      }
      const profileData = await profileResponse.json();
      setUserProfile(profileData);
    } catch (err) {
      console.error('[AuthContext] Error al cargar datos del perfil:', err);
      setProfileError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  // Cargar el perfil cuando el usuario inicia sesión
  useEffect(() => {
    if (user && !userProfile && !loadingProfile) {
      fetchUserProfile();
    }
  }, [user, userProfile, loadingProfile, fetchUserProfile]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isAdmin,
    institutionId,
    isLoading,
    userProfile,
    loadingProfile,
    profileError,
    fetchUserProfile,
    logout
  }), [user, isAdmin, institutionId, isLoading, userProfile, loadingProfile, profileError, fetchUserProfile, logout]);


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