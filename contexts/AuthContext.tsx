import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Store, AuthContext as AuthContextType } from '../types';
import { db } from '../services/db';
import { supabase } from '../lib/supabase';
import { generateId } from '../utils';

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

        if (savedUser) {
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
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('currentStore');
        localStorage.removeItem('userStores');
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
    if (userStores.length > 0) {
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
      console.log('Login attempt:', { email, password });
      // For demo purposes, check against hardcoded credentials
      // In production, this would use proper authentication
      if (email === 'admin@example.com' && password === 'admin1234') {
        // Create demo user
        const demoUser: User = {
          id: generateId(),
          email: 'admin@example.com',
          full_name: 'Admin Utama',
          phone: '+62812345678',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // Create demo store
        const demoStore: Store = {
          id: generateId(),
          name: 'Toko Demo',
          slug: 'toko-demo',
          description: 'Toko demo untuk testing',
          address: 'Jl. Demo No. 123, Jakarta',
          phone: '(021) 12345678',
          email: 'admin@example.com',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setUser(demoUser);
        setCurrentStore(demoStore);
        setUserStores([demoStore]);
        return;
      } else {
        // Try Supabase Auth first
        let userData = null;
        let stores = [];
        
        if (supabase) {
          try {
            console.log('Trying Supabase Auth login...');
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (authError) {
              console.log('Supabase Auth failed:', authError.message);
            } else if (authData.user) {
              console.log('Supabase Auth success:', authData.user);
              
              // Check if user exists in public.users table, create if not
              userData = await db.getUserByEmail(email);
              if (!userData) {
                console.log('Creating user in public.users table from Supabase Auth...');
                userData = await db.createUser({
                  id: authData.user.id,
                  email: authData.user.email,
                  full_name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || '',
                  phone: '',
                  is_active: true,
                  created_at: authData.user.created_at,
                  updated_at: new Date().toISOString()
                });
              }
              
              // Get stores for this user
              console.log('Getting stores for user:', userData.id);
              stores = await db.getUserStores(userData.id);
            }
          } catch (authErr) {
            console.log('Supabase Auth error:', authErr);
          }
        }
        
        // If Supabase Auth failed or no user found, try public.users table
        if (!userData) {
          // console.log('Trying public.users table...');
          userData = await db.getUserByEmail(email);
          // console.log('User data from database:', userData);
          
          if (!userData) {
            // console.log('User not found in database, checking if registration worked...');
            // Let's check if there are any users in the database
            if (supabase) {
              const { data: allUsers, error: allUsersError } = await supabase
                .from('users')
                .select('email, full_name, created_at')
                .limit(5);
              // console.log('All users in database:', allUsers);
              // console.log('All users error:', allUsersError);
            }
            throw new Error('User not found. Registration may have failed.');
          }
          
          // In production, verify password hash here
          // console.log('Getting stores for user ID:', userData.id);
          stores = await db.getUserStores(userData.id);
          // console.log('User stores from database:', stores);
        }
        
        setUser(userData);
        setUserStores(stores);
        
        // Set first store as current if none selected
        if (stores.length > 0 && !currentStore) {
          setCurrentStore(stores[0]);
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setCurrentStore(null);
    setUserStores([]);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('currentStore');
    localStorage.removeItem('userStores');
  };

  const registerStore = async (storeData: Partial<Store>, userData: Partial<User>, password: string) => {
    setIsLoading(true);
    try {
      console.log('Starting store registration...', { storeData, userData });
      
      // Check if Supabase is available
      if (!supabase) {
        throw new Error('Database tidak tersedia. Pastikan Supabase sudah dikonfigurasi dengan benar.');
      }

      // Check if email already exists
      console.log('Checking if email exists:', userData.email);
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
