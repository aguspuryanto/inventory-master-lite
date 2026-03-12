import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('=== LOGIN DEBUG ===');
    console.log('Supabase client:', supabase);
    console.log('Email:', email);
    console.log('Password:', password);

    if (supabase) {
      console.log('Attempting Supabase authentication...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('Supabase response:', { data, error });
      console.log('Error details:', error?.message, error?.status);
      if (error) {
        setError(error.message);
      } else {
        console.log('Login successful!');
        onLogin();
        navigate('/');
      }
    } else {
      console.log('Using dummy authentication...');
      // Dummy authentication
      if (email === 'admin@example.com' && password === 'admin1234') {
        onLogin();
        navigate('/');
      } else {
        setError('Email atau password salah. Gunakan admin@example.com / admin1234');
      }
    }
    
    setIsLoading(false);
  };

  const createTestUser = async () => {
    if (supabase) {
      // Create user in Supabase Auth system (not custom table)
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@example.com',
        password: 'admin1234',
        options: {
          emailRedirectTo: undefined, // Disable email redirect for development
          data: {
            name: 'Admin Utama' // Store name in auth.users metadata
          }
        }
      });
      console.log('Create user response:', { data, error });
      if (error) {
        if (error.message.includes('rate limit')) {
          alert('Rate limit exceeded. Wait a few minutes or create the user manually in Supabase dashboard.');
        } else if (error.message.includes('already registered')) {
          alert('User already exists in Supabase Auth! Try logging in directly.');
        } else {
          alert('Error creating user: ' + error.message);
        }
      } else {
        alert('User created successfully in Supabase Auth! Check email for confirmation or try logging in.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-200 dark:shadow-none">
              <Package className="text-white h-8 w-8" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Selamat Datang Kembali</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Masuk ke akun InvMaster Anda</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                <a href="#" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700">Lupa Password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all dark:text-slate-100"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 shadow-lg shadow-purple-200 dark:shadow-none transition-all mt-8 disabled:opacity-70"
            >
              {isLoading ? 'Memproses...' : 'Masuk Sekarang'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            Belum punya akun? <Link to="/register" className="font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700">Daftar di sini</Link>
          </p>

          {/* <button 
            type="button"
            onClick={createTestUser}
            className="w-full mt-4 bg-slate-600 text-white py-2 rounded-lg text-sm hover:bg-slate-700 transition-all"
          >
            Create Test User (admin@example.com)
          </button> */}
        </div>
        
        {/* Demo Hint */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Demo Akses: <span className="font-bold text-slate-700 dark:text-slate-300">admin@example.com</span> / <span className="font-bold text-slate-700 dark:text-slate-300">admin1234</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
