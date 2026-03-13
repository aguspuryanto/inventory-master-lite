import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './toast';
import { User } from '@supabase/supabase-js';
import { Package } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { addToast } = useToast();

  const handleSignUp = async () => {
    try {
      setError(null);
      setSignUpLoading(true);
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            email: email,
          }
        }
      });
      
      if (error) throw error;
      
      addToast({
        type: 'success',
        title: 'Registrasi Berhasil',
        message: 'Silakan cek email untuk verifikasi akun Anda'
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat registrasi';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Registrasi Gagal',
        message: errorMessage
      });
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setError(null);
      setSignInLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      // Get user data after successful sign in
      if (data.user) {
        onAuthSuccess(data.user);
        addToast({
          type: 'success',
          title: 'Login Berhasil',
          message: `Selamat datang kembali, ${email}!`
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat login';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Login Gagal',
        message: errorMessage
      });
    } finally {
      setSignInLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Masukkan email terlebih dahulu');
      return;
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      addToast({
        type: 'success',
        title: 'Email Reset Dikirim',
        message: 'Silakan cek email Anda untuk instruksi reset password'
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat reset password';
      setError(errorMessage);
      addToast({
        type: 'error',
        title: 'Reset Password Gagal',
        message: errorMessage
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="bg-purple-600 p-3 rounded-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isSignUp ? 'Buat Akun Baru' : 'Masuk ke KasirKu'}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            {isSignUp 
              ? 'Daftar untuk mengelola inventaris bisnis Anda' 
              : 'Masuk untuk melanjutkan ke dashboard'
            }
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-400 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            isSignUp ? handleSignUp() : handleSignIn();
          }}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm"
                  placeholder="nama@email.com"
                  disabled={signInLoading || signUpLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="block w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm"
                  placeholder="Minimal 6 karakter"
                  disabled={signInLoading || signUpLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  Ingat saya
                </label>
              </div>

              {!isSignUp && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
                >
                  Lupa password?
                </button>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-lg border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={signInLoading || signUpLoading}
              >
                {signInLoading || signUpLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isSignUp ? 'Mendaftar...' : 'Masuk...'}
                  </span>
                ) : (
                  isSignUp ? 'Buat Akun' : 'Masuk'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-slate-800 px-2 text-slate-500 dark:text-slate-400">
                  {isSignUp ? 'Sudah punya akun?' : 'Belum punya akun?'}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300"
              >
                {isSignUp ? 'Masuk di sini' : 'Daftar di sini'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          <p>&copy; 2026 KasirKu. Semua hak dilindungi.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
