import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Store, AuthContext as AuthContextType } from '../types';
import { db } from '../services/db';
import { supabase } from '../lib/supabase';
import { generateId } from '../utils';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [userStores, setUserStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // app name
  const appName = import.meta.env.VITE_APP_NAME || 'EzyKasir';

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUserData = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedStore = localStorage.getItem('currentStore');
        const savedStores = localStorage.getItem('userStores');
        const savedToken = localStorage.getItem('token');

        if (!savedToken) {
          logout();
          return;
        }

        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }

        if (savedStore) {
          const storeData = JSON.parse(savedStore);
          setCurrentStore(storeData);
        }

        if (savedStores) {
          const storesData = JSON.parse(savedStores);
          setUserStores(storesData);
        }

        if (savedToken) {
          setToken(savedToken);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('currentStore');
        localStorage.removeItem('userStores');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (currentStore) {
      localStorage.setItem('currentStore', JSON.stringify(currentStore));
    } else {
      localStorage.removeItem('currentStore');
    }
  }, [currentStore]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (userStores && userStores.length > 0) {
      localStorage.setItem('userStores', JSON.stringify(userStores));
      // Auto-select first store if none selected
      if (!currentStore) {
        setCurrentStore(userStores[0]);
      }
    } else {
      localStorage.removeItem('userStores');
    }
  }, [userStores, currentStore]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // console.log('Login attempt:', { email, password });
      const response = await api.login(email, password);
      // console.log('Login response:', response);

      // Set user data from API response
      setUser(response.user);
      setToken(response.token);
      setCurrentStore(response.store);
      setUserStores(response.userStores);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCurrentStore(null);
    setUserStores([]);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('currentStore');
    localStorage.removeItem('userStores');
  };

  const registerStore = async (storeData: Partial<Store>, userData: Partial<User>, password: string) => {
    setIsLoading(true);
    try {
      // console.log('Starting store registration...', { storeData, userData });
      
      // Check if Supabase is available
      if (!supabase) {
        throw new Error('Database tidak tersedia. Pastikan Supabase sudah dikonfigurasi dengan benar.');
      }

      // Check if email already exists
      // console.log('Checking if email exists:', userData.email);
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.log('Error checking email existence:', checkError);
        throw checkError;
      }

      if (existingUser) {
        console.log('Email already exists:', existingUser.email);
        throw {
          code: '23505',
          message: 'duplicate key value violates unique constraint "users_email_key"',
          details: null,
          hint: null
        };
      }

      // Create user with password hash
      const passwordHash = btoa(password || ''); // Simple encoding for demo
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password_hash: passwordHash,
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (userError) throw userError;
      console.log('User created:', newUser);

      // Create store
      const { data: newStore, error: storeError } = await supabase
        .from('stores')
        .insert({
          name: storeData.name || '',
          description: storeData.description || '',
          address: storeData.address || '',
          phone: storeData.phone || '',
          email: storeData.email || '',
          slug: storeData.name?.toLowerCase().replace(/\s+/g, '-') || generateId(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (storeError) throw storeError;
      console.log('Store created:', newStore);

      // Link user to store
      const { error: linkError } = await supabase
        .from('store_users')
        .insert({
          store_id: newStore.id,
          user_id: newUser.id,
          role: 'owner',
          permissions: {},
          created_at: new Date().toISOString()
        });

      if (linkError) throw linkError;
      console.log('Store user link created');

      // Update state
      setUser(newUser);
      setCurrentStore(newStore);
      setUserStores([newStore]);
      console.log('Registration completed successfully!');

    } catch (error) {
      console.error('Registration failed:', error);
      // {
      //     "code": "42501",
      //     "details": null,
      //     "hint": null,
      //     "message": "new row violates row-level security policy for table \"users\""
      // }

      // {
      //     "code": "23505",
      //     "details": null,
      //     "hint": null,
      //     "message": "duplicate key value violates unique constraint \"users_email_key\""
      // }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const switchStore = (storeId: string) => {
    const store = userStores.find(s => s.id === storeId);
    if (store) {
      setCurrentStore(store);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    currentStore,
    userStores,
    isLoading,
    login,
    logout,
    registerStore,
    switchStore
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
